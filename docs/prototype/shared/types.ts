export type UserRole = 'buyer' | 'seller' | 'officer' | 'master';

export interface User {
  id: string;
  username: string;
  fullName: string;
  fullNameEn?: string;
  email: string;
  phone?: string;
  role: UserRole;
  /** Officer-side users reference a dynamic Role for permission resolution.
   *  Master accounts ignore this field (always see every menu). Buyers and
   *  sellers don't use it at all. Undefined officers fall back to the
   *  Default role (no permissions beyond Dashboard). */
  roleId?: string;
  market?: string;
  /** Markets a buyer is registered for. When set on a buyer it drives the
   *  market dropdown on the auction board; for other roles use `market`. */
  markets?: string[];
  avatar?: string;
  /** Registered delivery / contact address — used to prefill forms (e.g. negotiated orders) */
  address?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const ROLE_LABELS: Record<UserRole, { th: string; en: string; color: string }> = {
  buyer:   { th: 'ผู้ซื้อ',          en: 'Buyer',   color: '#1677ff' },
  seller:  { th: 'ผู้ขาย',          en: 'Seller',  color: '#52c41a' },
  officer: { th: 'เจ้าหน้าที่',       en: 'Officer', color: '#fa8c16' },
  master:  { th: 'ผู้ดูแลระบบหลัก', en: 'Master',  color: '#722ed1' },
};

/** Single tapping day, or a range when a lot bundles multiple farmers
 *  whose tapping days differ. `from === to` renders as a single date. */
export interface TappingRange {
  from: string;   // YYYY-MM-DD — earliest tapping day in the lot
  to:   string;   // YYYY-MM-DD — latest tapping day in the lot
}

export interface AuctionLot {
  id: string;
  lotNo: string;
  rubberType: string;
  grade: string;
  weight: number;
  openingPrice: number;
  currentPrice?: number;
  status: 'open' | 'closed' | 'pending' | 'cancelled';
  isEudr: boolean;
  market: string;
  auctionDate: string;
  endTime: string;
  /** Tapping date(s) — when the rubber was actually tapped at the farm.
   *  Critical signal for buyers, especially for fresh latex. */
  tappingDate?: TappingRange;
  /** Date the market/cooperative physically received the lot from the seller.
   *  Usually === auctionDate for fresh latex, but may differ for sheet rubber. */
  receivedDate?: string;
  /** Dry Rubber Content percentage (0–100). Most relevant for น้ำยางสด (latex). */
  drc?: number;
}

export type TradingType = 'auction' | 'negotiated' | 'bid-ask' | 'forward';

/** Finance-officer workflow phases (linear pipeline).
 *  1 = Inbox — receive + verify contract data
 *  2 = QC — quality check (pass → 3, fail → loops back here)
 *  3 = Payment — invoice, payment method, director approval
 *  4 = Done — report sent, archived */
export type WorkflowPhase = 1 | 2 | 3 | 4;

/** QC outcome — `pending` means awaiting officer decision in Phase 2. */
export type QcResult = 'pending' | 'pass' | 'fail';

/** Who currently has approval authority for Phase 3.
 *  Default is `director`; finance officer can delegate to deputy or finance_head
 *  when the director is unavailable. */
export type ApproverRole = 'director' | 'deputy_director' | 'finance_head';

export interface Contract {
  id: string;
  contractNo: string;
  buyer: string;
  seller: string;
  rubberType: string;
  weight: number;
  price: number;
  totalAmount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  dueDate: string;
  /** How this contract was concluded — shown as a column on the payment list */
  tradingType: TradingType;
  // ─── Finance workflow ─────────────────────────────────────────────────
  workflowPhase?: WorkflowPhase;
  qcResult?:      QcResult;
  qcNote?:        string;
  qcCheckedAt?:   string;
  qcCheckedBy?:   string;
  /** Payment method chosen during Phase 3 (transfer | cash). */
  paymentMethod?: 'transfer' | 'cash';
  /** Who is responsible for approving this contract in Phase 3.
   *  Defaults to director — can be delegated. */
  approverRole?:  ApproverRole;
  /** True once the assigned approver has signed off. */
  directorApproved?: boolean;
  approvedAt?:    string;
  approvedBy?:    string;
}

export interface PaymentRecord {
  id: string;
  contractNo: string;
  amount: number;
  method: 'transfer' | 'cash' | 'qr';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  proof?: string;
}

export interface DeliveryRequest {
  id: string;
  contractNo: string;
  appointmentDate: string;
  receiverName: string;
  vehiclePlate: string;
  province: string;
  weight: number;
  status: 'pending' | 'approved' | 'completed';
  pin?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'auction' | 'payment' | 'delivery' | 'document' | 'system';
  read: boolean;
  createdAt: string;
}
