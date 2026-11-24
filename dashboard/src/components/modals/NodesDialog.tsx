import {
  Alert,
  AlertContent,
  AlertDescription,
  Button,
  Chip,
  Checkbox,
  CheckboxContent,
  CheckboxControl,
  CheckboxIndicator,
  FieldError,
  Input,
  Label,
  Modal,
  Switch,
  SwitchContent,
  SwitchControl,
  SwitchThumb,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@heroui/react";
import {
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  SquaresPlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetch } from "@/lib/api";
import { generateErrorMessage, generateSuccessMessage } from "@/lib/toast";
import { IconBlock } from "@/components/IconBlock";
import { StatusBadge } from "@/components/StatusBadge";
import {
  FetchNodesQueryKey,
  getNodeDefaultValues,
  NodeSchema,
  useNodes,
  useNodesQuery,
} from "@/stores/nodes";
import { useDashboard } from "@/stores/dashboard";
import type { NodeType, Status } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FC, type ReactNode } from "react";
import { Controller, type Resolver, type UseFormReturn, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DeleteNodeModal } from "./DeleteNodeModal";
import { cn } from "@/lib/utils";

type NodeFormProps = {
  form: UseFormReturn<NodeType>;
  mutate: (v: NodeType) => void;
  isLoading: boolean;
  submitBtnText: string;
  btnVariant?: "primary" | "outline";
  btnLeftAdornment?: ReactNode;
  addAsHost?: boolean;
};

const NodeForm: FC<NodeFormProps> = ({
  form,
  mutate,
  isLoading,
  submitBtnText,
  btnVariant = "primary",
  btnLeftAdornment,
  addAsHost = false,
}) => {
  const { t } = useTranslation();
  const [showCertificate, setShowCertificate] = useState(false);
  const { data: nodeSettings } = useQuery({
    queryKey: ["node-settings"],
    queryFn: () => fetch<{ min_node_version: string; certificate: string }>("/node/settings"),
  });

  const err = (name: keyof NodeType) => form.formState.errors[name]?.message;

  return (
    <form onSubmit={form.handleSubmit((v) => mutate(v as NodeType))}>
      <div className="flex flex-col gap-3">
        {nodeSettings && nodeSettings.certificate && (
          <Alert status="accent" className="items-start">
            <AlertContent className="flex flex-col overflow-hidden">
              <span>{t("nodes.connection-hint")}</span>
              <div className="flex justify-end gap-2 py-2">
                <a
                  href={URL.createObjectURL(
                    new Blob([nodeSettings.certificate], { type: "text/plain" }),
                  )}
                  download="ssl_client_cert.pem"
                  className="inline-flex items-center rounded-lg bg-accent px-2.5 py-1 text-xs text-accent-foreground hover:bg-accent-hover"
                >
                  {t("nodes.download-certificate")}
                </a>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label="toggle certificate"
                  onPress={() => setShowCertificate((v) => !v)}
                >
                  {showCertificate ? (
                    <EyeSlashIcon className="size-3.5" />
                  ) : (
                    <EyeIcon className="size-3.5" />
                  )}
                </Button>
              </div>
              {showCertificate && (
                <pre
                  className="max-h-40 overflow-auto rounded-md bg-default/50 p-2 text-[10px] leading-tight"
                  onClick={(e) => {
                    const sel = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(e.target as HTMLElement);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  }}
                >
                  {nodeSettings.certificate}
                </pre>
              )}
            </AlertContent>
          </Alert>
        )}

        <div className="flex w-full items-end gap-2">
          <TextField fullWidth isInvalid={!!err("name")} className="grow">
            <Label>{t("nodes.nodeName")}</Label>
            <Input placeholder="Vantray-S2" {...form.register("name")} />
            {err("name") && <FieldError>{err("name")}</FieldError>}
          </TextField>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <div className="pb-2">
                <Switch
                  isSelected={field.value !== "disabled"}
                  onChange={(selected) => field.onChange(selected ? "connecting" : "disabled")}
                  aria-label="node status"
                >
                  <SwitchContent>
                    <SwitchControl>
                      <SwitchThumb />
                    </SwitchControl>
                  </SwitchContent>
                </Switch>
              </div>
            )}
          />
        </div>

        <TextField fullWidth isInvalid={!!err("address")}>
          <Label>{t("nodes.nodeAddress")}</Label>
          <Input placeholder="51.20.12.13" {...form.register("address")} />
          {err("address") && <FieldError>{err("address")}</FieldError>}
        </TextField>

        <div className="flex w-full gap-2 items-end">
          <TextField fullWidth className="grow">
            <Label>{t("nodes.nodePort")}</Label>
            <Input type="number" placeholder="62050" {...form.register("port")} />
            {err("port") && <FieldError>{err("port")}</FieldError>}
          </TextField>
          <TextField fullWidth className="grow">
            <Label>{t("nodes.nodeAPIPort")}</Label>
            <Input type="number" placeholder="62051" {...form.register("api_port")} />
            {err("api_port") && <FieldError>{err("api_port")}</FieldError>}
          </TextField>
          <TextField fullWidth className="grow">
            <Label>{t("nodes.usageCoefficient")}</Label>
            <Input
              type="number"
              placeholder="1"
              step={0.1}
              {...form.register("usage_coefficient")}
            />
            {err("usage_coefficient") && <FieldError>{err("usage_coefficient")}</FieldError>}
          </TextField>
        </div>

        {addAsHost && (
          <Controller
            name="add_as_new_host"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                isSelected={!!field.value}
                onChange={(selected) => field.onChange(selected)}
              >
                <CheckboxContent>
                  <CheckboxControl>
                    <CheckboxIndicator />
                  </CheckboxControl>
                  <span className="text-sm">{t("nodes.addHostForEveryInbound")}</span>
                </CheckboxContent>
              </Checkbox>
            )}
          />
        )}

        <div className="flex w-full items-center gap-2">
          {btnLeftAdornment}
          <Button
            className="grow"
            type="submit"
            size="sm"
            isPending={isLoading}
            variant={btnVariant}
          >
            {submitBtnText}
          </Button>
        </div>
      </div>
    </form>
  );
};

const NodeAccordionShell: FC<{
  node: NodeType;
  nodeStatus: Status;
  children: ReactNode;
}> = ({ node, nodeStatus, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full rounded-lg border border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-start hover:bg-default/40"
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="flex-1 text-sm font-medium">{node.name}</span>
        <span className="flex items-center gap-2">
          {node.xray_version && (
            <Chip size="sm" variant="soft" className="rounded-full text-[.7rem] font-medium">
              Xray {node.xray_version}
            </Chip>
          )}
          {node.status && (
            <StatusBadge
              status={nodeStatus}
              i18nPrefix="nodeModal.status"
              showDetail={false}
              compact
            />
          )}
        </span>
        <ChevronDownIcon
          className={cn("size-4 text-muted transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && <div className="flex flex-col gap-2 px-2 pb-2">{children}</div>}
    </div>
  );
};

const NodeAccordion: FC<{ node: NodeType }> = ({ node }) => {
  const { updateNode, reconnectNode, setDeletingNode } = useNodes();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const form = useForm<NodeType>({
    defaultValues: node,
    resolver: zodResolver(NodeSchema) as unknown as Resolver<NodeType>,
  });

  const { isPending, mutate } = useMutation({
    mutationFn: (v: NodeType) => updateNode(v),
    onSuccess: () => {
      generateSuccessMessage("Node updated successfully");
      void queryClient.invalidateQueries({ queryKey: FetchNodesQueryKey });
    },
    onError: (e) => generateErrorMessage(e, form),
  });
  void isPending;

  const { isPending: isReconnecting, mutate: reconnect } = useMutation({
    mutationFn: () => reconnectNode(node),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FetchNodesQueryKey });
    },
  });

  const nodeStatus: Status = isReconnecting ? "connecting" : node.status ? node.status : "error";

  return (
    <NodeAccordionShell node={node} nodeStatus={nodeStatus}>
      {nodeStatus === "error" && node.message && (
        <Alert status="danger">
          <AlertContent>
            <AlertDescription>{node.message}</AlertDescription>
          </AlertContent>
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              isDisabled={isReconnecting}
              onPress={() => reconnect()}
            >
              {isReconnecting ? t("nodes.reconnecting") : t("nodes.reconnect")}
            </Button>
          </div>
        </Alert>
      )}
      <NodeForm
        form={form}
        mutate={(v) => mutate(v)}
        isLoading={isPending}
        submitBtnText={t("nodes.editNode")}
        btnVariant="outline"
        btnLeftAdornment={
          <Tooltip>
            <TooltipTrigger aria-label={t("delete")}>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="text-danger"
                aria-label="delete node"
                onPress={() => setDeletingNode(node)}
              >
                <TrashIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("delete")}</TooltipContent>
          </Tooltip>
        }
      />
    </NodeAccordionShell>
  );
};

const AddNodeForm: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { addNode } = useNodes();
  const form = useForm<NodeType>({
    resolver: zodResolver(NodeSchema) as unknown as Resolver<NodeType>,
    defaultValues: {
      ...getNodeDefaultValues(),
      add_as_new_host: false,
    },
  });
  const { isPending, mutate } = useMutation({
    mutationFn: (v: NodeType) => addNode(v),
    onSuccess: () => {
      generateSuccessMessage(t("nodes.addNodeSuccess", { name: form.getValues("name") }));
      void queryClient.invalidateQueries({ queryKey: FetchNodesQueryKey });
      form.reset();
    },
    onError: (e) => generateErrorMessage(e, form),
  });

  return (
    <div className="w-full rounded-lg border border-border">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-2 text-start text-sm font-medium">
          <PlusIcon className="inline-block size-4" />
          <span>{t("nodes.addNewVantrayNode")}</span>
        </summary>
        <div className="px-2 py-4">
          <NodeForm
            form={form}
            mutate={(v) => mutate(v)}
            isLoading={isPending}
            submitBtnText={t("nodes.addNode")}
            addAsHost
          />
        </div>
      </details>
    </div>
  );
};

export const NodesDialog: FC = () => {
  const { isEditingNodes, onEditingNodes } = useDashboard();
  const { t } = useTranslation();
  const { data: nodes, isPending } = useNodesQuery();

  const onClose = () => {
    onEditingNodes(false);
  };

  return (
    <>
      <Modal
        isOpen={isEditingNodes}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog className="flex max-h-[min(760px,90vh)] flex-col overflow-hidden">
              <Modal.CloseTrigger />
              <Modal.Header>
                <IconBlock>
                  <SquaresPlusIcon className="size-5" />
                </IconBlock>
              </Modal.Header>
              <Modal.Body className="min-h-0 flex-1 overflow-y-auto pb-6">
                <p className="mb-3 text-sm opacity-80">{t("nodes.title")}</p>
                {isPending && "loading..."}
                <div className="flex w-full flex-col gap-2">
                  {!isPending &&
                    nodes &&
                    nodes.map((node) => <NodeAccordion key={node.name} node={node} />)}
                  <AddNodeForm />
                </div>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      <DeleteNodeModal />
    </>
  );
};
