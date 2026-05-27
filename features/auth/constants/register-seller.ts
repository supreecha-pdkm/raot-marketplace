import type { SellerSubType } from "@/features/auth/utils/validations/register-seller"

export const SELLER_TYPES: { value: SellerSubType; label: string; desc: string }[] = [
  {
    value: "farmer",
    label: "เกษตรกร (รายบุคคล)",
    desc: "เจ้าของสวนยาง — ต้องระบุข้อมูลแปลง",
  },
  {
    value: "cooperative",
    label: "สถาบันเกษตรกร",
    desc: "สหกรณ์การเกษตร / กลุ่มเกษตรกร",
  },
  {
    value: "farmer_group",
    label: "กลุ่มพัฒนาเกษตรกร",
    desc: "กลุ่มที่ขึ้นทะเบียนกับ กยท.",
  },
  {
    value: "business",
    label: "ผู้ประกอบกิจการยาง",
    desc: "ผู้ประกอบการแปรรูปยาง — ต้องแนบใบอนุญาต",
  },
  {
    value: "organization",
    label: "องค์กร",
    desc: "องค์กรอื่นๆ ที่ขึ้นทะเบียน",
  },
]

export const RUBBER_TYPES = [
  "ยางแผ่นรมควัน RSS",
  "ยางแผ่นดิบ USS",
  "ยางก้อนถ้วย (Cup Lump)",
  "น้ำยางสด (Field Latex)",
  "ยางเครป (Crepe)",
  "ยางก้อนแห้ง",
]
