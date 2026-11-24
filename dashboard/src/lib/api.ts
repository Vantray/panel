import { $fetch as ohFetch, type FetchOptions } from "ofetch";
import { getAuthToken } from "./auth";

export const $fetch = ohFetch.create({
  baseURL: import.meta.env.VITE_BASE_API,
});

export const fetcher = <T = any>(url: string, ops: FetchOptions<"json"> = {}) => {
  const token = getAuthToken();
  if (token) {
    ops["headers"] = {
      ...(ops?.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return $fetch<T>(url, ops);
};

export const fetch = fetcher;

/**
 * True when the backend answers with any HTTP status below 500 — a 401 still
 * means the server is reachable; a network error or 5xx means it is down.
 */
export const probeBackend = async (): Promise<boolean> => {
  try {
    await fetch("/system");
    return true;
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    return status !== undefined && status < 500;
  }
};
