"use client"

import { Controller, useFieldArray, type FieldValues, type UseFormReturn } from "react-hook-form"
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Tag,
  Upload,
} from "antd"
import type { UploadFile } from "antd"
import {
  BankIcon,
  CheckCircleIcon,
  KeyIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react"

import { cn } from "@/shared/utils"
import {
  ACCEPTED_EXTS,
  BANKS,
  MAX_BANK_ACCOUNTS,
} from "@/features/auth/constants/register-shared"
import { beforeUpload } from "@/features/auth/utils/register-form-utils"

// ─── FieldWrapper ─────────────────────────────────────────────────────────────

export function FieldWrapper({
  id,
  label,
  required,
  error,
  className,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">
        {label}
        {required && (
          <span aria-hidden="true" className="text-error ml-0.5">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          aria-live="polite"
          className="text-error text-sm"
        >
          {error}
        </p>
      )}
    </div>
  )
}

// ─── SectionGroup ─────────────────────────────────────────────────────────────

export function SectionGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`section-${title}`} className="mb-6">
      <h2
        id={`section-${title}`}
        className="mb-3 text-sm font-semibold text-neutral-800"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

// ─── DocumentField ────────────────────────────────────────────────────────────

export function DocumentField<T extends FieldValues>({
  form,
  name,
  label,
}: {
  form: UseFormReturn<T>
  name: keyof T & string
  label: string
}) {
  return (
    <Controller
      control={form.control}
      name={name as never}
      render={({ field, fieldState }) => (
        <FieldWrapper
          id={`doc-${name}`}
          label={label}
          required
          error={fieldState.error?.message}
        >
          <Upload
            fileList={(field.value as UploadFile[]) ?? []}
            onChange={({ fileList }) => field.onChange(fileList)}
            beforeUpload={beforeUpload}
            maxCount={1}
            accept={ACCEPTED_EXTS}
            aria-describedby={
              fieldState.error ? `doc-${name}-error` : undefined
            }
          >
            <Button
              icon={<UploadSimpleIcon size={14} weight="bold" />}
              block
              danger={!!fieldState.error}
            >
              เลือกไฟล์ (JPG / PNG / PDF, ≤10MB)
            </Button>
          </Upload>
        </FieldWrapper>
      )}
    />
  )
}

// ─── BankStep ─────────────────────────────────────────────────────────────────

export function BankStep<T extends FieldValues>({
  form,
}: {
  form: UseFormReturn<T>
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bankAccounts" as never,
  })

  const primaryBankIndex = (form.watch("primaryBankIndex" as never) as number) ?? 0
  const bankAccounts = (form.watch("bankAccounts" as never) as Array<{ bank?: string; accountNo?: string }>) ?? []
  const accountCount = fields.length

  const handleRemove = (idx: number) => {
    remove(idx)
    const current = (form.getValues("primaryBankIndex" as never) as number) ?? 0
    if (idx === current) {
      form.setValue("primaryBankIndex" as never, 0 as never)
    } else if (idx < current) {
      form.setValue("primaryBankIndex" as never, Math.max(0, current - 1) as never)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Alert
        type="info"
        showIcon
        icon={<BankIcon size={16} weight="duotone" />}
        title="บัญชีธนาคารใช้สำหรับรับเงินค่ายาง / หักค่าธรรมเนียม"
        description={
          <span className="text-xs">
            สามารถเพิ่มบัญชีได้สูงสุด {MAX_BANK_ACCOUNTS} บัญชี — เลือก
            <strong> บัญชีหลัก </strong>1 บัญชีสำหรับรับเงินค่ายาง
          </span>
        }
      />

      <div className="flex flex-col gap-3">
        {fields.map((field, idx) => {
          const isPrimary = idx === primaryBankIndex
          const bankName = bankAccounts[idx]?.bank
          const accountNo = bankAccounts[idx]?.accountNo

          return (
            <Card
              key={field.id}
              size="small"
              className={cn(
                "transition-colors",
                isPrimary
                  ? "border-primary-500 bg-primary-50 shadow"
                  : "border-neutral-200",
              )}
              styles={{ body: { padding: "12px 14px" } }}
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    aria-hidden="true"
                    className={cn(
                      "text-neutral-0 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                      isPrimary ? "bg-primary-500" : "bg-neutral-400",
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      บัญชีที่ {idx + 1}
                    </p>
                    {(bankName || accountNo) && (
                      <p className="text-xs text-neutral-500">
                        {bankName ?? "—"}
                        {accountNo
                          ? ` · ****${String(accountNo).slice(-4)}`
                          : ""}
                      </p>
                    )}
                  </div>
                  {isPrimary && (
                    <Tag
                      icon={<CheckCircleIcon size={11} weight="fill" />}
                      className="bg-primary-500 text-neutral-0 ml-1 inline-flex items-center gap-1 rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold"
                    >
                      บัญชีหลัก
                    </Tag>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() =>
                        form.setValue("primaryBankIndex" as never, idx as never)
                      }
                      className="text-primary-600 focus:ring-primary-500 text-xs hover:underline focus:ring-2 focus:outline-none"
                    >
                      ตั้งเป็นบัญชีหลัก
                    </button>
                  )}
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="text-error focus:ring-error text-xs hover:underline focus:ring-2 focus:outline-none"
                    >
                      ลบ
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Controller
                  control={form.control}
                  name={`bankAccounts.${idx}.bank` as never}
                  render={({ field: f, fieldState }) => (
                    <FieldWrapper
                      id={`bank-${idx}-bank`}
                      label="ธนาคาร"
                      required
                      error={fieldState.error?.message}
                    >
                      <Select
                        {...f}
                        id={`bank-${idx}-bank`}
                        placeholder="เลือกธนาคาร"
                        showSearch
                        status={fieldState.error ? "error" : undefined}
                        aria-describedby={
                          fieldState.error
                            ? `bank-${idx}-bank-error`
                            : undefined
                        }
                        aria-required="true"
                        options={BANKS.map((b) => ({ value: b, label: b }))}
                      />
                    </FieldWrapper>
                  )}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name={`bankAccounts.${idx}.accountNo` as never}
                    render={({ field: f, fieldState }) => (
                      <FieldWrapper
                        id={`bank-${idx}-account-no`}
                        label="เลขบัญชี"
                        required
                        error={fieldState.error?.message}
                      >
                        <Input
                          {...f}
                          id={`bank-${idx}-account-no`}
                          placeholder="0000000000"
                          inputMode="numeric"
                          maxLength={12}
                          status={fieldState.error ? "error" : undefined}
                          aria-describedby={
                            fieldState.error
                              ? `bank-${idx}-account-no-error`
                              : undefined
                          }
                          aria-required="true"
                        />
                      </FieldWrapper>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`bankAccounts.${idx}.accountName` as never}
                    render={({ field: f, fieldState }) => (
                      <FieldWrapper
                        id={`bank-${idx}-account-name`}
                        label="ชื่อบัญชี"
                        required
                        error={fieldState.error?.message}
                      >
                        <Input
                          {...f}
                          id={`bank-${idx}-account-name`}
                          placeholder="ตามที่ปรากฏในสมุดบัญชี"
                          status={fieldState.error ? "error" : undefined}
                          aria-describedby={
                            fieldState.error
                              ? `bank-${idx}-account-name-error`
                              : undefined
                          }
                          aria-required="true"
                        />
                      </FieldWrapper>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name={`bankAccounts.${idx}.branch` as never}
                    render={({ field: f, fieldState }) => (
                      <FieldWrapper
                        id={`bank-${idx}-branch`}
                        label="สาขา"
                        required
                        error={fieldState.error?.message}
                      >
                        <Input
                          {...f}
                          id={`bank-${idx}-branch`}
                          placeholder="สาขา"
                          status={fieldState.error ? "error" : undefined}
                          aria-describedby={
                            fieldState.error
                              ? `bank-${idx}-branch-error`
                              : undefined
                          }
                          aria-required="true"
                        />
                      </FieldWrapper>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`bankAccounts.${idx}.accountType` as never}
                    render={({ field: f, fieldState }) => (
                      <FieldWrapper
                        id={`bank-${idx}-account-type`}
                        label="ประเภทบัญชี"
                        required
                        error={fieldState.error?.message}
                      >
                        <Select
                          {...f}
                          id={`bank-${idx}-account-type`}
                          placeholder="ประเภท"
                          status={fieldState.error ? "error" : undefined}
                          aria-describedby={
                            fieldState.error
                              ? `bank-${idx}-account-type-error`
                              : undefined
                          }
                          aria-required="true"
                          options={[
                            { value: "savings", label: "ออมทรัพย์" },
                            { value: "current", label: "กระแสรายวัน" },
                          ]}
                        />
                      </FieldWrapper>
                    )}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Button
        type="dashed"
        block
        disabled={accountCount >= MAX_BANK_ACCOUNTS}
        onClick={() => append({ accountType: "savings" } as never)}
        icon={<BankIcon size={14} weight="bold" />}
        className={cn(
          "h-11 font-medium",
          accountCount < MAX_BANK_ACCOUNTS &&
            "border-primary-500 text-primary-600",
        )}
      >
        {accountCount >= MAX_BANK_ACCOUNTS
          ? `ครบจำนวนสูงสุด ${MAX_BANK_ACCOUNTS} บัญชีแล้ว`
          : `เพิ่มบัญชีธนาคารอีก (${accountCount}/${MAX_BANK_ACCOUNTS})`}
      </Button>
    </div>
  )
}

// ─── CredsStep ────────────────────────────────────────────────────────────────

export function CredsStep<T extends FieldValues>({
  form,
}: {
  form: UseFormReturn<T>
}) {
  return (
    <div className="flex flex-col gap-4">
      <Alert
        type="warning"
        showIcon
        icon={<KeyIcon size={16} weight="duotone" />}
        title="ตั้งรหัสผ่านอย่างปลอดภัย"
        description="รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร และมีตัวพิมพ์ใหญ่ + พิมพ์เล็ก + ตัวเลข + อักขระพิเศษ"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          control={form.control}
          name={"username" as never}
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="cred-username"
              label="ชื่อผู้ใช้ (Username)"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="cred-username"
                size="large"
                placeholder="ชื่อผู้ใช้"
                autoComplete="username"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "cred-username-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          control={form.control}
          name={"password" as never}
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="cred-password"
              label="รหัสผ่าน"
              required
              error={fieldState.error?.message}
            >
              <Input.Password
                {...field}
                id="cred-password"
                size="large"
                placeholder="••••••••"
                autoComplete="new-password"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "cred-password-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name={"confirmPassword" as never}
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="cred-confirm-password"
              label="ยืนยันรหัสผ่าน"
              required
              error={fieldState.error?.message}
            >
              <Input.Password
                {...field}
                id="cred-confirm-password"
                size="large"
                placeholder="••••••••"
                autoComplete="new-password"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "cred-confirm-password-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
      </div>
    </div>
  )
}
