import { z } from "zod"

import {
  validateThaiId,
  validatePassword,
  authorizedPersonSchema,
  bankAccountSchema,
} from "@/features/auth/utils/validations/register-buyer"

// ─── Re-exports for convenience ───────────────────────────────────────────────

export { validateThaiId, validatePassword }

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

export const representativeSchema = z.object({
  title: z.string().min(1, "กรุณาเลือกคำนำหน้า"),
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  nationalId: z
    .string()
    .min(1, "กรุณากรอกเลขบัตรประจำตัวประชาชน")
    .refine(validateThaiId, "เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)"),
})

export const authorizedPersonNoDelegateSchema = z.object({
  title: z.string().min(1, "กรุณาเลือกคำนำหน้า"),
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  position: z.string().min(1, "กรุณากรอกตำแหน่ง"),
})

// ─── Address sub-schema ───────────────────────────────────────────────────────

const addressSchema = z.object({
  phone: z
    .string()
    .min(1, "กรุณากรอกเบอร์โทรศัพท์")
    .regex(/^0\d{9}$/, "รูปแบบ: 0XXXXXXXXX (10 หลัก)"),
  email: z.string().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  addressLine: z.string().min(1, "กรุณากรอกที่อยู่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกเขต/อำเภอ"),
  subDistrict: z.string().min(1, "กรุณาเลือกแขวง/ตำบล"),
  zipcode: z
    .string()
    .min(1, "กรุณากรอกรหัสไปรษณีย์")
    .regex(/^\d{5}$/, "รหัสไปรษณีย์ต้องเป็น 5 หลัก"),
})

// ─── Per-step schemas ─────────────────────────────────────────────────────────

export const sellerPdpaStepSchema = z.object({
  pdpaAccept: z.literal(true, {
    message: "กรุณายอมรับนโยบาย PDPA เพื่อดำเนินการต่อ",
  }),
  subType: z.enum(
    ["farmer", "cooperative", "business", "farmer_group", "organization"],
    { message: "กรุณาเลือกประเภทผู้ใช้งาน" },
  ),
  rubberTypes: z.array(z.string()).min(1, "เลือกอย่างน้อย 1 ชนิด"),
  market: z.string().min(1, "กรุณาเลือกตลาด"),
})

export const farmerPersonalStepSchema = addressSchema.extend({
  title: z.string().min(1, "กรุณาเลือกคำนำหน้า"),
  firstName: z
    .string()
    .min(2, "กรุณากรอกชื่อ (2-50 ตัวอักษร)")
    .max(50, "กรุณากรอกชื่อ (2-50 ตัวอักษร)"),
  lastName: z
    .string()
    .min(2, "กรุณากรอกนามสกุล (2-50 ตัวอักษร)")
    .max(50, "กรุณากรอกนามสกุล (2-50 ตัวอักษร)"),
  dob: z.string().min(1, "กรุณาเลือกวันเกิด"),
  nationalId: z
    .string()
    .min(1, "กรุณากรอกเลขบัตรประชาชน")
    .refine(validateThaiId, "เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)"),
  farmerRegNo: z.string().min(1, "กรุณากรอกเลขทะเบียนเกษตรกรชาวสวนยาง"),
})

export const cooperativePersonalStepSchema = addressSchema.extend({
  orgName: z.string().min(1, "กรุณากรอกชื่อสถาบันการเกษตร"),
  taxId: z.string().min(1, "กรุณากรอกเลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล"),
  instRegNo: z.string().min(1, "กรุณากรอกเลขทะเบียนสถาบันเกษตรกร"),
  authorizedPerson: authorizedPersonSchema,
})

export const businessPersonalStepSchema = addressSchema.extend({
  orgName: z.string().min(1, "กรุณากรอกชื่อผู้ประกอบกิจการยาง"),
  commerceRegNo: z.string().min(1, "กรุณากรอกเลขทะเบียนพาณิชย์"),
  authorizedPerson: authorizedPersonSchema,
})

export const farmerGroupPersonalStepSchema = addressSchema.extend({
  orgName: z.string().min(1, "กรุณากรอกชื่อกลุ่มพัฒนาชาวสวนยาง"),
  authorizedPerson: authorizedPersonNoDelegateSchema,
  representative: representativeSchema,
})

export const organizationPersonalStepSchema = addressSchema.extend({
  orgName: z.string().min(1, "กรุณากรอกชื่อองค์กร"),
  taxId: z.string().min(1, "กรุณากรอกเลขประจำตัวผู้เสียภาษี / ทะเบียนนิติบุคคล"),
  authorizedPerson: authorizedPersonSchema,
})

export const bankStepSchema = z.object({
  bankAccounts: z
    .array(bankAccountSchema)
    .min(1, "กรุณาเพิ่มบัญชีธนาคารอย่างน้อย 1 บัญชี"),
})

export const credsStepSchema = z
  .object({
    username: z
      .string()
      .min(1, "กรุณากรอกชื่อผู้ใช้")
      .regex(/^[a-z0-9]{6,}$/, "≥6 ตัว, a-z และ 0-9 เท่านั้น"),
    password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .superRefine((data, ctx) => {
    const err = validatePassword(data.password)
    if (err) ctx.addIssue({ path: ["password"], code: "custom", message: err })
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "รหัสผ่านไม่ตรงกัน",
      })
    }
  })

// ─── Main form schema — loose for RHF typing ─────────────────────────────────

export const sellerRegisterSchema = z.object({
  pdpaAccept: z.boolean().optional(),
  subType: z
    .enum(["farmer", "cooperative", "business", "farmer_group", "organization"])
    .optional(),
  rubberTypes: z.array(z.string()).optional(),
  market: z.string().optional(),

  title: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nationalId: z.string().optional(),
  dob: z.string().optional(),
  farmerRegNo: z.string().optional(),

  orgName: z.string().optional(),
  taxId: z.string().optional(),
  instRegNo: z.string().optional(),
  commerceRegNo: z.string().optional(),
  businessRegNo: z.string().optional(),

  authorizedPerson: z
    .object({
      title: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      position: z.string().optional(),
      delegated: z.enum(["delegated", "not_delegated"]).optional(),
    })
    .optional(),

  representative: z
    .object({
      title: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      nationalId: z.string().optional(),
    })
    .optional(),

  phone: z.string().optional(),
  email: z.string().optional(),
  addressLine: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  subDistrict: z.string().optional(),
  zipcode: z.string().optional(),

  bankAccounts: z
    .array(
      z.object({
        bank: z.string().optional(),
        accountNo: z.string().optional(),
        accountName: z.string().optional(),
        branch: z.string().optional(),
        accountType: z.enum(["savings", "current"]).optional(),
      }),
    )
    .optional(),
  primaryBankIndex: z.number().optional(),

  username: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),

  docIdCard: z.any().optional(),
  docHouseReg: z.any().optional(),
  docBankBook: z.any().optional(),
  docPdpa: z.any().optional(),
  docOrgCert: z.any().optional(),
  docFactoryLicense: z.any().optional(),
  docCompanyCert: z.any().optional(),
})

export type SellerSubType =
  | "farmer"
  | "cooperative"
  | "business"
  | "farmer_group"
  | "organization"

export type SellerRegisterInput = z.infer<typeof sellerRegisterSchema>
export type SellerBankAccountInput = NonNullable<
  SellerRegisterInput["bankAccounts"]
>[number]
