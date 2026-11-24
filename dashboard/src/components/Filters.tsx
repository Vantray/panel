import {
  Button,
  Input,
  ListBox,
  Select,
  TextField,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectPopover,
  Spinner,
} from "@heroui/react";
import { ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/stores/dashboard";
import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const statusOptions = ["", "active", "on_hold", "disabled", "limited", "expired"];

export const Filters: FC = () => {
  const { loading, filters, onFilterChange, refetchUsers, onCreateUser } = useDashboard();
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search ?? "");

  // Debounced search (300ms) driving the users query.
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((filters.search ?? "") !== search) {
        onFilterChange({ offset: 0, search });
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const clear = () => {
    setSearch("");
    onFilterChange({ offset: 0, search: "" });
  };

  return (
    <div
      id="filters"
      className="sticky top-0 z-10 -mx-6 grid grid-cols-1 gap-4 bg-background px-6 py-4 md:grid-cols-4"
    >
      <TextField
        fullWidth
        className="order-2 col-span-1 md:order-1 md:col-span-2 lg:col-span-1"
        aria-label={t("search")}
      >
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            className="ps-9 pe-16"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-e-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {loading && <Spinner size="sm" />}
            {filters.search && filters.search.length > 0 && (
              <Button
                isIconOnly
                onPress={clear}
                aria-label="clear"
                size="sm"
                variant="ghost"
                className="size-6 min-w-6 rounded-md"
              >
                <XMarkIcon className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </TextField>

      <Select
        className="order-1 col-span-1 md:order-3"
        aria-label={t("usersTable.status")}
        placeholder={t("usersTable.status")}
        value={filters.status ?? ""}
        onChange={(value) =>
          onFilterChange({
            status: (String(value) || undefined) as
              "active" | "disabled" | "limited" | "expired" | "on_hold" | undefined,
          })
        }
      >
        <SelectTrigger>
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectPopover>
          <ListBox>
            {statusOptions.map((status) => (
              <ListBox.Item
                key={status || "all"}
                id={status}
                textValue={status ? t(`status.${status}`) : t("usersTable.all")}
              >
                {status ? t(`status.${status}`) : t("usersTable.all")}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </SelectPopover>
      </Select>

      <div className="order-3 col-span-1 flex items-center justify-end gap-2 md:order-2 md:col-span-2 lg:col-span-2">
        <Button
          isIconOnly
          aria-label="refresh users"
          isDisabled={loading}
          onPress={() => refetchUsers()}
          size="sm"
          variant="outline"
        >
          <ArrowPathIcon className={cn("size-4", loading && "animate-spin")} />
        </Button>
        <Button onPress={() => onCreateUser(true)} size="sm" className="px-5">
          {t("createUser")}
        </Button>
      </div>
    </div>
  );
};
