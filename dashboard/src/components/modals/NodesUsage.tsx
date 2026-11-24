import { Modal } from "@heroui/react";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import type { FilterUsageType } from "@/types";
import dayjs from "@/lib/dayjs";
import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/stores/dashboard";
import { IconBlock } from "@/components/IconBlock";
import { UsageFilter } from "@/components/charts/UsageFilter";
import { UsageDonut } from "@/components/charts/UsageDonut";

export const NodesUsage: FC = () => {
  const { isShowingNodesUsage, onShowingNodesUsage, fetchNodesUsage } = useDashboard();
  const { t } = useTranslation();

  const [usage, setUsage] = useState<{ series: number[]; labels: string[] }>({
    series: [],
    labels: [],
  });
  const [usageFilter, setUsageFilter] = useState("1m");
  const fetchUsageWithFilter = (query: FilterUsageType) => {
    fetchNodesUsage(query).then((data) => {
      const labels: string[] = [];
      const series: number[] = [];
      for (const key in data.usages) {
        const entry = data.usages[key];
        series.push(entry.uplink + entry.downlink);
        labels.push(entry.node_name);
      }
      setUsage({ series, labels });
    });
  };

  useEffect(() => {
    if (isShowingNodesUsage) {
      fetchUsageWithFilter({
        start: dayjs().utc().subtract(30, "day").format("YYYY-MM-DDTHH:00:00"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowingNodesUsage]);

  const onClose = () => {
    onShowingNodesUsage(false);
    setUsageFilter("1m");
  };

  return (
    <Modal
      isOpen={isShowingNodesUsage}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container className="sm:max-w-2xl">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <div className="flex items-center gap-2">
                <IconBlock>
                  <ChartPieIcon className="size-5" />
                </IconBlock>
                <p className="text-lg font-semibold">{t("header.nodesUsage")}</p>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col items-center gap-4">
                <UsageFilter
                  defaultValue={usageFilter}
                  onChange={(filter, query) => {
                    setUsageFilter(filter);
                    fetchUsageWithFilter(query);
                  }}
                />
                <div className="mt-4 w-full max-w-100">
                  <UsageDonut series={usage.series} labels={usage.labels} height={400} />
                </div>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
