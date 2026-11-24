import { probeBackend } from "@/lib/api";
import { notifyConnectionError } from "@/lib/toast";
import { useEffect, useRef, useState } from "react";
import { OfflineCard } from "@/components/OfflineCard";
import { useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * Polls the backend every 10s. When the API stops responding (network error
 * or 5xx), a blocking overlay covers the whole app until it comes back.
 */
export const BackendGate = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [retrying, setRetrying] = useState(false);
  const wasDown = useRef(false);

  const query = useQuery({
    queryKey: ["backend-health"],
    queryFn: async () => {
      if (await probeBackend()) return true;
      throw new Error("backend unreachable");
    },
    refetchInterval: 10_000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const retry = async () => {
    setRetrying(true);
    const ok = await probeBackend();
    setRetrying(false);
    if (ok) {
      await query.refetch();
    } else {
      notifyConnectionError();
    }
  };

  const isDown = query.isError || (!query.isPending && !query.data);

  // Announce the outage once per transition (the toast itself is throttled).
  useEffect(() => {
    if (isDown && !wasDown.current) notifyConnectionError();
    wasDown.current = isDown;
  }, [isDown]);

  // The /offline route already renders the card itself.
  if (location.pathname === "/offline") return null;
  // On error TanStack keeps the last successful `data` around — the
  // overlay must stay up while isError, otherwise the cached `true` would
  // hide it forever after the backend dies.
  if (query.isPending || (query.data && !query.isError)) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-background/90 backdrop-blur-sm"
      role="alertdialog"
      aria-label={t("offline.title")}
    >
      <div className="w-full max-w-md">
        <OfflineCard onRetry={() => void retry()} retrying={retrying} />
      </div>
    </div>
  );
};
