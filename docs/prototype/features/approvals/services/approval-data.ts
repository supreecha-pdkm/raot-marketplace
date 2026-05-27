// ─── Buyer / Seller registration approval data ────────────────────────────
// Used by /officer/approvals and /officer/approval.
// Mirrors the registration form (src/app/register/[role]/page.tsx) so the
// officer sees exactly what the applicant submitted, plus per-document review.

export type DocStatus = 'pending' | 'approved' | 'rejected';

export type AppOverallStatus =
  | 'pending_review'      // ผู้สมัครส่งเข้ามา รอเจ้าหน้าที่ตรวจ
  | 'awaiting_director'   // เจ้าหน้าที่ตรวจผ่านแล้ว รอ ผอ.ตลาดอนุมัติ (Two-tier per FR-SYS01-005)
  | 'approved'            // อนุมัติเสร็จสิ้น
  | 'rejected'            // ปฏิเสธ
  | 'returned';           // ส่งกลับให้ผู้สมัครแก้ไข

export type ApprovalStage =
  | 'officer_review'      // อยู่ระหว่างการตรวจสอบของเจ้าหน้าที่
  | 'director_review'     // ส่งต่อให้ ผอ. ตลาดพิจารณา
  | 'approved'            // อนุมัติแล้ว
  | 'officer_rejected'    // เจ้าหน้าที่ปฏิเสธ
  | 'director_rejected';  // ผอ. ตลาดปฏิเสธ

export interface RegistrationDoc {
  id: string;
  /** Machine type per FR-SYS01-006 */
  type: 'id_card' | 'house_reg' | 'bank_book' | 'pdpa'
      | 'company_cert' | 'director_id' | 'poa'
      | 'org_cert' | 'factory_license';
  label: string;          // human label e.g. "สำเนาบัตรประชาชน"
  filename: string;       // mock file name
  uploadedAt: string;
  status: DocStatus;
  reviewerNote?: string;
  /** Base64 data URL for live preview in the POC. Populated when the user
   *  uploads a real file via the register wizard; absent on seed mock data. */
  dataUrl?: string;
  /** MIME type captured from the uploaded File — drives preview rendering
   *  (image vs PDF) in the officer/director detail pages. */
  mimeType?: string;
}

export interface BankAccount {
  bank: string;
  accountNo: string;
  accountName: string;
  branch: string;
  accountType: 'savings' | 'current';
}

/** ผู้มีอำนาจลงชื่อผูกพันนิติบุคคล — ใช้ใน seller subTypes: cooperative / business / farmer_group / organization */
export interface AuthorizedPerson {
  title: string;
  firstName: string;
  lastName: string;
  position: string;
  /** มอบอำนาจ / ไม่มอบอำนาจ — ไม่ใช้ใน farmer_group */
  delegated?: 'delegated' | 'not_delegated';
}

/** ตัวแทนกลุ่ม — ใช้เฉพาะ subType: farmer_group */
export interface GroupRepresentative {
  title: string;
  firstName: string;
  lastName: string;
  nationalId: string;
}

export interface Application {
  id: string;             // R001 / RS001
  type: 'buyer' | 'seller';
  subType: string;        // individual / company / farmer / cooperative / business / ...
  username: string;       // login username chosen at registration

  // Step 1 — personal (legacy; for farmer + buyer)
  title: string;
  firstName: string;
  lastName: string;
  dob: string;            // ISO date
  nationalId: string;
  phone: string;
  email: string;

  // Step 1 — address (เลขที่ / หมู่ที่ / ถนน รวมเป็นช่องเดียว)
  addressLine: string;
  province: string;
  district: string;
  subDistrict: string;
  zipcode: string;

  // Buyer-specific (multi-market)
  markets?: string[];

  // Seller-specific
  rubberTypes?: string[]; // multi-select
  market?: string;        // single market for seller
  plotId?: string;        // farmer
  plotArea?: number;      // farmer (rai)
  /** เลขทะเบียนเกษตรกรชาวสวนยาง — เฉพาะ farmer */
  farmerRegNo?: string;
  /** ชื่อสถาบัน / สถานประกอบการ / กลุ่ม — cooperative / business / farmer_group / organization */
  orgName?: string;
  /** เลขประจำตัวผู้เสียภาษีหรือทะเบียนนิติบุคคล — cooperative / organization */
  taxId?: string;
  /** เลขทะเบียนสถาบันเกษตรกร — cooperative */
  instRegNo?: string;
  /** เลขทะเบียนพาณิชย์ — business */
  commerceRegNo?: string;
  /** เลขทะเบียนผู้ประกอบกิจการยาง — business (optional ตามสเปก) */
  businessRegNo?: string;
  /** ผู้มีอำนาจลงชื่อผูกพันนิติบุคคล */
  authorizedPerson?: AuthorizedPerson;
  /** ตัวแทนกลุ่ม — farmer_group เท่านั้น */
  representative?: GroupRepresentative;

  // Step 2 — bank (primary account, denormalized for backward compat with
  // existing approval/profile views; mirrors `bankAccounts[primaryBankIndex]`).
  bank: string;
  accountNo: string;
  accountName: string;
  branch: string;
  accountType: 'savings' | 'current';
  /** Full list — applicants can register more than one bank account. */
  bankAccounts?: BankAccount[];
  /** Index into `bankAccounts` marking the primary/payout account. */
  primaryBankIndex?: number;

  // Step 4 — docs
  docs: RegistrationDoc[];

  // Meta
  submittedAt: string;
  overallStatus: AppOverallStatus;
  approvalStage: ApprovalStage;
  reviewerName?: string;
  reviewedAt?: string;
  forwardNote?: string;   // officer's note when forwarding to director
  rejectReason?: string;  // reason given by whichever tier rejected
  approveNote?: string;   // optional comment from director when approving
}

// ─── SLA Helper ─────────────────────────────────────────────────────────────

/** Returns true if submittedAt is more than 3 business days ago (Mon–Fri only) */
export function isOverSla(submittedAt: string): boolean {
  const submitted = new Date(submittedAt);
  const now = new Date();
  let businessDays = 0;
  const cursor = new Date(submitted);
  while (cursor < now) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) businessDays++;
  }
  return businessDays > 3;
}

// ─── Mock applications ─────────────────────────────────────────────────────

export const MOCK_APPLICATIONS: Application[] = [
  // Buyer — individual, all docs uploaded, officer review
  {
    id: 'R001', type: 'buyer', subType: 'individual', username: 'buyer_r001',
    title: 'นาย', firstName: 'ธนาคาร', lastName: 'ซื้อดี',
    dob: '1985-04-15',
    nationalId: '1234567890000',
    phone: '0891234567',
    email: 'buyer2@test.com',
    addressLine: '99/12 หมู่ 4 ซอยรักไทย ถนนสุราษฎร์-นาสาร',
    province: 'สุราษฎร์ธานี',
    district: 'เมือง',
    subDistrict: 'มะขามเตี้ย',
    zipcode: '84000',
    markets: ['ตลาดกลางยางพาราสุราษฎร์ธานี'],
    bank: 'ธนาคารกรุงไทย',
    accountNo: '1234567890',
    accountName: 'นายธนาคาร ซื้อดี',
    branch: 'สุราษฎร์ธานี',
    accountType: 'savings',
    docs: [
      { id: 'D-R001-1', type: 'id_card',  label: 'สำเนาบัตรประชาชน',           filename: 'id_card_R001.pdf',  uploadedAt: '2024-04-16T10:00:00', status: 'pending' },
      { id: 'D-R001-2', type: 'house_reg', label: 'สำเนาทะเบียนบ้าน',            filename: 'house_R001.jpg',    uploadedAt: '2024-04-16T10:01:00', status: 'pending' },
      { id: 'D-R001-3', type: 'bank_book', label: 'สำเนาสมุดบัญชีธนาคาร',         filename: 'bank_R001.pdf',     uploadedAt: '2024-04-16T10:02:00', status: 'pending' },
      { id: 'D-R001-4', type: 'pdpa',      label: 'แบบยินยอม PDPA',              filename: 'pdpa_R001.pdf',     uploadedAt: '2024-04-16T10:03:00', status: 'pending' },
    ],
    submittedAt: '2024-04-16',
    overallStatus: 'pending_review',
    approvalStage: 'officer_review',
  },

  // Buyer — corporate, officer rejected
  {
    id: 'R002', type: 'buyer', subType: 'company', username: 'buyer_r002',
    title: 'นาย', firstName: 'พลอย', lastName: 'ยางทอง',
    dob: '1978-11-22',
    nationalId: '0125668000001',
    phone: '0812345000',
    email: 'ploy@test.com',
    addressLine: 'อาคารพลอยยาง ชั้น 5 ถนนสามแยก',
    province: 'สุราษฎร์ธานี',
    district: 'เมือง',
    subDistrict: 'ตลาด',
    zipcode: '84000',
    markets: ['ตลาดกลางยางพาราสุราษฎร์ธานี', 'ตลาดกลางยางพารานครศรีธรรมราช'],
    bank: 'ธนาคารกสิกรไทย',
    accountNo: '9876543210',
    accountName: 'บจก.พลอยยาง จำกัด',
    branch: 'สุราษฎร์ธานี',
    accountType: 'current',
    docs: [
      { id: 'D-R002-1', type: 'id_card',      label: 'สำเนาบัตรประชาชน (ผู้ติดต่อ)', filename: 'id_R002.pdf',   uploadedAt: '2024-04-15T09:00:00', status: 'pending' },
      { id: 'D-R002-2', type: 'company_cert', label: 'หนังสือรับรองบริษัท',           filename: 'cert_R002.pdf', uploadedAt: '2024-04-15T09:05:00', status: 'rejected', reviewerNote: 'หนังสือรับรองหมดอายุ — ต้องไม่เกิน 6 เดือน' },
      { id: 'D-R002-3', type: 'director_id',  label: 'บัตรประชาชนกรรมการ',           filename: 'dir_R002.jpg',  uploadedAt: '2024-04-15T09:06:00', status: 'pending' },
    ],
    submittedAt: '2024-04-15',
    overallStatus: 'rejected',
    approvalStage: 'officer_rejected',
    reviewerName: 'นางสาวพิมพ์ใจ ประมูลดี',
    reviewedAt: '2024-04-15T14:30:00',
  },

  // Buyer — same person as R001, EARLIER attempt that was rejected. Demonstrates
  // resubmission history on the detail page (matched by nationalId + type).
  {
    id: 'R001-prev', type: 'buyer', subType: 'individual', username: 'buyer_r001_old',
    title: 'นาย', firstName: 'ธนาคาร', lastName: 'ซื้อดี',
    dob: '1985-04-15',
    nationalId: '1234567890000',
    phone: '0891234567',
    email: 'buyer2@test.com',
    addressLine: '99/12 หมู่ 4 ซอยรักไทย ถนนสุราษฎร์-นาสาร',
    province: 'สุราษฎร์ธานี',
    district: 'เมือง',
    subDistrict: 'มะขามเตี้ย',
    zipcode: '84000',
    markets: ['ตลาดกลางยางพาราสุราษฎร์ธานี'],
    bank: 'ธนาคารกรุงไทย',
    accountNo: '1234567890',
    accountName: 'นายธนาคาร ซื้อดี',
    branch: 'สุราษฎร์ธานี',
    accountType: 'savings',
    docs: [
      { id: 'D-R001P-1', type: 'id_card',  label: 'สำเนาบัตรประชาชน',   filename: 'id_R001_v1.pdf',  uploadedAt: '2024-03-10T10:00:00', status: 'rejected', reviewerNote: 'ภาพไม่ชัด' },
      { id: 'D-R001P-2', type: 'house_reg', label: 'สำเนาทะเบียนบ้าน',    filename: 'house_R001_v1.jpg', uploadedAt: '2024-03-10T10:01:00', status: 'approved' },
      { id: 'D-R001P-3', type: 'bank_book', label: 'สำเนาสมุดบัญชีธนาคาร', filename: 'bank_R001_v1.pdf',  uploadedAt: '2024-03-10T10:02:00', status: 'approved' },
      { id: 'D-R001P-4', type: 'pdpa',      label: 'แบบยินยอม PDPA',      filename: 'pdpa_R001_v1.pdf',  uploadedAt: '2024-03-10T10:03:00', status: 'approved' },
    ],
    submittedAt: '2024-03-10',
    overallStatus: 'rejected',
    approvalStage: 'officer_rejected',
    reviewerName: 'นางสาวพิมพ์ใจ ประมูลดี',
    reviewedAt: '2024-03-11T11:00:00',
    rejectReason: 'สำเนาบัตรประชาชนเบลอ มองเลขประจำตัวไม่ชัด — กรุณาส่งใหม่',
  },

  // Buyer — same person as R001, SECOND rejected attempt (between R001-prev
  // and the current R001). Demonstrates the rejected-tab dedupe + count.
  {
    id: 'R001-prev2', type: 'buyer', subType: 'individual', username: 'buyer_r001_old2',
    title: 'นาย', firstName: 'ธนาคาร', lastName: 'ซื้อดี',
    dob: '1985-04-15',
    nationalId: '1234567890000',
    phone: '0891234567',
    email: 'buyer2@test.com',
    addressLine: '99/12 หมู่ 4 ซอยรักไทย ถนนสุราษฎร์-นาสาร',
    province: 'สุราษฎร์ธานี',
    district: 'เมือง',
    subDistrict: 'มะขามเตี้ย',
    zipcode: '84000',
    markets: ['ตลาดกลางยางพาราสุราษฎร์ธานี'],
    bank: 'ธนาคารกรุงไทย',
    accountNo: '1234567890',
    accountName: 'นายธนาคาร ซื้อดี',
    branch: 'สุราษฎร์ธานี',
    accountType: 'savings',
    docs: [
      { id: 'D-R001P2-1', type: 'id_card',   label: 'สำเนาบัตรประชาชน',     filename: 'id_R001_v2.pdf',   uploadedAt: '2024-03-25T10:00:00', status: 'approved' },
      { id: 'D-R001P2-2', type: 'house_reg', label: 'สำเนาทะเบียนบ้าน',     filename: 'house_R001_v2.jpg', uploadedAt: '2024-03-25T10:01:00', status: 'approved' },
      { id: 'D-R001P2-3', type: 'bank_book', label: 'สำเนาสมุดบัญชีธนาคาร',  filename: 'bank_R001_v2.pdf',  uploadedAt: '2024-03-25T10:02:00', status: 'rejected', reviewerNote: 'ชื่อบัญชีไม่ตรงกับชื่อผู้สมัคร' },
      { id: 'D-R001P2-4', type: 'pdpa',      label: 'แบบยินยอม PDPA',       filename: 'pdpa_R001_v2.pdf',  uploadedAt: '2024-03-25T10:03:00', status: 'approved' },
    ],
    submittedAt: '2024-03-25',
    overallStatus: 'rejected',
    approvalStage: 'officer_rejected',
    reviewerName: 'นางสาวพิมพ์ใจ ประมูลดี',
    reviewedAt: '2024-03-26T15:00:00',
    rejectReason: 'ชื่อในสมุดบัญชีธนาคารไม่ตรงกับชื่อในบัตรประชาชน',
  },

  // Seller — same person as RS001, EARLIER attempt that was rejected.
  {
    id: 'RS001-prev', type: 'seller', subType: 'farmer', username: 'seller_rs001_old',
    title: 'นาย', firstName: 'มาลี', lastName: 'สวนยาง',
    dob: '1970-06-03',
    nationalId: '9876543210001',
    phone: '0856789012',
    email: 'malee@test.com',
    addressLine: '45 หมู่ 3 บ้านสวนยาง',
    province: 'สุราษฎร์ธานี',
    district: 'พุนพิน',
    subDistrict: 'ท่าสะท้อน',
    zipcode: '84130',
    market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    rubberTypes: ['ยางแผ่นรมควัน RSS'],
    plotId: 'GID-2024-00123',
    plotArea: 12.5,
    bank: 'ธ.ก.ส.',
    accountNo: '5544332211',
    accountName: 'นายมาลี สวนยาง',
    branch: 'พุนพิน',
    accountType: 'savings',
    docs: [
      { id: 'D-RS001P-1', type: 'id_card',   label: 'สำเนาบัตรประชาชน',   filename: 'id_RS001_v1.jpg',   uploadedAt: '2024-02-20T08:00:00', status: 'approved' },
      { id: 'D-RS001P-2', type: 'house_reg', label: 'สำเนาทะเบียนบ้าน',    filename: 'house_RS001_v1.jpg', uploadedAt: '2024-02-20T08:02:00', status: 'rejected', reviewerNote: 'ไม่ใช่ฉบับล่าสุด' },
      { id: 'D-RS001P-3', type: 'bank_book', label: 'สำเนาสมุดบัญชีธนาคาร', filename: 'bank_RS001_v1.pdf',  uploadedAt: '2024-02-20T08:05:00', status: 'approved' },
      { id: 'D-RS001P-4', type: 'pdpa',      label: 'แบบยินยอม PDPA',      filename: 'pdpa_RS001_v1.pdf',  uploadedAt: '2024-02-20T08:08:00', status: 'approved' },
    ],
    submittedAt: '2024-02-20',
    overallStatus: 'rejected',
    approvalStage: 'officer_rejected',
    reviewerName: 'นางสาวพิมพ์ใจ ประมูลดี',
    reviewedAt: '2024-02-21T14:00:00',
    rejectReason: 'สำเนาทะเบียนบ้านไม่ใช่ฉบับล่าสุด — ขอให้แนบสำเนาฉบับปัจจุบัน',
  },

  // Seller — farmer, all docs uploaded, officer review
  {
    id: 'RS001', type: 'seller', subType: 'farmer', username: 'seller_rs001',
    title: 'นาย', firstName: 'มาลี', lastName: 'สวนยาง',
    dob: '1970-06-03',
    nationalId: '9876543210001',
    phone: '0856789012',
    email: 'malee@test.com',
    addressLine: '45 หมู่ 3 บ้านสวนยาง',
    province: 'สุราษฎร์ธานี',
    district: 'พุนพิน',
    subDistrict: 'ท่าสะท้อน',
    zipcode: '84130',
    market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    rubberTypes: ['ยางแผ่นรมควัน RSS', 'ยางก้อนถ้วย (Cup Lump)'],
    plotId: 'GID-2024-00123',
    plotArea: 12.5,
    bank: 'ธ.ก.ส.',
    accountNo: '5544332211',
    accountName: 'นายมาลี สวนยาง',
    branch: 'พุนพิน',
    accountType: 'savings',
    docs: [
      { id: 'D-RS001-1', type: 'id_card',   label: 'สำเนาบัตรประชาชน',     filename: 'id_RS001.jpg',    uploadedAt: '2024-04-17T08:00:00', status: 'pending' },
      { id: 'D-RS001-2', type: 'house_reg', label: 'สำเนาทะเบียนบ้าน',      filename: 'house_RS001.jpg', uploadedAt: '2024-04-17T08:02:00', status: 'pending' },
      { id: 'D-RS001-3', type: 'bank_book', label: 'สำเนาสมุดบัญชีธนาคาร',   filename: 'bank_RS001.pdf',  uploadedAt: '2024-04-17T08:05:00', status: 'pending' },
      { id: 'D-RS001-4', type: 'pdpa',      label: 'แบบยินยอม PDPA',        filename: 'pdpa_RS001.pdf',  uploadedAt: '2024-04-17T08:08:00', status: 'pending' },
    ],
    submittedAt: '2024-04-17',
    overallStatus: 'pending_review',
    approvalStage: 'officer_review',
  },

  // Seller — cooperative, all docs approved, waiting for director
  {
    id: 'RS002', type: 'seller', subType: 'cooperative', username: 'seller_rs002',
    title: 'นาง', firstName: 'รัตนา', lastName: 'ประธานสหกรณ์',
    dob: '1965-09-12',
    nationalId: '3210987654321',
    phone: '0877123456',
    email: 'coop_surat@test.com',
    addressLine: '88 ถนนดอนนก',
    province: 'สุราษฎร์ธานี',
    district: 'เมือง',
    subDistrict: 'ตลาด',
    zipcode: '84000',
    market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    rubberTypes: ['น้ำยางสด (Field Latex)', 'ยางแผ่นรมควัน RSS'],
    bank: 'ธนาคารออมสิน',
    accountNo: '0019988776',
    accountName: 'สหกรณ์ยางพาราสุราษฎร์',
    branch: 'สุราษฎร์ธานี',
    accountType: 'savings',
    docs: [
      { id: 'D-RS002-1', type: 'id_card',   label: 'สำเนาบัตรประชาชน (ประธาน)', filename: 'id_RS002.pdf',     uploadedAt: '2024-04-12T09:00:00', status: 'approved' },
      { id: 'D-RS002-2', type: 'house_reg', label: 'สำเนาทะเบียนบ้าน',          filename: 'house_RS002.pdf',  uploadedAt: '2024-04-12T09:02:00', status: 'approved' },
      { id: 'D-RS002-3', type: 'bank_book', label: 'สำเนาสมุดบัญชีธนาคาร',       filename: 'bank_RS002.pdf',   uploadedAt: '2024-04-12T09:04:00', status: 'approved' },
      { id: 'D-RS002-4', type: 'pdpa',      label: 'แบบยินยอม PDPA',            filename: 'pdpa_RS002.pdf',   uploadedAt: '2024-04-12T09:05:00', status: 'approved' },
      { id: 'D-RS002-5', type: 'org_cert',  label: 'หนังสือจดทะเบียนสหกรณ์',     filename: 'org_RS002.pdf',    uploadedAt: '2024-04-12T09:06:00', status: 'approved' },
    ],
    submittedAt: '2024-04-12',
    overallStatus: 'awaiting_director',
    approvalStage: 'director_review',
    reviewerName: 'นางสาวพิมพ์ใจ ประมูลดี',
    reviewedAt: '2024-04-13T11:20:00',
    forwardNote: 'เอกสารครบถ้วนและถูกต้อง สหกรณ์มีประวัติดี ขอเสนอพิจารณาอนุมัติ',
  },

  // Seller — business, awaiting director
  {
    id: 'RS003', type: 'seller', subType: 'business', username: 'seller_rs003',
    title: 'นาย', firstName: 'ชัยชนะ', lastName: 'ยางพาณิชย์',
    dob: '1975-03-20',
    nationalId: '5678901234567',
    phone: '0844567890',
    email: 'chaichana@test.com',
    addressLine: '123/45 ถนนยางพารา อาคารชัยชนะ ชั้น 3',
    province: 'สุราษฎร์ธานี',
    district: 'เมือง',
    subDistrict: 'บางกุ้ง',
    zipcode: '84000',
    market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    rubberTypes: ['ยางแผ่นรมควัน RSS', 'น้ำยางสด (Field Latex)', 'ยางเครป'],
    bank: 'ธนาคารกรุงเทพ',
    accountNo: '7788990011',
    accountName: 'นายชัยชนะ ยางพาณิชย์',
    branch: 'สุราษฎร์ธานี สาขาใหญ่',
    accountType: 'current',
    docs: [
      { id: 'D-RS003-1', type: 'id_card',          label: 'สำเนาบัตรประชาชน',           filename: 'id_RS003.pdf',      uploadedAt: '2024-04-10T10:00:00', status: 'approved' },
      { id: 'D-RS003-2', type: 'house_reg',         label: 'สำเนาทะเบียนบ้าน',            filename: 'house_RS003.pdf',   uploadedAt: '2024-04-10T10:02:00', status: 'approved' },
      { id: 'D-RS003-3', type: 'bank_book',         label: 'สำเนาสมุดบัญชีธนาคาร',         filename: 'bank_RS003.pdf',    uploadedAt: '2024-04-10T10:04:00', status: 'approved' },
      { id: 'D-RS003-4', type: 'pdpa',              label: 'แบบยินยอม PDPA',              filename: 'pdpa_RS003.pdf',    uploadedAt: '2024-04-10T10:06:00', status: 'approved' },
      { id: 'D-RS003-5', type: 'factory_license',   label: 'ใบอนุญาตโรงงาน / ประกอบกิจการ', filename: 'license_RS003.pdf', uploadedAt: '2024-04-10T10:08:00', status: 'approved' },
    ],
    submittedAt: '2024-04-10',
    overallStatus: 'awaiting_director',
    approvalStage: 'director_review',
    reviewerName: 'นางสาวพิมพ์ใจ ประมูลดี',
    reviewedAt: '2024-04-11T09:30:00',
    forwardNote: 'ผู้ประกอบกิจการมีใบอนุญาตครบถ้วน เอกสารทุกฉบับถูกต้อง แนะนำให้อนุมัติ',
  },
];

// ─── Status overlay helpers (localStorage) ─────────────────────────────────
// Lets the detail page persist approval/reject decisions across navigations
// without mutating the seed mock array.

const STORAGE_KEY = 'raot_application_overrides';

interface AppOverride {
  status: AppOverallStatus;
  stage?: ApprovalStage;
  reviewerName?: string;
  reviewedAt?: string;
  rejectReason?: string;
  forwardNote?: string;
  approveNote?: string;
  /** Per-document status overrides keyed by doc id */
  docs?: Record<string, { status: DocStatus; note?: string }>;
}

type OverrideMap = Record<string, AppOverride>;

function readMap(): OverrideMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as OverrideMap;
  } catch {
    return {};
  }
}

function writeMap(m: OverrideMap): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  // Notify any open list pages so they refresh immediately. The native
  // `storage` event only fires in OTHER tabs; we need our own event for the
  // current tab.
  window.dispatchEvent(new Event(APPROVAL_UPDATED_EVENT));
}

/** Event broadcast on every override write so list pages can refresh. */
export const APPROVAL_UPDATED_EVENT = 'raot:approval-updated';

export function getOverride(id: string): AppOverride | null {
  return readMap()[id] ?? null;
}

export function setOverallStatus(
  id: string,
  status: AppOverallStatus,
  reviewerName: string,
  rejectReason?: string,
  newStage?: ApprovalStage,
  approveNote?: string,
): void {
  const m = readMap();
  m[id] = {
    ...m[id],
    status,
    reviewerName,
    reviewedAt: new Date().toISOString(),
    ...(rejectReason ? { rejectReason } : {}),
    ...(newStage ? { stage: newStage } : {}),
    ...(approveNote ? { approveNote } : {}),
  };
  writeMap(m);
}

export function setDocOverride(
  appId: string,
  docId: string,
  status: DocStatus,
  note?: string,
): void {
  const m = readMap();
  const existing = m[appId] ?? { status: 'pending_review' as AppOverallStatus };
  m[appId] = {
    ...existing,
    docs: { ...existing.docs, [docId]: { status, note } },
  };
  writeMap(m);
}

/**
 * Officer forwards an application to the market director.
 * Sets stage to director_review, status to awaiting_director, saves forwardNote.
 */
export function setForwardNote(
  id: string,
  note: string,
  reviewerName: string,
): void {
  const m = readMap();
  m[id] = {
    ...m[id],
    status: 'awaiting_director',
    stage: 'director_review',
    reviewerName,
    reviewedAt: new Date().toISOString(),
    forwardNote: note,
  };
  writeMap(m);
}

// ─── Submitted applications (localStorage) ─────────────────────────────────

const SUBMITTED_APPS_KEY = 'raot_submitted_applications';
const PENDING_CREDS_KEY  = 'raot_pending_credentials';

interface PendingCred {
  role: 'buyer' | 'seller';
  applicationId: string;
  password: string; // plaintext — mock only, never for prod
}

/** Generate a new Application ID (R-{timestamp} for buyer, RS-{timestamp} for seller) */
function generateAppId(type: 'buyer' | 'seller'): string {
  return `${type === 'buyer' ? 'R' : 'RS'}-${Date.now()}`;
}

/** True if the error is a localStorage QuotaExceededError. */
function isQuotaError(e: unknown): boolean {
  return e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
}

/** Strip the heavy `dataUrl` from all docs of a given app. */
function stripAppDocPayloads(a: Application): Application {
  return { ...a, docs: a.docs.map((d) => ({ ...d, dataUrl: undefined })) };
}

/**
 * Persist the submitted-applications array to localStorage with graceful
 * quota fallback. `dataUrl` payloads (base64 docs) can balloon past the
 * ~5 MB browser quota; if so, we progressively drop dataUrls from older
 * applications (newest preserved), then from the new app itself as a last
 * resort. dataUrl is optional in the type so consumers already handle its
 * absence (file preview just becomes a [Demo] click).
 */
function saveSubmittedAppsWithQuotaFallback(apps: Application[], newAppId: string): void {
  if (typeof window === 'undefined') return;
  // 1. Happy path
  try {
    localStorage.setItem(SUBMITTED_APPS_KEY, JSON.stringify(apps));
    return;
  } catch (e) {
    if (!isQuotaError(e)) throw e;
  }
  // 2. Drop dataUrls from older apps, keep the new one's previews
  const trimmed = apps.map((a) => (a.id === newAppId ? a : stripAppDocPayloads(a)));
  try {
    localStorage.setItem(SUBMITTED_APPS_KEY, JSON.stringify(trimmed));
    return;
  } catch (e) {
    if (!isQuotaError(e)) throw e;
  }
  // 3. Last-resort: drop dataUrls from the new app too — application metadata
  //    still saves so officer/director can review form data; file previews
  //    fall back to the [Demo] placeholder.
  const fullyStripped = trimmed.map(stripAppDocPayloads);
  localStorage.setItem(SUBMITTED_APPS_KEY, JSON.stringify(fullyStripped));
}

/** Save a submitted application to localStorage and return the saved Application */
export function submitApplication(
  data: Omit<Application, 'id' | 'submittedAt' | 'overallStatus' | 'approvalStage'> & { password: string }
): Application {
  const { password, ...rest } = data;
  const app: Application = {
    ...rest,
    id: generateAppId(rest.type),
    submittedAt: new Date().toISOString().split('T')[0],
    overallStatus: 'pending_review',
    approvalStage: 'officer_review',
  };
  // Save application (with progressive quota-fallback for large doc payloads)
  const apps = getSubmittedApplications();
  apps.push(app);
  saveSubmittedAppsWithQuotaFallback(apps, app.id);
  // Save pending credentials for login
  const creds = readPendingCreds();
  creds[rest.username] = { role: rest.type, applicationId: app.id, password };
  if (typeof window !== 'undefined') {
    localStorage.setItem(PENDING_CREDS_KEY, JSON.stringify(creds));
  }
  return app;
}

export function getSubmittedApplications(): Application[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SUBMITTED_APPS_KEY) ?? '[]') as Application[];
  } catch { return []; }
}

function readPendingCreds(): Record<string, PendingCred> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(PENDING_CREDS_KEY) ?? '{}') as Record<string, PendingCred>;
  } catch { return {}; }
}

export function getPendingCred(username: string): PendingCred | null {
  return readPendingCreds()[username] ?? null;
}

/** Merge MOCK_APPLICATIONS + localStorage-submitted apps (with overrides applied) */
export function getAllApplications(): Application[] {
  const submitted = getSubmittedApplications().map(applyOverrides);
  const mockIds = new Set(MOCK_APPLICATIONS.map((a) => a.id));
  const newOnes = submitted.filter((a) => !mockIds.has(a.id));
  return [...MOCK_APPLICATIONS.map(applyOverrides), ...newOnes];
}

/** Apply localStorage overrides on top of the mock data */
export function applyOverrides(app: Application): Application {
  const o = getOverride(app.id);
  if (!o) return app;
  const docs = app.docs.map((d) => {
    const ov = o.docs?.[d.id];
    return ov ? { ...d, status: ov.status, reviewerNote: ov.note ?? d.reviewerNote } : d;
  });
  return {
    ...app,
    overallStatus: o.status,
    approvalStage: o.stage ?? app.approvalStage,
    reviewerName: o.reviewerName ?? app.reviewerName,
    reviewedAt: o.reviewedAt ?? app.reviewedAt,
    forwardNote: o.forwardNote ?? app.forwardNote,
    rejectReason: o.rejectReason ?? app.rejectReason,
    approveNote: o.approveNote ?? app.approveNote,
    docs,
  };
}
