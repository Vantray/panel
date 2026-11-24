import { fetch } from "@/lib/api";
import type { HostsSchema } from "@/types";
import { create } from "zustand";

type HostsStore = {
  isLoading: boolean;
  isPostLoading: boolean;
  hosts: HostsSchema;
  fetchHosts: () => void;
  setHosts: (hosts: HostsSchema) => Promise<void>;
};

export const useHosts = create<HostsStore>()((set) => ({
  isLoading: false,
  isPostLoading: false,
  hosts: {},
  fetchHosts: () => {
    set({ isLoading: true });
    fetch("/hosts")
      .then((hosts) => set({ hosts }))
      .finally(() => set({ isLoading: false }));
  },
  setHosts: (body) => {
    set({ isPostLoading: true });
    return fetch("/hosts", { method: "PUT", body }).finally(() => {
      set({ isPostLoading: false });
    });
  },
}));
