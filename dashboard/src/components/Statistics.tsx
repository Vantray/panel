import { ChartBarIcon, ChartPieIcon, UsersIcon } from "@heroicons/react/24/outline";
import { formatBytes, numberWithCommas } from "@/lib/format";
import { useSystem } from "@/hooks/useSystem";
import { Skeleton } from "@heroui/react";
import type { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type StatisticCardProps = {
  title: string;
  content?: ReactNode;
  icon: ReactNode;
  isLoading?: boolean;
};

const StatisticCard: FC<StatisticCardProps> = ({ title, content, icon, isLoading }) => {
  return (
    <div className="flex w-full flex-row items-center justify-between rounded-xl border border-border bg-surface p-6 shadow-surface">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center rounded-lg bg-accent-soft p-2 text-accent-soft-foreground">
          {icon}
        </div>
        <p className="text-sm font-medium text-muted">{title}</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-20 rounded-md" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tabular-nums">{content}</p>
      )}
    </div>
  );
};

export const Statistics: FC<{ className?: string }> = ({ className }) => {
  const { data: systemData, isPending } = useSystem();
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between lg:gap-4",
        className,
      )}
    >
      <StatisticCard
        title={t("activeUsers")}
        isLoading={isPending}
        content={
          systemData && (
            <span className="flex items-end gap-1 text-3xl">
              {numberWithCommas(systemData.users_active)}
              <span className="pb-1 text-lg font-normal">
                / {numberWithCommas(systemData.total_user)}
              </span>
            </span>
          )
        }
        icon={<UsersIcon className="size-5" />}
      />
      <StatisticCard
        title={t("dataUsage")}
        isLoading={isPending}
        content={
          systemData && formatBytes(systemData.incoming_bandwidth + systemData.outgoing_bandwidth)
        }
        icon={<ChartBarIcon className="size-5" />}
      />
      <StatisticCard
        title={t("memoryUsage")}
        isLoading={isPending}
        content={
          systemData && (
            <span className="flex items-end gap-1 text-3xl">
              <span className="tabular-nums">{formatBytes(systemData.mem_used, 1, true)[0]}</span>
              <span className="pb-1 text-lg font-normal">
                {formatBytes(systemData.mem_used, 1, true)[1]} /{" "}
                {formatBytes(systemData.mem_total, 1)}
              </span>
            </span>
          )
        }
        icon={<ChartPieIcon className="size-5" />}
      />
    </div>
  );
};
