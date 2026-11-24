import { fetch } from "@/lib/api";
import { isNetworkError, notifyConnectionError } from "@/lib/toast";
import { getUsersPerPageLimitSize } from "@/lib/userPreference";
import type { FilterUsageType, Inbounds, ProtocolType, User, UserCreate } from "@/types";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type FilterType = {
  search?: string;
  limit?: number;
  offset?: number;
  sort: string;
  status?: "active" | "disabled" | "limited" | "expired" | "on_hold";
};

export type UserUsageResponse = {
  usages: { node_name: string; used_traffic: number }[];
};

export type NodesUsageResponse = {
  usages: { node_name: string; uplink: number; downlink: number }[];
};

type DashboardStateType = {
  isCreatingNewUser: boolean;
  editingUser: User | null | undefined;
  deletingUser: User | null;
  version: string | null;
  users: {
    users: User[];
    total: number;
  };
  inbounds: Inbounds;
  loading: boolean;
  filters: FilterType;
  subscribeUrl: string | null;
  QRcodeLinks: string[] | null;
  isEditingHosts: boolean;
  isEditingNodes: boolean;
  isShowingNodesUsage: boolean;
  isResetingAllUsage: boolean;
  resetUsageUser: User | null;
  revokeSubscriptionUser: User | null;
  isEditingCore: boolean;
  onCreateUser: (isOpen: boolean) => void;
  onEditingUser: (user: User | null) => void;
  onDeletingUser: (user: User | null) => void;
  onResetAllUsage: (isResetingAllUsage: boolean) => void;
  refetchUsers: () => void;
  resetAllUsage: () => Promise<void>;
  onFilterChange: (filters: Partial<FilterType>) => void;
  deleteUser: (user: User) => Promise<void>;
  createUser: (user: UserCreate) => Promise<void>;
  editUser: (user: UserCreate) => Promise<void>;
  fetchUserUsage: (user: User, query: FilterUsageType) => Promise<UserUsageResponse>;
  fetchNodesUsage: (query: FilterUsageType) => Promise<NodesUsageResponse>;
  setQRCode: (links: string[] | null) => void;
  setSubLink: (subscribeURL: string | null) => void;
  onEditingHosts: (isEditingHosts: boolean) => void;
  onEditingNodes: (isEditingNodes: boolean) => void;
  onShowingNodesUsage: (isShowingNodesUsage: boolean) => void;
  resetDataUsage: (user: User) => Promise<void>;
  revokeSubscription: (user: User) => Promise<void>;
};

const fetchUsers = (query: FilterType): Promise<User[]> => {
  for (const key in query) {
    if (!query[key as keyof FilterType]) delete query[key as keyof FilterType];
  }
  useDashboard.setState({ loading: true });
  return fetch("/users", { query })
    .then((users) => {
      useDashboard.setState({ users });
      return users;
    })
    .catch((err) => {
      // Callers fire-and-forget this fetch — surface connection failures
      // instead of silently swallowing them.
      if (isNetworkError(err)) notifyConnectionError();
      throw err;
    })
    .finally(() => {
      useDashboard.setState({ loading: false });
    });
};

export const fetchInbounds = () => {
  return fetch("/inbounds")
    .catch((err) => {
      if (isNetworkError(err)) notifyConnectionError();
      throw err;
    })
    .then((inbounds: Inbounds) => {
      // Guard against non-object responses (e.g. when the API is unreachable
      // and the dev server falls back to index.html).
      const entries =
        inbounds && typeof inbounds === "object" && !Array.isArray(inbounds)
          ? Object.entries(inbounds)
          : [];
      useDashboard.setState({
        inbounds: new Map(entries) as Inbounds,
      });
    });
};

export const useDashboard = create<DashboardStateType>()(
  subscribeWithSelector((set, get) => ({
    version: null,
    editingUser: null,
    deletingUser: null,
    isCreatingNewUser: false,
    QRcodeLinks: null,
    subscribeUrl: null,
    users: {
      users: [],
      total: 0,
    },
    loading: true,
    isResetingAllUsage: false,
    isEditingHosts: false,
    isEditingNodes: false,
    isShowingNodesUsage: false,
    resetUsageUser: null,
    revokeSubscriptionUser: null,
    filters: {
      search: "",
      limit: getUsersPerPageLimitSize(),
      sort: "-created_at",
    },
    inbounds: new Map(),
    isEditingCore: false,
    refetchUsers: () => {
      fetchUsers(get().filters);
    },
    resetAllUsage: () => {
      return fetch(`/users/reset`, { method: "POST" }).then(() => {
        get().onResetAllUsage(false);
        get().refetchUsers();
      });
    },
    onResetAllUsage: (isResetingAllUsage) => set({ isResetingAllUsage }),
    onCreateUser: (isCreatingNewUser) => set({ isCreatingNewUser }),
    onEditingUser: (editingUser) => {
      set({ editingUser });
    },
    onDeletingUser: (deletingUser) => {
      set({ deletingUser });
    },
    onFilterChange: (filters) => {
      set({
        filters: {
          ...get().filters,
          ...filters,
        },
      });
      get().refetchUsers();
    },
    setQRCode: (QRcodeLinks) => {
      set({ QRcodeLinks });
    },
    deleteUser: (user: User) => {
      // The edit dialog closes only on the CONFIRMED deletion (the confirm
      // opens on top of it and must stay when the deletion is cancelled).
      set({ editingUser: null });
      return fetch(`/user/${user.username}`, { method: "DELETE" }).then(() => {
        set({ deletingUser: null, editingUser: null });
        get().refetchUsers();
      });
    },
    createUser: (body: UserCreate) => {
      return fetch(`/user`, { method: "POST", body }).then(() => {
        set({ editingUser: null });
        get().refetchUsers();
      });
    },
    editUser: (body: UserCreate) => {
      return fetch(`/user/${body.username}`, { method: "PUT", body }).then(() => {
        get().onEditingUser(null);
        get().refetchUsers();
      });
    },
    fetchUserUsage: (body: User, query: FilterUsageType) => {
      for (const key in query) {
        if (!query[key as keyof FilterUsageType]) delete query[key as keyof FilterUsageType];
      }
      return fetch(`/user/${body.username}/usage`, { method: "GET", query });
    },
    fetchNodesUsage: (query: FilterUsageType) => {
      for (const key in query) {
        if (!query[key as keyof FilterUsageType]) delete query[key as keyof FilterUsageType];
      }
      return fetch("/nodes/usage", { query });
    },
    onEditingHosts: (isEditingHosts: boolean) => {
      set({ isEditingHosts });
    },
    onEditingNodes: (isEditingNodes: boolean) => {
      set({ isEditingNodes });
    },
    onShowingNodesUsage: (isShowingNodesUsage: boolean) => {
      set({ isShowingNodesUsage });
    },
    setSubLink: (subscribeUrl) => {
      set({ subscribeUrl });
    },
    resetDataUsage: (user) => {
      return fetch(`/user/${user.username}/reset`, { method: "POST" }).then(() => {
        set({ resetUsageUser: null });
        get().refetchUsers();
      });
    },
    revokeSubscription: (user) => {
      return fetch(`/user/${user.username}/revoke_sub`, {
        method: "POST",
      }).then((user) => {
        set({ revokeSubscriptionUser: null, editingUser: user });
        get().refetchUsers();
      });
    },
  })),
);

export type { ProtocolType };
