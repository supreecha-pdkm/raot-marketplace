export const STEPS = [
  { key: "pdpa", title: "ยอมรับ PDPA & ประเภทผู้ใช้งาน" },
  { key: "personal", title: "ข้อมูลส่วนตัว" },
  { key: "bank", title: "บัญชีธนาคาร" },
  { key: "creds", title: "ตั้งรหัสผ่าน" },
  { key: "docs", title: "อัปโหลดเอกสาร" },
] as const

export const TITLES = ["นาย", "นาง", "นางสาว", "อื่นๆ"]

export const BANKS = [
  "ธนาคารกรุงเทพ",
  "ธนาคารกสิกรไทย",
  "ธนาคารไทยพาณิชย์",
  "ธนาคารกรุงไทย",
  "ธนาคารกรุงศรีอยุธยา",
  "ธนาคารทหารไทยธนชาต",
  "ธ.ก.ส.",
]

export const MARKETS = [
  "ตลาดกลางยางพาราสุราษฎร์ธานี",
  "ตลาดกลางยางพารานครศรีธรรมราช",
  "ตลาดกลางยางพาราสงขลา",
]

export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const ACCEPTED_EXTS = ".jpg,.jpeg,.png,.pdf"
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "application/pdf"]
export const MAX_BANK_ACCOUNTS = 5
