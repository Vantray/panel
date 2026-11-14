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
    <a href="https://github.com/Vantray/panel/actions"><img src="https://img.shields.io/github/actions/workflow/status/vantray/panel/release.yml.svg" alt="Build"></a>
    <a href="https://github.com/Vantray/panel/releases/latest"><img src="https://img.shields.io/github/downloads/vantray/panel/total.svg" alt="Downloads"></a>
    <a href="https://www.gnu.org/licenses/agpl-3.0.html"><img src="https://img.shields.io/github/license/vantray/panel" alt="License" /></a>
</p>

Vantray — веб-панель с открытым исходным кодом для управления серверами [Xray-core](https://github.com/XTLS/Xray-core). С её помощью можно разворачивать, настраивать и отслеживать работу прокси- и VPN-протоколов.

Созданный как улучшенный форк оригинального проекта [Marzban](https://github.com/Gozargah/Marzban), Vantray добавляет более широкую поддержку протоколов, повышенную стабильность и множество функций для удобства использования.

### Функции

- **REST API** бэкэнд
- Поддержка протоколов **Vmess**, **VLESS**, **Trojan** и **Shadowsocks**
- Возможность активации **нескольких протоколов** для каждого пользователя
- **Несколько пользователей** на одном inbound
- **Несколько inbound** на **одном порту** (поддержка fallbacks)
- Ограничения на основе **количества трафика** и **срока действия**
- Ограничение трафика по **периодам** (например выдавать трафик на день, неделю и т. д.)
- Поддержка **ссылок-подписок** совместимых с **V2ray** _(такие как V2RayNG, SingBox, Nekoray, и др.)_, **Clash** и **ClashMeta**
- Автоматическая генерация **Ссылок** и **QRcode** 
- Мониторинг ресурсов сервера и **использования трафика**
- Настраиваемые конфигурации xray
- Поддержка **TLS** и **REALITY** 
- Встроенный **Telegram Bot**
- Встроенный **Command Line Interface (CLI)**
- **Несколько языков**
- Поддержка **Нескольких администраторов** (WIP)

# Быстрый старт


Установка Vantray с базой данных SQLite (по умолчанию):

```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install
```

Установка Vantray с базой данных MySQL:

```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install --database mysql
```

Установка Vantray с базой данных MariaDB:
```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install --database mariadb
```

Когда установка будет завершена:
- Вы увидите логи, которые можно остановить, нажав `Ctrl+C` или закрыв терминал.
- Файлы Vantray будут размещены по адресу `/opt/vantray`.
- Файл конфигурации будет размещен по адресу `/opt/vantray/.env` (см. [Конфигурация](#конфигурация)).
- Файлы с данными будут размещены по адресу `/var/lib/vantray`.
- По соображениям безопасности, панель управления недоступна через IP-адрес. Поэтому вам необходимо получить SSL-сертификат и получить доступ к панели управления, открыв веб-браузер и перейдя по адресу `https://YOUR_DOMAIN:8000/dashboard/` (замените YOUR_DOMAIN на ваш фактический домен).
- Вы также можете использовать перенаправление портов SSH для локального доступа к панели управления Vantray без домена. Замените `user@serverip` на ваше фактическое имя пользователя SSH и IP-адрес сервера и выполните следующую команду:

```bash
ssh -L 8000:localhost:8000 user@serverip
```

Наконец, перейдите по следующей ссылке, чтобы получить доступ к панели управления Vantray:

http://localhost:8000/dashboard/

Вы потеряете доступ к панели управления, как только закроете терминал SSH. Поэтому этот метод рекомендуется использовать только для тестирования.

Далее, Вам нужно создать главного администратора для входа в панель управления Vantray, выполнив следующую команду: 

```bash
vantray cli admin create --sudo
```

Готово! Теперь Вы можете войти, используя данные своей учетной записи.

Для того, чтобы увидеть справочное сообщение от CLI, выполните команду:

```bash
vantray --help
```

# Конфигурация

> Ниже приведены настройки, которые можно задать с помощью переменных окружения поместив их в файл `.env`.

| Перменная                                | Описание                                                                                                                       |
| ---------------------------------------- |--------------------------------------------------------------------------------------------------------------------------------|
| SUDO_USERNAME                            | Имя пользователя главного администратора                                                                                       |
| SUDO_PASSWORD                            | Пароль главного администратора                                                                                                 |
| SQLALCHEMY_DATABASE_URL                  | Путь к файлу БД ([SQLAlchemy's docs](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls))                       |
| UVICORN_HOST                             | Привязка приложения к хосту (по умолчанию: `0.0.0.0`)                                                                          |
| UVICORN_PORT                             | Привязка приложения к порту (по умолчанию: `8000`)                                                                             |
| UVICORN_UDS                              | Привязка приложения к UNIX domain socket                                                                                       |
| UVICORN_SSL_CERTFILE                     | Адрес файла сертификата SSL                                                                                                    |
| UVICORN_SSL_KEYFILE                      | Адрес файла ключа SSL                                                                                                          |
| UVICORN_SSL_CA_TYPE                      | Тип центра сертификации ключа SSL. Используйте `private` для тестирования самоподписанных CA (по умолчанию: `public`)          |
| XRAY_JSON                                | Адрес файла JSON конфигурации Xray. (по умолчанию: `xray_config.json`)                                                         |
| XRAY_EXECUTABLE_PATH                     | Путь к бинарникам Xray  (по умолчанию: `/usr/local/bin/xray`)                                                                  |
| XRAY_ASSETS_PATH                         | Путь к папке с рессурсными файлами для Xray (файлы geoip.dat и geosite.dat) (по умолчанию: `/usr/local/share/xray`)            |
| XRAY_SUBSCRIPTION_URL_PREFIX             | Префикс адреса подписки                                                                                                        |
| XRAY_FALLBACKS_INBOUND_TAG               | Если вы используете входящее соединение с несколькими резервными вариантами, укажите здесь его тег                             |
| XRAY_EXCLUDE_INBOUND_TAGS                | Теги входящих соединений, которые не требуют управления и не должны быть включены в список прокси                              |
| CUSTOM_TEMPLATES_DIRECTORY               | Путь к папке с пользовательскими шаблонами (по умолчанию: `app/templates`)                                                     |
| CLASH_SUBSCRIPTION_TEMPLATE              | Шаблон для создания конфигурации Clash (по умолчанию: `clash/default.yml`)                                                     |
| SUBSCRIPTION_PAGE_TEMPLATE               | Шаблон для страницы подписки (по умолчанию: `subscription/index.html`)                                                         |
| HOME_PAGE_TEMPLATE                       | Шаблон главной страницы (по умолчанию: `home/index.html`)                                                                      |
| TELEGRAM_API_TOKEN                       | Токен Telegram-бота  (полученный от [@botfather](https://t.me/botfather))                                                      |
| TELEGRAM_ADMIN_ID                        | Числовой идентификатор администратора в Telegram (полученный от [@userinfobot](https://t.me/userinfobot))                      |
| TELEGRAM_PROXY_URL                       | URL прокси для запуска Telegram-бота (если серверы Telegram заблокированы на вашем сервере).                                   |
| JWT_ACCESS_TOKEN_EXPIRE_MINUTES          | Время истечения срока действия доступного токена в минутах, `0` означает "без истечения срока действия" (по умолчанию: `1440`) |
| DOCS                                     | Активация документации API по адресам `/docs` и `/redoc`. (по умолчанию: `False`)                                              |
| DEBUG                                    | Активация режима разработки (development) (по умолчанию: `False`)                                                              |
| WEBHOOK_ADDRESS                          | Адрес Webhook для отправки уведомлений. Уведомления Webhook будут отправляться, если это значение было установлено             |
| WEBHOOK_SECRET                           | Webhook secret будет передаваться с каждым запросом в виде `x-webhook-secret` в заголовке (по умолчанию: `None`)               |
| NUMBER_OF_RECURRENT_NOTIFICATIONS        | Сколько раз повторять попытку отправки уведомления при обнаружении ошибки  (по умолчанию: `3`)                                 |
| RECURRENT_NOTIFICATIONS_TIMEOUT          | Тайм-аут между каждым повторным запросом при обнаружении ошибки в секундах (по умолчанию: `180`)                               |
| NOTIFY_REACHED_USAGE_PERCENT             | При каком проценте использования отправлять предупреждение (по умолчанию: `80`)                                                |
| NOTIFY_DAYS_LEFT                         | Когда отправлять предупреждение об истечении срока действия (по умолчанию: `3`)                                                |
| USERS_AUTODELETE_DAYS | Удалять пользователей с истекшим сроком действия (и, возможно, ограниченных пользователей) по истечении этого количества дней (отрицательные значения отключают эту функцию, по умолчанию: `-1`) |
| USER_AUTODELETE_INCLUDE_LIMITED_ACCOUNTS | Следует ли включать ограниченные учетные записи в функцию автоматического удаления (по умолчанию: `False`) |
| USE_CUSTOM_JSON_DEFAULT | Включить пользовательскую конфигурацию JSON для ВСЕХ поддерживаемых клиентов (по умолчанию: `False`) |
| USE_CUSTOM_JSON_FOR_V2RAYNG | Включить пользовательскую конфигурацию JSON только для V2rayNG (по умолчанию: `False`) |
| USE_CUSTOM_JSON_FOR_STREISAND | Включить пользовательскую конфигурацию JSON только для Streisand (по умолчанию: `False`) |
| USE_CUSTOM_JSON_FOR_V2RAYN | Включить пользовательскую конфигурацию JSON только для V2rayN (по умолчанию: `False`)                                                               |

# API

Vantray предоставляет REST API, позволяющий разработчикам программно взаимодействовать с сервисами Vantray. Для просмотра документации по API в Swagger UI или ReDoc установите  переменную `DOCS=True` и перейдите по ссылкам `/docs` и `/redoc`.

# Backup

Всегда полезно регулярно создавать резервные копии файлов Vantray, чтобы предотвратить потерю данных в случае системных сбоев или случайного удаления. Ниже приведены шаги для создания резервной копии Vantray:

1. По умолчанию все важные файлы Vantray сохраняются в папке `/var/lib/vantray` (в версиях Docker). Скопируйте весь каталог `/var/lib/vantray` в выбранное вами место резервного копирования, например на внешний жесткий диск или в облачное хранилище.
2. Кроме того, не забудьте сделать резервную копию файла env, содержащего переменные конфигурации, а также файла конфигурации Xray. Если вы устанавливали Vantray с помощью [скрипта установки](#быстрый-старт), то env и другие конфигурации должны находиться в каталоге `/opt/vantray/`.

Выполнив эти действия, вы сможете обеспечить резервное копирование всех файлов и данных Vantray, а также переменных конфигурации и конфигурации Xray на случай, если в будущем потребуется их восстановить. Не забывайте регулярно обновлять резервные копии, чтобы поддерживать их в актуальном состоянии.

# Telegram Bot

Vantray поставляется с встроенным ботом Telegram, который может управлять сервером, создавать и удалять пользователей, а также отправлять уведомления. Этот бот можно легко включить, выполнив несколько простых шагов, и он предоставляет удобный способ взаимодействия с Vantray без необходимости каждый раз заходить на сервер.

Чтобы включить Telegram-бота, выполните следующие действия:

1. установите `TELEGRAM_API_TOKEN` в качестве API-токена вашего бота.
2. установите `TELEGRAM_ADMIN_ID` в качестве цифрового ID вашего Telegram-аккаунта, который вы можете получить от [@userinfobot](https://t.me/userinfobot)

Сервис резервного копирования Vantray эффективно архивирует все необходимые файлы и отправляет их вашему указанному Telegram-боту. Он поддерживает базы данных SQLite, MySQL и MariaDB. Одной из ключевых особенностей является автоматизация, позволяющая настроить расписание резервного копирования, например, каждый час. При этом ограничений на размер файлов для загрузки в Telegram через бота нет: если файл превышает лимит, он будет автоматически разделен и отправлен частями. Также можно запустить резервное копирование вручную в любой момент.

Установка последней версии Vantray:

```bash
sudo bash -c "$(curl -sL https://github.com/vantray/scripts/raw/main/vantray.sh)" @ install-script
```

Настройка сервиса резервного копирования:

```bash
vantray backup-service
```

Мгновенное резервное копирование:

```bash
vantray backup
```

# CLI

Vantray поставляется с встроенным CLI, который позволяет администраторам напрямую взаимодействовать с ним.

Если вы установили Vantray с помощью скрипта установки, то доступ к командам cli можно получить, выполнив команду:

```bash
vantray cli [OPTIONS] COMMAND [ARGS]...
```

Для получения дополнительной информации можно ознакомиться с [документацией по CLI](./cli/README.md).


# Webhook уведомления

Вы можете задать адрес webhook, и Vantray будет отправлять уведомления на этот адрес.

Запросы будут отправляться в виде POST-запроса на адрес, указанный в `WEBHOOK_ADDRESS`, с `WEBHOOK_SECRET` в качестве `x-webhook-secret` в заголовках.

Пример запроса, отправленного :

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

Различные типы действий: `user_created`, `user_updated`, `user_deleted`, `user_limited`, `user_expired`, `user_disabled`, `user_enabled`

## Участие в разработке

Вклад приветствуется. Пожалуйста, прочитайте [руководство по участию](/CONTRIBUTING.md), прежде чем открывать pull request или issue.

## Лицензия

Распространяется под лицензией [AGPL-3.0](LICENSE).

Copyright (C) 2023 Gozargah и контрибьюторы Marzban.\
Copyright (C) 2026 lordfre.