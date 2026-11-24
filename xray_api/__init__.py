from xray_api import exceptions
from xray_api import types
from xray_api.proxyman import Proxyman
from xray_api.stats import Stats


class XRay(Proxyman, Stats):
    pass


__all__ = [
    "XRay",
    "exceptions",
    "types"
]
