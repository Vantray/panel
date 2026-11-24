import {
  Checkbox,
  Chip,
  CheckboxContent,
  CheckboxControl,
  CheckboxIndicator,
  Input,
  Label,
  ListBox,
  Select,
  SelectIndicator,
  SelectPopover,
  SelectTrigger,
  SelectValue,
  TextField,
} from "@heroui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { shadowsocksMethods, XTLSFlows } from "@/constants";
import { useDashboard } from "@/stores/dashboard";
import { useState, type FC } from "react";
import { type ControllerRenderProps, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { InboundType, ProtocolType, ProxyKeys } from "@/types";
import { cn } from "@/lib/utils";

type ProtocolCardProps = {
  title: ProtocolType;
  description: string;
  isSelected: boolean;
  toggleAccordion: () => void;
  isExpanded: boolean;
  disabled?: boolean;
};

const InboundCard: FC<{
  inbound: InboundType;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ inbound, isSelected, onToggle }) => {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center justify-between overflow-hidden rounded-lg border border-border px-3 py-2 transition-colors",
        isSelected && "bg-default/40",
      )}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <Checkbox
        isSelected={isSelected}
        onChange={onToggle}
        className="grow pl-2"
        aria-label={inbound.tag}
      >
        <CheckboxContent className="w-full gap-2">
          <CheckboxControl>
            <CheckboxIndicator />
          </CheckboxControl>
          <span className="truncate text-xs uppercase">
            {inbound.tag} <span className="normal-case">({inbound.network})</span>
          </span>
        </CheckboxContent>
      </Checkbox>
      {inbound.tls && inbound.tls != "none" && (
        <Chip size="sm" variant="soft" className="opacity-80">
          {inbound.tls}
        </Chip>
      )}
    </div>
  );
};

const ProtocolCard: FC<ProtocolCardProps> = ({
  title,
  description,
  isSelected,
  toggleAccordion,
  isExpanded,
  disabled,
}) => {
  const form = useFormContext();
  const { inbounds } = useDashboard();
  const { t } = useTranslation();

  const inboundsForProtocol =
    (inbounds.get(title as ProtocolType) as InboundType[] | undefined) || [];
  const protocolHasInbound = inboundsForProtocol.length > 0;

  const [inboundSelection] = useWatch({
    name: [`inbounds.${title}`],
    control: form.control,
  }) as [string[] | undefined];

  const selectedInbounds = inboundSelection ?? [];

  const isPartialSelected = isSelected && selectedInbounds.length !== inboundsForProtocol.length;

  const shouldBeDisabled = !isSelected && !protocolHasInbound;

  const toggleInbound = (tag: string) => {
    const next = selectedInbounds.includes(tag)
      ? selectedInbounds.filter((t) => t !== tag)
      : [...selectedInbounds, tag];
    form.setValue(`inbounds.${title}`, next);
    if (next.length === 0) {
      const selected_proxies = form.getValues("selected_proxies");
      form.setValue(
        "selected_proxies",
        selected_proxies.filter((p: string) => p !== title),
      );
      toggleAccordion();
    }
  };

  const CheckboxPart = (
    <Checkbox
      isSelected={isSelected}
      // Protocols without any configured inbound cannot be selected.
      isDisabled={disabled || shouldBeDisabled}
      aria-label={title}
      onChange={() => {
        const current: ProxyKeys = (form.getValues("selected_proxies") ?? []) as ProxyKeys;
        if (current.includes(title)) {
          form.setValue(
            "selected_proxies",
            current.filter((p) => p !== title),
          );
        } else {
          form.setValue(
            `inbounds.${title}`,
            inboundsForProtocol.map((i) => i.tag),
          );
          form.setValue("selected_proxies", [...current, title]);
        }
      }}
    >
      <CheckboxContent className="gap-3 py-2 ps-3">
        <CheckboxControl>
          <CheckboxIndicator />
        </CheckboxControl>
        <span className="flex flex-col text-start">
          <span
            className={cn(
              "text-sm capitalize",
              shouldBeDisabled ? "text-muted/60" : "text-foreground",
            )}
          >
            {title}
          </span>
          <span
            className={cn("text-xs font-medium", shouldBeDisabled ? "text-muted/60" : "text-muted")}
          >
            {description}
          </span>
        </span>
      </CheckboxContent>
    </Checkbox>
  );

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border transition-colors",
        isSelected ? "border-accent bg-accent-soft/30" : "border-border",
        shouldBeDisabled && "bg-default/30 opacity-60",
      )}
    >
      {isPartialSelected && (
        <span className="absolute -top-1 -right-1 z-10 size-2 rounded-full bg-warning" />
      )}
      <div className="flex items-center justify-between pe-2">
        {CheckboxPart}
        {isSelected && protocolHasInbound && (
          <button
            type="button"
            aria-label="inbound settings"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-accent transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              toggleAccordion();
            }}
          >
            <ChevronDownIcon
              className={cn("size-5 transition-transform", isExpanded && "rotate-180")}
            />
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="flex flex-col gap-2 border-t border-border px-3 pt-3 pb-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm">{t("inbound")}</p>
            <div className="flex w-full flex-col gap-1">
              {inboundsForProtocol.map((inbound) => (
                <InboundCard
                  key={inbound.tag}
                  inbound={inbound}
                  isSelected={selectedInbounds.includes(inbound.tag)}
                  onToggle={() => toggleInbound(inbound.tag)}
                />
              ))}
            </div>
          </div>
          {title === "vmess" && isSelected && (
            <TextField fullWidth aria-label="ID">
              <Label>ID</Label>
              <Input
                placeholder={t("userDialog.generatedByDefault")}
                {...form.register("proxies.vmess.id")}
              />
            </TextField>
          )}
          {title === "vless" && isSelected && (
            <>
              <TextField fullWidth aria-label="ID">
                <Label>ID</Label>
                <Input
                  placeholder={t("userDialog.generatedByDefault")}
                  {...form.register("proxies.vless.id")}
                />
              </TextField>
              <ControllerRenderSelect name="proxies.vless.flow" label="Flow" options={XTLSFlows} />
            </>
          )}
          {title === "trojan" && isSelected && (
            <TextField fullWidth aria-label={t("password")}>
              <Label>{t("password")}</Label>
              <Input
                placeholder={t("userDialog.generatedByDefault")}
                {...form.register("proxies.trojan.password")}
              />
            </TextField>
          )}
          {title === "shadowsocks" && isSelected && (
            <>
              <TextField fullWidth aria-label={t("password")}>
                <Label>{t("password")}</Label>
                <Input
                  placeholder={t("userDialog.generatedByDefault")}
                  {...form.register("proxies.shadowsocks.password")}
                />
              </TextField>
              <ControllerRenderSelect
                name="proxies.shadowsocks.method"
                label={t("userDialog.method")}
                options={shadowsocksMethods.map((m) => ({
                  title: m,
                  value: m,
                }))}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ControllerRenderSelect: FC<{
  name: string;
  label: string;
  options: { title: string; value: string }[];
}> = ({ name, label, options }) => {
  const form = useFormContext();
  const value = form.watch(name);
  return (
    <Select
      fullWidth
      aria-label={label}
      value={value ?? ""}
      onChange={(v) => form.setValue(name, v as string)}
    >
      <Label>{label}</Label>
      <SelectTrigger>
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectPopover>
        <ListBox>
          {options.map((entry) => (
            <ListBox.Item key={entry.value} id={entry.value} textValue={entry.title}>
              {entry.title}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </SelectPopover>
    </Select>
  );
};

export type RadioListType = {
  title: ProtocolType;
  description: string;
};

export type ProtocolGroupProps = ControllerRenderProps & {
  list: RadioListType[];
  disabled?: boolean;
};

export const ProtocolGroup: FC<ProtocolGroupProps> = ({ list, disabled, value }) => {
  const [expanded, setExpanded] = useState<ProtocolType[]>([]);

  const toggleAccordion = (title: ProtocolType) => {
    setExpanded((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const currentValue = (value ?? []) as ProxyKeys;

  return (
    <div className="flex flex-col gap-2">
      {list.map((entry) => {
        const isSelected = currentValue.includes(entry.title);
        return (
          <ProtocolCard
            key={entry.title}
            title={entry.title}
            description={entry.description}
            isSelected={isSelected}
            disabled={disabled}
            isExpanded={expanded.includes(entry.title)}
            toggleAccordion={() => toggleAccordion(entry.title)}
          />
        );
      })}
    </div>
  );
};
