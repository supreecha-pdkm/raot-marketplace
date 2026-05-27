"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Checkbox, Divider, Input, Segmented, Space } from "antd";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  InfoIcon,
  LeafIcon,
  LockIcon,
  LockKeyIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { loginSchema } from "@/features/auth/utils/validations/login";
import type { LoginInput } from "@/features/auth/utils/validations/login";

type Role = "buyer" | "seller";

type RoleOption = {
  value: Role;
  label: string;
  icon: React.ReactNode;
  description: string;
};

const ROLES: RoleOption[] = [
  {
    value: "buyer",
    label: "ผู้ซื้อ",
    icon: <ShoppingCartIcon size={16} weight="duotone" />,
    description: "ซื้อยางพาราผ่านระบบประมูล",
  },
  {
    value: "seller",
    label: "ผู้ขาย",
    icon: <LeafIcon size={16} weight="duotone" />,
    description: "ขายผลผลิตยางพาราเข้าตลาด",
  },
];

export function LoginView() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>("buyer");
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const usernameHelpId = "login-username-help";
  const passwordHelpId = "login-password-help";

  async function onSubmit(values: LoginInput) {
    setLoginError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (!result || result.error) {
      setLoginError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    router.push(`/${selectedRole}/dashboard`);
  }

  const roleDescription =
    ROLES.find((r) => r.value === selectedRole)?.description ?? "";

  return (
    <div className="bg-neutral-0 flex min-h-screen">
      <section
        aria-hidden="true"
        className="text-neutral-0 relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-[linear-gradient(135deg,var(--color-primary-900)_0%,var(--color-primary-500)_50%,var(--color-primary-900)_100%)] p-12 md:flex"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--color-primary-400)_0%,transparent_60%),radial-gradient(circle_at_70%_70%,var(--color-info)_0%,transparent_60%)] opacity-15" />
        <div className="relative max-w-105 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="RAOT"
            width={112}
            height={112}
            className="bg-neutral-0 mx-auto rounded-full object-contain p-2.5 shadow-xl"
          />
          <h1 className="text-neutral-0 mt-6 text-2xl font-bold">
            ตลาดยาง Green Rubber
          </h1>
          <p className="text-neutral-0/85 mt-2 text-base">
            ระบบตรวจสอบย้อนกลับผลผลิตยางพารา RAOT
          </p>
          <div className="border-neutral-0/15 bg-neutral-0/10 text-neutral-0/85 mt-8 rounded-md border px-4 py-3 text-xs leading-relaxed">
            รองรับ EUDR Traceability
            <br />
            ปลอดภัย · โปร่งใส · ตรวจสอบได้
          </div>
        </div>
      </section>

      <main className="bg-neutral-0 flex w-full max-w-130 shrink-0 flex-col overflow-y-auto px-6 py-6 md:px-10 md:pb-8">
        <div className="mb-4 flex justify-end">
          <NextLink
            href="/login/admin"
            className="text-primary-500 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-xs whitespace-nowrap no-underline hover:bg-neutral-200"
          >
            เป็นเจ้าหน้าที่?
            <ArrowRightIcon size={12} weight="bold" />
          </NextLink>
        </div>

        <div className="mx-auto flex w-full max-w-105 flex-1 flex-col justify-center">
          <header className="mb-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="RAOT"
              width={80}
              height={80}
              className="mx-auto mb-1 block object-contain"
            />
            <h1 className="text-primary-900 mt-3 mb-1 text-2xl font-bold">
              เข้าสู่ระบบ
            </h1>
            <p className="text-xs text-neutral-500">
              เลือกบทบาทและเข้าสู่ระบบ RAOT Green Rubber
            </p>
          </header>

          <fieldset className="mb-4 border-0 p-0">
            <legend className="mb-2 block text-xs font-semibold text-neutral-800">
              ฉันคือ
            </legend>
            <Segmented<Role>
              block
              value={selectedRole}
              onChange={setSelectedRole}
              options={ROLES.map(({ value, label, icon }) => ({
                value,
                label: (
                  <Space size={6}>
                    <span className="inline-flex items-center align-middle text-sm">
                      {icon}
                    </span>
                    <span>{label}</span>
                  </Space>
                ),
              }))}
            />
            <p className="mt-1.5 text-xs text-neutral-500">{roleDescription}</p>
          </fieldset>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3.5"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-username"
                className="text-sm font-medium text-neutral-800"
              >
                ชื่อผู้ใช้
              </label>
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      {...field}
                      id="login-username"
                      size="large"
                      placeholder="email@example.com"
                      autoComplete="username"
                      prefix={<UserIcon size={16} weight="regular" />}
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={usernameHelpId}
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                    />
                    <p
                      id={usernameHelpId}
                      className="text-error text-sm"
                      aria-live="polite"
                    >
                      {fieldState.error?.message ?? ""}
                    </p>
                  </>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-neutral-800"
              >
                รหัสผ่าน
              </label>
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <>
                    <Input.Password
                      {...field}
                      id="login-password"
                      size="large"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      prefix={<LockIcon size={16} weight="regular" />}
                      iconRender={(visible) =>
                        visible ? (
                          <EyeIcon size={16} />
                        ) : (
                          <EyeSlashIcon size={16} />
                        )
                      }
                      status={fieldState.error ? "error" : undefined}
                      aria-describedby={passwordHelpId}
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                    />
                    <p
                      id={passwordHelpId}
                      className="text-error text-sm"
                      aria-live="polite"
                    >
                      {fieldState.error?.message ?? ""}
                    </p>
                  </>
                )}
              />
            </div>

            <div className="mt-1 flex items-center justify-between">
              <Checkbox name="remember">จำฉันไว้</Checkbox>
              <NextLink
                href="/forgot-password"
                className="text-primary-500 hover:text-primary-600 text-sm"
              >
                ลืมรหัสผ่าน?
              </NextLink>
            </div>

            {loginError && (
              <p role="alert" className="text-error text-sm">
                {loginError}
              </p>
            )}

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={form.formState.isSubmitting}
              className="mt-1 h-13 text-base font-semibold"
            >
              เข้าสู่ระบบ
            </Button>
          </form>

          <aside
            aria-label="ความปลอดภัย"
            className="mt-4 flex items-start gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5"
          >
            <LockKeyIcon
              size={16}
              weight="duotone"
              className="text-primary-500 mt-0.5 shrink-0"
            />
            <p className="text-[11px] leading-normal text-neutral-500">
              ข้อมูลของคุณเข้ารหัสตามมาตรฐาน TLS ·{" "}
              <NextLink href="#" className="text-primary-500 hover:underline">
                นโยบาย PDPA
              </NextLink>{" "}
              ·{" "}
              <NextLink href="#" className="text-primary-500 hover:underline">
                ความช่วยเหลือ
              </NextLink>
            </p>
          </aside>

          <Divider plain className="my-5!">
            <span className="text-xs text-neutral-500">ยังไม่มีบัญชี?</span>
          </Divider>

          <Space className="w-full justify-center" size={8}>
            <NextLink href="/register/buyer">
              <Button>สมัครผู้ซื้อ</Button>
            </NextLink>
            <NextLink href="/register/seller">
              <Button>สมัครผู้ขาย</Button>
            </NextLink>
          </Space>

          <div
            role="note"
            className="border-warning-light bg-warning-light/40 mt-2.5 flex items-start gap-1.5 rounded-md border px-2.5 py-2"
          >
            <InfoIcon
              size={14}
              weight="bold"
              className="text-warning mt-0.5 shrink-0"
            />
            <p className="text-warning text-[11px]">
              ผู้ขายต้องผ่านการอนุมัติจากเจ้าหน้าที่ตลาดกลางก่อนใช้งาน
            </p>
          </div>
        </div>

        <footer className="mt-5 text-center text-[11px] text-neutral-400">
          <ShieldCheckIcon
            size={12}
            weight="duotone"
            className="mr-1 inline-block align-middle"
          />
          RAOT v1.0.0 · ผู้ซื้อ
        </footer>
      </main>
    </div>
  );
}
