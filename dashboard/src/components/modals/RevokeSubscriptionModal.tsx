import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/stores/dashboard";
import { useState, type FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { generateErrorMessage, generateSuccessMessage } from "@/lib/toast";
import { ConfirmModal } from "./ConfirmModal";

export const RevokeSubscriptionModal: FC = () => {
  const [loading, setLoading] = useState(false);
  const { revokeSubscriptionUser: user, revokeSubscription } = useDashboard();
  const { t } = useTranslation();
  const onClose = () => {
    useDashboard.setState({ revokeSubscriptionUser: null });
  };
  const onRevoke = () => {
    if (user) {
      setLoading(true);
      revokeSubscription(user)
        .then(() => {
          generateSuccessMessage(t("revokeUserSub.success", { username: user.username }));
        })
        .catch((err) => generateErrorMessage(err))
        .finally(() => setLoading(false));
    }
  };
  return (
    <ConfirmModal
      isOpen={!!user}
      onClose={onClose}
      onConfirm={onRevoke}
      loading={loading}
      tone="accent"
      icon={<ArrowPathIcon className="size-5" />}
      title={t("revokeUserSub.title")}
      prompt={
        user && (
          <Trans components={{ b: <b /> }}>
            {t("revokeUserSub.prompt", { username: user.username })}
          </Trans>
        )
      }
      confirmLabel={t("revoke")}
    />
  );
};
