import json
from datetime import UTC, datetime
from uuid import UUID


def utcnow() -> datetime:
    """Naive UTC "now", identical in spirit to the removed datetime.utcnow().

    The database stores naive datetimes, so keep the same semantics while
    avoiding the deprecated datetime.utcnow().
    """
    return datetime.now(UTC).replace(tzinfo=None)


def utcfromtimestamp(timestamp: float) -> datetime:
    """Naive UTC datetime from a POSIX timestamp (replacement for the deprecated datetime.utcfromtimestamp)."""
    return datetime.fromtimestamp(timestamp, UTC).replace(tzinfo=None)


def calculate_usage_percent(used_traffic: int, data_limit: int) -> float:
    return (used_traffic * 100) / data_limit


def calculate_expiration_days(expire: int) -> int:
    return (datetime.fromtimestamp(expire) - utcnow()).days


def yml_uuid_representer(dumper, data):
    return dumper.represent_scalar("tag:yaml.org,2002:str", str(data))


class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            # if the obj is uuid, we simply return the value of uuid
            return str(obj)
        return super().default(self, obj)
