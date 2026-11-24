import { Button, Calendar, Popover, RangeCalendar, Tab, Tabs } from "@heroui/react";
import { CalendarIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { FilterUsageType } from "@/types";
import dayjs, { type ManipulateType } from "@/lib/dayjs";
import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { getLocalTimeZone, today, type CalendarDate } from "@internationalized/date";

type DateRange = { start: CalendarDate; end: CalendarDate };

const filterOptionTypes = {
  h: "hour",
  d: "day",
  w: "week",
  m: "month",
  y: "year",
} as const;

const quickFilterOptions = ["7h", "1d", "3d", "1w", "1m", "3m"];

const customFilterOptions: { title: string; options: string[] }[] = [
  { title: "hours", options: ["1h", "2h", "3h", "6h", "8h", "12h"] },
  { title: "days", options: ["1d", "2d", "3d", "4d", "5d", "6d"] },
  { title: "weeks", options: ["1w", "2w", "3w", "4w"] },
  { title: "months", options: ["1m", "2m", "3m", "6m", "8m"] },
];

export const buildUsageQuery = (value: string): FilterUsageType => {
  const num = Number(value.slice(0, value.length - 1));
  const unit = filterOptionTypes[
    value[value.length - 1] as keyof typeof filterOptionTypes
  ] as ManipulateType;
  return {
    start: dayjs().utc().subtract(num, unit).format("YYYY-MM-DDTHH:00:00"),
  };
};

export type UsageFilterProps = {
  onChange: (filter: string, query: FilterUsageType) => void;
  defaultValue: string;
};

type UsageFilterComponent = FC<UsageFilterProps>;

export const UsageFilter: UsageFilterComponent = ({ onChange, defaultValue }) => {
  const { t } = useTranslation();

  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [customOpen, setCustomOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [range, setRange] = useState<DateRange | null>(null);

  const isCustomSelected = selectedValue !== "" && !quickFilterOptions.includes(selectedValue);
  const customLabel =
    customOpen || range
      ? t("userDialog.custom")
      : isCustomSelected
        ? t("userDialog.custom") + ` (${selectedValue})`
        : t("userDialog.custom");

  const selectFilter = (value: string) => {
    setSelectedValue(value);
    setCustomOpen(false);
    onChange(value, buildUsageQuery(value));
  };

  const onDateChange = (dates: DateRange | null) => {
    setRange(dates);
    if (dates?.start && dates?.end) {
      setCustomOpen(false);
      setSelectedValue("custom");
      onChange("custom", {
        start: `${dates.start.toString()}T00:00:00`,
        end: `${dates.end.toString()}T23:59:59`,
      });
    }
  };

  const FilterButton = ({ value }: { value: string }) => (
    <Button
      size="sm"
      variant={selectedValue === value ? "primary" : "outline"}
      className="min-w-12 justify-center px-3 py-1"
      onPress={() => selectFilter(value)}
    >
      {value}
    </Button>
  );

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex min-w-[320px] max-w-fit flex-wrap items-center gap-1 rounded-lg border border-border p-1 md:min-w-100">
        {quickFilterOptions.map((value) => (
          <FilterButton key={value} value={value} />
        ))}
        <Popover
          isOpen={customOpen}
          onOpenChange={(open) => {
            setCustomOpen(open);
            if (open) setRange(null);
          }}
        >
          <Button
            size="sm"
            variant={isCustomSelected ? "primary" : "outline"}
            className="grow justify-center px-3 py-1"
            onPress={() => setCustomOpen(true)}
          >
            {customLabel}
            <CalendarIcon className="size-4" />
          </Button>
          <Popover.Content placement="bottom">
            <div className="p-2">
              <Tabs
                selectedKey={String(tabIndex)}
                onSelectionChange={(key) => setTabIndex(Number(key))}
              >
                <Tab key="0" id="0">
                  {t("userDialog.relative")}
                  <Tabs.Indicator />
                </Tab>
                <Tab key="1" id="1">
                  {t("userDialog.absolute")}
                  <Tabs.Indicator />
                </Tab>
              </Tabs>
              {tabIndex === 0 && (
                <div className="flex flex-col gap-3 p-2">
                  {customFilterOptions.map((row) => (
                    <div key={row.title} className="flex items-center gap-2">
                      <span className="min-w-15 text-sm">{t("userDialog." + row.title)}</span>
                      {row.options.map((value) => (
                        <FilterButton key={value} value={value} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {tabIndex === 1 && (
                <div className="flex justify-center p-2">
                  <RangeCalendar
                    aria-label="usage range"
                    maxValue={today(getLocalTimeZone())}
                    value={range}
                    onChange={(v) => onDateChange((v as DateRange) ?? null)}
                  >
                    <Calendar.Header>
                      <Calendar.NavButton slot="previous" />
                      <Calendar.Heading />
                      <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                      <Calendar.GridHeader>
                        {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                      </Calendar.GridHeader>
                      <Calendar.GridBody>
                        {(date) => <Calendar.Cell date={date} />}
                      </Calendar.GridBody>
                    </Calendar.Grid>
                  </RangeCalendar>
                </div>
              )}
            </div>
          </Popover.Content>
        </Popover>
      </div>
      {range && !customOpen && (
        <button
          type="button"
          className="flex min-w-[320px] items-center rounded-lg border border-border px-3 py-1.5 text-sm md:min-w-100"
          onClick={() => setCustomOpen(true)}
        >
          <span className="w-full">{range.start.toString()} (00:00)</span>
          <ChevronRightIcon className="size-4 text-muted" />
          <span className="w-full text-end">{range.end.toString()} (23:59)</span>
          <CalendarIcon className="size-4 text-muted" />
        </button>
      )}
    </div>
  );
};
