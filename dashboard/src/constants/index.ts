import type { DataLimitResetStrategy, ProxyHostSecurity } from "@/types";

export const REPO_URL = "https://github.com/Vantray/panel";

export const XTLSFlows = [
  { title: "none", value: "" },
  { title: "xtls-rprx-vision", value: "xtls-rprx-vision" },
];

export const shadowsocksMethods = ["aes-128-gcm", "aes-256-gcm", "chacha20-ietf-poly1305"];

export const proxyHostSecurity: {
  title: string;
  value: ProxyHostSecurity;
}[] = [
  { title: "Inbound's default", value: "inbound_default" },
  { title: "TLS", value: "tls" },
  { title: "None", value: "none" },
];

export const proxyALPN: { title: string; value: string }[] = [
  { title: "", value: "" },
  { title: "h3", value: "h3" },
  { title: "h2", value: "h2" },
  { title: "http/1.1", value: "http/1.1" },
  { title: "h3,h2,http/1.1", value: "h3,h2,http/1.1" },
  { title: "h3,h2", value: "h3,h2" },
  { title: "h2,http/1.1", value: "h2,http/1.1" },
];

export const proxyFingerprint: { title: string; value: string }[] = [
  { title: "", value: "" },
  ...[
    "chrome",
    "firefox",
    "safari",
    "ios",
    "android",
    "edge",
    "360",
    "qq",
    "random",
    "randomized",
  ].map((key) => ({ title: key, value: key })),
];

export const resetStrategy: {
  title: "No" | "Daily" | "Weekly" | "Monthly" | "Annually";
  value: DataLimitResetStrategy;
}[] = [
  { title: "No", value: "no_reset" },
  { title: "Daily", value: "day" },
  { title: "Weekly", value: "week" },
  { title: "Monthly", value: "month" },
  { title: "Annually", value: "year" },
];

export const userStatusColor: Record<
  string,
  { chip: "success" | "muted" | "warning" | "danger" | "accent" }
> = {
  active: { chip: "success" },
  connected: { chip: "success" },
  disabled: { chip: "muted" },
  expired: { chip: "warning" },
  on_hold: { chip: "accent" },
  connecting: { chip: "warning" },
  limited: { chip: "danger" },
  error: { chip: "danger" },
};
