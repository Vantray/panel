from __future__ import annotations

import json
from collections import defaultdict
from copy import deepcopy
from pathlib import PosixPath

import json5
from sqlalchemy import func

from app.config import settings
from app.db import GetDB
from app.db import models as db_models
from app.models.proxy import ProxyTypes
from app.models.user import UserStatus
from app.utils.crypto import get_cert_SANs


def merge_dicts(a, b):  # B will override A dictionary key and values
    for key, value in b.items():
        if isinstance(value, dict) and key in a and isinstance(a[key], dict):
            merge_dicts(a[key], value)  # Recursively merge nested dictionaries
        else:
            a[key] = value
    return a


class XRayConfig(dict):
    def __init__(self, config: dict | str | PosixPath | None = None, api_host: str = "127.0.0.1", api_port: int = 8080):
        if config is None:
            config = {}

        if isinstance(config, str):
            try:
                # considering string as json
                config = json5.loads(config)
            except json.JSONDecodeError, ValueError:
                # considering string as file path
                with open(config) as file:
                    config = json5.loads(file.read())

        if isinstance(config, PosixPath):
            with open(config) as file:
                config = json5.loads(file.read())

        if isinstance(config, dict):
            config = deepcopy(config)

        self.api_host = api_host
        self.api_port = api_port

        super().__init__(config)
        self._validate()

        self.inbounds = []
        self.inbounds_by_protocol = {}
        self.inbounds_by_tag = {}
        self._fallbacks_inbound = self.get_inbound(settings.xray_fallback_inbound_tag)
        self._resolve_inbounds()

        self._apply_api()

    def _apply_api(self):
        api_inbound = self.get_inbound("API_INBOUND")
        if api_inbound:
            api_inbound["listen"] = self.api_host
            api_inbound["listen"]["address"] = self.api_host
            api_inbound["port"] = self.api_port
            return

        self["api"] = {"services": ["HandlerService", "StatsService", "LoggerService"], "tag": "API"}
        self["stats"] = {}
        forced_policies = {
            "levels": {"0": {"statsUserUplink": True, "statsUserDownlink": True}},
            "system": {
                "statsInboundDownlink": False,
                "statsInboundUplink": False,
                "statsOutboundDownlink": True,
                "statsOutboundUplink": True,
            },
        }
        if self.get("policy"):
            self["policy"] = merge_dicts(self.get("policy"), forced_policies)
        else:
            self["policy"] = forced_policies
        inbound = {
            "listen": self.api_host,
            "port": self.api_port,
            "protocol": "dokodemo-door",
            "settings": {"address": self.api_host},
            "tag": "API_INBOUND",
        }
        try:
            self["inbounds"].insert(0, inbound)
        except KeyError:
            self["inbounds"] = []
            self["inbounds"].insert(0, inbound)

        rule = {"inboundTag": ["API_INBOUND"], "outboundTag": "API", "type": "field"}
        try:
            self["routing"]["rules"].insert(0, rule)
        except KeyError:
            self["routing"] = {"rules": []}
            self["routing"]["rules"].insert(0, rule)

    def _validate(self):
        if not self.get("inbounds"):
            raise ValueError("config doesn't have inbounds")

        if not self.get("outbounds"):
            raise ValueError("config doesn't have outbounds")

        for inbound in self["inbounds"]:
            if not inbound.get("tag"):
                raise ValueError("all inbounds must have a unique tag")
            if "," in inbound.get("tag"):
                raise ValueError("character «,» is not allowed in inbound tag")
        for outbound in self["outbounds"]:
            if not outbound.get("tag"):
                raise ValueError("all outbounds must have a unique tag")

    def _resolve_inbounds(self):
        for inbound in self["inbounds"]:
            if inbound["protocol"] not in ProxyTypes._value2member_map_:
                continue

            if inbound["tag"] in settings.xray_exclude_inbound_tags:
                continue

            if not inbound.get("settings"):
                inbound["settings"] = {}
            if not inbound["settings"].get("clients"):
                inbound["settings"]["clients"] = []

            config = {
                "tag": inbound["tag"],
                "protocol": inbound["protocol"],
                "port": None,
                "network": "tcp",
                "tls": "none",
                "sni": [],
                "host": [],
                "path": "",
                "header_type": "",
                "is_fallback": False,
            }

            # port config
            try:
                config["port"] = inbound["port"]
            except KeyError:
                if self._fallbacks_inbound:
                    try:
                        config["port"] = self._fallbacks_inbound["port"]
                        config["is_fallback"] = True
                    except KeyError:
                        raise ValueError("fallbacks inbound doesn't have port")

            # stream config
            if stream := inbound.get("streamSettings"):
                net = stream.get("network", "tcp")
                net_settings = stream.get(f"{net}Settings", {})
                security = stream.get("security")
                tls_settings = stream.get(f"{security}Settings")

                if config["is_fallback"] is True:
                    # probably this is a fallback
                    security = self._fallbacks_inbound.get("streamSettings", {}).get("security")
                    tls_settings = self._fallbacks_inbound.get("streamSettings", {}).get(f"{security}Settings", {})

                config["network"] = net

                if security == "tls":
                    # config['fp']
                    # config['alpn']
                    config["tls"] = "tls"
                    for certificate in tls_settings.get("certificates", []):
                        if certificate.get("certificateFile", None):
                            with open(certificate["certificateFile"], "rb") as file:
                                cert = file.read()
                                config["sni"].extend(get_cert_SANs(cert))

                        if certificate.get("certificate", None):
                            cert = certificate["certificate"]
                            if isinstance(cert, list):
                                cert = "\n".join(cert)
                            if isinstance(cert, str):
                                cert = cert.encode()
                            config["sni"].extend(get_cert_SANs(cert))

                elif security == "reality":
                    config["fp"] = "chrome"
                    config["tls"] = "reality"
                    config["sni"] = tls_settings.get("serverNames", [])

                    try:
                        config["pbk"] = tls_settings["publicKey"]
                    except KeyError:
                        pvk = tls_settings.get("privateKey")
                        if not pvk:
                            raise ValueError(f"You need to provide privateKey in realitySettings of {inbound['tag']}")

                        try:
                            from app.xray import core

                            x25519 = core.get_x25519(pvk)
                            config["pbk"] = x25519["public_key"]
                        except ImportError:
                            pass

                        if not config.get("pbk"):
                            raise ValueError(f"You need to provide publicKey in realitySettings of {inbound['tag']}")

                    try:
                        config["sids"] = tls_settings.get("shortIds")
                        config["sids"][0]  # check if there is any shortIds
                    except IndexError, TypeError:
                        raise ValueError(
                            f"You need to define at least one shortID in realitySettings of {inbound['tag']}"
                        )
                    try:
                        config["spx"] = tls_settings.get("SpiderX")
                    except Exception:
                        config["spx"] = ""

                if net in ("tcp", "raw"):
                    header = net_settings.get("header", {})
                    request = header.get("request", {})
                    path = request.get("path")
                    host = request.get("headers", {}).get("Host")

                    config["header_type"] = header.get("type", "")

                    if isinstance(path, str) or isinstance(host, str):
                        raise ValueError(
                            f"Settings of {inbound['tag']} for path and host must be list, not str\n"
                            "https://xtls.github.io/config/transports/tcp.html#httpheaderobject"
                        )

                    if path and isinstance(path, list):
                        config["path"] = path[0]

                    if host and isinstance(host, list):
                        config["host"] = host

                elif net == "ws":
                    path = net_settings.get("path", "")
                    host = net_settings.get("host", "") or net_settings.get("headers", {}).get("Host")

                    config["header_type"] = ""

                    if isinstance(path, list) or isinstance(host, list):
                        raise ValueError(
                            f"Settings of {inbound['tag']} for path and host must be str, not list\n"
                            "https://xtls.github.io/config/transports/websocket.html#websocketobject"
                        )

                    if isinstance(path, str):
                        config["path"] = path

                    if isinstance(host, str):
                        config["host"] = [host]

                    config["heartbeatPeriod"] = net_settings.get("heartbeatPeriod", 0)
                elif net == "grpc" or net == "gun":
                    config["header_type"] = ""
                    config["path"] = net_settings.get("serviceName", "")
                    host = net_settings.get("authority", "")
                    config["host"] = [host]
                    config["multiMode"] = net_settings.get("multiMode", False)

                elif net == "quic":
                    config["header_type"] = net_settings.get("header", {}).get("type", "")
                    config["path"] = net_settings.get("key", "")
                    config["host"] = [net_settings.get("security", "")]

                elif net == "httpupgrade":
                    config["path"] = net_settings.get("path", "")
                    host = net_settings.get("host", "")
                    config["host"] = [host]

                elif net in ("splithttp", "xhttp"):
                    config["path"] = net_settings.get("path", "")
                    host = net_settings.get("host", "")
                    config["host"] = [host]
                    config["scMaxEachPostBytes"] = net_settings.get("scMaxEachPostBytes", 1000000)
                    config["scMaxConcurrentPosts"] = net_settings.get("scMaxConcurrentPosts", 100)
                    config["scMinPostsIntervalMs"] = net_settings.get("scMinPostsIntervalMs", 30)
                    config["xPaddingBytes"] = net_settings.get("xPaddingBytes", "100-1000")
                    config["xmux"] = net_settings.get("xmux", {})
                    config["mode"] = net_settings.get("mode", "auto")
                    config["noGRPCHeader"] = net_settings.get("noGRPCHeader", False)
                    config["keepAlivePeriod"] = net_settings.get("keepAlivePeriod", 0)

                elif net == "kcp":
                    header = net_settings.get("header", {})

                    config["header_type"] = header.get("type", "")
                    config["host"] = header.get("domain", "")
                    config["path"] = net_settings.get("seed", "")

                elif net in ("http", "h2", "h3"):
                    net_settings = stream.get("httpSettings", {})

                    config["host"] = net_settings.get("host") or net_settings.get("Host", "")
                    config["path"] = net_settings.get("path", "")

                else:
                    config["path"] = net_settings.get("path", "")
                    host = net_settings.get("host", {}) or net_settings.get("Host", {})
                    if host and isinstance(host, str):
                        config["host"] = host
                    elif host and isinstance(host, list):
                        config["host"] = host[0]

            self.inbounds.append(config)
            self.inbounds_by_tag[inbound["tag"]] = config

            try:
                self.inbounds_by_protocol[inbound["protocol"]].append(config)
            except KeyError:
                self.inbounds_by_protocol[inbound["protocol"]] = [config]

    def get_inbound(self, tag) -> dict:
        for inbound in self["inbounds"]:
            if inbound["tag"] == tag:
                return inbound

    def get_outbound(self, tag) -> dict:
        for outbound in self["outbounds"]:
            if outbound["tag"] == tag:
                return outbound

    def to_json(self, **json_kwargs):
        return json.dumps(self, **json_kwargs)

    def copy(self):
        return deepcopy(self)

    def include_db_users(self) -> XRayConfig:
        config = self.copy()

        with GetDB() as db:
            query = (
                db.query(
                    db_models.User.id,
                    db_models.User.username,
                    func.lower(db_models.Proxy.type).label("type"),
                    db_models.Proxy.settings,
                    func.group_concat(db_models.excluded_inbounds_association.c.inbound_tag).label(
                        "excluded_inbound_tags"
                    ),
                )
                .join(db_models.Proxy, db_models.User.id == db_models.Proxy.user_id)
                .outerjoin(
                    db_models.excluded_inbounds_association,
                    db_models.Proxy.id == db_models.excluded_inbounds_association.c.proxy_id,
                )
                .filter(db_models.User.status.in_([UserStatus.active, UserStatus.on_hold]))
                .group_by(
                    func.lower(db_models.Proxy.type),
                    db_models.User.id,
                    db_models.User.username,
                    db_models.Proxy.settings,
                )
            )
            result = query.all()

            grouped_data = defaultdict(list)

            for row in result:
                grouped_data[row.type].append(
                    (
                        row.id,
                        row.username,
                        row.settings,
                        [i for i in row.excluded_inbound_tags.split(",") if i] if row.excluded_inbound_tags else None,
                    )
                )

            for proxy_type, rows in grouped_data.items():
                inbounds = self.inbounds_by_protocol.get(proxy_type)
                if not inbounds:
                    continue

                for inbound in inbounds:
                    clients = config.get_inbound(inbound["tag"])["settings"]["clients"]

                    for row in rows:
                        user_id, username, _settings, excluded_inbound_tags = row

                        if excluded_inbound_tags and inbound["tag"] in excluded_inbound_tags:
                            continue

                        client = {"email": f"{user_id}.{username}", **_settings}

                        # XTLS currently only supports transmission methods of TCP and mKCP
                        if client.get("flow") and (
                            inbound.get("network", "tcp") not in ("tcp", "raw", "kcp")
                            or (
                                inbound.get("network", "tcp") in ("tcp", "raw", "kcp")
                                and inbound.get("tls") not in ("tls", "reality")
                            )
                            or inbound.get("header_type") == "http"
                        ):
                            del client["flow"]

                        clients.append(client)

        if settings.debug:
            with open("generated_config-debug.json", "w") as f:
                f.write(config.to_json(indent=4))

        return config
