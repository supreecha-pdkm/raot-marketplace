import type { RegistrationDoc } from '@/features/approvals/services/approval-data';
import { PROVINCE_NAMES } from '@/shared/utils/thai-address';
import type { StepKey } from '../types/register';

export const TITLES = ['นาย', 'นาง', 'นางสาว', 'อื่นๆ'];
export const PROVINCES = PROVINCE_NAMES;
export const MARKETS = [
  'ตลาดกลางยางพาราสุราษฎร์ธานี',
  'ตลาดกลางยางพารานครศรีธรรมราช',
  'ตลาดกลางยางพาราสงขลา',
];
export const BANKS = [
  'ธนาคารกรุงเทพ',
  'ธนาคารกสิกรไทย',
  'ธนาคารไทยพาณิชย์',
  'ธนาคารกรุงไทย',
  'ธนาคารกรุงศรีอยุธยา',
  'ธนาคารทหารไทยธนชาต',
  'ธ.ก.ส.',
];
export const RUBBER_TYPES = [
  'ยางแผ่นรมควัน RSS',
  'ยางแผ่นดิบ USS',
  'ยางก้อนถ้วย (Cup Lump)',
  'น้ำยางสด (Field Latex)',
  'ยางเครป (Crepe)',
  'ยางก้อนแห้ง',
];

export const BUYER_TYPES = [
  { value: 'individual', label: 'บุคคลธรรมดา', desc: 'บุคคลที่ลงทะเบียนเพื่อซื้อยางในนามตนเอง' },
  { value: 'company', label: 'นิติบุคคล', desc: 'บริษัท / ห้างหุ้นส่วน — ต้องแนบหนังสือรับรองบริษัท' },
] as const;

export const SELLER_TYPES = [
  { value: 'farmer', label: 'เกษตรกร (รายบุคคล)', desc: 'เจ้าของสวนยาง — ต้องระบุข้อมูลแปลง' },
  { value: 'cooperative', label: 'สถาบันเกษตรกร', desc: 'สหกรณ์การเกษตร / กลุ่มเกษตรกร' },
  { value: 'farmer_group', label: 'กลุ่มพัฒนาเกษตรกร', desc: 'กลุ่มที่ขึ้นทะเบียนกับ กยท.' },
  { value: 'business', label: 'ผู้ประกอบกิจการยาง', desc: 'ผู้ประกอบการแปรรูปยาง — ต้องแนบใบอนุญาต' },
  { value: 'organization', label: 'องค์กร', desc: 'องค์กรอื่นๆ ที่ขึ้นทะเบียน' },
] as const;

/** Subtypes that the default seller-registration flow hides. Users who need
 *  to register as these types enter through `/register/seller?variant=institution`
 *  (the "สมัครสถาบันเกษตรกร และผู้ประกอบกิจการยาง" button on the login page).
 *  Single source of truth for both the dropdown filter and the variant guard. */
export const INSTITUTION_VARIANT_SUBTYPES = ['cooperative', 'business'] as const;
export type InstitutionVariantSubType = (typeof INSTITUTION_VARIANT_SUBTYPES)[number];

export const ALL_STEPS: ReadonlyArray<{ key: StepKey; title: string }> = [
  { key: 'pdpa', title: 'ยอมรับ PDPA & ประเภทผู้ใช้งาน' },
  { key: 'personal', title: 'ข้อมูลส่วนตัว' },
  { key: 'bank', title: 'บัญชีธนาคาร' },
  { key: 'creds', title: 'ตั้งรหัสผ่าน' },
  { key: 'docs', title: 'อัปโหลดเอกสาร' },
];

export interface DocDef {
  key: string;
  type: RegistrationDoc['type'];
  label: string;
}

export const DOC_DEFS: DocDef[] = [
  { key: 'docIdCard', type: 'id_card', label: 'สำเนาบัตรประชาชน' },
  { key: 'docHouseReg', type: 'house_reg', label: 'สำเนาทะเบียนบ้าน' },
  { key: 'docBankBook', type: 'bank_book', label: 'สำเนาสมุดบัญชีธนาคาร' },
  { key: 'docPdpa', type: 'pdpa', label: 'แบบยินยอม PDPA' },
  { key: 'docCompanyCert', type: 'company_cert', label: 'หนังสือรับรองบริษัท' },
  { key: 'docDirectorId', type: 'director_id', label: 'บัตรประชาชนกรรมการ' },
  { key: 'docPoa', type: 'poa', label: 'หนังสือมอบอำนาจ' },
  { key: 'docOrgCert', type: 'org_cert', label: 'หนังสือจดทะเบียนสถาบัน / กลุ่ม' },
  { key: 'docFactoryLicense', type: 'factory_license', label: 'ใบอนุญาตประกอบกิจการโรงงาน' },
];

export const MAX_UPLOAD_SIZE_MB = 10;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
export const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export const MAX_BANK_ACCOUNTS = 5;
