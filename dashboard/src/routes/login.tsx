import { fetch } from "@/lib/api";
import { removeAuthToken, setAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Alert,
  AlertContent,
  AlertDescription,
  Button,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Footer } from "@/components/Footer";
import { Language } from "@/components/Language";

const schema = z.object({
  username: z.string().min(1, "login.fieldRequired"),
  password: z.string().min(1, "login.fieldRequired"),
});

type LoginValues = z.infer<typeof schema>;

export const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    removeAuthToken();
  }, []);

  const login = (values: LoginValues) => {
    setError("");
    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("password", values.password);
    formData.append("grant_type", "password");
    setLoading(true);
    fetch<{ access_token: string }>("/admin/token", {
      method: "post",
      body: formData,
    })
      .then(({ access_token: token }) => {
        setAuthToken(token);
        navigate({ to: "/" });
      })
      .catch((err: { response?: { _data?: { detail?: string } } }) => {
        setError(err?.response?._data?.detail || "Something went wrong!");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex min-h-screen w-full flex-col justify-between p-6">
      <div className="flex w-full justify-end">
        <Language />
      </div>
      <div className="flex w-full items-center justify-center">
        <div className="mt-6 w-full max-w-85">
          <div className="flex w-full flex-col items-center">
            <p className="text-2xl font-semibold">{t("login.loginYourAccount")}</p>
            <p className="text-muted">{t("login.welcomeBack")}</p>
          </div>
          <form
            onSubmit={handleSubmit(login)}
            className="mx-auto flex w-full max-w-75 flex-col gap-3 pt-6"
          >
            <TextField fullWidth isInvalid={!!errors.username} aria-label={t("username")}>
              <Label>{t("username")}</Label>
              <Input placeholder={t("username")} {...register("username")} />
              {errors.username && <FieldError>{t(errors.username.message as string)}</FieldError>}
            </TextField>
            <TextField fullWidth isInvalid={!!errors.password} aria-label={t("password")}>
              <Label>{t("password")}</Label>
              <Input type="password" placeholder={t("password")} {...register("password")} />
              {errors.password && <FieldError>{t(errors.password.message as string)}</FieldError>}
            </TextField>
            {error && (
              <Alert status="danger" className="rounded-lg">
                <AlertContent>
                  <AlertDescription>{error}</AlertDescription>
                </AlertContent>
              </Alert>
            )}
            <Button type="submit" fullWidth isPending={loading} className={cn("mt-2")}>
              <ArrowRightEndOnRectangleIcon className="size-4" />
              {t("login")}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export const Route = createFileRoute("/login")({
  component: Login,
});
