import { TrashIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/stores/dashboard";
import { generateSuccessMessage } from "@/lib/toast";
import { useState, type FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ConfirmModal } from "./ConfirmModal";

export type DeleteUserModalProps = Record<string, never>;

export const DeleteUserModal: FC<DeleteUserModalProps> = () => {
  const [loading, setLoading] = useState(false);
  const { deletingUser: user, onDeletingUser, deleteUser } = useDashboard();
  const { t } = useTranslation();
  const onClose = () => {
    onDeletingUser(null);
  };
  const onDelete = () => {
    if (user) {
      setLoading(true);
      deleteUser(user)
        .then(() => {
          generateSuccessMessage(t("deleteUser.deleteSuccess", { username: user.username }));
        })
        .then(onClose)
        .finally(() => setLoading(false));
    }
  };
  return (
    <ConfirmModal
      isOpen={!!user}
      onClose={onClose}
      onConfirm={onDelete}
      loading={loading}
      tone="danger"
      icon={<TrashIcon className="size-5" />}
      title={t("deleteUser.title")}
      prompt={
        user && (
          <Trans components={{ b: <b /> }}>
            {t("deleteUser.prompt", { username: user.username })}
          </Trans>
        )
      }
      confirmLabel={t("delete")}
    />
  );
};
