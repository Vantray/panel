import { OfflineCard } from "@/components/OfflineCard";
import { notifyConnectionError } from "@/lib/toast";
import { probeBackend } from "@/lib/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const Offline = () => {
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);

  // Self-recovery: probe the backend on mount and every 5s. Once it answers,
  // leave the offline screen automatically — even without pressing the button.
  const probe = useQuery({
    queryKey: ["offline-probe"],
    queryFn: async () => {
      if (await probeBackend()) return true;
      throw new Error("backend unreachable");
    },
    refetchInterval: 5000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (probe.data) navigate({ to: "/" });
  }, [probe.data, navigate]);

  const retry = async () => {
    setRetrying(true);
    const ok = await probeBackend();
    setRetrying(false);
    if (ok) {
      navigate({ to: "/" });
    } else {
      notifyConnectionError();
    }
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-background">
      <OfflineCard onRetry={() => void retry()} retrying={retrying || probe.isRefetching} />
    </div>
  );
};

export const Route = createFileRoute("/offline")({
  component: Offline,
});
