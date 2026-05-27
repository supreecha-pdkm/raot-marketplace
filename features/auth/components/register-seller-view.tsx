"use client"

import { useState } from "react"
import NextLink from "next/link"
import {
  useForm,
  Controller,
  type UseFormReturn,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
} from "antd"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  FilesIcon,
  LeafIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react"

import { cn } from "@/shared/utils"
import {
  sellerRegisterSchema,
  sellerPdpaStepSchema,
  farmerPersonalStepSchema,
  cooperativePersonalStepSchema,
  businessPersonalStepSchema,
  farmerGroupPersonalStepSchema,
  organizationPersonalStepSchema,
  bankStepSchema,
  credsStepSchema,
  type SellerRegisterInput,
  type SellerSubType,
} from "@/features/auth/utils/validations/register-seller"
import {
  STEPS,
  TITLES,
  MARKETS,
} from "@/features/auth/constants/register-shared"
import {
  SELLER_TYPES,
  RUBBER_TYPES,
} from "@/features/auth/constants/register-seller"
import {
  type ZodIssue,
  type StepSchemaType,
} from "@/features/auth/utils/register-form-utils"
import {
  FieldWrapper,
  SectionGroup,
  DocumentField,
  BankStep,
  CredsStep,
} from "@/features/auth/components/register-form-fields"

// ─── Types ────────────────────────────────────────────────────────────────────

type FormProps = { form: UseFormReturn<SellerRegisterInput> }

// ─── ContactAddressBlock ──────────────────────────────────────────────────────

function ContactAddressBlock({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="field-phone"
              label="เบอร์โทรศัพท์"
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

      <Controller
        control={form.control}
        name="addressLine"
        render={({ field, fieldState }) => (
          <FieldWrapper
            id="field-address-line"
            label="เลขที่ / หมู่ที่ / ถนน"
            required
            error={fieldState.error?.message}
          >
            <Input
              {...field}
              id="field-address-line"
              size="large"
              placeholder="ตัวอย่าง 111/1 หมู่ 5 ถ.สุขุมวิท"
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
              label="เขต / อำเภอ"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="field-district"
                size="large"
                placeholder="เขต / อำเภอ"
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
              label="แขวง / ตำบล"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="field-sub-district"
                size="large"
                placeholder="แขวง / ตำบล"
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
  )
}

// ─── AuthorizedPersonFields ───────────────────────────────────────────────────

function AuthorizedPersonFields({
  form,
  withDelegated,
}: FormProps & { withDelegated: boolean }) {
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

      <div className={cn("grid grid-cols-1 gap-3", withDelegated && "sm:grid-cols-2")}>
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
        {withDelegated && (
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
        )}
      </div>
    </div>
  )
}

// ─── GroupRepresentativeFields ────────────────────────────────────────────────

function GroupRepresentativeFields({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Controller
          control={form.control}
          name="representative.title"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="rep-title"
              label="คำนำหน้า"
              required
              error={fieldState.error?.message}
              className="sm:w-1/4"
            >
              <Select
                {...field}
                id="rep-title"
                size="large"
                placeholder="เลือก"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "rep-title-error" : undefined
                }
                aria-required="true"
                options={TITLES.map((t) => ({ value: t, label: t }))}
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="representative.firstName"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="rep-first-name"
              label="ชื่อ"
              required
              error={fieldState.error?.message}
              className="flex-1"
            >
              <Input
                {...field}
                id="rep-first-name"
                size="large"
                placeholder="ชื่อ"
                autoComplete="given-name"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "rep-first-name-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
        <Controller
          control={form.control}
          name="representative.lastName"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="rep-last-name"
              label="นามสกุล"
              required
              error={fieldState.error?.message}
              className="flex-1"
            >
              <Input
                {...field}
                id="rep-last-name"
                size="large"
                placeholder="นามสกุล"
                autoComplete="family-name"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "rep-last-name-error" : undefined
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
          name="representative.nationalId"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="rep-national-id"
              label="เลขบัตรประจำตัวประชาชน"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="rep-national-id"
                size="large"
                placeholder="0000000000000"
                inputMode="numeric"
                maxLength={13}
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "rep-national-id-error" : undefined
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

// ─── Step 0: PDPA ─────────────────────────────────────────────────────────────

function SellerPdpaStep({ form }: FormProps) {
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
            label="ประเภทผู้ขาย"
            required
            error={fieldState.error?.message}
          >
            <div
              role="radiogroup"
              aria-labelledby="field-sub-type"
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {SELLER_TYPES.map((type) => (
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
        name="rubberTypes"
        render={({ field, fieldState }) => (
          <FieldWrapper
            id="field-rubber-types"
            label="ชนิดยางที่ต้องการขาย (เลือกอย่างน้อย 1)"
            required
            error={fieldState.error?.message}
          >
            <Checkbox.Group
              value={field.value ?? []}
              onChange={field.onChange}
              aria-describedby={
                fieldState.error ? "field-rubber-types-error" : undefined
              }
              aria-required="true"
              className="grid grid-cols-1 gap-1.5 sm:grid-cols-2"
            >
              {RUBBER_TYPES.map((t) => (
                <Checkbox key={t} value={t}>
                  {t}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </FieldWrapper>
        )}
      />

      <Controller
        control={form.control}
        name="market"
        render={({ field, fieldState }) => (
          <FieldWrapper
            id="field-market"
            label="ตลาดที่ลงทะเบียน (เลือก 1 ตลาดเท่านั้น)"
            required
            error={fieldState.error?.message}
          >
            <Select
              {...field}
              id="field-market"
              size="large"
              placeholder="เลือกตลาด"
              status={fieldState.error ? "error" : undefined}
              aria-describedby={
                fieldState.error ? "field-market-error" : undefined
              }
              aria-required="true"
              options={MARKETS.map((m) => ({ value: m, label: m }))}
            />
            <p className="text-xs text-neutral-500">
              ผู้ขายลงทะเบียนได้กับ 1 ตลาดเท่านั้น (ตามนโยบาย กยท.)
            </p>
          </FieldWrapper>
        )}
      />
    </div>
  )
}

// ─── Step 1: Personal — per sub-type ─────────────────────────────────────────

function FarmerPersonalStep({ form }: FormProps) {
  return (
    <SectionGroup title="ข้อมูลส่วนตัวผู้ใช้งาน">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <FieldWrapper
                id="f-title"
                label="คำนำหน้า"
                required
                error={fieldState.error?.message}
                className="sm:w-1/4"
              >
                <Select
                  {...field}
                  id="f-title"
                  size="large"
                  placeholder="เลือก"
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "f-title-error" : undefined
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
                id="f-first-name"
                label="ชื่อ"
                required
                error={fieldState.error?.message}
                className="flex-1"
              >
                <Input
                  {...field}
                  id="f-first-name"
                  size="large"
                  placeholder="ชื่อ"
                  autoComplete="given-name"
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "f-first-name-error" : undefined
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
                id="f-last-name"
                label="นามสกุล"
                required
                error={fieldState.error?.message}
                className="flex-1"
              >
                <Input
                  {...field}
                  id="f-last-name"
                  size="large"
                  placeholder="นามสกุล"
                  autoComplete="family-name"
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "f-last-name-error" : undefined
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
            name="dob"
            render={({ field, fieldState }) => (
              <FieldWrapper
                id="f-dob"
                label="วันเกิด"
                required
                error={fieldState.error?.message}
              >
                <input
                  {...field}
                  id="f-dob"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  aria-describedby={
                    fieldState.error ? "f-dob-error" : undefined
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
          <Controller
            control={form.control}
            name="nationalId"
            render={({ field, fieldState }) => (
              <FieldWrapper
                id="f-national-id"
                label="เลขบัตรประจำตัวประชาชน"
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  id="f-national-id"
                  size="large"
                  placeholder="0000000000000"
                  inputMode="numeric"
                  maxLength={13}
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "f-national-id-error" : undefined
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
            name="farmerRegNo"
            render={({ field, fieldState }) => (
              <FieldWrapper
                id="f-farmer-reg-no"
                label="เลขทะเบียนเกษตรกรชาวสวนยาง"
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  id="f-farmer-reg-no"
                  size="large"
                  placeholder="เลขทะเบียนเกษตรกรชาวสวนยาง"
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "f-farmer-reg-no-error" : undefined
                  }
                  aria-required="true"
                />
              </FieldWrapper>
            )}
          />
        </div>

        <SectionGroup title="ข้อมูลที่อยู่ติดต่อ">
          <ContactAddressBlock form={form} />
        </SectionGroup>
      </div>
    </SectionGroup>
  )
}

function CooperativePersonalStep({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-0">
      <SectionGroup title="ข้อมูลสถาบันการเกษตร">
        <div className="flex flex-col gap-3">
          <Controller
            control={form.control}
            name="orgName"
            render={({ field, fieldState }) => (
              <FieldWrapper
                id="coop-org-name"
                label="ชื่อสถาบันการเกษตร"
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  id="coop-org-name"
                  size="large"
                  autoComplete="organization"
                  placeholder="ชื่อสถาบันการเกษตร"
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "coop-org-name-error" : undefined
                  }
                  aria-required="true"
                />
              </FieldWrapper>
            )}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="taxId"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  id="coop-tax-id"
                  label="เลขผู้เสียภาษี / ทะเบียนนิติบุคคล"
                  required
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="coop-tax-id"
                    size="large"
                    placeholder="เลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล"
                    inputMode="numeric"
                    status={fieldState.error ? "error" : undefined}
                    aria-describedby={
                      fieldState.error ? "coop-tax-id-error" : undefined
                    }
                    aria-required="true"
                  />
                </FieldWrapper>
              )}
            />
            <Controller
              control={form.control}
              name="instRegNo"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  id="coop-inst-reg-no"
                  label="เลขทะเบียนสถาบันเกษตรกร"
                  required
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="coop-inst-reg-no"
                    size="large"
                    placeholder="เลขทะเบียนสถาบันเกษตรกร"
                    status={fieldState.error ? "error" : undefined}
                    aria-describedby={
                      fieldState.error ? "coop-inst-reg-no-error" : undefined
                    }
                    aria-required="true"
                  />
                </FieldWrapper>
              )}
            />
          </div>
        </div>
      </SectionGroup>
      <SectionGroup title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
        <AuthorizedPersonFields form={form} withDelegated />
      </SectionGroup>
      <SectionGroup title="ข้อมูลที่อยู่ติดต่อ">
        <ContactAddressBlock form={form} />
      </SectionGroup>
    </div>
  )
}

function BusinessPersonalStep({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-0">
      <SectionGroup title="ข้อมูลสถานประกอบการ">
        <div className="flex flex-col gap-3">
          <Controller
            control={form.control}
            name="orgName"
            render={({ field, fieldState }) => (
              <FieldWrapper
                id="biz-org-name"
                label="ชื่อผู้ประกอบกิจการยาง / สถานประกอบการ"
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  id="biz-org-name"
                  size="large"
                  autoComplete="organization"
                  placeholder="ชื่อผู้ประกอบกิจการยาง / สถานประกอบการ"
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "biz-org-name-error" : undefined
                  }
                  aria-required="true"
                />
              </FieldWrapper>
            )}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="commerceRegNo"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  id="biz-commerce-reg-no"
                  label="เลขทะเบียนพาณิชย์"
                  required
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="biz-commerce-reg-no"
                    size="large"
                    placeholder="เลขทะเบียนพาณิชย์"
                    status={fieldState.error ? "error" : undefined}
                    aria-describedby={
                      fieldState.error
                        ? "biz-commerce-reg-no-error"
                        : undefined
                    }
                    aria-required="true"
                  />
                </FieldWrapper>
              )}
            />
            <Controller
              control={form.control}
              name="businessRegNo"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  id="biz-business-reg-no"
                  label="เลขทะเบียนผู้ประกอบกิจการยาง (ถ้ามี)"
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="biz-business-reg-no"
                    size="large"
                    placeholder="เลขทะเบียนผู้ประกอบกิจการยาง"
                    status={fieldState.error ? "error" : undefined}
                    aria-describedby={
                      fieldState.error
                        ? "biz-business-reg-no-error"
                        : undefined
                    }
                  />
                </FieldWrapper>
              )}
            />
          </div>
        </div>
      </SectionGroup>
      <SectionGroup title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
        <AuthorizedPersonFields form={form} withDelegated />
      </SectionGroup>
      <SectionGroup title="ข้อมูลที่อยู่ติดต่อ">
        <ContactAddressBlock form={form} />
      </SectionGroup>
    </div>
  )
}

function FarmerGroupPersonalStep({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-0">
      <SectionGroup title="ข้อมูลกลุ่มพัฒนาชาวสวนยาง">
        <Controller
          control={form.control}
          name="orgName"
          render={({ field, fieldState }) => (
            <FieldWrapper
              id="fg-org-name"
              label="ชื่อกลุ่มพัฒนาชาวสวนยาง"
              required
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="fg-org-name"
                size="large"
                autoComplete="organization"
                placeholder="ชื่อกลุ่มพัฒนาชาวสวนยาง"
                status={fieldState.error ? "error" : undefined}
                aria-describedby={
                  fieldState.error ? "fg-org-name-error" : undefined
                }
                aria-required="true"
              />
            </FieldWrapper>
          )}
        />
      </SectionGroup>
      <SectionGroup title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
        <AuthorizedPersonFields form={form} withDelegated={false} />
      </SectionGroup>
      <SectionGroup title="ข้อมูลตัวแทนกลุ่ม">
        <GroupRepresentativeFields form={form} />
      </SectionGroup>
      <SectionGroup title="ข้อมูลที่อยู่ติดต่อ">
        <ContactAddressBlock form={form} />
      </SectionGroup>
    </div>
  )
}

function OrganizationPersonalStep({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-0">
      <SectionGroup title="ข้อมูลองค์กร">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="orgName"
            render={({ field, fieldState }) => (
              <FieldWrapper
                id="org-name"
                label="ชื่อองค์กร"
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  id="org-name"
                  size="large"
                  autoComplete="organization"
                  placeholder="ชื่อองค์กร"
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "org-name-error" : undefined
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
                id="org-tax-id"
                label="เลขผู้เสียภาษี / ทะเบียนนิติบุคคล"
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  id="org-tax-id"
                  size="large"
                  placeholder="เลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล"
                  inputMode="numeric"
                  status={fieldState.error ? "error" : undefined}
                  aria-describedby={
                    fieldState.error ? "org-tax-id-error" : undefined
                  }
                  aria-required="true"
                />
              </FieldWrapper>
            )}
          />
        </div>
      </SectionGroup>
      <SectionGroup title="ข้อมูลผู้มีอำนาจลงชื่อผูกพันนิติบุคคล">
        <AuthorizedPersonFields form={form} withDelegated />
      </SectionGroup>
      <SectionGroup title="ข้อมูลที่อยู่ติดต่อ">
        <ContactAddressBlock form={form} />
      </SectionGroup>
    </div>
  )
}

// ─── Step 4: Documents ────────────────────────────────────────────────────────

function SellerDocsStep({
  form,
  subType,
}: FormProps & { subType?: SellerSubType }) {
  const isInstitution =
    subType === "cooperative" ||
    subType === "farmer_group" ||
    subType === "organization"

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

      {isInstitution && (
        <>
          <Divider plain className="!my-1 text-xs text-neutral-500">
            เอกสารสถาบัน / กลุ่ม
          </Divider>
          <DocumentField
            form={form}
            name="docOrgCert"
            label="หนังสือจดทะเบียนสถาบัน / กลุ่ม"
          />
        </>
      )}

      {subType === "business" && (
        <>
          <Divider plain className="!my-1 text-xs text-neutral-500">
            เอกสารผู้ประกอบกิจการ
          </Divider>
          <DocumentField
            form={form}
            name="docFactoryLicense"
            label="ใบอนุญาตประกอบกิจการโรงงาน"
          />
          <DocumentField
            form={form}
            name="docCompanyCert"
            label="หนังสือรับรองบริษัท (ไม่เกิน 6 เดือน)"
          />
        </>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function RegisterSellerView() {
  const [step, setStep] = useState(0)

  const form = useForm<SellerRegisterInput, unknown, SellerRegisterInput>({
    resolver: zodResolver(sellerRegisterSchema),
    defaultValues: {
      pdpaAccept: false,
      rubberTypes: [],
      bankAccounts: [{ accountType: "savings" }],
      primaryBankIndex: 0,
    },
  })

  const subType = form.watch("subType")
  const currentStepKey = STEPS[step].key

  const handleNext = async () => {
    form.clearErrors()
    const values = form.getValues()

    const personalSchemas: Partial<Record<SellerSubType, StepSchemaType>> = {
      farmer: farmerPersonalStepSchema as StepSchemaType,
      cooperative: cooperativePersonalStepSchema as StepSchemaType,
      business: businessPersonalStepSchema as StepSchemaType,
      farmer_group: farmerGroupPersonalStepSchema as StepSchemaType,
      organization: organizationPersonalStepSchema as StepSchemaType,
    }

    const stepSchemas: Record<number, StepSchemaType | undefined> = {
      0: sellerPdpaStepSchema as StepSchemaType,
      1: subType ? personalSchemas[subType] : undefined,
      2: bankStepSchema as StepSchemaType,
      3: credsStepSchema as StepSchemaType,
    }

    const schema = stepSchemas[step]
    if (!schema) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
      return
    }

    const result = schema.safeParse(values)
    if (!result.success) {
      result.error.issues.forEach((issue: ZodIssue) => {
        form.setError(issue.path.map(String).join(".") as never, {
          message: issue.message,
        })
      })
      return
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,var(--color-primary-800)_0%,var(--color-primary-500)_50%,var(--color-primary-800)_100%)] p-4">
      <div className="relative w-full max-w-[720px]">
        {/* Header strip */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <LeafIcon
              size={32}
              weight="duotone"
              className="text-primary-200"
              aria-hidden="true"
            />
            <div>
              <h1 className="text-neutral-0 text-base leading-tight font-semibold">
                ลงทะเบียนผู้ขาย
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
              {currentStepKey === "pdpa" && <SellerPdpaStep form={form} />}

              {currentStepKey === "personal" && subType === "farmer" && (
                <FarmerPersonalStep form={form} />
              )}
              {currentStepKey === "personal" && subType === "cooperative" && (
                <CooperativePersonalStep form={form} />
              )}
              {currentStepKey === "personal" && subType === "business" && (
                <BusinessPersonalStep form={form} />
              )}
              {currentStepKey === "personal" && subType === "farmer_group" && (
                <FarmerGroupPersonalStep form={form} />
              )}
              {currentStepKey === "personal" && subType === "organization" && (
                <OrganizationPersonalStep form={form} />
              )}
              {currentStepKey === "personal" && !subType && (
                <p className="py-8 text-center text-sm text-neutral-500">
                  กรุณาเลือกประเภทผู้ขายในขั้นตอนก่อนหน้า
                </p>
              )}

              {currentStepKey === "bank" && <BankStep form={form} />}

              {currentStepKey === "creds" && <CredsStep form={form} />}

              {currentStepKey === "docs" && (
                <SellerDocsStep form={form} subType={subType} />
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
                  ขั้นตอนที่ {step + 1} / {STEPS.length} —{" "}
                  {STEPS[step].title}
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
  )
}
