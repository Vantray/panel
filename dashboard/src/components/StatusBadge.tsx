import { Chip, ChipLabel } from "@heroui/react";
import {
  ClockIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import { userStatusColor } from "@/constants";
import type { Status } from "@/types";
import { useTranslation } from "react-i18next";
import { relativeExpiryDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const statusIcons: Record<string, typeof WifiIcon> = {
  active: WifiIcon,
  connected: WifiIcon,
  disabled: NoSymbolIcon,
  expired: ClockIcon,
  on_hold: ClockIcon,
  connecting: ClockIcon,
  limited: ExclamationCircleIcon,
  error: ExclamationCircleIcon,
};

type StatusBadgeProps = {
  expiryDate?: number | null;
  status: Status;
  compact?: boolean;
  showDetail?: boolean;
  extraText?: string | null;
  /** i18n key prefix; nodes use `nodeModal.status.*` */
  i18nPrefix?: string;
};

export const StatusBadge = ({
  expiryDate,
  status,
  compact = false,
  showDetail = true,
  extraText,
  i18nPrefix = "status",
}: StatusBadgeProps) => {
  const { t } = useTranslation();
  const dateInfo = relativeExpiryDate(expiryDate);
  const Icon = statusIcons[status] ?? WifiIcon;
  const color = userStatusColor[status]?.chip;

  return (
    // flex row keeps the relative expiry text vertically centered with the chip
    <div className="flex items-center gap-2">
      <Chip
        color={color === "muted" ? undefined : color}
        className={cn("inline-flex gap-2 rounded-full px-3 py-1", compact && "gap-1")}
      >
        <Icon className={compact ? "size-3" : "size-4"} />
        {showDetail && (
          <ChipLabel
            className={cn(
              "font-medium tracking-tight",
              compact ? "text-[.7rem] leading-4" : "text-sm",
            )}
          >
            {status && t(`${i18nPrefix}.${status}`)}
            {extraText && `: ${extraText}`}
          </ChipLabel>
        )}
      </Chip>
      {showDetail && expiryDate && (
        <span className="text-xs font-medium text-muted">
          {t(dateInfo.status, { time: dateInfo.time })}
        </span>
      )}
    </div>
  );
};
