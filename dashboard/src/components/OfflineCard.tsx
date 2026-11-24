import { Button, Spinner } from "@heroui/react";
import { SignalSlashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

/**
 * Full-height card shown when the Vantray backend cannot be reached.
 * Shared by the /offline route and the in-session health gate.
 */
export const OfflineCard = ({ onRetry, retrying }: { onRetry: () => void; retrying?: boolean }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center gap-5 p-6">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <SignalSlashIcon className="size-7" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-xl font-semibold">{t("offline.title")}</p>
        <p className="max-w-sm text-sm text-muted">{t("offline.description")}</p>
      </div>
      <Button size="sm" onPress={onRetry} isPending={retrying}>
        {retrying ? <Spinner size="sm" /> : null}
        {t("offline.retry")}
      </Button>
    </div>
  );
};
