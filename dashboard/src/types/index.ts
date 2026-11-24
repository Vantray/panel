export type Status =
  "active" | "disabled" | "limited" | "expired" | "on_hold" | "error" | "connecting" | "connected";

export type ProxyKeys = ("vmess" | "vless" | "trojan" | "shadowsocks")[];

export type ProxyType = {
  vmess?: {
    id?: string;
  };
  vless?: {
    id?: string;
    flow?: string;
  };
  trojan?: {
    password?: string;
  };
  shadowsocks?: {
    password?: string;
    method?: string;
  };
};

export type DataLimitResetStrategy = "no_reset" | "day" | "week" | "month" | "year";

export type UserInbounds = {
  [key: string]: string[];
};

export type User = {
  proxies: ProxyType;
  expire: number | null;
  data_limit: number | null;
  data_limit_reset_strategy: DataLimitResetStrategy;
  on_hold_expire_duration: number | null;
  lifetime_used_traffic: number;
  username: string;
  used_traffic: number;
  status: Status;
  links: string[];
  subscription_url: string;
  inbounds: UserInbounds;
  note: string;
  online_at: string;
};

export type UserCreate = Pick<
  User,
  | "inbounds"
  | "proxies"
  | "expire"
  | "data_limit"
  | "data_limit_reset_strategy"
  | "on_hold_expire_duration"
  | "username"
  | "status"
  | "note"
>;

export type Admin = {
  // `discord_webook` matches the backend field name (typo included).
  discord_webook: string;
  is_sudo: boolean;
  telegram_id: number | string;
  username: string;
};

export type ProtocolType = "vmess" | "vless" | "trojan" | "shadowsocks";

export type InboundType = {
  tag: string;
  protocol: ProtocolType;
  network: string;
  tls: string;
  port?: number;
};

export type Inbounds = Map<ProtocolType, InboundType[]>;

export type FilterUsageType = {
  start?: string;
  end?: string;
};

export type NodeStatus = "connected" | "connecting" | "error" | "disabled";

export type NodeType = {
  name: string;
  address: string;
  port: number | string;
  api_port: number | string;
  xray_version?: string | null;
  id?: number | null;
  status?: NodeStatus | null;
  message?: string | null;
  add_as_new_host?: boolean;
  usage_coefficient: number | string;
};

export type NodeSettings = {
  min_node_version: string;
  certificate: string;
};

export type ProxyHostSecurity = "inbound_default" | "none" | "tls";

export type ProxyHost = {
  remark: string;
  address: string;
  port: number | null;
  path: string | null;
  sni: string | null;
  host: string | null;
  mux_enable?: boolean;
  allowinsecure?: boolean | null;
  is_disabled?: boolean;
  fragment_setting?: string | null;
  noise_setting?: string | null;
  random_user_agent?: boolean;
  security?: string;
  alpn?: string;
  fingerprint?: string;
  use_sni_as_host?: boolean;
};

export type HostsSchema = Record<string, ProxyHost[]>;

export type SystemInfo = {
  version: string;
  users_active: number;
  total_user: number;
  incoming_bandwidth: number;
  outgoing_bandwidth: number;
  mem_total: number;
  mem_used: number;
};

export type CoreInfo = {
  version: string | null;
  started: boolean | null;
  logs_websocket: string | null;
};

export type UserUsage = {
  usages: {
    node_name: string;
    used_traffic: number;
  }[];
};

export type NodeUsage = {
  usages: {
    node_name: string;
    uplink: number;
    downlink: number;
  }[];
};
