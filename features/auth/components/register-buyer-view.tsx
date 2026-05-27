"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  useForm,
  Controller,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Input,
  Radio,
  Select,
  Steps,
} from "antd";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  FilesIcon,
  IdentificationCardIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
} from "@phosphor-icons/react";

import { cn } from "@/shared/utils";
import {
  buyerRegisterSchema,
  pdpaStepSchema,
  individualPersonalStepSchema,
  companyPersonalStepSchema,
  bankStepSchema,
  credsStepSchema,
  type BuyerRegisterInput,
  type BuyerSubType,
} from "@/features/auth/utils/validations/register-buyer";
import {
  STEPS,
  TITLES,
  MARKETS,
} from "@/features/auth/constants/register-shared";
import { BUYER_TYPES } from "@/features/auth/constants/register-buyer";
import {
  type ZodIssue,
  type StepSchemaType,
} from "@/features/auth/utils/register-form-utils";
import {
  FieldWrapper,
  SectionGroup,
  DocumentField,
  BankStep,
  CredsStep,
} from "@/features/auth/components/register-form-fields";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormProps = { form: UseFormReturn<BuyerRegisterInput> };

// ─── ContactAddressBlock ──────────────────────────────────────────────────────

function ContactAddressBlock({
  form,
  showDivider,
}: FormProps & { showDivider?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="field-phone"
              label="หมายเลขโทรศัพท์"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="field-phone"
                size="large"
                placeholder="0812345678"
                autoComplete="tel"
                inputMode="tel"
                maxLength={10}
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "field-phone-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="field-email"
              label="อีเมล"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="field-email"
                size="large"
                placeholder="example@email.com"
                autoComplete="email"
                inputMode="email"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "field-email-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
      </div>

      {showDivider && (
        <Divider plain className="!my-0 text-xs text-neutral-500">
          ที่อยู่ตามบัตรประชาชน
        </Divider>
      )}

      <Controller
        control={form.control}
        name="addressLine"
        render={({ field, fieldState }) => (
          <FieldWrapper
            id="field-address-line"
            label="บ้านเลขที่ / หมู่ / ซอย / ถนน"
            required
            error={fieldState.error?.message}
          >
            <Input
              {...field}
              id="field-address-line"
              size="large"
              placeholder="เช่น 123/4 หมู่ 5 ซ.รักไทย ถ.สุขุมวิท"
              autoComplete="street-address"
              status={fieldState.error ? "error" : undefined}
              aria-describedby={
                fieldState.error ? "field-address-line-error" : undefined
              }
              aria-required="true"
            />
          </FieldWrapper>
        )}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Controller
          control={form.control}
          name="province"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="field-province"
              label="จังหวัด"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="field-province"
                size="large"
                placeholder="จังหวัด"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "field-province-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="district"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="field-district"
              label="อำเภอ / เขต"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="field-district"
                size="large"
                placeholder="อำเภอ / เขต"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "field-district-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="subDistrict"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="field-sub-district"
              label="ตำบล / แขวง"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="field-sub-district"
                size="large"
                placeholder="ตำบล / แขวง"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "field-sub-district-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Controller
          control={form.control}
          name="zipcode"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="field-zipcode"
              label="รหัสไปรษณีย์"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="field-zipcode"
                size="large"
                placeholder="84000"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={5}
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "field-zipcode-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
      </div>
    </div>
  );
}

// ─── AuthorizedPersonFields ───────────────────────────────────────────────────

function AuthorizedPersonFields({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Controller
          control={form.control}
          name="authorizedPerson.title"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ap-title"
              label="คำนำหน้า"
              required
              error={fieldState.error?.message}
              className="sm:w-1/4"
            >
              <Select
                {...field}
                id="ap-title"
                size="large"
                placeholder="เลือก"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "ap-title-error" : undefined
                }
                aria-required="true"
                options={TITLES.map((t) => ({ value: t, label: t }))}
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="authorizedPerson.firstName"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ap-first-name"
              label="ชื่อ"
              required
              error={fieldState.error?.message}
              className="flex-1"
            >
              <Input
                {...field}
                id="ap-first-name"
                size="large"
                placeholder="ชื่อ"
                autoComplete="given-name"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "ap-first-name-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="authorizedPerson.lastName"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ap-last-name"
              label="นามสกุล"
              required
              error={fieldState.error?.message}
              className="flex-1"
            >
              <Input
                {...field}
                id="ap-last-name"
                size="large"
                placeholder="นามสกุล"
                autoComplete="family-name"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "ap-last-name-error" : undefined
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
          name="authorizedPerson.position"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ap-position"
              label="ตำแหน่ง"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="ap-position"
                size="large"
                placeholder="ตำแหน่ง"
                autoComplete="organization-title"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "ap-position-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="authorizedPerson.delegated"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ap-delegated"
              label="มอบอำนาจแก่ผู้รับมอบอำนาจ"
              required
              error={fieldState.error?.message}
            >
              <Radio.Group
                {...field}
                id="ap-delegated"
                aria-describedby={
                  fieldState.error ? "ap-delegated-error" : undefined
                }
                aria-required="true"
                className="pt-1"
              >
                <Radio value="delegated">มอบอำนาจ</Radio>
                <Radio value="not_delegated">ไม่มอบอำนาจ</Radio>
              </Radio.Group>
            </FieldWrapper>
          )}
        />
      </div>
    </div>
  );
}

// ─── Step 0: PDPA ─────────────────────────────────────────────────────────────

function PdpaStep({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert
        type="info"
        showIcon
        icon={<ShieldCheckIcon size={16} weight="duotone" />}
        title="นโยบายความเป็นส่วนตัว (PDPA) — การยางแห่งประเทศไทย"
        description={
          <ul className="mt-1 flex flex-col gap-1 text-xs leading-relaxed text-neutral-600">
            <li>
              <strong>ข้อมูลที่เก็บรวบรวม</strong> — ชื่อ-นามสกุล,
              เลขบัตรประชาชน, เลขผู้เสียภาษี, เลขบัญชีธนาคาร,
              สำเนาเอกสารยืนยันตัวตน, ที่อยู่, อีเมล, เบอร์โทรศัพท์
            </li>
            <li>
              <strong>วัตถุประสงค์</strong> — ยืนยันตัวตน เปิดบัญชีผู้ใช้
              ดำเนินการประมูล / ซื้อ-ขายยางพารา ออกใบเสร็จ ติดต่อสื่อสาร
            </li>
            <li>
              <strong>การเปิดเผย</strong> — กยท.
              จะไม่เปิดเผยต่อบุคคลที่สามโดยไม่ได้รับอนุญาต ยกเว้นคู่ค้า /
              หน่วยงานรัฐที่มีอำนาจตามกฎหมาย
            </li>
            <li>
              <strong>สิทธิของท่าน</strong> — เข้าถึง / แก้ไข / ลบ / ระงับใช้ /
              โอนย้ายข้อมูล / เพิกถอนความยินยอม
            </li>
            <li>
              <strong>ความมั่นคงปลอดภัย</strong> — เข้ารหัสตามมาตรฐาน TLS
              จำกัดสิทธิการเข้าถึงเฉพาะเจ้าหน้าที่ที่ได้รับมอบหมาย
            </li>
          </ul>
        }
      />

      <Controller
        control={form.control}
        name="pdpaAccept"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <Checkbox
              checked={field.value ?? false}
              onChange={(e) => field.onChange(e.target.checked)}
              aria-describedby={
                fieldState.error ? "field-pdpa-accept-error" : undefined
              }
              aria-required="true"
            >
              ฉันได้อ่านและยอมรับนโยบาย PDPA แล้ว
            </Checkbox>
            {fieldState.error && (
              <p
                id="field-pdpa-accept-error"
                role="alert"
                aria-live="polite"
                className="text-error text-sm"
              >
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      <Divider className="!my-0" />

      <Controller
        control={form.control}
        name="subType"
        render={({ field, fieldState }) => (
          <FieldWrapper
            id="field-sub-type"
            label="ประเภทผู้ใช้งาน"
            required
            error={fieldState.error?.message}
          >
            <div
              role="radiogroup"
              aria-labelledby="field-sub-type"
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {BUYER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  role="radio"
                  aria-checked={field.value === type.value}
                  onClick={() => field.onChange(type.value)}
                  className={cn(
                    "focus:ring-primary-500 rounded border p-3 text-left transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none",
                    field.value === type.value
                      ? "border-primary-500 bg-primary-50"
                      : "bg-surface hover:border-primary-300 hover:bg-primary-50/40 border-neutral-200",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      field.value === type.value
                        ? "text-primary-700"
                        : "text-neutral-800",
                    )}
                  >
                    {type.label}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">{type.desc}</p>
                </button>
              ))}
            </div>
          </FieldWrapper>
        )}
      />

      <Controller
        control={form.control}
        name="markets"
        render={({ field, fieldState }) => (
          <FieldWrapper
            id="field-markets"
            label="ตลาดที่ต้องการซื้อ (เลือกได้หลายตลาด)"
            required
            error={fieldState.error?.message}
          >
            <Select
              mode="multiple"
              value={field.value ?? []}
              onChange={field.onChange}
              id="field-markets"
              size="large"
              placeholder="เลือกตลาด"
              status={fieldState.error ? "error" : undefined}
              aria-describedby={
                fieldState.error ? "field-markets-error" : undefined
              }
              aria-required="true"
              options={MARKETS.map((m) => ({ value: m, label: m }))}
            />
          </FieldWrapper>
        )}
      />
    </div>
  );
}

// ─── Step 1a: Individual personal ────────────────────────────────────────────

function IndividualPersonalStep({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ind-title"
              label="คำนำหน้า"
              required
              error={fieldState.error?.message}
              className="sm:w-1/4"
            >
              <Select
                {...field}
                id="ind-title"
                size="large"
                placeholder="เลือก"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "ind-title-error" : undefined
                }
                aria-required="true"
                options={TITLES.map((t) => ({ value: t, label: t }))}
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="firstName"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ind-first-name"
              label="ชื่อ"
              required
              error={fieldState.error?.message}
              className="flex-1"
            >
              <Input
                {...field}
                id="ind-first-name"
                size="large"
                placeholder="ชื่อ"
                autoComplete="given-name"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "ind-first-name-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="lastName"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ind-last-name"
              label="นามสกุล"
              required
              error={fieldState.error?.message}
              className="flex-1"
            >
              <Input
                {...field}
                id="ind-last-name"
                size="large"
                placeholder="นามสกุล"
                autoComplete="family-name"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "ind-last-name-error" : undefined
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
          name="nationalId"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ind-national-id"
              label="เลขบัตรประชาชน (13 หลัก)"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="ind-national-id"
                size="large"
                placeholder="0000000000000"
                inputMode="numeric"
                maxLength={13}
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "ind-national-id-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="dob"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="ind-dob"
              label="วัน/เดือน/ปีเกิด"
              required
              error={fieldState.error?.message}
            >
              <input
                {...field}
                id="ind-dob"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                aria-describedby={
                  fieldState.error ? "ind-dob-error" : undefined
                }
                aria-required="true"
                className={cn(
                  "h-10 w-full cursor-pointer rounded border px-3 text-sm text-neutral-700",
                  "focus:ring-primary-500 focus:ring-2 focus:ring-offset-0 focus:outline-none",
                  fieldState.error
                    ? "border-error focus:ring-error"
                    : "focus:border-primary-500 border-neutral-200",
                )}
              />
            </FieldWrapper>
          )}
        />
      </div>

      <ContactAddressBlock form={form} showDivider />
    </div>
  );
}

// ─── Step 1b: Company personal ────────────────────────────────────────────────

function CompanyPersonalStep({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-0">
      <SectionGroup title="ข้อมูลนิติบุคคล">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="orgName"
            render={({ field, fieldState }) => (
              <FieldWrapper
                id="co-org-name"
                label="ชื่อนิติบุคคล"
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  id="co-org-name"
                  size="large"
                  autoComplete="organization"
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "co-org-name-error" : undefined
                  }
                  aria-required="true"
                />
              </FieldWrapper>
            )}
          />
          <Controller
            control={form.control}
            name="taxId"
            render={({ field, fieldState }) => (
              <FieldWrapper
                id="co-tax-id"
                label="เลขประจำตัวผู้เสียภาษี (13 หลัก)"
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  id="co-tax-id"
                  size="large"
                  placeholder="0000000000000"
                  inputMode="numeric"
                  maxLength={13}
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "co-tax-id-error" : undefined
                  }
                  aria-required="true"
                />
              </FieldWrapper>
            )}
          />
        </div>
      </SectionGroup>

      <SectionGroup title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
        <AuthorizedPersonFields form={form} />
      </SectionGroup>

      <SectionGroup title="ข้อมูลที่อยู่ติดต่อ">
        <ContactAddressBlock form={form} />
      </SectionGroup>
    </div>
  );
}

// ─── Step 4: Documents ────────────────────────────────────────────────────────

function DocsStep({ form, subType }: FormProps & { subType?: BuyerSubType }) {
  return (
    <div className="flex flex-col gap-3">
      <Alert
        type="info"
        showIcon
        icon={<FilesIcon size={16} weight="duotone" />}
        title="อัปโหลดเอกสาร (รองรับ JPG, PNG, PDF — ขนาดไม่เกิน 10MB ต่อไฟล์)"
      />

      <DocumentField form={form} name="docIdCard" label="สำเนาบัตรประชาชน" />
      <DocumentField form={form} name="docHouseReg" label="สำเนาทะเบียนบ้าน" />
      <DocumentField
        form={form}
        name="docBankBook"
        label="สำเนาสมุดบัญชีธนาคาร (ไม่เกิน 6 เดือน)"
      />
      <DocumentField
        form={form}
        name="docPdpa"
        label="แบบยินยอม PDPA (เซ็นแล้ว)"
      />

      {subType === "company" && (
        <>
          <Divider plain className="!my-1 text-xs text-neutral-500">
            เอกสารนิติบุคคล
          </Divider>
          <DocumentField
            form={form}
            name="docCompanyCert"
            label="หนังสือรับรองบริษัท (ไม่เกิน 6 เดือน)"
          />
          <DocumentField
            form={form}
            name="docDirectorId"
            label="สำเนาบัตรประชาชนกรรมการผู้มีอำนาจ"
          />
          <DocumentField form={form} name="docPoa" label="หนังสือมอบอำนาจ" />
        </>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function RegisterBuyerView() {
  const [step, setStep] = useState(0);

  const form = useForm<BuyerRegisterInput, unknown, BuyerRegisterInput>({
    resolver: zodResolver(buyerRegisterSchema),
    defaultValues: {
      pdpaAccept: false,
      bankAccounts: [{ accountType: "savings" }],
      primaryBankIndex: 0,
    },
  });

  const subType = form.watch("subType");
  const currentStepKey = STEPS[step].key;

  const handleNext = async () => {
    form.clearErrors();
    const values = form.getValues();

    const stepSchemas: Record<number, StepSchemaType> = {
      0: pdpaStepSchema as StepSchemaType,
      2: bankStepSchema as StepSchemaType,
      3: credsStepSchema as StepSchemaType,
    };

    let schema: StepSchemaType | undefined = stepSchemas[step];
    if (step === 1 && subType === "individual")
      schema = individualPersonalStepSchema as StepSchemaType;
    if (step === 1 && subType === "company")
      schema = companyPersonalStepSchema as StepSchemaType;

    if (!schema) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      return;
    }

    const result = schema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue: ZodIssue) => {
        form.setError(issue.path.map(String).join(".") as never, {
          message: issue.message,
        });
      });
      return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,var(--color-primary-800)_0%,var(--color-primary-500)_50%,var(--color-primary-800)_100%)] p-4">
      <div className="relative w-full max-w-[720px]">
        {/* Header strip */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShoppingCartIcon
              size={32}
              weight="duotone"
              className="text-primary-200"
              aria-hidden="true"
            />
            <div>
              <h1 className="text-neutral-0 text-base leading-tight font-semibold">
                ลงทะเบียนผู้ซื้อ
              </h1>
              <p className="text-neutral-0/70 text-xs">
                RAOT Rubber Traceability — Registration
              </p>
            </div>
          </div>
          <NextLink
            href="/login"
            className="border-neutral-0/30 bg-neutral-0/10 text-neutral-0 hover:bg-neutral-0/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs no-underline"
          >
            <ArrowLeftIcon size={12} weight="bold" />
            กลับเข้าสู่ระบบ
          </NextLink>
        </div>

        <Card>
          <Steps
            current={step}
            size="small"
            responsive
            className="mb-6"
            items={STEPS.map((s) => ({ title: s.title }))}
            aria-label="ขั้นตอนการลงทะเบียน"
          />

          <main>
            <form onSubmit={(e) => e.preventDefault()} noValidate>
              {currentStepKey === "pdpa" && <PdpaStep form={form} />}

              {currentStepKey === "personal" && subType === "individual" && (
                <IndividualPersonalStep form={form} />
              )}
              {currentStepKey === "personal" && subType === "company" && (
                <CompanyPersonalStep form={form} />
              )}
              {currentStepKey === "personal" && !subType && (
                <p className="py-8 text-center text-sm text-neutral-500">
                  กรุณาเลือกประเภทผู้ใช้งานในขั้นตอนก่อนหน้า
                </p>
              )}

              {currentStepKey === "bank" && <BankStep form={form} />}

              {currentStepKey === "creds" && <CredsStep form={form} />}

              {currentStepKey === "docs" && (
                <DocsStep form={form} subType={subType} />
              )}

              <Divider className="!mt-6 !mb-4" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  icon={<ArrowLeftIcon size={14} weight="bold" />}
                  onClick={() => setStep((s) => Math.max(s - 1, 0))}
                  disabled={step === 0}
                >
                  ย้อนกลับ
                </Button>

                <span className="text-xs text-neutral-500">
                  ขั้นตอนที่ {step + 1} / {STEPS.length} — {STEPS[step].title}
                </span>

                {step < STEPS.length - 1 ? (
                  <Button type="primary" onClick={handleNext}>
                    ถัดไป{" "}
                    <ArrowRightIcon
                      size={14}
                      weight="bold"
                      className="inline align-middle"
                    />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckCircleIcon size={16} weight="bold" />}
                  >
                    ส่งคำขอลงทะเบียน
                  </Button>
                )}
              </div>
            </form>
          </main>
        </Card>

        <p className="text-neutral-0/50 mt-3.5 text-center text-[11px]">
          บัญชีจะอยู่ในสถานะ &ldquo;รอตรวจสอบ&rdquo; จนกว่าเจ้าหน้าที่จะอนุมัติ
          (Two-tier Approval)
        </p>
      </div>
    </div>
  );
}

void IdentificationCardIcon;
