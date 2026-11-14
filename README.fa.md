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

Vantray یک پنل وب متن‌باز برای مدیریت سرورهای [Xray-core](https://github.com/XTLS/Xray-core) است. با آن می‌توانید پروتکل‌های پراکسی و VPN را راه‌اندازی، پیکربندی و پایش کنید.

Vantray که به‌عنوان یک فورک بهبودیافته از پروژه اصلی [Marzban](https://github.com/Gozargah/Marzban) ساخته شده است، پشتیبانی گسترده‌تر از پروتکل‌ها، پایداری بیشتر و امکانات متعددی برای سهولت استفاده اضافه می‌کند.

### ویژگی‌ها

- بک‌اند **REST API**
- پشتیبانی از پروتکل‌های **Vmess**، **VLESS**، **Trojan** و **Shadowsocks**
- امکان فعال‌سازی **چندین پروتکل** برای هر کاربر
- **چندین کاربر** روی یک inbound
- **چندین inbound** روی **یک پورت** (پشتیبانی از fallbacks)
- محدودیت بر اساس **حجم ترافیک** و **تاریخ انقضا**
- محدودیت ترافیک **دوره‌ای** (مثلاً تخصیص ترافیک روزانه، هفتگی و غیره)
- پشتیبانی از **لینک‌های اشتراک** سازگار با **V2ray** _(مانند V2RayNG، SingBox، Nekoray و غیره)_، **Clash** و **ClashMeta**
- تولید خودکار **لینک‌ها** و **کد QR**
- پایش منابع سرور و **میزان مصرف ترافیک**
- پیکربندی‌های قابل سفارشی‌سازی Xray
- پشتیبانی از **TLS** و **REALITY**
- **ربات تلگرام** داخلی
- **رابط خط فرمان (CLI)** داخلی
- **چندزبانه**
- پشتیبانی از **چندین ادمین** (در حال توسعه)

# شروع سریع

نصب Vantray با پایگاه داده SQLite (پیش‌فرض):

```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install
```

نصب Vantray با پایگاه داده MySQL:

```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install --database mysql
```

نصب Vantray با پایگاه داده MariaDB:
```bash
bash -c "$(curl -sL https://github.com/Vantray/scripts/raw/main/vantray.sh)" @ install --database mariadb
```

پس از پایان نصب:
- لاگ‌ها نمایش داده می‌شوند که با فشردن `Ctrl+C` یا بستن ترمینال می‌توانید آن‌ها را متوقف کنید.
- فایل‌های Vantray در مسیر `/opt/vantray` قرار می‌گیرند.
- فایل پیکربندی در مسیر `/opt/vantray/.env` قرار می‌گیرد (به [پیکربندی](#پیکربندی) مراجعه کنید).
- فایل‌های داده در مسیر `/var/lib/vantray` قرار می‌گیرند.
- به دلایل امنیتی، دسترسی به داشبورد از طریق آدرس IP ممکن نیست. بنابراین باید یک گواهی SSL دریافت کنید و با باز کردن مرورگر و رفتن به آدرس `https://YOUR_DOMAIN:8000/dashboard/` به داشبورد دسترسی پیدا کنید (YOUR_DOMAIN را با دامنه واقعی خود جایگزین کنید).
- همچنین می‌توانید از SSH port forwarding برای دسترسی محلی به داشبورد Vantray بدون دامنه استفاده کنید. `user@serverip` را با نام کاربری SSH و آدرس IP واقعی سرور خود جایگزین کنید و دستور زیر را اجرا کنید:

```bash
ssh -L 8000:localhost:8000 user@serverip
```

در نهایت، برای دسترسی به داشبورد Vantray لینک زیر را باز کنید:

http://localhost:8000/dashboard/

به محض بستن ترمینال SSH، دسترسی شما به داشبورد قطع می‌شود. بنابراین این روش فقط برای آزمایش توصیه می‌شود.

سپس باید با اجرای دستور زیر یک ادمین اصلی (sudo) برای ورود به داشبورد Vantray بسازید:

```bash
vantray cli admin create --sudo
```

تمام! اکنون می‌توانید با اطلاعات حساب خود وارد شوید.

برای مشاهده پیام راهنمای CLI، دستور زیر را اجرا کنید:

```bash
vantray --help
```

# پیکربندی

> در ادامه تنظیماتی آمده است که می‌توان با استفاده از متغیرهای محیطی و قرار دادن آن‌ها در فایل `.env` پیکربندی کرد.

| متغیر                                    | توضیحات                                                                                                                        |
| ---------------------------------------- |--------------------------------------------------------------------------------------------------------------------------------|
| SUDO_USERNAME                            | نام کاربری ادمین اصلی                                                                                                          |
| SUDO_PASSWORD                            | رمز عبور ادمین اصلی                                                                                                            |
| SQLALCHEMY_DATABASE_URL                  | مسیر فایل پایگاه داده ([مستندات SQLAlchemy](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls))                |
| UVICORN_HOST                             | اتصال برنامه به یک هاست (پیش‌فرض: `0.0.0.0`)                                                                                   |
| UVICORN_PORT                             | اتصال برنامه به یک پورت (پیش‌فرض: `8000`)                                                                                      |
| UVICORN_UDS                              | اتصال برنامه به یک UNIX domain socket                                                                                          |
| UVICORN_SSL_CERTFILE                     | مسیر فایل گواهی SSL                                                                                                            |
| UVICORN_SSL_KEYFILE                      | مسیر فایل کلید SSL                                                                                                             |
| UVICORN_SSL_CA_TYPE                      | نوع مرجع صدور گواهی SSL. برای آزمایش CAهای خودامضا از `private` استفاده کنید (پیش‌فرض: `public`)                               |
| XRAY_JSON                                | مسیر فایل پیکربندی JSON مربوط به Xray (پیش‌فرض: `xray_config.json`)                                                            |
| XRAY_EXECUTABLE_PATH                     | مسیر فایل اجرایی Xray (پیش‌فرض: `/usr/local/bin/xray`)                                                                         |
| XRAY_ASSETS_PATH                         | مسیر پوشه فایل‌های منبع Xray (فایل‌های geoip.dat و geosite.dat) (پیش‌فرض: `/usr/local/share/xray`)                             |
| XRAY_SUBSCRIPTION_URL_PREFIX             | پیشوند آدرس اشتراک                                                                                                             |
| XRAY_FALLBACKS_INBOUND_TAG               | اگر از inbound با چندین fallback استفاده می‌کنید، تگ آن را اینجا مشخص کنید                                                     |
| XRAY_EXCLUDE_INBOUND_TAGS                | تگ‌های inboundهایی که نیازی به مدیریت ندارند و نباید در فهرست پراکسی‌ها قرار گیرند                                              |
| CUSTOM_TEMPLATES_DIRECTORY               | مسیر پوشه قالب‌های سفارشی (پیش‌فرض: `app/templates`)                                                                           |
| CLASH_SUBSCRIPTION_TEMPLATE              | قالب تولید پیکربندی Clash (پیش‌فرض: `clash/default.yml`)                                                                       |
| SUBSCRIPTION_PAGE_TEMPLATE               | قالب صفحه اشتراک (پیش‌فرض: `subscription/index.html`)                                                                          |
| HOME_PAGE_TEMPLATE                       | قالب صفحه اصلی (پیش‌فرض: `home/index.html`)                                                                                    |
| TELEGRAM_API_TOKEN                       | توکن ربات تلگرام (دریافت‌شده از [@botfather](https://t.me/botfather))                                                          |
| TELEGRAM_ADMIN_ID                        | شناسه عددی ادمین در تلگرام (دریافت‌شده از [@userinfobot](https://t.me/userinfobot))                                            |
| TELEGRAM_PROXY_URL                       | آدرس پراکسی برای اجرای ربات تلگرام (اگر سرورهای تلگرام روی سرور شما مسدود است)                                                 |
| JWT_ACCESS_TOKEN_EXPIRE_MINUTES          | مدت اعتبار توکن دسترسی به دقیقه؛ `0` یعنی «بدون انقضا» (پیش‌فرض: `1440`)                                                       |
| DOCS                                     | فعال‌سازی مستندات API در آدرس‌های `/docs` و `/redoc` (پیش‌فرض: `False`)                                                        |
| DEBUG                                    | فعال‌سازی حالت توسعه (development) (پیش‌فرض: `False`)                                                                          |
| WEBHOOK_ADDRESS                          | آدرس Webhook برای ارسال اعلان‌ها. در صورت تنظیم این مقدار، اعلان‌های Webhook ارسال می‌شوند                                      |
| WEBHOOK_SECRET                           | کلید مخفی Webhook همراه هر درخواست به‌صورت `x-webhook-secret` در هدر ارسال می‌شود (پیش‌فرض: `None`)                            |
| NUMBER_OF_RECURRENT_NOTIFICATIONS        | تعداد دفعات تلاش مجدد برای ارسال اعلان هنگام بروز خطا (پیش‌فرض: `3`)                                                           |
| RECURRENT_NOTIFICATIONS_TIMEOUT          | فاصله زمانی بین هر تلاش مجدد هنگام بروز خطا، به ثانیه (پیش‌فرض: `180`)                                                         |
| NOTIFY_REACHED_USAGE_PERCENT             | در چه درصدی از مصرف هشدار ارسال شود (پیش‌فرض: `80`)                                                                            |
| NOTIFY_DAYS_LEFT                         | چند روز مانده به انقضا هشدار ارسال شود (پیش‌فرض: `3`)                                                                          |
| USERS_AUTODELETE_DAYS                    | حذف کاربران منقضی‌شده (و در صورت تمایل کاربران محدودشده) پس از این تعداد روز (مقادیر منفی این قابلیت را غیرفعال می‌کنند، پیش‌فرض: `-1`) |
| USER_AUTODELETE_INCLUDE_LIMITED_ACCOUNTS | آیا حساب‌های محدودشده نیز در قابلیت حذف خودکار لحاظ شوند (پیش‌فرض: `False`)                                                     |
| USE_CUSTOM_JSON_DEFAULT                  | فعال‌سازی پیکربندی JSON سفارشی برای همه کلاینت‌های پشتیبانی‌شده (پیش‌فرض: `False`)                                             |
| USE_CUSTOM_JSON_FOR_V2RAYNG              | فعال‌سازی پیکربندی JSON سفارشی فقط برای V2rayNG (پیش‌فرض: `False`)                                                             |
| USE_CUSTOM_JSON_FOR_STREISAND            | فعال‌سازی پیکربندی JSON سفارشی فقط برای Streisand (پیش‌فرض: `False`)                                                           |
| USE_CUSTOM_JSON_FOR_V2RAYN               | فعال‌سازی پیکربندی JSON سفارشی فقط برای V2rayN (پیش‌فرض: `False`)                                                              |

# API

Vantray یک REST API ارائه می‌دهد که به توسعه‌دهندگان امکان می‌دهد به‌صورت برنامه‌نویسی با سرویس‌های Vantray تعامل کنند. برای مشاهده مستندات API در Swagger UI یا ReDoc، متغیر `DOCS=True` را تنظیم کنید و به آدرس‌های `/docs` و `/redoc` بروید.

# پشتیبان‌گیری

همیشه خوب است که برای جلوگیری از از دست رفتن داده‌ها در صورت خرابی سیستم یا حذف تصادفی، به‌طور منظم از فایل‌های Vantray نسخه پشتیبان تهیه کنید. مراحل تهیه نسخه پشتیبان از Vantray در ادامه آمده است:

1. به‌طور پیش‌فرض، همه فایل‌های مهم Vantray در پوشه `/var/lib/vantray` ذخیره می‌شوند (در نسخه‌های Docker). کل دایرکتوری `/var/lib/vantray` را در یک مکان پشتیبان دلخواه، مانند هارد اکسترنال یا فضای ابری، کپی کنید.
2. علاوه بر این، فراموش نکنید که از فایل env که شامل متغیرهای پیکربندی است و همچنین از فایل پیکربندی Xray نسخه پشتیبان تهیه کنید. اگر Vantray را با [اسکریپت نصب](#شروع-سریع) نصب کرده‌اید، فایل env و سایر پیکربندی‌ها باید در دایرکتوری `/opt/vantray/` باشند.

با انجام این مراحل می‌توانید مطمئن شوید که همه فایل‌ها و داده‌های Vantray، به‌همراه متغیرهای پیکربندی و پیکربندی Xray، برای بازیابی در آینده پشتیبان‌گیری شده‌اند. فراموش نکنید که نسخه‌های پشتیبان را به‌طور منظم به‌روزرسانی کنید تا همیشه به‌روز باشند.

# ربات تلگرام

Vantray با یک ربات تلگرام داخلی همراه است که می‌تواند سرور را مدیریت کند، کاربران را بسازد و حذف کند و اعلان ارسال کند. این ربات را می‌توان با چند مرحله ساده به‌راحتی فعال کرد و راهی آسان برای تعامل با Vantray فراهم می‌کند، بدون اینکه هر بار نیاز به ورود به سرور باشد.

برای فعال‌سازی ربات تلگرام مراحل زیر را انجام دهید:

1. مقدار `TELEGRAM_API_TOKEN` را برابر با توکن API ربات خود قرار دهید.
2. مقدار `TELEGRAM_ADMIN_ID` را برابر با شناسه عددی حساب تلگرام خود قرار دهید که می‌توانید از [@userinfobot](https://t.me/userinfobot) دریافت کنید.

سرویس پشتیبان‌گیری Vantray همه فایل‌های لازم را به‌طور کارآمد آرشیو می‌کند و به ربات تلگرامی که مشخص کرده‌اید ارسال می‌کند. این سرویس از پایگاه‌های داده SQLite، MySQL و MariaDB پشتیبانی می‌کند. یکی از ویژگی‌های کلیدی آن خودکارسازی است که به شما امکان می‌دهد زمان‌بندی پشتیبان‌گیری، مثلاً هر ساعت، را تنظیم کنید. محدودیتی برای حجم فایل‌های آپلودی به تلگرام از طریق ربات وجود ندارد: اگر فایلی از حد مجاز بزرگ‌تر باشد، به‌طور خودکار تقسیم و به‌صورت چند بخش ارسال می‌شود. همچنین می‌توانید در هر زمان پشتیبان‌گیری را به‌صورت دستی اجرا کنید.

نصب آخرین نسخه Vantray:

```bash
sudo bash -c "$(curl -sL https://github.com/vantray/scripts/raw/main/vantray.sh)" @ install-script
```

پیکربندی سرویس پشتیبان‌گیری:

```bash
vantray backup-service
```

پشتیبان‌گیری فوری:

```bash
vantray backup
```

# CLI

Vantray با یک CLI داخلی همراه است که به ادمین‌ها امکان می‌دهد مستقیماً با آن تعامل کنند.

اگر Vantray را با اسکریپت نصب، نصب کرده‌اید، می‌توانید با اجرای دستور زیر به دستورات CLI دسترسی پیدا کنید:

```bash
vantray cli [OPTIONS] COMMAND [ARGS]...
```

برای اطلاعات بیشتر به [مستندات CLI](./cli/README.md) مراجعه کنید.


# اعلان‌های Webhook

می‌توانید یک آدرس webhook تنظیم کنید و Vantray اعلان‌ها را به آن آدرس ارسال خواهد کرد.

درخواست‌ها به‌صورت POST به آدرس مشخص‌شده در `WEBHOOK_ADDRESS` ارسال می‌شوند و `WEBHOOK_SECRET` به‌عنوان `x-webhook-secret` در هدرها قرار می‌گیرد.

نمونه‌ای از درخواست ارسال‌شده:

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

انواع مختلف اکشن‌ها: `user_created`، `user_updated`، `user_deleted`، `user_limited`، `user_expired`، `user_disabled`، `user_enabled`

## مشارکت در توسعه

مشارکت شما پذیرفته می‌شود. لطفاً پیش از باز کردن pull request یا issue، [راهنمای مشارکت](/CONTRIBUTING.md) را مطالعه کنید.

## مجوز

تحت مجوز [AGPL-3.0](LICENSE) منتشر شده است.

Copyright (C) 2023 Gozargah و مشارکت‌کنندگان Marzban.\
Copyright (C) 2026 Vantray.