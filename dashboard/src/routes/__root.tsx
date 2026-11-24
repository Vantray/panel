import { createRootRoute, Navigate, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { BackendGate } from "@/components/BackendGate";

const RootLayout = () => (
  <>
    <Outlet />
    <BackendGate />
    <TanStackRouterDevtools position="bottom-right" />
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <Navigate to="/" />,
});
