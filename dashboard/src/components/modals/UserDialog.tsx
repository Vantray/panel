import {
  Alert,
  AlertContent,
  AlertDescription,
  Button,
  Calendar,
  DateField,
  DatePicker,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  SelectIndicator,
  SelectPopover,
  SelectTrigger,
  SelectValue,
  Switch,
  SwitchContent,
  SwitchControl,
  SwitchThumb,
  TextArea,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  FieldError,
} from "@heroui/react";
import {
  ArrowPathIcon,
  ChartPieIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetStrategy } from "@/constants";
import dayjs from "@/lib/dayjs";
import { useEffect, useState, type FC } from "react";
import { Controller, FormProvider, type Resolver, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { parseDate, today, getLocalTimeZone } from "@internationalized/date";
import type { FilterUsageType, User, UserCreate, UserInbounds, ProxyKeys } from "@/types";
import { relativeExpiryDate } from "@/lib/date";
import { z } from "zod";
import { useDashboard } from "@/stores/dashboard";
import { generateSuccessMessage } from "@/lib/toast";
import { IconBlock } from "@/components/IconBlock";
import { ProtocolGroup } from "./ProtocolGroup";
import { UsageFilter } from "@/components/charts/UsageFilter";
import { UsageDonut } from "@/components/charts/UsageDonut";
import { cn } from "@/lib/utils";

export type FormType = Pick<UserCreate, keyof UserCreate> & {
  selected_proxies: ProxyKeys;
};

const formatUser = (user: User): FormType => {
  return {
    ...user,
    data_limit: user.data_limit
      ? Number((user.data_limit / 1073741824).toFixed(5))
      : user.data_limit,
    on_hold_expire_duration: user.on_hold_expire_duration
      ? Number(user.on_hold_expire_duration / (24 * 60 * 60))
      : user.on_hold_expire_duration,
    selected_proxies: Object.keys(user.proxies) as ProxyKeys,
  };
};

const getDefaultValues = (): FormType => {
  const defaultInbounds = Object.fromEntries(useDashboard.getState().inbounds);
  const inbounds: UserInbounds = {};
  for (const key in defaultInbounds) {
    inbounds[key] = defaultInbounds[key].map((i) => i.tag);
  }
  return {
    selected_proxies: Object.keys(defaultInbounds) as ProxyKeys,
    data_limit: null,
    expire: null,
    username: "",
    data_limit_reset_strategy: "no_reset",
    status: "active",
    on_hold_expire_duration: null,
    note: "",
    inbounds,
    proxies: {
      vless: { id: "", flow: "" },
      vmess: { id: "" },
      trojan: { password: "" },
      shadowsocks: { password: "", method: "chacha20-ietf-poly1305" },
    },
  };
};

const mergeProxies = (
  proxyKeys: ProxyKeys,
  proxyType: User["proxies"] | undefined,
): User["proxies"] => {
  const proxies = proxyKeys.reduce((ac, a) => ({ ...ac, [a]: {} }), {} as User["proxies"]);
  if (!proxyType) return proxies;
  proxyKeys.forEach((proxy) => {
    if (proxyType[proxy]) {
      proxies[proxy] = proxyType[proxy];
    }
  });
  return proxies;
};

const baseSchema = {
  username: z.string().min(1, { message: "Required" }),
  selected_proxies: z.array(z.string()).refine((value) => value.length > 0, {
    message: "userDialog.selectOneProtocol",
  }),
  note: z.string().nullable(),
  proxies: z.record(z.string(), z.record(z.string(), z.any())).transform((ins) => {
    const deleteIfEmpty = (obj: any, key: string) => {
      if (obj && obj[key] === "") {
        delete obj[key];
      }
    };
    deleteIfEmpty(ins.vmess, "id");
    deleteIfEmpty(ins.vless, "id");
    deleteIfEmpty(ins.trojan, "password");
    deleteIfEmpty(ins.shadowsocks, "password");
    deleteIfEmpty(ins.shadowsocks, "method");
    return ins;
  }),
  data_limit: z
    .string()
    .min(0)
    .or(z.number())
    .nullable()
    .transform((str) => {
      if (str) return Number((parseFloat(String(str)) * 1073741824).toFixed(5));
      return 0;
    }),
  expire: z.number().nullable(),
  data_limit_reset_strategy: z.string(),
  inbounds: z.record(z.string(), z.array(z.string())).transform((ins) => {
    Object.keys(ins).forEach((protocol) => {
      if (Array.isArray(ins[protocol]) && !ins[protocol]?.length) delete ins[protocol];
    });
    return ins;
  }),
};

const schema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("active"),
    ...baseSchema,
  }),
  z.object({
    status: z.literal("disabled"),
    ...baseSchema,
  }),
  z.object({
    status: z.literal("limited"),
    ...baseSchema,
  }),
  z.object({
    status: z.literal("expired"),
    ...baseSchema,
  }),
  z.object({
    status: z.literal("on_hold"),
    on_hold_expire_duration: z.coerce
      .number()
      .min(0.1, "Required")
      .transform((d) => {
        return d * (24 * 60 * 60);
      }),
    ...baseSchema,
  }),
]);

const InputWithSuffix = ({
  suffix,
  ...props
}: React.ComponentProps<typeof Input> & { suffix: string }) => (
  <div className="relative w-full">
    <Input {...props} className={cn(props.className, "pe-12")} />
    <span className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-xs text-muted">
      {suffix}
    </span>
  </div>
);

export const UserDialog: FC = () => {
  const {
    editingUser,
    isCreatingNewUser,
    onCreateUser,
    editUser,
    fetchUserUsage,
    onEditingUser,
    createUser,
    onDeletingUser,
  } = useDashboard();
  const isEditing = !!editingUser;
  const isOpen = isCreatingNewUser || isEditing;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const { t } = useTranslation();

  const [usageVisible, setUsageVisible] = useState(false);
  const handleUsageToggle = () => {
    setUsageVisible((current) => !current);
  };

  const form = useForm<FormType>({
    defaultValues: getDefaultValues(),
    resolver: zodResolver(schema) as unknown as Resolver<FormType>,
  });

  useEffect(
    () =>
      useDashboard.subscribe(
        (state) => state.inbounds,
        () => {
          form.reset(getDefaultValues());
        },
      ),
    [form],
  );

  const [dataLimit, userStatus] = useWatch({
    control: form.control,
    name: ["data_limit", "status"],
  });

  const [usage, setUsage] = useState<{ series: number[]; labels: string[] }>({
    series: [],
    labels: [],
  });
  const [usageFilter, setUsageFilter] = useState("1m");
  const fetchUsageWithFilter = (query: FilterUsageType) => {
    if (!editingUser) return;
    fetchUserUsage(editingUser, query).then((data) => {
      const labels: string[] = [];
      const series: number[] = [];
      for (const key in data.usages) {
        series.push(data.usages[key].used_traffic);
        labels.push(data.usages[key].node_name);
      }
      setUsage({ series, labels });
    });
  };

  useEffect(() => {
    if (editingUser) {
      form.reset(formatUser(editingUser));
      fetchUsageWithFilter({
        start: dayjs().utc().subtract(30, "day").format("YYYY-MM-DDTHH:00:00"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingUser]);

  const submit = (values: FormType) => {
    setLoading(true);
    const method = isEditing ? editUser : createUser;
    setError(null);

    const { selected_proxies, ...rest } = values;

    const body: UserCreate = {
      ...rest,
      data_limit: values.data_limit,
      proxies: mergeProxies(selected_proxies, values.proxies),
      data_limit_reset_strategy:
        values.data_limit && values.data_limit > 0 ? values.data_limit_reset_strategy : "no_reset",
      status:
        values.status === "active" || values.status === "disabled" || values.status === "on_hold"
          ? values.status
          : "active",
    };

    method(body)
      .then(() => {
        generateSuccessMessage(
          t(isEditing ? "userDialog.userEdited" : "userDialog.userCreated", {
            username: values.username,
          }),
        );
        onClose();
      })
      .catch((err) => {
        if (err?.response?.status === 409 || err?.response?.status === 400)
          setError(err?.response?._data?.detail);
        if (err?.response?.status === 422) {
          Object.keys(err.response._data.detail).forEach((key) => {
            setError(err?.response._data.detail[key] as string);
            form.setError(key as "username", {
              type: "custom",
              message: err.response._data.detail[key],
            });
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onClose = () => {
    form.reset(getDefaultValues());
    onCreateUser(false);
    onEditingUser(null);
    setError(null);
    setUsageVisible(false);
    setUsageFilter("1m");
  };

  const handleResetUsage = () => {
    useDashboard.setState({ resetUsageUser: editingUser });
  };

  const handleRevokeSubscription = () => {
    useDashboard.setState({ revokeSubscriptionUser: editingUser });
  };

  const disabled = loading;
  const isOnHold = userStatus === "on_hold";

  const [randomUsernameLoading, setRandomUsernameLoading] = useState(false);

  const createRandomUsername = (): string => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let counter = 0;
    while (counter < 6) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
      counter += 1;
    }
    return result;
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop variant="blur">
        <Modal.Container size="lg">
          <Modal.Dialog className="sm:max-w-170">
            <Modal.CloseTrigger />
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(submit)}>
                <Modal.Header>
                  <div className="flex items-center gap-2">
                    <IconBlock>
                      {isEditing ? (
                        <PencilSquareIcon className="size-5" />
                      ) : (
                        <UserPlusIcon className="size-5" />
                      )}
                    </IconBlock>
                    <p className="text-lg font-semibold">
                      {isEditing ? t("userDialog.editUserTitle") : t("createNewUser")}
                    </p>
                  </div>
                </Modal.Header>
                <Modal.Body>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex w-full flex-row items-start gap-2">
                          <TextField
                            fullWidth
                            className="min-w-0 grow"
                            isInvalid={!!form.formState.errors.username}
                            aria-label={t("username")}
                          >
                            <Label>
                              <span className="flex items-center gap-2">
                                {t("username")}
                                {!isEditing && (
                                  <ArrowPathIcon
                                    className={cn(
                                      "size-4 cursor-pointer transition-transform",
                                      randomUsernameLoading && "animate-spin",
                                    )}
                                    onClick={() => {
                                      setRandomUsernameLoading(true);
                                      const randomUsername = createRandomUsername();
                                      form.setValue("username", randomUsername);
                                      setTimeout(() => {
                                        setRandomUsernameLoading(false);
                                      }, 350);
                                    }}
                                  />
                                )}
                              </span>
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={form.watch("username") ?? ""}
                                readOnly={isEditing}
                                disabled={disabled}
                                {...form.register("username")}
                              />
                              {isEditing && (
                                <Controller
                                  name="status"
                                  control={form.control}
                                  render={({ field }) => (
                                    <Tooltip>
                                      <TooltipTrigger aria-label="status">
                                        <span>
                                          <Switch
                                            isSelected={field.value === "active"}
                                            isDisabled={disabled}
                                            onChange={(selected) =>
                                              field.onChange(selected ? "active" : "disabled")
                                            }
                                          >
                                            <SwitchContent>
                                              <SwitchControl>
                                                <SwitchThumb />
                                              </SwitchControl>
                                            </SwitchContent>
                                          </Switch>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {t(`status`) + ": " + t(`status.${field.value}`)}
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                />
                              )}
                            </div>
                            {form.formState.errors.username && (
                              <FieldError>{form.formState.errors.username.message}</FieldError>
                            )}
                          </TextField>
                          {!isEditing && (
                            <Controller
                              name="status"
                              control={form.control}
                              render={({ field }) => (
                                <TextField
                                  fullWidth
                                  className="mb-2 w-36 shrink-0"
                                  aria-label={t("userDialog.onHold")}
                                >
                                  <Label>{t("userDialog.onHold")}</Label>
                                  <Switch
                                    isSelected={field.value === "on_hold"}
                                    isDisabled={disabled}
                                    onChange={(selected) =>
                                      field.onChange(selected ? "on_hold" : "active")
                                    }
                                  >
                                    <SwitchContent>
                                      <SwitchControl>
                                        <SwitchThumb />
                                      </SwitchControl>
                                    </SwitchContent>
                                  </Switch>
                                </TextField>
                              )}
                            />
                          )}
                        </div>

                        <Controller
                          control={form.control}
                          name="data_limit"
                          render={({ field }) => (
                            <TextField
                              fullWidth
                              isInvalid={!!form.formState.errors.data_limit}
                              aria-label={t("userDialog.dataLimit")}
                            >
                              <Label>{t("userDialog.dataLimit")}</Label>
                              <InputWithSuffix
                                suffix="GB"
                                type="number"
                                min={0}
                                step={1}
                                disabled={disabled}
                                value={field.value ? String(field.value) : ""}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              {form.formState.errors.data_limit && (
                                <FieldError>{form.formState.errors.data_limit.message}</FieldError>
                              )}
                            </TextField>
                          )}
                        />

                        {!!dataLimit && Number(dataLimit) > 0 && (
                          <Controller
                            control={form.control}
                            name="data_limit_reset_strategy"
                            render={({ field }) => (
                              <Select
                                fullWidth
                                isDisabled={disabled}
                                aria-label={t("userDialog.periodicUsageReset")}
                                value={field.value}
                                onChange={(v) => field.onChange(v as string)}
                              >
                                <Label>{t("userDialog.periodicUsageReset")}</Label>
                                <SelectTrigger>
                                  <SelectValue />
                                  <SelectIndicator />
                                </SelectTrigger>
                                <SelectPopover>
                                  <ListBox>
                                    {resetStrategy.map((s) => (
                                      <ListBox.Item key={s.value} id={s.value} textValue={s.value}>
                                        {t("userDialog.resetStrategy" + s.title)}
                                        <ListBox.ItemIndicator />
                                      </ListBox.Item>
                                    ))}
                                  </ListBox>
                                </SelectPopover>
                              </Select>
                            )}
                          />
                        )}

                        <div>
                          {isOnHold && (
                            <Controller
                              control={form.control}
                              name="on_hold_expire_duration"
                              render={({ field }) => (
                                <TextField
                                  fullWidth
                                  isInvalid={!!form.formState.errors.on_hold_expire_duration}
                                  aria-label={t("userDialog.onHoldExpireDuration")}
                                >
                                  <Label>{t("userDialog.onHoldExpireDuration")}</Label>
                                  <InputWithSuffix
                                    suffix="Days"
                                    type="number"
                                    min={0}
                                    disabled={disabled}
                                    value={field.value ? String(field.value) : ""}
                                    onChange={(e) => {
                                      form.setValue("expire", null);
                                      field.onChange(e.target.value);
                                    }}
                                  />
                                  {form.formState.errors.on_hold_expire_duration && (
                                    <FieldError>
                                      {form.formState.errors.on_hold_expire_duration.message}
                                    </FieldError>
                                  )}
                                </TextField>
                              )}
                            />
                          )}
                          {!isOnHold && (
                            <Controller
                              name="expire"
                              control={form.control}
                              render={({ field }) => {
                                const { status, time } = relativeExpiryDate(field.value);
                                const dateValue =
                                  field.value && field.value > 0
                                    ? parseDate(
                                        dayjs(field.value * 1000)
                                          .utc()
                                          .format("YYYY-MM-DD"),
                                      )
                                    : undefined;
                                return (
                                  <>
                                    <DatePicker
                                      className="w-full"
                                      granularity="day"
                                      isDisabled={disabled}
                                      minValue={today(getLocalTimeZone())}
                                      value={dateValue}
                                      aria-label={t("userDialog.expiryDate")}
                                      onChange={(value) => {
                                        form.setValue("on_hold_expire_duration", null);
                                        field.onChange(
                                          value
                                            ? dayjs
                                                .utc(value.toString())
                                                .set("hour", 23)
                                                .set("minute", 59)
                                                .set("second", 59)
                                                .valueOf() / 1000
                                            : 0,
                                        );
                                      }}
                                    >
                                      <Label>{t("userDialog.expiryDate")}</Label>
                                      <DateField.Group fullWidth>
                                        <DateField.Input>
                                          {(segment) => <DateField.Segment segment={segment} />}
                                        </DateField.Input>
                                        <DateField.Suffix>
                                          <DatePicker.Trigger>
                                            <DatePicker.TriggerIndicator />
                                          </DatePicker.Trigger>
                                        </DateField.Suffix>
                                      </DateField.Group>
                                      {field.value ? (
                                        <p className="text-xs text-muted">{t(status, { time })}</p>
                                      ) : null}
                                      <DatePicker.Popover>
                                        <Calendar aria-label={t("userDialog.expiryDate")}>
                                          <Calendar.Header>
                                            <Calendar.YearPickerTrigger>
                                              <Calendar.YearPickerTriggerHeading />
                                              <Calendar.YearPickerTriggerIndicator />
                                            </Calendar.YearPickerTrigger>
                                            <Calendar.NavButton slot="previous" />
                                            <Calendar.NavButton slot="next" />
                                          </Calendar.Header>
                                          <Calendar.Grid>
                                            <Calendar.GridHeader>
                                              {(day) => (
                                                <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                                              )}
                                            </Calendar.GridHeader>
                                            <Calendar.GridBody>
                                              {(date) => <Calendar.Cell date={date} />}
                                            </Calendar.GridBody>
                                          </Calendar.Grid>
                                          <Calendar.YearPickerGrid>
                                            <Calendar.YearPickerGridBody>
                                              {({ year }) => (
                                                <Calendar.YearPickerCell year={year} />
                                              )}
                                            </Calendar.YearPickerGridBody>
                                          </Calendar.YearPickerGrid>
                                        </Calendar>
                                      </DatePicker.Popover>
                                    </DatePicker>
                                  </>
                                );
                              }}
                            />
                          )}
                        </div>

                        <TextField fullWidth aria-label={t("userDialog.note")}>
                          <Label>{t("userDialog.note")}</Label>
                          <TextArea {...form.register("note")} />
                        </TextField>
                      </div>
                      {error && (
                        <Alert status="danger" className="rounded-lg">
                          <AlertContent>
                            <AlertDescription>{error}</AlertDescription>
                          </AlertContent>
                        </Alert>
                      )}
                    </div>

                    <div>
                      <p className="mb-2">{t("userDialog.protocols")}</p>
                      <Controller
                        control={form.control}
                        name="selected_proxies"
                        render={({ field }) => (
                          <ProtocolGroup
                            list={[
                              {
                                title: "vmess",
                                description: t("userDialog.vmessDesc"),
                              },
                              {
                                title: "vless",
                                description: t("userDialog.vlessDesc"),
                              },
                              {
                                title: "trojan",
                                description: t("userDialog.trojanDesc"),
                              },
                              {
                                title: "shadowsocks",
                                description: t("userDialog.shadowsocksDesc"),
                              },
                            ]}
                            disabled={disabled}
                            {...field}
                          />
                        )}
                      />
                      {form.formState.errors.selected_proxies && (
                        <p className="mt-1 text-sm text-danger">
                          {t(form.formState.errors.selected_proxies.message as string)}
                        </p>
                      )}
                    </div>

                    {isEditing && usageVisible && (
                      <div className="flex flex-col items-center gap-4 pt-4 md:col-span-2">
                        <UsageFilter
                          defaultValue={usageFilter}
                          onChange={(filter, query) => {
                            setUsageFilter(filter);
                            fetchUsageWithFilter(query);
                          }}
                        />
                        <div className="w-full md:w-[70%]">
                          <UsageDonut series={usage.series} labels={usage.labels} height={300} />
                        </div>
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="mt-3 md:hidden">
                      <Alert status="danger" className="rounded-lg">
                        <AlertContent>
                          <AlertDescription>{error}</AlertDescription>
                        </AlertContent>
                      </Alert>
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer className="w-full flex-col gap-3 sm:flex-row sm:justify-between">
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    {isEditing && (
                      <>
                        <Tooltip>
                          <TooltipTrigger aria-label={t("delete")}>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="danger-soft"
                              // Keep the edit dialog open beneath the confirm;
                              // it closes only when deletion actually happens
                              // (deleteUser clears editingUser in the store).
                              onPress={() => onDeletingUser(editingUser)}
                            >
                              <TrashIcon className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("delete")}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger aria-label={t("userDialog.usage")}>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={handleUsageToggle}
                            >
                              <ChartPieIcon className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("userDialog.usage")}</TooltipContent>
                        </Tooltip>
                        <Button size="sm" variant="outline" onPress={handleResetUsage}>
                          {t("userDialog.resetUsage")}
                        </Button>
                        <Button size="sm" variant="outline" onPress={handleRevokeSubscription}>
                          {t("userDialog.revokeSubscription")}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="px-8"
                    isPending={loading}
                    isDisabled={disabled}
                  >
                    {isEditing ? t("userDialog.editUser") : t("createUser")}
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
