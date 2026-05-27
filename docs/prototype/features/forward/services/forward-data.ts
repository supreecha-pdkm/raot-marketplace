// ─── Shared types + mock data for buyer/forward list page and detail page ────

export type RoundStatus    = 'bidding' | 'collecting' | 'contracting';
export type BidStatus      = 'winner' | 'pending' | 'lost';
export type AllocationMode = 'all' | 'cut';

export interface ContractDetail {
  contractNo: string;
  sellerName: string;
  quantity: number;
  price: number;
  totalValue: number;
  deliveryDate: string;
}

export interface SellerSubmission {
  id: string;
  sellerName: string;
  offeredWeight: number;
  submittedAt: string;
  /** populated once staff has allocated and issued contracts */
  allocatedWeight?: number;
}

export interface MyBid {
  rubberType: string;
  bidWeight: number;
  offerPrice: number;
  bidStatus: BidStatus;
  submittedAt: string;
  contracts?: ContractDetail[];
  /** buyer's allocation choice when sellers offered more than requested */
  allocationChoice?: AllocationMode;
}

export interface ForwardRound {
  roundId: string;
  topic: string;
  sellerCollectedWeight: number;
  /** list of individual sellers who submitted to this round */
  sellerSubmissions?: SellerSubmission[];
  /** when buyer bidding becomes available (datetime string "YYYY-MM-DD HH:mm") */
  biddingOpensAt?: string;
  bidDeadline: string;
  deliveryDate?: string;
  /** smallest weight a buyer can bid (kg) */
  minBuyerWeight?: number;
  /** smallest price a buyer can offer (฿/kg) */
  minBuyerPrice?: number;
  roundStatus: RoundStatus;
  remark?: string;
  myBid?: MyBid;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_ROUNDS: ForwardRound[] = [
  // Open — buyer HAS bid
  {
    roundId: 'FWD-001',
    topic: 'รับซื้อยางแผ่นรมควัน Q2/2569',
    sellerCollectedWeight: 0,
    biddingOpensAt: '2026-04-18 08:00',
    bidDeadline:    '2026-04-22 17:00',
    minBuyerWeight: 1000,
    minBuyerPrice:  60.00,
    roundStatus: 'bidding',
    remark: 'รอบทดสอบ Q2/2569',
    myBid: {
      rubberType: 'ยางแผ่นรมควัน RSS3',
      bidWeight: 2000,
      offerPrice: 68.50,
      bidStatus: 'pending',
      submittedAt: '2026-04-18 09:00',
    },
  },
  // Open — buyer HAS NOT bid (bidding opens in the FUTURE — used to demo "not open yet")
  {
    roundId: 'FWD-003',
    topic: 'รับซื้อยางก้อนถ้วย เดือนเมษายน',
    sellerCollectedWeight: 0,
    biddingOpensAt: '2099-12-31 09:00',
    bidDeadline:    '2099-12-31 17:00',
    minBuyerWeight: 500,
    minBuyerPrice:  35.00,
    roundStatus: 'bidding',
    remark: 'เปิดรับประมูลในอนาคต — ปุ่มเสนอราคายังถูกปิด',
    myBid: undefined,
  },
  // Collecting — buyer won; sellers actively submitting
  {
    roundId: 'FWD-002',
    topic: 'รับซื้อน้ำยางสด ล็อตเดือนพฤษภาคม',
    sellerCollectedWeight: 5500,
    biddingOpensAt: '2026-04-15 09:00',
    bidDeadline:    '2026-04-17 17:00',
    deliveryDate:   '2026-05-20',
    minBuyerWeight: 2000,
    minBuyerPrice:  35.00,
    roundStatus: 'collecting',
    sellerSubmissions: [
      { id: 's-002-1', sellerName: 'อนันต์ ศรีสะอาด',  offeredWeight: 3000, submittedAt: '2026-04-17 09:00' },
      { id: 's-002-2', sellerName: 'วิภา ทองคำ',        offeredWeight: 2500, submittedAt: '2026-04-17 10:30' },
    ],
    myBid: {
      rubberType: 'น้ำยางสด',
      bidWeight: 8000,
      offerPrice: 42.00,
      bidStatus: 'winner',
      submittedAt: '2026-04-16 08:00',
    },
  },
  // Contracting — buyer won + has contracts
  {
    roundId: 'FWD-H001',
    topic: 'รับซื้อยางก้อนถ้วยรอบแรกปี 2569',
    sellerCollectedWeight: 9000,
    biddingOpensAt: '2026-04-08 08:00',
    bidDeadline:    '2026-04-10 17:00',
    deliveryDate:   '2026-05-30',
    minBuyerWeight: 2000,
    minBuyerPrice:  35.00,
    roundStatus: 'contracting',
    sellerSubmissions: [
      { id: 's-H001-1', sellerName: 'ประสิทธิ์ ยางงาม', offeredWeight: 4000, submittedAt: '2026-04-11 08:30', allocatedWeight: 4000 },
      { id: 's-H001-2', sellerName: 'รัตนา สวนยาง',      offeredWeight: 3000, submittedAt: '2026-04-11 09:00', allocatedWeight: 3000 },
      { id: 's-H001-3', sellerName: 'ชาญชัย ไร่ยาง',     offeredWeight: 2000, submittedAt: '2026-04-11 10:00', allocatedWeight: 2000 },
    ],
    myBid: {
      rubberType: 'ยางก้อนถ้วย',
      bidWeight: 9000,
      offerPrice: 37.50,
      bidStatus: 'winner',
      submittedAt: '2026-04-09 09:00',
      contracts: [
        { contractNo: 'FC-20260530-001', sellerName: 'ประสิทธิ์ ยางงาม', quantity: 4000, price: 37.50, totalValue: 150000, deliveryDate: '2026-05-30' },
        { contractNo: 'FC-20260530-002', sellerName: 'รัตนา สวนยาง',      quantity: 3000, price: 37.50, totalValue: 112500, deliveryDate: '2026-05-30' },
        { contractNo: 'FC-20260530-003', sellerName: 'ชาญชัย ไร่ยาง',     quantity: 2000, price: 37.50, totalValue: 75000,  deliveryDate: '2026-05-30' },
      ],
    },
  },
  // Contracting — buyer won, sellers offered MORE than requested, buyer has not decided
  {
    roundId: 'FWD-005',
    topic: 'รับซื้อยางแผ่นรมควัน ล็อตพิเศษ',
    sellerCollectedWeight: 7500,   // > bidWeight (5000) → excess of 2500 kg
    biddingOpensAt: '2026-04-09 09:00',
    bidDeadline:    '2026-04-12 17:00',
    deliveryDate:   '2026-05-25',
    minBuyerWeight: 1000,
    minBuyerPrice:  60.00,
    roundStatus: 'contracting',
    sellerSubmissions: [
      { id: 's-005-1', sellerName: 'เชิดชัย สวนยาง',  offeredWeight: 3000, submittedAt: '2026-04-13 09:00' },
      { id: 's-005-2', sellerName: 'สมหมาย ยางดี',     offeredWeight: 2500, submittedAt: '2026-04-13 09:30' },
      { id: 's-005-3', sellerName: 'นิรันดร์ ยางทอง',  offeredWeight: 2000, submittedAt: '2026-04-13 10:00' },
    ],
    myBid: {
      rubberType: 'ยางแผ่นรมควัน RSS3',
      bidWeight: 5000,
      offerPrice: 70.00,
      bidStatus: 'winner',
      submittedAt: '2026-04-11 10:00',
      // allocationChoice undefined on purpose — buyer needs to pick
    },
  },
  // Contracting — buyer lost
  {
    roundId: 'FWD-H002',
    topic: 'รับซื้อ RSS3 มีนาคม 2569',
    sellerCollectedWeight: 6000,
    biddingOpensAt: '2026-03-23 09:00',
    bidDeadline:    '2026-03-25 17:00',
    deliveryDate:   '2026-05-10',
    minBuyerWeight: 1500,
    minBuyerPrice:  65.00,
    roundStatus: 'contracting',
    sellerSubmissions: [
      { id: 's-H002-1', sellerName: 'สมศักดิ์ ไร่ยางทอง', offeredWeight: 3500, submittedAt: '2026-03-26 09:00', allocatedWeight: 3500 },
      { id: 's-H002-2', sellerName: 'นิภา สวนยางสุข',      offeredWeight: 2500, submittedAt: '2026-03-26 10:00', allocatedWeight: 2500 },
    ],
    myBid: {
      rubberType: 'ยางแผ่นรมควัน RSS3',
      bidWeight: 3000,
      offerPrice: 69.00,
      bidStatus: 'lost',
      submittedAt: '2026-03-24 11:00',
    },
  },
];
