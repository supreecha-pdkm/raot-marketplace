import { Contract } from '@/shared/types';

// Each contract sits in one of 4 finance-workflow phases.
// Phase 1 (inbox)    → no QC yet
// Phase 2 (QC)       → qcResult set: 'pending' = awaiting decision, 'fail' = looped back
// Phase 3 (payment)  → QC passed, awaiting payment method + director approval
// Phase 4 (done)     → fully closed (matches existing status: 'completed')
export const MOCK_CONTRACTS: Contract[] = [
  // ─── Phase 1: fresh contracts, ยังไม่ได้ตรวจ QC ──────────────────────────
  {
    id: 'C001', contractNo: 'CNT-2024-0042', buyer: 'นายสมชาย ใจดี',
    seller: 'นายสมศักดิ์ เกษตรกร', rubberType: 'ยางแผ่นรมควัน (RSS3)',
    weight: 5200, price: 71.00, totalAmount: 369200,
    status: 'active', createdAt: '2024-04-17', dueDate: '2024-04-20',
    tradingType: 'auction',
    workflowPhase: 1,
  },
  {
    id: 'C005', contractNo: 'CNT-2024-0051', buyer: 'นายสมชาย ใจดี',
    seller: 'นายประสิทธิ์ ไร่ยาง', rubberType: 'ยางแผ่นดิบ USS3',
    weight: 1500, price: 63.00, totalAmount: 94500,
    status: 'pending', createdAt: '2024-04-20', dueDate: '2024-04-29',
    tradingType: 'bid-ask',
    workflowPhase: 1,
  },

  // ─── Phase 2: QC ตรวจคุณภาพ — มีทั้งรอตรวจ + ตกตรวจ (loop back) ─────────
  {
    id: 'C002', contractNo: 'CNT-2024-0038', buyer: 'นายสมชาย ใจดี',
    seller: 'สหกรณ์กสิกรรมสุราษฎร์ธานี', rubberType: 'น้ำยางสด',
    weight: 8000, price: 53.50, totalAmount: 428000,
    status: 'pending', createdAt: '2024-04-15', dueDate: '2024-04-18',
    tradingType: 'negotiated',
    workflowPhase: 2,
    qcResult: 'pending',
  },
  {
    id: 'C006', contractNo: 'CNT-2024-0055', buyer: 'นายธนกฤต พัฒนวงศ์',
    seller: 'สหกรณ์ยางสงขลา', rubberType: 'ยางแผ่นรมควัน (RSS3)',
    weight: 6000, price: 70.50, totalAmount: 423000,
    status: 'pending', createdAt: '2024-04-19', dueDate: '2024-04-26',
    tradingType: 'auction',
    workflowPhase: 2,
    qcResult: 'fail',
    qcNote: 'ตรวจพบความชื้นเกินมาตรฐาน — ส่งกลับให้ผู้ขายปรับปรุงก่อน',
    qcCheckedAt: '2024-04-19',
    qcCheckedBy: 'นายอนันต์ ตรวจคุณภาพ',
  },

  // ─── Phase 3: ผ่าน QC แล้ว — รอออกใบแจ้ง / ชำระ / อนุมัติ ──────────────
  {
    id: 'C004', contractNo: 'CNT-2024-0050', buyer: 'นายสมชาย ใจดี',
    seller: 'ประสิทธิ์ ยางงาม', rubberType: 'ยางก้อนถ้วย',
    weight: 4000, price: 37.50, totalAmount: 150000,
    status: 'pending', createdAt: '2024-04-21', dueDate: '2024-04-25',
    tradingType: 'forward',
    workflowPhase: 3,
    qcResult: 'pass',
    qcCheckedAt: '2024-04-21',
    qcCheckedBy: 'นายอนันต์ ตรวจคุณภาพ',
    paymentMethod: 'transfer',
    approverRole: 'director',
    directorApproved: false,
  },
  {
    id: 'C007', contractNo: 'CNT-2024-0060', buyer: 'บจก.ยางรุ่ง', seller: 'สหกรณ์นครศรีฯ',
    rubberType: 'น้ำยางสด', weight: 9500, price: 54.25, totalAmount: 515375,
    status: 'pending', createdAt: '2024-04-22', dueDate: '2024-04-24',
    tradingType: 'auction',
    workflowPhase: 3,
    qcResult: 'pass',
    qcCheckedAt: '2024-04-22',
    qcCheckedBy: 'นายอนันต์ ตรวจคุณภาพ',
    paymentMethod: 'cash',
    approverRole: 'deputy_director',
    directorApproved: false,
  },

  // ─── Phase 4: เสร็จสมบูรณ์ ─────────────────────────────────────────────
  {
    id: 'C003', contractNo: 'CNT-2024-0031', buyer: 'นายสมชาย ใจดี',
    seller: 'นายมานี รักสวน', rubberType: 'ยางก้อนถ้วย',
    weight: 10000, price: 47.50, totalAmount: 475000,
    status: 'completed', createdAt: '2024-04-10', dueDate: '2024-04-13',
    tradingType: 'bid-ask',
    workflowPhase: 4,
    qcResult: 'pass',
    qcCheckedAt: '2024-04-10',
    qcCheckedBy: 'นายอนันต์ ตรวจคุณภาพ',
    paymentMethod: 'transfer',
    approverRole: 'director',
    directorApproved: true,
    approvedAt: '2024-04-11',
    approvedBy: 'ผอ.ตลาด',
  },
];

// Approver display labels — shared across workflow UI.
export const APPROVER_LABELS: Record<NonNullable<Contract['approverRole']>, string> = {
  director:         'ผู้อำนวยการตลาด',
  deputy_director:  'รองผู้อำนวยการ',
  finance_head:     'หัวหน้าฝ่ายการเงิน',
};

// Phase metadata — labels, descriptions, colors. Used everywhere the workflow
// renders (sidebar, hub page, dashboard).
export const PHASE_META: Record<1 | 2 | 3 | 4, {
  shortLabel:  string;
  fullLabel:   string;
  description: string;
  color:       string;
}> = {
  1: { shortLabel: 'Phase 1: รับเอกสาร',  fullLabel: 'Phase 1 — ต้อนรับและตรวจสอบ',     description: 'รับสัญญาเข้าระบบ ตรวจข้อมูลเบื้องต้น', color: '#1677ff' },
  2: { shortLabel: 'Phase 2: ตรวจ QC',    fullLabel: 'Phase 2 — ตรวจคัดคุณภาพยาง',      description: 'ผ่าน → สร้างสัญญา · ไม่ผ่าน → แจ้งย้อนกลับ', color: '#fa8c16' },
  3: { shortLabel: 'Phase 3: ชำระเงิน',   fullLabel: 'Phase 3 — จัดทำเอกสารและชำระเงิน', description: 'ออกใบแจ้ง · เลือกวิธีชำระ · ผู้อำนวยการอนุมัติ', color: '#13c2c2' },
  4: { shortLabel: 'Phase 4: สรุปงาน',    fullLabel: 'Phase 4 — สรุปและจบ',              description: 'ส่งรายงาน · บันทึกฐานข้อมูล · ปิดงาน', color: '#52c41a' },
};
