import { Button, Dropdown, Label, Link } from "@heroui/react";
import {
  ArrowLeftEndOnRectangleIcon,
  Bars3Icon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentMinusIcon,
  LinkIcon,
  MoonIcon,
  SquaresPlusIcon,
  StarIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { REPO_URL } from "@/constants";
import useAdmin, { AdminQueryKey } from "@/hooks/useAdmin";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/stores/dashboard";
import { useTheme } from "@/stores/theme";
import { Language } from "./Language";
import type { FC } from "react";

export const Header: FC = () => {
  const { admin, isAdminPending, isAdminSuccess } = useAdmin();
  const isSudo = !isAdminPending && isAdminSuccess && admin.is_sudo;

  const { onEditingHosts, onResetAllUsage, onEditingNodes, onShowingNodesUsage } = useDashboard();
  const { colorMode, toggleColorMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = () => {
    queryClient.removeQueries({ queryKey: AdminQueryKey });
    navigate({ to: "/login" });
  };

  const menuAction = (key: string) => {
    switch (key) {
      case "hosts":
        onEditingHosts(true);
        break;
      case "nodes":
        onEditingNodes(true);
        break;
      case "nodes-usage":
        onShowingNodesUsage(true);
        break;
      case "reset-all":
        onResetAllUsage(true);
        break;
      case "logout":
        logout();
        break;
    }
  };

  return (
    <div className="relative flex items-center justify-between gap-2">
      <div className="relative">
        <h1 className="text-2xl font-semibold">{t("users")}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Dropdown>
          <Button isIconOnly size="sm" variant="outline" aria-label="settings">
            <Bars3Icon className="size-4" />
          </Button>
          <Dropdown.Popover className="min-w-47.5">
            <Dropdown.Menu onAction={(key) => menuAction(String(key))}>
              {isSudo && (
                <>
                  <Dropdown.Item id="hosts" textValue={t("header.hostSettings")}>
                    <LinkIcon className="size-4 shrink-0 text-muted" />
                    <Label>{t("header.hostSettings")}</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="nodes" textValue={t("header.nodeSettings")}>
                    <SquaresPlusIcon className="size-4 shrink-0 text-muted" />
                    <Label>{t("header.nodeSettings")}</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="nodes-usage" textValue={t("header.nodesUsage")}>
                    <ChartPieIcon className="size-4 shrink-0 text-muted" />
                    <Label>{t("header.nodesUsage")}</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="reset-all" textValue={t("resetAllUsage")}>
                    <DocumentMinusIcon className="size-4 shrink-0 text-muted" />
                    <Label>{t("resetAllUsage")}</Label>
                  </Dropdown.Item>
                </>
              )}
              <Dropdown.Item id="logout" textValue={t("header.logout")}>
                <ArrowLeftEndOnRectangleIcon className="size-4 shrink-0 text-muted" />
                <Label>{t("header.logout")}</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>

        {isSudo && (
          <Button
            isIconOnly
            size="sm"
            variant="outline"
            aria-label="core settings"
            onPress={() => {
              useDashboard.setState({ isEditingCore: true });
            }}
          >
            <Cog6ToothIcon className="size-4" />
          </Button>
        )}

        <Language />

        <Button
          isIconOnly
          size="sm"
          variant="outline"
          aria-label="switch theme"
          onPress={toggleColorMode}
        >
          {colorMode === "light" ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
        </Button>

        <Link href={REPO_URL} target="_blank">
          <Button size="sm" variant="outline">
            <StarIcon className="size-4" />
            Star
          </Button>
        </Link>
      </div>
    </div>
  );
};
