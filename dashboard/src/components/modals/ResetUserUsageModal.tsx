import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/stores/dashboard";
import { useState, type FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { generateErrorMessage, generateSuccessMessage } from "@/lib/toast";
import { ConfirmModal } from "./ConfirmModal";

export const ResetUserUsageModal: FC = () => {
  const [loading, setLoading] = useState(false);
  const { resetUsageUser: user, resetDataUsage } = useDashboard();
  const { t } = useTranslation();
  const onClose = () => {
    useDashboard.setState({ resetUsageUser: null });
  };
  const onReset = () => {
    if (user) {
      setLoading(true);
      resetDataUsage(user)
        .then(() => {
          generateSuccessMessage(t("resetUserUsage.success", { username: user.username }));
        })
        .catch((err) => generateErrorMessage(err))
        .finally(() => setLoading(false));
    }
  };
  return (
    <ConfirmModal
      isOpen={!!user}
      onClose={onClose}
      onConfirm={onReset}
      loading={loading}
      tone="accent"
      icon={<ArrowPathIcon className="size-5" />}
      title={t("resetUserUsage.title")}
      prompt={
        user && (
          <Trans components={{ b: <b /> }}>
            {t("resetUserUsage.prompt", { username: user.username })}
          </Trans>
        )
      }
      confirmLabel={t("reset")}
    />
  );
};
