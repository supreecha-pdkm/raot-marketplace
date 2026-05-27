import { z } from "zod"

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function validateThaiId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false
  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseInt(id[i], 10) * (13 - i)
  return (11 - (sum % 11)) % 10 === parseInt(id[12], 10)
}

export function validatePassword(value: string): string | null {
  if (!value) return "กรุณากรอกรหัสผ่าน"
  if (value.length < 8) return "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร"
  if (!/[A-Z]/.test(value)) return "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว"
  if (!/[a-z]/.test(value)) return "ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว"
  if (!/\d/.test(value)) return "ต้องมีตัวเลขอย่างน้อย 1 ตัว"
  if (!/[^A-Za-z0-9]/.test(value)) return "ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"
  return null
}

// ─── Reusable sub-schemas ─────────────────────────────────────────────────────

export const authorizedPersonSchema = z.object({
  title: z.string().min(1, "กรุณาเลือกคำนำหน้า"),
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  position: z.string().min(1, "กรุณากรอกตำแหน่ง"),
  delegated: z.enum(["delegated", "not_delegated"], { message: "กรุณาเลือก" }),
})

export const bankAccountSchema = z.object({
  bank: z.string().min(1, "กรุณาเลือกธนาคาร"),
  accountNo: z.string().regex(/^\d{10,12}$/, "10-12 หลัก"),
  accountName: z.string().min(1, "กรุณากรอกชื่อบัญชี"),
  branch: z.string().min(1, "กรุณากรอกสาขา"),
  accountType: z.enum(["savings", "current"], { message: "กรุณาเลือกประเภทบัญชี" }),
})

// ─── Per-step validation schemas ──────────────────────────────────────────────

export const pdpaStepSchema = z.object({
  pdpaAccept: z.literal(true, { message: "กรุณายอมรับนโยบาย PDPA เพื่อดำเนินการต่อ" }),
  subType: z.enum(["individual", "company"], { message: "กรุณาเลือกประเภทผู้ใช้งาน" }),
  markets: z.array(z.string()).min(1, "กรุณาเลือกอย่างน้อย 1 ตลาด"),
})

const addressSchema = z.object({
  phone: z
    .string()
    .min(1, "กรุณากรอกเบอร์โทรศัพท์")
    .regex(/^0\d{9}$/, "รูปแบบ: 0XXXXXXXXX (10 หลัก)"),
  email: z.string().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  addressLine: z.string().min(1, "กรุณากรอกที่อยู่"),
  province: z.string().min(1, "กรุณากรอกจังหวัด"),
  district: z.string().min(1, "กรุณากรอกอำเภอ"),
  subDistrict: z.string().min(1, "กรุณากรอกตำบล"),
  zipcode: z
    .string()
    .min(1, "กรุณากรอกรหัสไปรษณีย์")
    .regex(/^\d{5}$/, "รหัสไปรษณีย์ต้องเป็น 5 หลัก"),
})

export const individualPersonalStepSchema = addressSchema.extend({
  title: z.string().min(1, "กรุณาเลือกคำนำหน้า"),
  firstName: z
    .string()
    .min(2, "กรุณากรอกชื่อ (2-50 ตัวอักษร)")
    .max(50, "กรุณากรอกชื่อ (2-50 ตัวอักษร)"),
  lastName: z
    .string()
    .min(2, "กรุณากรอกนามสกุล (2-50 ตัวอักษร)")
    .max(50, "กรุณากรอกนามสกุล (2-50 ตัวอักษร)"),
  nationalId: z
    .string()
    .min(1, "กรุณากรอกเลขบัตรประชาชน")
    .refine(validateThaiId, "เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)"),
  dob: z.string().min(1, "กรุณาเลือกวันเกิด"),
})

export const companyPersonalStepSchema = addressSchema.extend({
  orgName: z.string().min(1, "กรุณากรอกชื่อนิติบุคคล"),
  taxId: z
    .string()
    .min(1, "กรุณากรอกเลขประจำตัวผู้เสียภาษี")
    .regex(/^\d{13}$/, "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก"),
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

// ─── Main form schema — loose, for RHF typing; per-step schemas handle strict validation ──

export const buyerRegisterSchema = z.object({
  pdpaAccept: z.boolean().optional(),
  subType: z.enum(["individual", "company"]).optional(),
  markets: z.array(z.string()).optional(),

  title: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nationalId: z.string().optional(),
  dob: z.string().optional(),

  orgName: z.string().optional(),
  taxId: z.string().optional(),
  authorizedPerson: z
    .object({
      title: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      position: z.string().optional(),
      delegated: z.enum(["delegated", "not_delegated"]).optional(),
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
  docCompanyCert: z.any().optional(),
  docDirectorId: z.any().optional(),
  docPoa: z.any().optional(),
})

export type BuyerSubType = "individual" | "company"

// Derived from the schema so resolver and form types always align
export type BuyerRegisterInput = z.infer<typeof buyerRegisterSchema>
export type BankAccountInput = NonNullable<BuyerRegisterInput["bankAccounts"]>[number]


