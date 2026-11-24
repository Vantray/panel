import { fetch } from "@/lib/api";
import { useDashboard } from "@/stores/dashboard";
import type { SystemInfo } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const StatisticsQueryKey = ["statistics-query-key"];

export const useSystem = () => {
  const query = useQuery<SystemInfo, Error>({
    queryKey: StatisticsQueryKey,
    queryFn: () => fetch<SystemInfo>("/system"),
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const version = query.data?.version;
    if (version && version !== useDashboard.getState().version) {
      useDashboard.setState({ version });
    }
  }, [query.data?.version]);

  return query;
};
