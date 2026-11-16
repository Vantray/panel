from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class NodeStatus(str, Enum):
    connected = "connected"
    connecting = "connecting"
    error = "error"
    disabled = "disabled"


class NodeSettings(BaseModel):
    min_node_version: str = "v0.2.0"
    certificate: str


class Node(BaseModel):
    name: str
    address: str
    port: int = 62050
    api_port: int = 62051
    usage_coefficient: float = Field(gt=0, default=1.0)


class NodeCreate(Node):
    add_as_new_host: bool = True
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "DE node",
                "address": "192.168.1.1",
                "port": 62050,
                "api_port": 62051,
                "add_as_new_host": True,
                "usage_coefficient": 1,
            }
        }
    )


class NodeModify(Node):
    name: str | None = Field(None)
    address: str | None = Field(None)
    port: int | None = Field(None)
    api_port: int | None = Field(None)
    status: NodeStatus | None = Field(None)
    usage_coefficient: float | None = Field(None)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "DE node",
                "address": "192.168.1.1",
                "port": 62050,
                "api_port": 62051,
                "status": "disabled",
                "usage_coefficient": 1.0,
            }
        }
    )


class NodeResponse(Node):
    id: int
    xray_version: str | None = None
    status: NodeStatus
    message: str | None = None
    model_config = ConfigDict(from_attributes=True)


class NodeUsageResponse(BaseModel):
    node_id: int | None = None
    node_name: str
    uplink: int
    downlink: int


class NodesUsageResponse(BaseModel):
    usages: list[NodeUsageResponse]
