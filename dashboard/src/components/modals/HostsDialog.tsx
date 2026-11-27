import {
  Button,
  Chip,
  Checkbox,
  CheckboxContent,
  CheckboxControl,
  CheckboxIndicator,
  Input,
  Label,
  ListBox,
  Modal,
  Popover,
  Select,
  SelectIndicator,
  SelectPopover,
  SelectTrigger,
  SelectValue,
  Switch,
  SwitchContent,
  SwitchControl,
  SwitchThumb,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@heroui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  LinkIcon,
  TrashIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { proxyALPN, proxyFingerprint, proxyHostSecurity } from "@/constants";
import { useHosts } from "@/stores/hosts";
import { useDashboard } from "@/stores/dashboard";
import { generateErrorMessage, generateSuccessMessage } from "@/lib/toast";
import { useEffect, useState, type FC } from "react";
import {
  FormProvider,
  type Resolver,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { z } from "zod";
import { IconBlock } from "@/components/IconBlock";
import { cn } from "@/lib/utils";

const hostsSchema = z.record(
  z.string().min(1),
  z.array(
    z.object({
      remark: z.string().min(1, "Remark is required"),
      address: z.string().min(1, "Address is required"),
      port: z
        .string()
        .or(z.number())
        .nullable()
        .transform((value) => {
          if (typeof value === "number") return value;
          if (value !== null && !isNaN(parseInt(value))) return Number(parseInt(value));
          return null;
        }),
      path: z.string().nullable(),
      sni: z.string().nullable(),
      host: z.string().nullable(),
      mux_enable: z.boolean().default(false),
      allowinsecure: z.boolean().nullable().default(false),
      is_disabled: z.boolean().default(true),
      fragment_setting: z.string().nullable(),
      noise_setting: z.string().nullable(),
      random_user_agent: z.boolean().default(false),
      security: z.string(),
      alpn: z.string(),
      fingerprint: z.string(),
      use_sni_as_host: z.boolean().default(false),
    }),
  ),
);

type HostsFormValues = z.input<typeof hostsSchema>;

const TEMPLATE_VARIABLES: { badge: string; key: string }[] = [
  { badge: "{SERVER_IP}", key: "hostsDialog.currentServer" },
  { badge: "{SERVER_IPV6}", key: "hostsDialog.currentServerv6" },
  { badge: "{USERNAME}", key: "hostsDialog.username" },
  { badge: "{DATA_USAGE}", key: "hostsDialog.dataUsage" },
  { badge: "{DATA_LEFT}", key: "hostsDialog.remainingData" },
  { badge: "{DATA_LIMIT}", key: "hostsDialog.dataLimit" },
  { badge: "{DAYS_LEFT}", key: "hostsDialog.remainingDays" },
  { badge: "{EXPIRE_DATE}", key: "hostsDialog.expireDate" },
  { badge: "{TIME_LEFT}", key: "hostsDialog.remainingTime" },
  { badge: "{STATUS_TEXT}", key: "hostsDialog.statusText" },
  { badge: "{STATUS_EMOJI}", key: "hostsDialog.statusEmoji" },
  { badge: "{PROTOCOL}", key: "hostsDialog.proxyProtocol" },
  { badge: "{TRANSPORT}", key: "hostsDialog.proxyMethod" },
];

const TemplateVariablesContent = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-xs text-xs">
      <p className="pr-5">{t("hostsDialog.desc")}</p>
      {TEMPLATE_VARIABLES.map((v) => (
        <p key={v.badge} className="mt-1">
          <Chip size="sm" variant="soft">
            {v.badge}
          </Chip>{" "}
          {t(v.key)}
        </p>
      ))}
    </div>
  );
};

const InfoPopover = ({ children }: { children: React.ReactNode }) => {
  return (
    <Popover>
      <Popover.Trigger aria-label="info">
        <span className="mt-px flex cursor-pointer text-muted">
          <InformationCircleIcon className="size-4" />
        </span>
      </Popover.Trigger>
      <Popover.Content placement="right">
        <div className="p-3">{children}</div>
      </Popover.Content>
    </Popover>
  );
};

const LabeledField: FC<{
  label: string;
  info?: React.ReactNode;
  children: (props: { id: string }) => React.ReactNode;
  fieldId: string;
}> = ({ label, info, children, fieldId }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between gap-1">
      <Label htmlFor={fieldId}>{label}</Label>
      {info}
    </div>
    {children({ id: fieldId })}
  </div>
);

const HostCard: FC<{
  hostKey: string;
  index: number;
  fieldsLength: number;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (direction: "up" | "down") => void;
}> = ({ hostKey, index, fieldsLength, onRemove, onDuplicate, onMove }) => {
  const form = useFormContext<HostsFormValues>();
  const { t } = useTranslation();
  const errors = form.formState.errors[hostKey]?.[index];
  const base = `${hostKey}.${index}`;

  const booleanField = (name: string, label: string) => {
    const path = `${base}.${name}`;
    return (
      <Checkbox
        isSelected={!!(form.watch(path as never) as unknown)}
        onChange={(selected) => form.setValue(path as never, selected as never)}
      >
        <CheckboxContent>
          <CheckboxControl>
            <CheckboxIndicator />
          </CheckboxControl>
          <span className="text-sm">{label}</span>
        </CheckboxContent>
      </Checkbox>
    );
  };

  const selectField = (
    name: string,
    label: string,
    options: { title: string; value: string }[],
  ) => {
    const path = `${base}.${name}`;
    return (
      <div className="flex flex-col gap-1">
        <Label>{label}</Label>
        <Select
          fullWidth
          aria-label={label}
          value={(form.watch(path as never) as unknown as string) ?? ""}
          onChange={(v) => form.setValue(path as never, v as never)}
        >
          <SelectTrigger>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectPopover>
            <ListBox>
              {options.map((s) => (
                <ListBox.Item key={s.value} id={s.value} textValue={s.title || "—"}>
                  {s.title}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </SelectPopover>
        </Select>
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-border p-2">
      <div className="flex items-start gap-2">
        <div className="flex w-full flex-col">
          <div className="flex w-full items-center gap-2">
            <div className="min-w-0 flex-1">
              <Input
                {...form.register(`${base}.remark` as never)}
                placeholder={t("hostsDialog.remark.placeholder")}
                aria-label="Remark"
                className="w-full"
              />
            </div>
            <InfoPopover>
              <TemplateVariablesContent />
            </InfoPopover>
          </div>
          {errors?.remark && <p className="mt-1 text-xs text-danger">{errors.remark.message}</p>}
        </div>
      </div>
      <div>
        <div className="flex w-full items-center gap-2">
          <div className="min-w-0 flex-1">
            <Input
              {...form.register(`${base}.address` as never)}
              placeholder={t("hostsDialog.address.placeholder")}
              aria-label="Address"
              className="w-full"
            />
          </div>
          <InfoPopover>
            <TemplateVariablesContent />
          </InfoPopover>
        </div>
        {errors?.address && <p className="mt-1 text-xs text-danger">{errors.address.message}</p>}
      </div>

      <div className="flex items-center justify-between gap-1 border-t border-border pt-2">
        <div className="flex items-center gap-2">
          <Switch
            isSelected={!(form.watch(`${base}.is_disabled` as never) as unknown)}
            onChange={(selected) =>
              form.setValue(`${base}.is_disabled` as never, !selected as never)
            }
            aria-label="enabled"
          >
            <SwitchContent>
              <SwitchControl>
                <SwitchThumb />
              </SwitchControl>
            </SwitchContent>
          </Switch>
          <Tooltip>
            <TooltipTrigger aria-label="Delete">
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="text-danger"
                onPress={onRemove}
              >
                <TrashIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger aria-label="Duplicate">
              <Button isIconOnly size="sm" variant="ghost" onPress={onDuplicate}>
                <DocumentDuplicateIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
          {index < fieldsLength - 1 && (
            <Tooltip>
              <TooltipTrigger aria-label="Move Down">
                <Button isIconOnly size="sm" variant="ghost" onPress={() => onMove("down")}>
                  <ArrowDownIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Down</TooltipContent>
            </Tooltip>
          )}
          {index > 0 && (
            <Tooltip>
              <TooltipTrigger aria-label="Move Up">
                <Button isIconOnly size="sm" variant="ghost" onPress={() => onMove("up")}>
                  <ArrowUpIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Up</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <details className="group rounded-lg">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-muted">
          {t("hostsDialog.advancedOptions")}
          <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-2 flex flex-col gap-3">
          <LabeledField
            fieldId={`${base}-port`}
            label={t("hostsDialog.port")}
            info={
              <InfoPopover>
                <p className="max-w-xs pr-5 text-xs">{t("hostsDialog.port.info")}</p>
              </InfoPopover>
            }
          >
            {() => (
              <Input
                {...form.register(`${base}.port` as never)}
                type="number"
                placeholder="8080"
                aria-label={t("hostsDialog.port")}
              />
            )}
          </LabeledField>
          <LabeledField
            fieldId={`${base}-sni`}
            label={t("hostsDialog.sni")}
            info={
              <InfoPopover>
                <p className="max-w-xs pr-5 text-xs">{t("hostsDialog.sni.info")}</p>
                <p className="mt-2 text-xs">
                  <Trans
                    i18nKey="hostsDialog.host.wildcard"
                    components={{
                      badge: (
                        <Chip size="sm" variant="soft">
                          {""}
                        </Chip>
                      ),
                    }}
                  />
                </p>
                <p className="text-xs">
                  <Trans
                    i18nKey="hostsDialog.host.multiHost"
                    components={{
                      badge: (
                        <Chip size="sm" variant="soft">
                          {""}
                        </Chip>
                      ),
                    }}
                  />
                </p>
              </InfoPopover>
            }
          >
            {() => (
              <Input
                {...form.register(`${base}.sni` as never)}
                placeholder="example.com"
                aria-label={t("hostsDialog.sni")}
              />
            )}
          </LabeledField>
          <LabeledField
            fieldId={`${base}-host`}
            label={t("hostsDialog.host")}
            info={
              <InfoPopover>
                <p className="max-w-xs pr-5 text-xs">{t("hostsDialog.host.info")}</p>
                <p className="mt-2 text-xs">
                  <Trans
                    i18nKey="hostsDialog.host.wildcard"
                    components={{
                      badge: (
                        <Chip size="sm" variant="soft">
                          {""}
                        </Chip>
                      ),
                    }}
                  />
                </p>
                <p className="text-xs">
                  <Trans
                    i18nKey="hostsDialog.host.multiHost"
                    components={{
                      badge: (
                        <Chip size="sm" variant="soft">
                          {""}
                        </Chip>
                      ),
                    }}
                  />
                </p>
              </InfoPopover>
            }
          >
            {() => (
              <Input
                {...form.register(`${base}.host` as never)}
                placeholder="example.com"
                aria-label={t("hostsDialog.host")}
              />
            )}
          </LabeledField>
          <LabeledField
            fieldId={`${base}-path`}
            label={t("hostsDialog.path")}
            info={
              <InfoPopover>
                <p className="max-w-xs pr-5 text-xs">{t("hostsDialog.path.info")}</p>
              </InfoPopover>
            }
          >
            {() => (
              <Input
                {...form.register(`${base}.path` as never)}
                placeholder="/vless"
                aria-label={t("hostsDialog.path")}
              />
            )}
          </LabeledField>
          {selectField("security", t("hostsDialog.security"), proxyHostSecurity)}
          {selectField("alpn", t("hostsDialog.alpn"), proxyALPN)}
          {selectField("fingerprint", t("hostsDialog.fingerprint"), proxyFingerprint)}
          <LabeledField
            fieldId={`${base}-fragment`}
            label={t("hostsDialog.fragment")}
            info={
              <InfoPopover>
                <p className="max-w-xs pr-5 text-xs">{t("hostsDialog.fragment.info")}</p>
                <p className="pt-2 pb-1 pr-5 text-xs">{t("hostsDialog.fragment.info.examples")}</p>
                <p className="pr-5 text-xs">100-200,10-20,tlshello</p>
                <p className="pr-5 text-xs">100-200,10-20,1-3</p>
                <p className="pt-3 pr-5 text-xs">{t("hostsDialog.fragment.info.attention")}</p>
              </InfoPopover>
            }
          >
            {() => (
              <Input
                {...form.register(`${base}.fragment_setting` as never)}
                placeholder={t("hostsDialog.fragment.placeholder")}
                aria-label={t("hostsDialog.fragment")}
              />
            )}
          </LabeledField>
          <LabeledField
            fieldId={`${base}-noise`}
            label={t("hostsDialog.noise")}
            info={
              <InfoPopover>
                <p className="max-w-xs pr-5 text-xs">{t("hostsDialog.noise.info")}</p>
                <p className="pt-2 pb-1 pr-5 text-xs">{t("hostsDialog.noise.info.examples")}</p>
                <p className="pr-5 text-xs">rand:10-20,10-20</p>
                <p className="pr-5 text-xs">
                  rand:10-20,10-20&base64:7nQBAAABAAAAAAAABnQtcmluZwZtc2VkZ2UDbmV0AAABAAE=,10-25
                </p>
                <p className="pt-3 pr-5 text-xs">{t("hostsDialog.noise.info.attention")}</p>
              </InfoPopover>
            }
          >
            {() => (
              <Input
                {...form.register(`${base}.noise_setting` as never)}
                placeholder={t("hostsDialog.noise.placeholder")}
                aria-label={t("hostsDialog.noise")}
              />
            )}
          </LabeledField>
          {booleanField("use_sni_as_host", t("hostsDialog.useSniAsHost"))}
          {booleanField("allowinsecure", t("hostsDialog.allowinsecure"))}
          {booleanField("mux_enable", t("hostsDialog.muxEnable"))}
          {booleanField("random_user_agent", t("hostsDialog.randomUserAgent"))}
        </div>
      </details>
    </div>
  );
};

const InboundAccordion: FC<{
  hostKey: string;
  isOpen: boolean;
  toggleAccordion: () => void;
}> = ({ hostKey, isOpen, toggleAccordion }) => {
  const form = useFormContext<HostsFormValues>();
  const { t } = useTranslation();
  const { fields, append, remove, insert, move } = useFieldArray({
    control: form.control,
    name: hostKey,
  });
  const errors = form.formState.errors[hostKey];

  useEffect(() => {
    if (errors && !isOpen) toggleAccordion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  const handleAddHost = () => {
    append({
      host: "",
      sni: "",
      port: null,
      path: null,
      address: "",
      remark: "",
      mux_enable: false,
      allowinsecure: false,
      is_disabled: false,
      fragment_setting: "",
      noise_setting: "",
      random_user_agent: false,
      security: "inbound_default",
      alpn: "",
      fingerprint: "",
      use_sni_as_host: false,
    });
  };

  return (
    <div className="w-full rounded-lg border border-border">
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-2 py-2 text-start",
          "hover:bg-default/40",
        )}
        onClick={toggleAccordion}
      >
        <span className="flex-1 text-sm font-medium">{hostKey}</span>
        <ChevronDownIcon
          className={cn("size-4 text-muted transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-3 px-2 pb-2">
          {fields.map((_field, index) => (
            <HostCard
              key={_field.id}
              hostKey={hostKey}
              index={index}
              fieldsLength={fields.length}
              onRemove={() => remove(index)}
              onDuplicate={() =>
                insert(index + 1, form.getValues(`${hostKey}.${index}` as never) as never)
              }
              onMove={(direction) => {
                if (direction === "up" && index > 0) move(index, index - 1);
                if (direction === "down" && index < fields.length - 1) {
                  move(index, index + 1);
                }
              }}
            />
          ))}
          <Button variant="outline" fullWidth size="sm" onPress={handleAddHost}>
            {t("hostsDialog.addHost")}
          </Button>
        </div>
      )}
    </div>
  );
};

export const HostsDialog: FC = () => {
  const { isEditingHosts, onEditingHosts, refetchUsers } = useDashboard();
  const { isLoading, hosts, fetchHosts, isPostLoading, setHosts } = useHosts();
  const { t } = useTranslation();
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isEditingHosts) fetchHosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingHosts]);

  const form = useForm<HostsFormValues>({
    resolver: zodResolver(hostsSchema) as unknown as Resolver<HostsFormValues>,
  });

  useEffect(() => {
    if (hosts && isEditingHosts) {
      form.reset(hosts as HostsFormValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hosts]);

  const onClose = () => {
    setOpenAccordions(new Set());
    onEditingHosts(false);
  };

  const handleFormSubmit = (hosts: HostsFormValues) => {
    setHosts(hosts as never)
      .then(() => {
        generateSuccessMessage(t("hostsDialog.savedSuccess"));
        refetchUsers();
      })
      .catch((err) => {
        if (err?.response?.status === 409 || err?.response?.status === 400) {
          generateErrorMessage(err);
        }
        if (err?.response?.status === 422) {
          Object.keys(err.response._data.detail).forEach((key) => {
            generateErrorMessage({
              response: {
                _data: { detail: err.response._data.detail[key] + " (" + key + ")" },
              },
            });
          });
        }
      });
  };

  const toggleAccordion = (hostKey: string) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(hostKey)) next.delete(hostKey);
      else next.add(hostKey);
      return next;
    });
  };

  return (
    <Modal
      isOpen={isEditingHosts}
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
                <LinkIcon className="size-5" />
              </IconBlock>
            </Modal.Header>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="flex min-h-0 flex-1 flex-col"
              >
                <Modal.Body className="min-h-0 flex-1 overflow-y-auto pb-3">
                  <p className="mb-3 text-sm opacity-80">{t("hostsDialog.title")}</p>
                  {isLoading && <p>{t("hostsDialog.loading")}</p>}
                  {!isLoading &&
                    hosts &&
                    (Object.keys(hosts).length > 0 ? (
                      <div className="flex w-full flex-col gap-2">
                        {Object.keys(hosts).map((hostKey) => (
                          <InboundAccordion
                            key={hostKey}
                            hostKey={hostKey}
                            isOpen={openAccordions.has(hostKey)}
                            toggleAccordion={() => toggleAccordion(hostKey)}
                          />
                        ))}
                      </div>
                    ) : (
                      "No inbound found. Please check your Xray config file."
                    ))}
                </Modal.Body>
                <Modal.Footer className="shrink-0 justify-end">
                  <Button
                    className="px-5"
                    type="submit"
                    size="sm"
                    isPending={isPostLoading}
                    isDisabled={isPostLoading}
                  >
                    {t("hostsDialog.apply")}
                  </Button>
                </Modal.Footer>
              </form>
            </FormProvider>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
