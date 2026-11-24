import { TrashIcon } from "@heroicons/react/24/outline";
import { FetchNodesQueryKey, useNodes } from "@/stores/nodes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { generateErrorMessage, generateSuccessMessage } from "@/lib/toast";
import { ConfirmModal } from "./ConfirmModal";

export const DeleteNodeModal: FC = () => {
  const { deleteNode, deletingNode, setDeletingNode } = useNodes();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const onClose = () => {
    setDeletingNode(null);
  };

  const { isPending, mutate: onDelete } = useMutation({
    mutationFn: deleteNode,
    onSuccess: () => {
      generateSuccessMessage(
        t("deleteNode.deleteSuccess", {
          name: deletingNode && deletingNode.name,
        }),
      );
      setDeletingNode(null);
      void queryClient.invalidateQueries({ queryKey: FetchNodesQueryKey });
    },
    onError: (e) => generateErrorMessage(e),
  });

  return (
    <ConfirmModal
      isOpen={!!deletingNode}
      onClose={onClose}
      onConfirm={() => onDelete()}
      loading={isPending}
      tone="danger"
      icon={<TrashIcon className="size-5" />}
      title={t("deleteNode.title")}
      prompt={
        deletingNode && (
          <Trans components={{ b: <b /> }}>
            {t("deleteNode.prompt", { name: deletingNode.name })}
          </Trans>
        )
      }
      confirmLabel={t("delete")}
    />
  );
};
