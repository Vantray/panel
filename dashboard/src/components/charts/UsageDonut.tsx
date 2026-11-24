import { formatBytes } from "@/lib/format";
import { generateDistinctColors } from "@/lib/color";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

type UsageDonutProps = {
  series: number[];
  labels: string[];
  height?: number;
};

export const UsageDonut = ({ series, labels, height = 320 }: UsageDonutProps) => {
  const { t } = useTranslation();

  const data = series.map((value, index) => ({
    name: labels[index] ?? "-",
    value,
  }));
  const colors = generateDistinctColors(data.length);
  const total = series.reduce((t, c) => (t += c), 0);

  if (!data.length || total === 0) {
    return (
      <div
        className="flex w-full items-center justify-center text-sm text-muted"
        style={{ height }}
      >
        {t("userDialog.noData")}
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <p className="mb-2 text-center text-sm font-medium">
        {t("userDialog.total")}
        {formatBytes(total)}
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            stroke="var(--color-surface)"
            strokeWidth={1}
            isAnimationActive={false}
            label={({ value }) => (value ? formatBytes(value, 1) : null)}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0];
              const value = Number(item.value ?? 0);
              const percent = Math.round((value / Math.max(total, 1)) * 1000) / 10;
              return (
                <div className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs shadow-overlay">
                  <span className="font-medium">{item.name}</span>
                  {": "}
                  <span className="tabular-nums">
                    {percent}%, {formatBytes(value, 1)}
                  </span>
                </div>
              );
            }}
          />
          <Legend formatter={(value) => <span className="text-xs text-foreground">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
