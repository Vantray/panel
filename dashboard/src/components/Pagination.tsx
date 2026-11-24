import {
  Button,
  Label,
  ListBox,
  Select,
  SelectIndicator,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@heroui/react";
import { ArrowLongLeftIcon, ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/stores/dashboard";
import { setUsersPerPageLimitSize } from "@/lib/userPreference";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const MINIMAL_PAGE_ITEM_COUNT = 5;

/**
 * Generate numeric page items around current page.
 *   - Always include first and last page
 *   - Add ellipsis if needed
 */
function generatePageItems(total: number, current: number, width: number) {
  if (width < MINIMAL_PAGE_ITEM_COUNT) {
    throw new Error(`Must allow at least ${MINIMAL_PAGE_ITEM_COUNT} page items`);
  }
  if (width % 2 === 0) {
    throw new Error(`Must allow odd number of page items`);
  }
  if (total < width) {
    return [...new Array(total).keys()];
  }
  const left = Math.max(0, Math.min(total - width, current - Math.floor(width / 2)));
  const items: (string | number)[] = new Array(width);
  for (let i = 0; i < width; i += 1) {
    items[i] = i + left;
  }
  // replace non-ending items with placeholders
  if (Number(items[0]) > 0) {
    items[0] = 0;
    items[1] = "prev-more";
  }
  if (Number(items[items.length - 1]) < total - 1) {
    items[items.length - 1] = total - 1;
    items[items.length - 2] = "next-more";
  }
  return items;
}

export const Pagination: FC = () => {
  const {
    filters,
    onFilterChange,
    users: { total },
  } = useDashboard();
  const { limit: perPage, offset } = filters;

  const page = (offset || 0) / (perPage || 1);
  const noPages = Math.ceil(total / (perPage || 1));
  const pages = generatePageItems(noPages, page, 7);

  const changePage = (page: number) => {
    onFilterChange({
      offset: page * (perPage as number),
    });
  };

  const handlePageSizeChange = (value: unknown) => {
    const limit = parseInt(String(value));
    onFilterChange({ limit });
    setUsersPerPageLimitSize(String(limit));
  };

  const { t } = useTranslation();

  return (
    <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row">
      <div className="order-2 flex items-center gap-2 md:order-1">
        <Select
          className="min-w-18"
          aria-label="page size"
          value={String(perPage)}
          onChange={(value) => handlePageSizeChange(value)}
        >
          <SelectTrigger>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectPopover>
            <ListBox>
              {["10", "20", "30"].map((size) => (
                <ListBox.Item key={size} id={size} textValue={size}>
                  {size}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </SelectPopover>
        </Select>
        <Label className="whitespace-nowrap text-sm font-normal">{t("itemsPerPage")}</Label>
      </div>

      <div className="order-1 flex flex-wrap items-center gap-1 md:order-2">
        <Button
          size="sm"
          variant="outline"
          onPress={() => changePage(page - 1)}
          isDisabled={page === 0 || noPages === 0}
        >
          <ArrowLongLeftIcon className="size-4" />
          {t("previous")}
        </Button>
        {pages.map((pageIndex) => {
          if (typeof pageIndex === "string")
            return (
              <Button key={pageIndex} size="sm" variant="ghost" isDisabled>
                ...
              </Button>
            );
          return (
            <Button
              key={pageIndex}
              size="sm"
              variant={pageIndex === page ? "primary" : "outline"}
              className={cn(pageIndex === page && "font-semibold")}
              onPress={() => changePage(pageIndex)}
            >
              {pageIndex + 1}
            </Button>
          );
        })}
        <Button
          size="sm"
          variant="outline"
          onPress={() => changePage(page + 1)}
          isDisabled={page + 1 === noPages || noPages === 0}
        >
          {t("next")}
          <ArrowLongRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
};
