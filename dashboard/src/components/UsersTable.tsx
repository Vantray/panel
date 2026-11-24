import { Button, Table, Tooltip, type SortDescriptor } from "@heroui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
  LinkIcon,
  PencilSquareIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import {
  createColumnHelper,
  flexRender,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useDashboard } from "@/stores/dashboard";
import { cn, copyText } from "@/lib/utils";
import { useEffect, useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { User } from "@/types";
import { EmptyState } from "./EmptyState";
import { OnlineBadge } from "./OnlineBadge";
import { OnlineStatus } from "./OnlineStatus";
import { Pagination } from "./Pagination";
import { StatusBadge } from "./StatusBadge";
import { UsageSlider } from "./UsageSlider";

type SortColumn = "username" | "expire" | "used_traffic";

const SORTABLE_COLUMNS: SortColumn[] = ["username", "expire", "used_traffic"];

const features = tableFeatures({ rowSortingFeature });

const columnHelper = createColumnHelper<typeof features, User>();

const sortToDescriptor = (sort: string): SortDescriptor | null => {
  const column = sort.startsWith("-") ? sort.slice(1) : sort;
  if (!SORTABLE_COLUMNS.includes(column as SortColumn)) return null;
  return {
    column: column === "expire" ? "status" : column,
    direction: sort.startsWith("-") ? "descending" : "ascending",
  };
};

const descriptorToSort = (descriptor: SortDescriptor): string => {
  const column = descriptor.column === "status" ? "expire" : String(descriptor.column);
  return descriptor.direction === "descending" ? `-${column}` : column;
};

export const UsersTable: FC = () => {
  const {
    filters,
    users: { users, total },
    onEditingUser,
    onFilterChange,
    onCreateUser,
    setQRCode,
    setSubLink,
  } = useDashboard();

  const { t } = useTranslation();

  const sortDescriptor = useMemo(() => sortToDescriptor(filters.sort), [filters.sort]);

  const isFiltered = users.length !== total;

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("username", {
          header: t("username"),
          cell: ({ row }) => (
            <div className="flex items-center">
              <OnlineBadge lastOnline={row.original.online_at} />
              <span className="ml-2 truncate font-medium">{row.original.username}</span>
              <OnlineStatus lastOnline={row.original.online_at} />
            </div>
          ),
        }),
        columnHelper.accessor("expire", {
          id: "status",
          header: `${t("usersTable.status")}${filters.status ? `: ${filters.status}` : ""}`,
          cell: ({ row }) => (
            <StatusBadge expiryDate={row.original.expire} status={row.original.status} />
          ),
        }),
        columnHelper.accessor("used_traffic", {
          header: t("usersTable.dataUsage"),
          cell: ({ row }) => (
            <UsageSlider
              totalUsedTraffic={row.original.lifetime_used_traffic}
              dataLimitResetStrategy={row.original.data_limit_reset_strategy}
              used={row.original.used_traffic}
              total={row.original.data_limit}
            />
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: "",
          cell: ({ row }) => (
            <ActionButtons
              user={row.original}
              onQR={() => {
                setQRCode(row.original.links);
                setSubLink(row.original.subscription_url);
              }}
              onEdit={() => onEditingUser(row.original)}
            />
          ),
        }),
      ]),

    [t, filters.status, setQRCode, setSubLink, onEditingUser],
  );

  const table = useTable({
    columns,
    data: users,
    features,
    getRowId: (user) => user.username,
  });

  return (
    <div id="users-table">
      <Table variant="primary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Users"
            className="min-w-180"
            sortDescriptor={sortDescriptor ?? undefined}
            onSortChange={(descriptor) => onFilterChange({ sort: descriptorToSort(descriptor) })}
            onRowAction={(key) => {
              const user = users.find((u) => u.username === key);
              if (user) onEditingUser(user);
            }}
          >
            <Table.Header>
              {table.getHeaderGroups()[0]?.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const label = flexRender(header.column.columnDef.header, header.getContext());
                return (
                  // `id` is required for React Aria sorting — React strips
                  // `key` from props, so the column id must be passed explicitly.
                  <Table.Column
                    key={header.id}
                    id={header.id}
                    allowsSorting={canSort}
                    isRowHeader={header.id === "username"}
                    className={cn("uppercase", header.id === "actions" && "text-end")}
                  >
                    {canSort
                      ? ({ sortDirection }) => (
                          <Table.SortableColumnHeader
                            showIndicator={false}
                            className="flex w-fit items-center gap-2"
                          >
                            {sortDirection === "ascending" ? (
                              <ChevronUpIcon className="size-3 shrink-0" />
                            ) : sortDirection === "descending" ? (
                              <ChevronDownIcon className="size-3 shrink-0" />
                            ) : null}
                            {label}
                          </Table.SortableColumnHeader>
                        )
                      : label}
                  </Table.Column>
                );
              })}
            </Table.Header>
            <Table.Body
              renderEmptyState={() => (
                <EmptyState isFiltered={isFiltered} onCreateUser={() => onCreateUser(true)} />
              )}
            >
              {table.getRowModel().rows.map((row) => (
                <Table.Row key={row.id} id={row.id}>
                  {row.getAllCells().map((cell) => (
                    <Table.Cell key={cell.id} className={cellClasses[cell.column.id]}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <Pagination />
    </div>
  );
};

const cellClasses: Record<string, string> = {
  username: "min-w-[140px]",
  status: "min-w-[150px]",
  used_traffic: "min-w-[230px]",
  actions: "min-w-[180px] text-end",
};

type ActionButtonsProps = {
  user: User;
  onQR: () => void;
  onEdit: () => void;
};

const ActionButtons: FC<ActionButtonsProps> = ({ user, onQR, onEdit }) => {
  const { t } = useTranslation();

  const proxyLinks = user.links.join("\r\n");
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    if (copied !== null) {
      const timer = setTimeout(() => setCopied(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copy = (kind: number, text: string) => {
    const absolute = text.startsWith("/") ? window.location.origin + text : text;
    void copyText(absolute).then(() => setCopied(kind));
  };

  return (
    <div className="flex justify-end gap-1">
      <Tooltip>
        <Tooltip.Trigger aria-label={t("usersTable.copyLink")}>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={() => copy(0, user.subscription_url)}
          >
            {copied === 0 ? <CheckIcon className="size-4" /> : <LinkIcon className="size-4" />}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {copied === 0 ? t("usersTable.copied") : t("usersTable.copyLink")}
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger aria-label={t("usersTable.copyConfigs")}>
          <Button isIconOnly size="sm" variant="ghost" onPress={() => copy(1, proxyLinks)}>
            {copied === 1 ? <CheckIcon className="size-4" /> : <ClipboardIcon className="size-4" />}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {copied === 1 ? t("usersTable.copied") : t("usersTable.copyConfigs")}
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger aria-label="QR Code">
          <Button isIconOnly size="sm" variant="ghost" onPress={onQR}>
            <QrCodeIcon className="size-4" />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>QR Code</Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger aria-label={t("userDialog.editUser")}>
          <Button isIconOnly size="sm" variant="ghost" onPress={onEdit}>
            <PencilSquareIcon className="size-4" />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>{t("userDialog.editUser")}</Tooltip.Content>
      </Tooltip>
    </div>
  );
};
