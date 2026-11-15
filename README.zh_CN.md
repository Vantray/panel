[English](/README.md) | [فارسی](/README.fa.md) | [中文](/README.zh_CN.md) | [Русский](/README.ru_RU.md)

<p align="center">
  <a href="https://github.com/Vantray/panel" target="_blank" rel="noopener noreferrer">
    <picture>
      <img width="160" height="160" src="images/vantray-icon.svg">
    </picture>
  </a>
</p>

<h1 align="center"/>Vantray</h1>

<br/>
<p align="center">
    <a href="https://github.com/Vantray/panel/releases"><img src="https://img.shields.io/github/v/release/vantray/panel" alt="Release"></a>
    <a href="https://github.com/Vantray/panel/actions"><img src="https://img.shields.io/github/actions/workflow/status/vantray/panel/build.yml.svg" alt="Build"></a>
    <a href="https://www.gnu.org/licenses/agpl-3.0.html"><img src="https://img.shields.io/github/license/vantray/panel" alt="License" /></a>
</p>

Vantray 是一个用于管理 [Xray-core](https://github.com/XTLS/Xray-core) 服务器的开源 Web 面板。通过它，您可以部署、配置和监控各类代理及 VPN 协议。

Vantray 是原始项目 [Marzban](https://github.com/Gozargah/Marzban) 的改进分支，在此基础上增加了更广泛的协议支持、更高的稳定性，以及许多提升易用性的功能。

### 功能特性

- **REST API** 后端
- 支持 **Vmess**、**VLESS**、**Trojan** 和 **Shadowsocks** 协议
- 可为每个用户启用**多种协议**
- 单个 inbound 上支持**多个用户**
- 同一**端口**上支持**多个 inbound**（支持 fallbacks）
- 基于**流量**和**有效期**的限制
- 按**周期**限制流量（例如按天、按周分配流量等）
- 支持与 **V2ray** _（如 V2RayNG、SingBox、Nekoray 等）_、**Clash** 和 **ClashMeta** 兼容的**订阅链接**
- 自动生成**链接**和**二维码**
- 服务器资源及**流量使用情况**监控
- 可自定义的 Xray 配置
- 支持 **TLS** 和 **REALITY**
- 内置 **Telegram 机器人**
- 内置**命令行界面（CLI）**
- **多语言**支持
- 支持**多管理员**（开发中）

# 快速开始

使用 SQLite 数据库（默认）安装 Vantray：

```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install
```

使用 MySQL 数据库安装 Vantray：

```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install --database mysql
```

使用 MariaDB 数据库安装 Vantray：
```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install --database mariadb
```

安装完成后：
- 您将看到日志输出，可按 `Ctrl+C` 或关闭终端来停止查看。
- Vantray 的文件位于 `/opt/vantray`。
- 配置文件位于 `/opt/vantray/.env`（参见[配置](#配置)）。
- 数据文件位于 `/var/lib/vantray`。
- 出于安全考虑，无法通过 IP 地址访问管理面板。因此您需要获取 SSL 证书，然后在浏览器中访问 `https://YOUR_DOMAIN:8000/dashboard/`（将 YOUR_DOMAIN 替换为您的实际域名）。
- 您也可以使用 SSH 端口转发，在没有域名的情况下于本地访问 Vantray 管理面板。请将 `user@serverip` 替换为您实际的 SSH 用户名和服务器 IP 地址，然后执行以下命令：

```bash
ssh -L 8000:localhost:8000 user@serverip
```

最后，打开以下链接即可访问 Vantray 管理面板：

http://localhost:8000/dashboard/

一旦关闭 SSH 终端，您将失去对管理面板的访问。因此，此方法仅建议用于测试。

接下来，您需要执行以下命令创建超级管理员，以便登录 Vantray 管理面板：

```bash
vantray cli admin create --sudo
```

完成！现在您可以使用您的账户凭据登录了。

要查看 CLI 的帮助信息，请运行：

```bash
vantray --help
```

# 配置

> 以下是可以通过环境变量进行设置的选项，请将它们写入 `.env` 文件。

| 变量                                     | 说明                                                                                                                           |
| ---------------------------------------- |--------------------------------------------------------------------------------------------------------------------------------|
| SUDO_USERNAME                            | 超级管理员用户名                                                                                                               |
| SUDO_PASSWORD                            | 超级管理员密码                                                                                                                 |
| SQLALCHEMY_DATABASE_URL                  | 数据库文件路径（[SQLAlchemy 文档](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls)）                        |
| UVICORN_HOST                             | 将应用绑定到指定主机（默认：`0.0.0.0`）                                                                                        |
| UVICORN_PORT                             | 将应用绑定到指定端口（默认：`8000`）                                                                                           |
| UVICORN_UDS                              | 将应用绑定到 UNIX domain socket                                                                                                |
| UVICORN_SSL_CERTFILE                     | SSL 证书文件的路径                                                                                                             |
| UVICORN_SSL_KEYFILE                      | SSL 密钥文件的路径                                                                                                             |
| UVICORN_SSL_CA_TYPE                      | SSL 证书颁发机构的类型。测试自签名 CA 时请使用 `private`（默认：`public`）                                                     |
| XRAY_JSON                                | Xray JSON 配置文件的路径（默认：`xray_config.json`）                                                                           |
| XRAY_EXECUTABLE_PATH                     | Xray 可执行文件的路径（默认：`/usr/local/bin/xray`）                                                                           |
| XRAY_ASSETS_PATH                         | Xray 资源文件夹（包含 geoip.dat 和 geosite.dat 文件）的路径（默认：`/usr/local/share/xray`）                                   |
| XRAY_SUBSCRIPTION_URL_PREFIX             | 订阅地址前缀                                                                                                                   |
| XRAY_FALLBACKS_INBOUND_TAG               | 如果您使用了带有多个 fallback 的 inbound，请在此处填写其标签                                                                   |
| XRAY_EXCLUDE_INBOUND_TAGS                | 无需管理、不应包含在代理列表中的 inbound 的标签                                                                                |
| CUSTOM_TEMPLATES_DIRECTORY               | 自定义模板文件夹的路径（默认：`app/templates`）                                                                                |
| CLASH_SUBSCRIPTION_TEMPLATE              | 用于生成 Clash 配置的模板（默认：`clash/default.yml`）                                                                         |
| SUBSCRIPTION_PAGE_TEMPLATE               | 订阅页面的模板（默认：`subscription/index.html`）                                                                              |
| HOME_PAGE_TEMPLATE                       | 主页的模板（默认：`home/index.html`）                                                                                          |
| TELEGRAM_API_TOKEN                       | Telegram 机器人令牌（从 [@botfather](https://t.me/botfather) 获取）                                                            |
| TELEGRAM_ADMIN_ID                        | 管理员的 Telegram 数字 ID（从 [@userinfobot](https://t.me/userinfobot) 获取）                                                  |
| TELEGRAM_PROXY_URL                       | 运行 Telegram 机器人所使用的代理 URL（如果您的服务器无法访问 Telegram 服务器）                                                 |
| JWT_ACCESS_TOKEN_EXPIRE_MINUTES          | 访问令牌的过期时间（单位：分钟），`0` 表示"永不过期"（默认：`1440`）                                                           |
| DOCS                                     | 启用位于 `/docs` 和 `/redoc` 的 API 文档（默认：`False`）                                                                      |
| DEBUG                                    | 启用开发模式（默认：`False`）                                                                                                  |
| WEBHOOK_ADDRESS                          | 用于发送通知的 Webhook 地址。设置该值后将发送 Webhook 通知                                                                     |
| WEBHOOK_SECRET                           | Webhook 密钥，将在每个请求的请求头中以 `x-webhook-secret` 的形式发送（默认：`None`）                                           |
| NUMBER_OF_RECURRENT_NOTIFICATIONS        | 发送通知出错时的重试次数（默认：`3`）                                                                                          |
| RECURRENT_NOTIFICATIONS_TIMEOUT          | 出错时每次重试之间的间隔时间（单位：秒）（默认：`180`）                                                                        |
| NOTIFY_REACHED_USAGE_PERCENT             | 使用量达到多少百分比时发送警告（默认：`80`）                                                                                   |
| NOTIFY_DAYS_LEFT                         | 距离到期还剩多少天时发送警告（默认：`3`）                                                                                      |
| USERS_AUTODELETE_DAYS                    | 在过期（以及可选的流量受限）用户超过该天数后将其删除（负值表示禁用此功能，默认：`-1`）                                         |
| USER_AUTODELETE_INCLUDE_LIMITED_ACCOUNTS | 自动删除功能是否包含流量受限的账户（默认：`False`）                                                                            |
| USE_CUSTOM_JSON_DEFAULT                  | 对所有受支持的客户端启用自定义 JSON 配置（默认：`False`）                                                                      |
| USE_CUSTOM_JSON_FOR_V2RAYNG              | 仅对 V2rayNG 启用自定义 JSON 配置（默认：`False`）                                                                             |
| USE_CUSTOM_JSON_FOR_STREISAND            | 仅对 Streisand 启用自定义 JSON 配置（默认：`False`）                                                                           |
| USE_CUSTOM_JSON_FOR_V2RAYN               | 仅对 V2rayN 启用自定义 JSON 配置（默认：`False`）                                                                              |

# API

Vantray 提供 REST API，使开发者能够以编程方式与 Vantray 服务交互。要在 Swagger UI 或 ReDoc 中查看 API 文档，请设置 `DOCS=True` 变量，然后访问 `/docs` 和 `/redoc`。

# 备份

定期备份 Vantray 的文件始终是个好习惯，可以防止系统故障或误删除造成的数据丢失。以下是创建 Vantray 备份的步骤：

1. 默认情况下，Vantray 的所有重要文件都保存在 `/var/lib/vantray` 文件夹中（Docker 版本）。请将整个 `/var/lib/vantray` 目录复制到您选择的备份位置，例如外部硬盘或云存储。
2. 此外，请不要忘记备份包含配置变量的 env 文件，以及 Xray 配置文件。如果您是通过[安装脚本](#快速开始)安装的 Vantray，那么 env 文件和其他配置应位于 `/opt/vantray/` 目录中。

按照这些步骤操作，您可以确保 Vantray 的所有文件和数据，以及配置变量和 Xray 配置都已备份，以便将来需要时进行恢复。请记得定期更新备份，使其保持最新。

# Telegram 机器人

Vantray 内置了 Telegram 机器人，可以管理服务器、创建和删除用户以及发送通知。只需几个简单步骤即可轻松启用该机器人，它提供了一种便捷的方式来与 Vantray 交互，而无需每次都登录服务器。

要启用 Telegram 机器人，请按以下步骤操作：

1. 将 `TELEGRAM_API_TOKEN` 设置为您的机器人的 API 令牌。
2. 将 `TELEGRAM_ADMIN_ID` 设置为您的 Telegram 账户的数字 ID，您可以从 [@userinfobot](https://t.me/userinfobot) 获取。

Vantray 备份服务可以高效地归档所有必要文件，并将其发送到您指定的 Telegram 机器人。它支持 SQLite、MySQL 和 MariaDB 数据库。其关键特性之一是自动化，您可以设置备份计划，例如每小时一次。通过机器人上传到 Telegram 的文件没有大小限制：如果文件超过限制，将被自动拆分并分段发送。您也可以随时手动执行备份。

安装最新版本的 Vantray：

```bash
sudo bash -c "$(curl -sL https://github.com/vantray/scripts/raw/main/vantray.sh)" @ install-script
```

配置备份服务：

```bash
vantray backup-service
```

立即备份：

```bash
vantray backup
```

# CLI

Vantray 内置了 CLI，管理员可以直接通过它与 Vantray 交互。

如果您是通过安装脚本安装的 Vantray，则可以通过执行以下命令访问 CLI 命令：

```bash
vantray cli [OPTIONS] COMMAND [ARGS]...
```

更多信息请参阅 [CLI 文档](./cli/README.md)。


# Webhook 通知

您可以设置 webhook 地址，Vantray 会向该地址发送通知。

请求将以 POST 方式发送到 `WEBHOOK_ADDRESS` 中指定的地址，并在请求头中以 `x-webhook-secret` 携带 `WEBHOOK_SECRET`。

发送的请求示例：

```
Headers:
Host: 0.0.0.0:9000
User-Agent: python-requests/2.28.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: keep-alive
x-webhook-secret: something-very-very-secret
Content-Length: 107
Content-Type: application/json



Body:
{"username": "test_user", "action": "user_updated", "enqueued_at": 1680506457.636369, "tries": 0}
```

不同的操作类型：`user_created`、`user_updated`、`user_deleted`、`user_limited`、`user_expired`、`user_disabled`、`user_enabled`

## 参与贡献

欢迎贡献代码。在提交 pull request 或 issue 之前，请先阅读[贡献指南](/CONTRIBUTING.md)。

## 许可证

基于 [AGPL-3.0](LICENSE) 许可证发布。

Copyright (C) 2023 Gozargah 和 Marzban 贡献者。\
Copyright (C) 2026 Vantray.