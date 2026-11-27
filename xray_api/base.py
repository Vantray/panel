import grpc


class XRayBase:
    def __init__(
            self,
            address: str,
            port: int,
            ssl_cert: str | None = None,
            ssl_target_name: str | None = None
    ) -> None:
        self.address = address
        self.port = port

        if ssl_target_name is not None and ssl_cert is None:
            raise ValueError("ssl_target_name requires ssl_cert")

        target = f"{address}:{port}"
        options = (("grpc.ssl_target_name_override", ssl_target_name),) if ssl_target_name is not None else None

        if ssl_cert is None:
            self._channel = grpc.insecure_channel(target)
        else:
            creds = grpc.ssl_channel_credentials(root_certificates=ssl_cert)
            self._channel = grpc.secure_channel(target, credentials=creds, options=options)
