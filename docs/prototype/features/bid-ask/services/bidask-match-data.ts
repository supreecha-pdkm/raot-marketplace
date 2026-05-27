// ─── Shared types + mock for Bid/Ask matching flow ──────────────────────────
// Used by /buyer/bid-ask and /seller/bid-ask

export interface MatchParty {
  name: string;
  address: string;
  gps?: string;
}

export type MatchStage =
  | 'awaiting_match'          // neither party has confirmed
  | 'awaiting_counterparty'   // I confirmed, they haven't
  | 'contract_drafted'        // both matched — contract draft created
  | 'contract_signed'         // both signed — buyer must pay
  | 'paid';                   // done

export interface Match {
  id: string;
  rubberType: string;         // display label e.g. 'ยางแผ่นรมควัน RSS3'
  rubberKey: string;          // machine key e.g. 'RSS3'
  price: number;              // agreed price ฿/kg
  quantity: number;           // agreed quantity kg
  buyer: MatchParty;
  seller: MatchParty;

  // Stage 1: match confirmation (each party confirms once + proposes delivery date)
  buyerMatchedAt?: string;
  sellerMatchedAt?: string;
  deliveryDate?: string;      // set when the first party confirms

  // Stage 2: contract signing (both sign after draft)
  contractNo?: string;        // auto-generated when both matched
  buyerSignedAt?: string;
  sellerSignedAt?: string;

  // Stage 3: payment
  paidAt?: string;

  createdAt: string;
}

export type ViewerRole = 'buyer' | 'seller';

export function getMatchStage(m: Match): MatchStage {
  if (m.paidAt) return 'paid';
  if (m.buyerSignedAt && m.sellerSignedAt) return 'contract_signed';
  if (m.buyerMatchedAt && m.sellerMatchedAt) return 'contract_drafted';
  if (m.buyerMatchedAt || m.sellerMatchedAt) return 'awaiting_counterparty';
  return 'awaiting_match';
}

export const STAGE_CFG: Record<MatchStage, { label: string; color: string }> = {
  awaiting_match:        { label: 'รอทั้งสองฝ่ายยืนยัน',           color: 'default'    },
  awaiting_counterparty: { label: 'รออีกฝ่ายยืนยัน',                 color: 'processing' },
  contract_drafted:      { label: 'ร่างสัญญาแล้ว — รอลงนามทั้งสอง', color: 'warning'    },
  contract_signed:       { label: 'สัญญาสมบูรณ์ — รอชำระเงิน',       color: 'success'    },
  paid:                  { label: 'ชำระเงินแล้ว — เสร็จสิ้น',        color: 'default'    },
};

// ─── Universal mock matches — each page filters to matches involving "me" ──
// For the demo, buyer name === 'คุณ' on the buyer page, seller name === 'คุณ' on seller page.
// We seed 4 matches across both sides, each in a different stage.

export const MOCK_MATCHES: Match[] = [
  // 1) Fresh — neither confirmed. Buyer is "me" (buyer page sees this).
  {
    id: 'M-001',
    rubberType: 'ยางแผ่นรมควัน RSS3',
    rubberKey: 'RSS3',
    price: 70.50,
    quantity: 3000,
    buyer: {
      name: 'คุณ',
      address: '123 ถ.สุราษฎร์ อ.เมือง จ.สุราษฎร์ธานี 84000',
      gps: '9.1382,99.3215',
    },
    seller: {
      name: 'นายสมศักดิ์ เกษตรกร',
      address: 'สวนยางท่าสะท้อน — 45/2 หมู่ 6 ต.ท่าสะท้อน อ.พุนพิน จ.สุราษฎร์ธานี 84130',
      gps: '9.1021,99.2441',
    },
    createdAt: '2024-04-20T09:00:00',
  },

  // 2) I (buyer) confirmed — awaiting counterparty. Delivery date set.
  {
    id: 'M-002',
    rubberType: 'ยางก้อนถ้วย (CL)',
    rubberKey: 'CL',
    price: 45.75,
    quantity: 5000,
    buyer: {
      name: 'คุณ',
      address: '123 ถ.สุราษฎร์ อ.เมือง จ.สุราษฎร์ธานี 84000',
      gps: '9.1382,99.3215',
    },
    seller: {
      name: 'นายธนาคาร ชาวสวน',
      address: 'สวนยางระนอง — 77 หมู่ 1 ต.ราชกรูด อ.เมือง จ.ระนอง 85000',
      gps: '9.9552,98.6097',
    },
    buyerMatchedAt: '2024-04-21T10:30:00',
    deliveryDate: '2024-05-05',
    createdAt: '2024-04-20T14:00:00',
  },

  // 3) Both matched — contract drafted. Buyer is "me".
  {
    id: 'M-003',
    rubberType: 'น้ำยางสด',
    rubberKey: 'Latex',
    price: 52.25,
    quantity: 4000,
    buyer: {
      name: 'คุณ',
      address: '123 ถ.สุราษฎร์ อ.เมือง จ.สุราษฎร์ธานี 84000',
      gps: '9.1382,99.3215',
    },
    seller: {
      name: 'สหกรณ์ยางพาราสุราษฎร์',
      address: 'สหกรณ์ยางพาราสุราษฎร์ — 88 ถ.ดอนนก ต.มะขามเตี้ย อ.เมือง จ.สุราษฎร์ธานี 84000',
      gps: '9.1347,99.3298',
    },
    buyerMatchedAt: '2024-04-21T08:00:00',
    sellerMatchedAt: '2024-04-21T09:15:00',
    deliveryDate: '2024-05-02',
    contractNo: 'BA-20240421-003',
    createdAt: '2024-04-20T16:00:00',
  },

  // 4) Contract signed — buyer must pay. Buyer is "me".
  {
    id: 'M-004',
    rubberType: 'ยางแผ่นดิบ USS3',
    rubberKey: 'USS3',
    price: 63.00,
    quantity: 1500,
    buyer: {
      name: 'คุณ',
      address: '123 ถ.สุราษฎร์ อ.เมือง จ.สุราษฎร์ธานี 84000',
      gps: '9.1382,99.3215',
    },
    seller: {
      name: 'นายประสิทธิ์ ไร่ยาง',
      address: 'สวนยางสงขลา — 12/3 หมู่ 4 ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90110',
      gps: '7.0104,100.4762',
    },
    buyerMatchedAt: '2024-04-20T10:00:00',
    sellerMatchedAt: '2024-04-20T11:00:00',
    deliveryDate: '2024-04-29',
    contractNo: 'BA-20240420-004',
    buyerSignedAt: '2024-04-21T09:00:00',
    sellerSignedAt: '2024-04-21T10:00:00',
    createdAt: '2024-04-20T08:00:00',
  },

  // 5) Seller-side: seller is "me". Fresh match for seller page.
  {
    id: 'M-005',
    rubberType: 'ยางแผ่นรมควัน RSS3',
    rubberKey: 'RSS3',
    price: 71.00,
    quantity: 4000,
    buyer: {
      name: 'บ.ยางไทยพาณิชย์ จำกัด',
      address: 'โรงงาน บ.ยางไทยพาณิชย์ — 99 หมู่ 5 ถ.กาญจนวนิช ต.บ้านพรุ อ.หาดใหญ่ จ.สงขลา 90250',
      gps: '6.9713,100.4833',
    },
    seller: {
      name: 'คุณ',
      address: '55/2 หมู่ 3 ต.ท่าชนะ อ.ท่าชนะ จ.สุราษฎร์ธานี 84170',
      gps: '9.5437,99.1727',
    },
    createdAt: '2024-04-20T13:00:00',
  },

  // 6) Seller-side: I (seller) confirmed, awaiting buyer
  {
    id: 'M-006',
    rubberType: 'ยางก้อนถ้วย (CL)',
    rubberKey: 'CL',
    price: 46.00,
    quantity: 6300,
    buyer: {
      name: 'บ.สยามรับเบอร์ จำกัด',
      address: '33 ถ.ชนเกษม ต.มะขามเตี้ย อ.เมือง จ.สุราษฎร์ธานี 84000',
      gps: '9.1413,99.3290',
    },
    seller: {
      name: 'คุณ',
      address: '55/2 หมู่ 3 ต.ท่าชนะ อ.ท่าชนะ จ.สุราษฎร์ธานี 84170',
      gps: '9.5437,99.1727',
    },
    sellerMatchedAt: '2024-04-21T11:00:00',
    deliveryDate: '2024-05-06',
    createdAt: '2024-04-20T15:00:00',
  },

  // 7) Seller-side: contract signed, awaiting payment (seller view)
  {
    id: 'M-007',
    rubberType: 'น้ำยางสด',
    rubberKey: 'Latex',
    price: 53.00,
    quantity: 5000,
    buyer: {
      name: 'บ.น้ำยางสยาม จำกัด',
      address: '77/5 ถ.ประชาธิปไตย ต.เทพกระษัตรี อ.ถลาง จ.ภูเก็ต 83110',
      gps: '8.0167,98.3417',
    },
    seller: {
      name: 'คุณ',
      address: '55/2 หมู่ 3 ต.ท่าชนะ อ.ท่าชนะ จ.สุราษฎร์ธานี 84170',
      gps: '9.5437,99.1727',
    },
    buyerMatchedAt: '2024-04-19T10:00:00',
    sellerMatchedAt: '2024-04-19T11:00:00',
    deliveryDate: '2024-04-30',
    contractNo: 'BA-20240419-007',
    buyerSignedAt: '2024-04-20T09:00:00',
    sellerSignedAt: '2024-04-20T10:00:00',
    createdAt: '2024-04-19T09:00:00',
  },
];

/** Filter matches involving the viewer (where one party.name === "คุณ") */
export function myMatches(role: ViewerRole, all: Match[] = MOCK_MATCHES): Match[] {
  return all.filter(m => (role === 'buyer' ? m.buyer.name === 'คุณ' : m.seller.name === 'คุณ'));
}
