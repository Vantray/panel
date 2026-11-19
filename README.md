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

Vantray is an open-source web panel for managing [Xray-core](https://github.com/XTLS/Xray-core) servers. It lets you deploy, configure, and monitor proxy and VPN protocols.

Built as an improved fork of the original [Marzban](https://github.com/Gozargah/Marzban) project, Vantray adds broader protocol support, improved stability, and many features for ease of use.

### Features

- **REST API** backend
- Support for **Vmess**, **VLESS**, **Trojan** and **Shadowsocks** protocols
- Ability to enable **multiple protocols** for each user
- **Multiple users** on a single inbound
- **Multiple inbounds** on a **single port** (fallbacks support)
- Limits based on **traffic volume** and **expiration date**
- Periodic traffic limits (e.g. allocate traffic per day, week, etc.)
- Support for **subscription links** compatible with **V2ray** _(such as V2RayNG, SingBox, Nekoray, etc.)_, **Clash** and **ClashMeta**
- Automatic generation of **links** and **QR codes**
- Server resource and **traffic usage** monitoring
- Customizable Xray configurations
- **TLS** and **REALITY** support
- Built-in **Telegram Bot**
- Built-in **Command Line Interface (CLI)**
- **Multiple languages**
- Support for **multiple administrators** (WIP)

# Quick Start

Install Vantray with the SQLite database (default):

```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install
```

Install Vantray with the MySQL database:

```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install --database mysql
```

Install Vantray with the MariaDB database:
```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install --database mariadb
```

Once the installation is complete:
- You will see the logs, which you can stop by pressing `Ctrl+C` or by closing the terminal.
- Vantray files will be located at `/opt/vantray`.
- The configuration file will be located at `/opt/vantray/.env` (see [Configuration](#configuration)).
- Data files will be located at `/var/lib/vantray`.
- For security reasons, the dashboard is not accessible via an IP address. Therefore, you need to obtain an SSL certificate and access the dashboard by opening a web browser and navigating to `https://YOUR_DOMAIN:8000/dashboard/` (replace YOUR_DOMAIN with your actual domain).
- You can also use SSH port forwarding to access the Vantray dashboard locally without a domain. Replace `user@serverip` with your actual SSH username and server IP address and run the following command:

```bash
ssh -L 8000:localhost:8000 user@serverip
```

Finally, open the following link to access the Vantray dashboard:

http://localhost:8000/dashboard/

You will lose access to the dashboard as soon as you close the SSH terminal. Therefore, this method is recommended for testing only.

Next, you need to create a sudo administrator to log in to the Vantray dashboard by running the following command:

```bash
vantray cli admin create --sudo
```

That's it! You can now log in using your account credentials.

To see the CLI help message, run:

```bash
vantray --help
```

# Configuration

Copy the example file to `.env` and replace the variables as needed:

```bash
cp .env.example .env
```

> Below are the settings that can be configured using environment variables placed in the `.env` file.

| Variable                                 | Description                                                                                                                    |
| ---------------------------------------- |--------------------------------------------------------------------------------------------------------------------------------|
| SUDO_USERNAME                            | Sudo administrator username                                                                                                    |
| SUDO_PASSWORD                            | Sudo administrator password                                                                                                    |
| SQLALCHEMY_DATABASE_URL                  | Path to the database file ([SQLAlchemy's docs](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls))             |
| UVICORN_HOST                             | Bind the application to a host (default: `0.0.0.0`)                                                                            |
| UVICORN_PORT                             | Bind the application to a port (default: `8000`)                                                                               |
| UVICORN_UDS                              | Bind the application to a UNIX domain socket                                                                                   |
| UVICORN_SSL_CERTFILE                     | Path to the SSL certificate file                                                                                               |
| UVICORN_SSL_KEYFILE                      | Path to the SSL key file                                                                                                       |
| UVICORN_SSL_CA_TYPE                      | Type of the SSL certificate authority. Use `private` for testing self-signed CAs (default: `public`)                           |
| XRAY_JSON                                | Path to the Xray JSON configuration file (default: `xray_config.json`)                                                         |
| XRAY_EXECUTABLE_PATH                     | Path to the Xray binary (default: `/usr/local/bin/xray`)                                                                       |
| XRAY_ASSETS_PATH                         | Path to the folder containing Xray asset files (geoip.dat and geosite.dat) (default: `/usr/local/share/xray`)                  |
| XRAY_SUBSCRIPTION_URL_PREFIX             | Subscription URL prefix                                                                                                        |
| XRAY_FALLBACKS_INBOUND_TAG               | If you use an inbound with multiple fallbacks, specify its tag here                                                            |
| XRAY_EXCLUDE_INBOUND_TAGS                | Tags of inbounds that do not need to be managed and should not be included in the proxy list                                   |
| CUSTOM_TEMPLATES_DIRECTORY               | Path to the folder with custom templates (default: `app/templates`)                                                            |
| CLASH_SUBSCRIPTION_TEMPLATE              | Template for generating the Clash configuration (default: `clash/default.yml`)                                                 |
| SUBSCRIPTION_PAGE_TEMPLATE               | Template for the subscription page (default: `subscription/index.html`)                                                        |
| HOME_PAGE_TEMPLATE                       | Template for the home page (default: `home/index.html`)                                                                        |
| TELEGRAM_API_TOKEN                       | Telegram bot token (obtained from [@botfather](https://t.me/botfather))                                                        |
| TELEGRAM_ADMIN_ID                        | Numeric Telegram ID of the administrator (obtained from [@userinfobot](https://t.me/userinfobot))                              |
| TELEGRAM_PROXY_URL                       | Proxy URL for running the Telegram bot (if Telegram servers are blocked on your server)                                        |
| JWT_ACCESS_TOKEN_EXPIRE_MINUTES          | Access token expiration time in minutes, `0` means "no expiration" (default: `1440`)                                           |
| DOCS                                     | Enable API documentation at `/docs` and `/redoc` (default: `False`)                                                            |
| DEBUG                                    | Enable development mode (default: `False`)                                                                                     |
| WEBHOOK_ADDRESS                          | Webhook address for sending notifications. Webhook notifications will be sent if this value is set                             |
| WEBHOOK_SECRET                           | The webhook secret will be sent with each request as `x-webhook-secret` in the header (default: `None`)                        |
| NUMBER_OF_RECURRENT_NOTIFICATIONS        | How many times to retry sending a notification when an error is encountered (default: `3`)                                     |
| RECURRENT_NOTIFICATIONS_TIMEOUT          | Timeout between each retry when an error is encountered, in seconds (default: `180`)                                           |
| NOTIFY_REACHED_USAGE_PERCENT             | At what usage percentage to send a warning (default: `80`)                                                                     |
| NOTIFY_DAYS_LEFT                         | How many days before expiration to send a warning (default: `3`)                                                               |
| USERS_AUTODELETE_DAYS                    | Delete expired (and optionally limited users) after this many days (Negative values disable this feature, default: `-1`)       |
| USER_AUTODELETE_INCLUDE_LIMITED_ACCOUNTS | Whether to include limited accounts in the auto-delete feature (default: `False`)                                              |
| USE_CUSTOM_JSON_DEFAULT                  | Enable custom JSON config for ALL supported clients (default: `False`)                                                         |
| USE_CUSTOM_JSON_FOR_V2RAYNG              | Enable custom JSON config only for V2rayNG (default: `False`)                                                                  |
| USE_CUSTOM_JSON_FOR_STREISAND            | Enable custom JSON config only for Streisand (default: `False`)                                                                |
| USE_CUSTOM_JSON_FOR_V2RAYN               | Enable custom JSON config only for V2rayN (default: `False`)                                                                   |

# API

Vantray provides a REST API that allows developers to interact with Vantray services programmatically. To view the API documentation in Swagger UI or ReDoc, set the `DOCS=True` variable and go to `/docs` and `/redoc`.

# Backup

It is always a good idea to regularly back up your Vantray files to prevent data loss in the event of system failures or accidental deletion. Below are the steps for creating a Vantray backup:

1. By default, all important Vantray files are stored in the `/var/lib/vantray` folder (in Docker versions). Copy the entire `/var/lib/vantray` directory to a backup location of your choice, such as an external hard drive or cloud storage.
2. In addition, do not forget to back up the env file containing the configuration variables, as well as the Xray configuration file. If you installed Vantray using the [installation script](#quick-start), the env file and other configurations should be located in the `/opt/vantray/` directory.

By following these steps, you can ensure that all Vantray files and data, as well as the configuration variables and Xray configuration, are backed up in case you need to restore them in the future. Remember to update your backups regularly to keep them up to date.

# Telegram Bot

Vantray comes with a built-in Telegram bot that can manage the server, create and delete users, and send notifications. This bot can be easily enabled by following a few simple steps, and it provides a convenient way to interact with Vantray without having to log in to the server every time.

To enable the Telegram bot, follow these steps:

1. Set `TELEGRAM_API_TOKEN` to the API token of your bot.
2. Set `TELEGRAM_ADMIN_ID` to the numeric ID of your Telegram account, which you can get from [@userinfobot](https://t.me/userinfobot).

The Vantray backup service efficiently archives all necessary files and sends them to your specified Telegram bot. It supports SQLite, MySQL, and MariaDB databases. One of its key features is automation, which lets you set up a backup schedule, for example, every hour. There are no file size limits for uploading to Telegram via the bot: if a file exceeds the limit, it will be automatically split and sent in parts. You can also run a backup manually at any time.

Install the latest version of Vantray:

```bash
sudo bash -c "$(curl -sL https://github.com/vantray/scripts/raw/main/vantray.sh)" @ install-script
```

Set up the backup service:

```bash
vantray backup-service
```

Instant backup:

```bash
vantray backup
```

# CLI

Vantray comes with a built-in CLI that allows administrators to interact with it directly.

If you installed Vantray using the installation script, you can access the CLI commands by running:

```bash
vantray cli [OPTIONS] COMMAND [ARGS]...
```

For more information, see the [CLI documentation](./cli/README.md).


# Webhook notifications

You can set a webhook address, and Vantray will send notifications to that address.

Requests will be sent as a POST request to the address specified in `WEBHOOK_ADDRESS`, with `WEBHOOK_SECRET` as `x-webhook-secret` in the headers.

Example of a request sent:

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

Different action types: `user_created`, `user_updated`, `user_deleted`, `user_limited`, `user_expired`, `user_disabled`, `user_enabled`

## Contributing

Contributions are welcome. Please read the [contributing guide](/CONTRIBUTING.md) before opening a pull request or issue.

## License

Distributed under the [AGPL-3.0](LICENSE) license.

Copyright (C) 2023 Gozargah and Marzban contributors.\
Copyright (C) 2026 Vantray.
