import { fetch } from "@/lib/api";
import { removeAuthToken, getAuthToken } from "@/lib/auth";
import { CoreSettingsModal } from "@/components/modals/CoreSettingsModal";
import { DeleteUserModal } from "@/components/modals/DeleteUserModal";
import { Filters } from "@/components/Filters";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HostsDialog } from "@/components/modals/HostsDialog";
import { NodesDialog } from "@/components/modals/NodesDialog";
import { NodesUsage } from "@/components/modals/NodesUsage";
import { QRCodeDialog } from "@/components/modals/QRCodeDialog";
import { ResetAllUsageModal } from "@/components/modals/ResetAllUsageModal";
import { ResetUserUsageModal } from "@/components/modals/ResetUserUsageModal";
import { RevokeSubscriptionModal } from "@/components/modals/RevokeSubscriptionModal";
import { Statistics } from "@/components/Statistics";
import { UserDialog } from "@/components/modals/UserDialog";
import { UsersTable } from "@/components/UsersTable";
import { fetchInbounds, useDashboard } from "@/stores/dashboard";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

const Dashboard = () => {
  useEffect(() => {
    useDashboard.getState().refetchUsers();
    void fetchInbounds();
  }, []);

  return (
    <div className="flex min-h-screen flex-col justify-between px-6 py-4">
      <div className="w-full">
        <Header />
        <Statistics className="mt-4" />
        <Filters />
        <UsersTable />
        <UserDialog />
        <DeleteUserModal />
        <QRCodeDialog />
        <HostsDialog />
        <ResetUserUsageModal />
        <RevokeSubscriptionModal />
        <NodesDialog />
        <NodesUsage />
        <ResetAllUsageModal />
        <CoreSettingsModal />
      </div>
      <Footer />
    </div>
  );
};

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const token = getAuthToken();
    if (!token) throw redirect({ to: "/login" });
    try {
      await fetch("/admin");
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        removeAuthToken();
        throw redirect({ to: "/login" });
      }
      // Backend unreachable (network error) or erroring — block the app on
      // the offline screen instead of rendering a dead admin panel.
      throw redirect({ to: "/offline" });
    }
  },
  component: Dashboard,
});
