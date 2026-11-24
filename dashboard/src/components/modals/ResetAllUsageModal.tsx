import { DocumentMinusIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/stores/dashboard";
import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { generateErrorMessage, generateSuccessMessage } from "@/lib/toast";
import { ConfirmModal } from "./ConfirmModal";

export const ResetAllUsageModal: FC = () => {
  const [loading, setLoading] = useState(false);
  const { isResetingAllUsage, onResetAllUsage, resetAllUsage } = useDashboard();
  const { t } = useTranslation();
  const onClose = () => {
    onResetAllUsage(false);
  };
  const onReset = () => {
    setLoading(true);
    resetAllUsage()
      .then(() => {
        generateSuccessMessage(t("resetAllUsage.success"));
      })
      .catch((err) => generateErrorMessage(err))
      .finally(() => setLoading(false));
  };
  return (
    <ConfirmModal
      isOpen={isResetingAllUsage}
      onClose={onClose}
      onConfirm={onReset}
      loading={loading}
      tone="danger"
      icon={<DocumentMinusIcon className="size-5" />}
      title={t("resetAllUsage.title")}
      prompt={isResetingAllUsage ? t("resetAllUsage.prompt") : ""}
      confirmLabel={t("reset")}
    />
  );
};
