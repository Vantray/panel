import { toast } from "@heroui/react";
import i18n from "@/lib/i18n";
import type { UseFormReturn } from "react-hook-form";

type ApiErrorShape = {
  response?: {
    status?: number;
    _data?: { detail?: string | Record<string, string> };
  };
};

/** True when the request never got an HTTP response (backend unreachable). */
export const isNetworkError = (e: unknown) => {
  const err = e as ApiErrorShape;
  return !err?.response;
};

/** "Can't reach the server — reload the page" toast for connection failures.
 * Throttled: background polls fail every few seconds while the backend is
 * down, so this must not spam a toast per failure. */
let lastConnectionToastAt = 0;
const CONNECTION_TOAST_THROTTLE_MS = 15_000;

export const notifyConnectionError = () => {
  const now = Date.now();
  if (now - lastConnectionToastAt < CONNECTION_TOAST_THROTTLE_MS) return;
  lastConnectionToastAt = now;
  toast.danger(i18n.t("connectionFailed.title"), {
    description: i18n.t("connectionFailed.hint"),
    timeout: 5000,
  });
};

export const generateErrorMessage = (e: ApiErrorShape | unknown, form?: UseFormReturn<any>) => {
  if (isNetworkError(e)) {
    notifyConnectionError();
    return;
  }
  const err = e as ApiErrorShape;
  const detail = err?.response?._data?.detail;
  if (detail && typeof detail === "string") {
    toast.danger(detail, { timeout: 3000 });
    return;
  }
  if (detail && typeof detail === "object" && form) {
    Object.keys(detail).forEach((errorKey) =>
      form.setError(errorKey, { message: detail[errorKey] }),
    );
    return;
  }
  toast.danger("Something went wrong!", { timeout: 3000 });
};

export const generateSuccessMessage = (message: string) => {
  toast.success(message, { timeout: 3000 });
};
