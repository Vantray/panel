import {
  Button,
  Chip,
  Label,
  ListBox,
  Modal,
  Select,
  SelectIndicator,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@heroui/react";
import { ArrowPathIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useCoreSettings } from "@/stores/core";
import { useDashboard } from "@/stores/dashboard";
import { useNodesQuery } from "@/stores/nodes";
import { getAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { ReadyState } from "react-use-websocket";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { IconBlock } from "@/components/IconBlock";
import { JsonEditor } from "@/components/JsonEditor";
import { generateErrorMessage, generateSuccessMessage } from "@/lib/toast";

export const MAX_NUMBER_OF_LOGS = 500;

const getStatus = (readyState: ReadyState) => {
  switch (readyState) {
    case ReadyState.CONNECTING:
      return "connecting";
    case ReadyState.OPEN:
      return "connected";
    default:
      return "closed";
  }
};

const getWebsocketUrl = (nodeID: string) => {
  try {
    const baseURL = new URL(
      import.meta.env.VITE_BASE_API.startsWith("/")
        ? window.location.origin + import.meta.env.VITE_BASE_API
        : import.meta.env.VITE_BASE_API,
    );

    return (
      (baseURL.protocol === "https:" ? "wss://" : "ws://") +
      baseURL.host +
      baseURL.pathname.replace(/\/$/, "") +
      (!nodeID ? "/core/logs" : `/node/${nodeID}/logs`) +
      "?interval=1&token=" +
      getAuthToken()
    );
  } catch (e) {
    console.error("Unable to generate websocket url", e);
    return null;
  }
};

let logsTmp: string[] = [];

const CoreSettingModalContent: FC = () => {
  const { data: nodes } = useNodesQuery();
  const [selectedNode, setNode] = useState<string>("");

  const { isEditingCore } = useDashboard();
  const {
    fetchCoreSettings,
    updateConfig,
    isLoading,
    config,
    isPostLoading,
    version,
    restartCore,
  } = useCoreSettings();

  const logsDiv = useRef<HTMLDivElement | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: { config: config || "" },
  });

  useEffect(() => {
    if (config) form.setValue("config", config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    if (isEditingCore) fetchCoreSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingCore]);

  const scrollShouldStayOnEnd = useRef(true);
  const updateLogs = useCallback(
    debounce((nextLogs: string[]) => {
      const el = logsDiv.current;
      const isScrollOnEnd =
        Math.abs((el?.scrollTop || 0) - (el?.scrollHeight || 0) + (el?.offsetHeight || 0)) < 10;
      scrollShouldStayOnEnd.current = el ? isScrollOnEnd : false;
      setLogs(nextLogs);
    }, 300),
    [],
  );

  const { readyState } = useWebSocket(getWebsocketUrl(selectedNode), {
    onMessage: (e: MessageEvent) => {
      logsTmp.push(e.data as string);
      if (logsTmp.length > MAX_NUMBER_OF_LOGS)
        logsTmp = logsTmp.slice(logsTmp.length - MAX_NUMBER_OF_LOGS);
      updateLogs([...logsTmp]);
    },
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 1000,
  });

  useEffect(() => {
    if (logsDiv.current && scrollShouldStayOnEnd.current)
      logsDiv.current.scrollTop = logsDiv.current?.scrollHeight;
  }, [logs]);

  useEffect(() => {
    return () => {
      logsTmp = [];
    };
  }, []);

  const status = getStatus(readyState);

  const { mutate: handleRestartCore, isPending: isRestarting } = useMutation({
    mutationFn: restartCore,
  });

  const handleOnSave = ({ config: nextConfig }: { config: string }) => {
    updateConfig(nextConfig)
      .then(() => {
        generateSuccessMessage(t("core.successMessage"));
      })
      .catch((e) => {
        let message = t("core.generalErrorMessage");
        const detail = e?.response?._data?.detail;
        if (typeof detail === "object") message = detail[Object.keys(detail)[0]];
        if (typeof detail === "string") message = detail;
        generateErrorMessage({ response: { _data: { detail: message } } });
      });
  };

  const handleLog = (id: string) => {
    if (id === selectedNode) return;
    setNode(id === "host" ? "" : id);
    setLogs([]);
    logsTmp = [];
  };

  return (
    <form onSubmit={form.handleSubmit(handleOnSave)} className="flex min-h-0 flex-1 flex-col">
      <Modal.Body className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between pt-2">
          <Label>
            {t("core.configuration")} {isLoading && <span className="text-xs text-muted">…</span>}
          </Label>
          <Chip size="sm" variant="soft" className="lowercase">
            {version && `v${version}`}
          </Chip>
        </div>
        <div className="relative pt-3">
          <Controller
            control={form.control}
            name="config"
            render={({ field }) => (
              <JsonEditor json={config} onChange={field.onChange} height="400px" />
            )}
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              {nodes?.[0] && (
                <Select
                  className="w-auto min-w-35"
                  aria-label="log source"
                  value={selectedNode || "host"}
                  onChange={(v) => handleLog(String(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectPopover>
                    <ListBox>
                      <ListBox.Item id="host" textValue="Master">
                        Master
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      {nodes.map((s) => (
                        <ListBox.Item key={s.address} id={String(s.id)} textValue={s.name}>
                          {s.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </SelectPopover>
                </Select>
              )}
              <Label className="w-auto">{t("core.logs")}</Label>
            </div>
            <Label>{t(`core.socket.${status}`)}</Label>
          </div>
          <div
            className="max-h-37.5 min-h-30 overflow-y-auto rounded-lg border border-border bg-surface p-2 dark:bg-default/40"
            ref={logsDiv}
          >
            {logs.map((message, i) => (
              <p className="whitespace-pre-line text-xs opacity-80" key={i}>
                {message}
              </p>
            ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="w-full shrink-0 justify-between">
        <div className="flex items-center">
          <Button size="sm" variant="outline" onPress={() => handleRestartCore()}>
            <ArrowPathIcon className={cn("size-4", isRestarting && "animate-spin")} />
            {isRestarting ? t("core.restarting") : t("core.restartCore")}
          </Button>
        </div>
        <Button
          size="sm"
          type="submit"
          isDisabled={isLoading || isPostLoading}
          isPending={isPostLoading}
        >
          {t("core.save")}
        </Button>
      </Modal.Footer>
    </form>
  );
};

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export const CoreSettingsModal: FC = () => {
  const { isEditingCore } = useDashboard();
  const { t } = useTranslation();
  const onClose = () => {
    useDashboard.setState({ isEditingCore: false });
  };

  return (
    <Modal
      isOpen={isEditingCore}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog className="flex h-[min(790px,90vh)] flex-col overflow-hidden sm:max-w-180">
            <Modal.CloseTrigger />
            <Modal.Header>
              <div className="flex items-center gap-2">
                <IconBlock>
                  <Cog6ToothIcon className="size-5" />
                </IconBlock>
                <p className="text-lg font-semibold">{t("core.title")}</p>
              </div>
            </Modal.Header>
            <CoreSettingModalContent />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
