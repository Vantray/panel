import { fetch } from "@/lib/api";
import { useDashboard } from "@/stores/dashboard";
import type { NodeStatus, NodeType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { create } from "zustand";

export const NodeSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  port: z
    .number()
    .min(1)
    .or(z.string().transform((v) => parseFloat(v))),
  api_port: z
    .number()
    .min(1)
    .or(z.string().transform((v) => parseFloat(v))),
  xray_version: z.string().nullable().optional(),
  id: z.number().nullable().optional(),
  status: z.enum(["connected", "connecting", "error", "disabled"]).nullable().optional(),
  message: z.string().nullable().optional(),
  add_as_new_host: z.boolean().optional(),
  usage_coefficient: z.number().or(z.string().transform((v) => parseFloat(v))),
});

export const getNodeDefaultValues = (): NodeType => ({
  name: "",
  address: "",
  port: 62050,
  api_port: 62051,
  xray_version: "",
  usage_coefficient: 1,
});

export const FetchNodesQueryKey = ["fetch-nodes-query-key"];

export type NodeStore = {
  nodes: NodeType[];
  deletingNode?: NodeType | null;
  addNode: (node: NodeType) => Promise<unknown>;
  fetchNodes: () => Promise<NodeType[]>;
  updateNode: (node: NodeType) => Promise<unknown>;
  reconnectNode: (node: NodeType) => Promise<unknown>;
  deleteNode: () => Promise<unknown>;
  setDeletingNode: (node: NodeType | null) => void;
};

export const useNodesQuery = () => {
  const isEditingNodes = useDashboard((s) => s.isEditingNodes);
  return useQuery({
    queryKey: FetchNodesQueryKey,
    queryFn: useNodes.getState().fetchNodes,
    refetchInterval: isEditingNodes ? 3000 : undefined,
    refetchOnWindowFocus: false,
  });
};

export const useNodes = create<NodeStore>()((set, get) => ({
  nodes: [],
  addNode(body) {
    return fetch("/node", { method: "POST", body });
  },
  fetchNodes() {
    return fetch("/nodes");
  },
  updateNode(body) {
    return fetch(`/node/${body.id}`, {
      method: "PUT",
      body,
    });
  },
  setDeletingNode(node) {
    set({ deletingNode: node });
  },
  reconnectNode(body) {
    return fetch(`/node/${body.id}/reconnect`, {
      method: "POST",
    });
  },
  deleteNode: () => {
    return fetch(`/node/${get().deletingNode?.id}`, {
      method: "DELETE",
    });
  },
}));

export type { NodeStatus };
