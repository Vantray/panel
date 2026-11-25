from pathlib import Path
from typing import Annotated, Literal

from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def _split(v, sep: str | None = ",") -> list[str]:
    if isinstance(v, str):
        return [i.strip() for i in v.split(sep) if i.strip()]
    return list(v or [])


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        env_ignore_empty=True,
    )

    sqlalchemy_database_url: str = "sqlite:///db.sqlite3"
    sqlalchemy_pool_size: int = 10
    sqlalchemy_max_overflow: int = 30

    uvicorn_host: str = "0.0.0.0"
    uvicorn_port: int = 8000
    uvicorn_uds: str | None = None
    uvicorn_ssl_certfile: str | None = None
    uvicorn_ssl_keyfile: str | None = None
    uvicorn_ssl_ca_type: Literal["public", "private"] = "public"
    dashboard_path: str = "/dashboard/"

    debug: bool = False
    docs: bool = False

    allowed_origins: Annotated[list[str], NoDecode] = ["*"]

    xray_json: str = "./xray_config.json"
    xray_fallback_inbound_tag: str = ""
    xray_executable_path: str = "/usr/local/bin/xray"
    xray_assets_path: str = "/usr/local/share/xray"
    xray_exclude_inbound_tags: Annotated[list[str], NoDecode] = []
    xray_subscription_url_prefix: str = ""
    xray_subscription_path: str = "sub"

    telegram_api_token: str = ""
    telegram_admin_id: Annotated[list[int], NoDecode] = []
    telegram_proxy_url: str = ""
    telegram_logger_channel_id: int = 0
    telegram_default_vless_flow: str = ""

    jwt_access_token_expire_minutes: int = 1440

    custom_templates_directory: str | None = None
    subscription_page_template: str = "subscription/index.html"
    home_page_template: str = "home/index.html"

    clash_subscription_template: str = "clash/default.yml"
    clash_settings_template: str = "clash/settings.yml"

    singbox_subscription_template: str = "singbox/default.json"
    singbox_settings_template: str = "singbox/settings.json"

    mux_template: str = "mux/default.json"

    v2ray_subscription_template: str = "v2ray/default.json"
    v2ray_settings_template: str = "v2ray/settings.json"

    user_agent_template: str = "user_agent/default.json"
    grpc_user_agent_template: str = "user_agent/grpc.json"

    external_config: str = ""
    login_notify_white_list: Annotated[list[str], NoDecode] = []

    use_custom_json_default: bool = False
    use_custom_json_for_v2rayn: bool = False
    use_custom_json_for_v2rayng: bool = False
    use_custom_json_for_streisand: bool = False
    use_custom_json_for_happ: bool = False

    notify_status_change: bool = True
    notify_user_created: bool = True
    notify_user_updated: bool = True
    notify_user_deleted: bool = True
    notify_user_data_used_reset: bool = True
    notify_user_sub_revoked: bool = True
    notify_if_data_usage_percent_reached: bool = True
    notify_if_days_left_reached: bool = True
    notify_login: bool = True

    active_status_text: str = "Active"
    expired_status_text: str = "Expired"
    limited_status_text: str = "Limited"
    disabled_status_text: str = "Disabled"
    onhold_status_text: str = "On-Hold"

    users_autodelete_days: int = -1
    user_autodelete_include_limited_accounts: bool = False

    sudo_username: str = ""
    sudo_password: SecretStr = SecretStr("")

    webhook_address: Annotated[list[str], NoDecode] = []
    webhook_secret: str | None = None

    recurrent_notifications_timeout: int = 180
    number_of_recurrent_notifications: int = 3
    notify_reached_usage_percent: Annotated[list[int], NoDecode] = [80]
    notify_days_left: Annotated[list[int], NoDecode] = [3]

    disable_recording_node_usage: bool = False

    sub_update_interval: str = "12"
    sub_support_url: str = "https://t.me/"
    sub_profile_title: str = "Subscription"

    discord_webhook_url: str = ""

    job_core_health_check_interval: int = 10
    job_record_node_usages_interval: int = 30
    job_record_user_usages_interval: int = 10
    job_review_users_interval: int = 10
    job_send_notifications_interval: int = 30

    @property
    def sudoers(self) -> dict[str, str]:
        password = self.sudo_password.get_secret_value()
        if self.sudo_username and password:
            return {self.sudo_username: password}
        return {}

    @field_validator("allowed_origins", "login_notify_white_list", "webhook_address", mode="before")
    @classmethod
    def _csv_str(cls, v):
        return _split(v, ",")

    @field_validator("xray_exclude_inbound_tags", mode="before")
    @classmethod
    def _space_separated(cls, v):
        return _split(v, None)

    @field_validator("telegram_admin_id", mode="before")
    @classmethod
    def _admin_ids(cls, v):
        if isinstance(v, str):
            return [int(i) for i in _split(v, ",") if i.isdigit()]
        if isinstance(v, int):
            return [v]
        return v

    @field_validator("notify_reached_usage_percent", "notify_days_left", mode="before")
    @classmethod
    def _int_csv(cls, v):
        if isinstance(v, str):
            return [int(i) for i in _split(v, ",")]
        if isinstance(v, int):
            return [v]
        return v

    @field_validator("uvicorn_ssl_ca_type", mode="after")
    @classmethod
    def _lower(cls, v: str) -> str:
        return v.lower()

    @field_validator("xray_subscription_url_prefix", "xray_subscription_path", mode="after")
    @classmethod
    def _strip_slashes(cls, v: str) -> str:
        return v.strip("/")


settings = Settings()
