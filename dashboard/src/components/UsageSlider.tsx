import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { resetStrategy } from "@/constants";

type UsageSliderProps = {
  used: number;
  total: number | null;
  dataLimitResetStrategy: string | null;
  totalUsedTraffic: number;
  compact?: boolean;
};

const getResetStrategyI18nSuffix = (strategy: string): string => {
  const entry = resetStrategy.find((entry) => entry.value === strategy);
  return entry ? entry.title : "No";
};

export const UsageSlider = ({
  used,
  total,
  dataLimitResetStrategy,
  totalUsedTraffic,
  compact = false,
}: UsageSliderProps) => {
  const { t } = useTranslation();
  const isUnlimited = total === 0 || total === null;
  const isReached = !isUnlimited && (used / total) * 100 >= 100;
  const percent = isUnlimited ? 100 : Math.min((used / total) * 100, 100);

  const totalLabel = isUnlimited ? (
    <span className="font-system-ui">∞</span>
  ) : (
    formatBytes(total) +
    (dataLimitResetStrategy && dataLimitResetStrategy !== "no_reset"
      ? " " + t("userDialog.resetStrategy" + getResetStrategyI18nSuffix(dataLimitResetStrategy))
      : "")
  );

  if (compact) {
    return (
      <div className="flex items-center justify-between text-xs font-medium text-muted">
        <span>
          {formatBytes(used)} / {totalLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-1.75 w-full overflow-hidden rounded-full bg-default">
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            isReached ? "bg-danger" : "bg-accent",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs font-medium text-muted">
        <span>
          {formatBytes(used)} / {totalLabel}
        </span>
        <span>
          {t("usersTable.total")}: {formatBytes(totalUsedTraffic)}
        </span>
      </div>
    </div>
  );
};
