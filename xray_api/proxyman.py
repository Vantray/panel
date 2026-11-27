import grpc

from xray_api.base import XRayBase
from xray_api.exceptions import RelatedError
from xray_api.proto.app.proxyman.command import command_pb2, command_pb2_grpc
from xray_api.proto.common.protocol import user_pb2
from xray_api.types.account import Account
from xray_api.types.message import Message, TypedMessage


class Proxyman(XRayBase):
    def alter_inbound(self, tag: str, operation: TypedMessage, timeout: int | None = None) -> bool:
        stub = command_pb2_grpc.HandlerServiceStub(self._channel)
        try:
            stub.AlterInbound(command_pb2.AlterInboundRequest(tag=tag, operation=operation), timeout=timeout)
            return True

        except grpc.RpcError as e:
            raise RelatedError(e)

    def alter_outbound(self, tag: str, operation: TypedMessage, timeout: int | None = None) -> bool:
        stub = command_pb2_grpc.HandlerServiceStub(self._channel)
        try:
            stub.AlterInbound(command_pb2.AlterOutboundRequest(tag=tag, operation=operation), timeout=timeout)
            return True

        except grpc.RpcError as e:
            raise RelatedError(e)

    def add_inbound_user(self, tag: str, user: Account, timeout: int | None = None) -> bool:
        return self.alter_inbound(
            tag=tag,
            operation=Message(
                command_pb2.AddUserOperation(
                    user=user_pb2.User(
                        level=user.level,
                        email=user.email,
                        account=user.message
                    )
                )
            ), timeout=timeout)

    def remove_inbound_user(self, tag: str, email: str, timeout: int | None = None) -> bool:
        return self.alter_inbound(
            tag=tag,
            operation=Message(
                command_pb2.RemoveUserOperation(
                    email=email
                )
            ), timeout=timeout)

    def add_outbound_user(self, tag: str, user: Account, timeout: int | None = None) -> bool:
        return self.alter_outbound(
            tag=tag,
            operation=Message(
                command_pb2.AddUserOperation(
                    user=user_pb2.User(
                        level=user.level,
                        email=user.email,
                        account=user.message
                    )
                )
            ), timeout=timeout)

    def remove_outbound_user(self, tag: str, email: str, timeout: int | None = None) -> bool:
        return self.alter_outbound(
            tag=tag,
            operation=Message(
                command_pb2.RemoveUserOperation(
                    email=email
                )
            ), timeout=timeout)

    def add_inbound(self):
        raise NotImplementedError

    def remove_inbound(self):
        raise NotImplementedError

    def add_outbound(self):
        raise NotImplementedError

    def remove_outbound(self):
        raise NotImplementedError
