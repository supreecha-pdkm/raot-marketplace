// Shared seed data for the staff/negotiated flow + its [id] detail route.
// Pure data only — no React, no client hooks — so any page can import it.

export type OrderStatus = 'pending' | 'waiting_seller' | 'seller_approved' | 'matched' | 'completed';

export interface Buyer {
  id: string;
  name: string;
  code: string;
  company?: string;
  phone: string;
}

export interface NegotiatedOrder {
  id:             string;
  buyerId:        string;
  rubberType:     string;
  quantity:       number;
  targetPrice:    number;
  status:         OrderStatus;
  createdAt:      string;
  sellerCount:    number;
  note?:          string;
  allowUnlimited?: boolean;
  createdByStaff: string;
}

export interface SellerOffer {
  id:              string;
  name:            string;
  farmName:        string;
  province:        string;
  offeredPrice:    number;
  availableWeight: number;
  isEudr:          boolean;
  rating:          number;
  deliveryDays:    number;
  forestStatus:    'ไม่บุกรุก' | 'อยู่ระหว่างตรวจสอบ';
  unlimited?:      boolean;
}

/** Full seller profile — used by the seller-detail page. */
export interface SellerProfile {
  id:           string;
  name:         string;
  nationalId:   string;
  farmName:     string;
  province:     string;
  address:      string;
  phone:        string;
  email?:       string;
  joinedAt:     string;
  rating:       number;
  totalSold:    number;
  isEudr:       boolean;
  forestStatus: 'ไม่บุกรุก' | 'อยู่ระหว่างตรวจสอบ';
}

export const SELLER_REGISTRY: SellerProfile[] = [
  { id: 'S01', name: 'นายสมศักดิ์ เกษตรกร', nationalId: '1840100012345', farmName: 'สวนยางท่าสะท้อน', province: 'สุราษฎร์ธานี', address: '123/4 หมู่ 5 ต.ท่าสะท้อน อ.พุนพิน', phone: '0812345678', email: 'somsak@example.com', joinedAt: '2022-03-15', rating: 5, totalSold: 124500, isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S02', name: 'นายมานี รักสวน',        nationalId: '1850203456789', farmName: 'สวนยางชุมพร',     province: 'ชุมพร',         address: '88 หมู่ 2 ต.บางมะพร้าว อ.หลังสวน', phone: '0823456789',                            joinedAt: '2023-01-20', rating: 4, totalSold: 78200,  isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S03', name: 'นางสาวสุดา ไร่ยาง',     nationalId: '1860304567890', farmName: 'ไร่ยางพัทลุง',   province: 'พัทลุง',        address: '12 หมู่ 3 ต.คูหาสวรรค์ อ.เมือง',    phone: '0834567890',                            joinedAt: '2023-06-10', rating: 3, totalSold: 32100,  isEudr: false, forestStatus: 'อยู่ระหว่างตรวจสอบ' },
  { id: 'S04', name: 'นายธนาคาร ชาวสวน',      nationalId: '1870405678901', farmName: 'สวนยางระนอง',    province: 'ระนอง',         address: '45 หมู่ 1 ต.บางริ้น อ.เมือง',         phone: '0845678901',                            joinedAt: '2023-08-22', rating: 4, totalSold: 56700,  isEudr: false, forestStatus: 'ไม่บุกรุก' },
  { id: 'S05', name: 'นายวิชัย ยางนา',         nationalId: '1880506789012', farmName: 'สวนยางตรัง',      province: 'ตรัง',          address: '7/8 หมู่ 4 ต.ทับเที่ยง อ.เมือง',      phone: '0856789012',                            joinedAt: '2022-11-30', rating: 5, totalSold: 98400,  isEudr: false, forestStatus: 'ไม่บุกรุก' },
  { id: 'S06', name: 'นางประนอม เกษตรดี',     nationalId: '1890607890123', farmName: 'สวนยางกระบี่',    province: 'กระบี่',        address: '99 หมู่ 6 ต.อ่าวลึกใต้ อ.อ่าวลึก',     phone: '0867890123',                            joinedAt: '2024-01-12', rating: 3, totalSold: 18900,  isEudr: false, forestStatus: 'ไม่บุกรุก' },
  { id: 'S07', name: 'สหกรณ์ยางพาราสงขลา',   nationalId: '0993000123456', farmName: 'สหกรณ์สงขลา',    province: 'สงขลา',         address: '111/1 ถ.ราษฎร์ยินดี อ.หาดใหญ่',      phone: '0878901234', email: 'songkhla@coop.th', joinedAt: '2020-05-05', rating: 5, totalSold: 540000, isEudr: false, forestStatus: 'ไม่บุกรุก' },
  { id: 'S08', name: 'สหกรณ์ยางพาราสุราษฎร์', nationalId: '0993000234567', farmName: 'สหกรณ์สุราษฎร์', province: 'สุราษฎร์ธานี', address: '22 ถ.ตลาดใหม่ อ.เมือง',                phone: '0889012345', email: 'surat@coop.th',     joinedAt: '2019-09-09', rating: 5, totalSold: 720000, isEudr: false, forestStatus: 'ไม่บุกรุก' },
  { id: 'S09', name: 'นายสมชาย ยางดี',         nationalId: '1900708901234', farmName: 'สวนยางนครศรีธรรมราช', province: 'นครศรีธรรมราช', address: '50 หมู่ 7 ต.ปากนคร อ.เมือง', phone: '0890123456',                            joinedAt: '2023-04-18', rating: 4, totalSold: 45200,  isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S10', name: 'นายประสิทธิ์ ไร่ยาง',    nationalId: '1910809012345', farmName: 'สวนยางสงขลา',     province: 'สงขลา',         address: '14 หมู่ 9 ต.คลองอู่ตะเภา อ.หาดใหญ่',  phone: '0901234567',                            joinedAt: '2024-02-05', rating: 3, totalSold: 12300,  isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S11', name: 'นายเกรียงไกร ยางเขียว',  nationalId: '1920900123456', farmName: 'สวนยางยะลา',      province: 'ยะลา',          address: '5/2 หมู่ 4 ต.สะเตง อ.เมือง',           phone: '0912345678',                            joinedAt: '2022-08-15', rating: 4, totalSold: 67800,  isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S12', name: 'นางมะลิ สวนยาง',          nationalId: '1930011234567', farmName: 'สวนยางนราธิวาส',  province: 'นราธิวาส',       address: '32 หมู่ 1 ต.บางนาค อ.เมือง',          phone: '0923456789',                            joinedAt: '2023-12-01', rating: 4, totalSold: 24500,  isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S13', name: 'นายอำนวย ใจกล้า',         nationalId: '1940122345678', farmName: 'สวนยางพังงา',     province: 'พังงา',          address: '60/1 หมู่ 8 ต.โคกกลอย อ.ตะกั่วทุ่ง',    phone: '0934567890',                            joinedAt: '2021-07-20', rating: 5, totalSold: 134200, isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S14', name: 'สหกรณ์ยางพาราภูเก็ต',     nationalId: '0993000345678', farmName: 'สหกรณ์ภูเก็ต',    province: 'ภูเก็ต',         address: '88 ถ.วิชิตสงคราม อ.เมือง',             phone: '0945678901', email: 'phuket@coop.th',  joinedAt: '2018-04-04', rating: 5, totalSold: 880000, isEudr: false, forestStatus: 'ไม่บุกรุก' },
];

export function getSellerProfile(id: string): SellerProfile | undefined {
  return SELLER_REGISTRY.find(s => s.id === id);
}

export const BUYERS: Buyer[] = [
  { id: 'U001', code: 'B-001', name: 'นายสมชาย ใจดี',         company: 'บริษัท กรีนรับเบอร์ จำกัด',  phone: '0812345678' },
  { id: 'U011', code: 'B-002', name: 'นางสาวพรทิพย์ รุ่งเรือง', company: 'หจก.รุ่งเรืองยางพารา',        phone: '0891112222' },
  { id: 'U012', code: 'B-003', name: 'นายธนาคาร ซื้อดี',         company: 'บริษัท สยามยาง อินเตอร์',    phone: '0843334444' },
  { id: 'U013', code: 'B-004', name: 'นายวีระชัย พาณิชย์',       company: 'บริษัท เอเชียรับเบอร์ จำกัด', phone: '0865556666' },
  { id: 'U014', code: 'B-005', name: 'บจก.ไทยแลนด์รับเบอร์',    phone: '0877778888' },
];

export const HISTORY_ORDERS: NegotiatedOrder[] = [
  { id: 'SN-H001', buyerId: 'U001', rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 4500, targetPrice: 68.00, status: 'completed', createdAt: '2024-04-10', sellerCount: 2, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่' },
  { id: 'SN-H002', buyerId: 'U012', rubberType: 'น้ำยางสด',          quantity: 6200, targetPrice: 51.00, status: 'completed', createdAt: '2024-04-08', sellerCount: 3, createdByStaff: 'นายวิศวะ หน้างาน',     note: 'ตามสัญญา Q2' },
  { id: 'SN-H003', buyerId: 'U013', rubberType: 'ยางก้อนถ้วย CL',    quantity: 2800, targetPrice: 44.50, status: 'completed', createdAt: '2024-04-05', sellerCount: 1, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่' },
  { id: 'SN-H004', buyerId: 'U014', rubberType: 'ยางแผ่นดิบ USS3',    quantity: 1500, targetPrice: 60.50, status: 'completed', createdAt: '2024-04-02', sellerCount: 2, createdByStaff: 'นายวิศวะ หน้างาน' },
  { id: 'SN-H005', buyerId: 'U011', rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 3200, targetPrice: 67.50, status: 'completed', createdAt: '2024-03-28', sellerCount: 1, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่' },
  { id: 'SN-H006', buyerId: 'U001', rubberType: 'น้ำยางสด',          quantity: 9500, targetPrice: 53.00, status: 'completed', createdAt: '2024-03-22', sellerCount: 4, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่', note: 'รวม 4 ผู้ขาย' },
];

// History sellers — keyed by order id so the detail page can render the
// matched seller list.
export const HISTORY_SELLER_OFFERS: Record<string, SellerOffer[]> = {
  'SN-H001': [
    { id: 'S01', name: 'นายสมศักดิ์ เกษตรกร', farmName: 'สวนยางท่าสะท้อน', province: 'สุราษฎร์ธานี', offeredPrice: 68.00, availableWeight: 2500, isEudr: true,  rating: 5, deliveryDays: 2, forestStatus: 'ไม่บุกรุก' },
    { id: 'S02', name: 'นายมานี รักสวน',       farmName: 'สวนยางชุมพร',     province: 'ชุมพร',         offeredPrice: 68.00, availableWeight: 2000, isEudr: true,  rating: 4, deliveryDays: 3, forestStatus: 'ไม่บุกรุก' },
  ],
  'SN-H002': [
    { id: 'S08', name: 'สหกรณ์ยางพาราสุราษฎร์', farmName: 'สหกรณ์สุราษฎร์', province: 'สุราษฎร์ธานี', offeredPrice: 51.00, availableWeight: 4000, isEudr: false, rating: 5, deliveryDays: 1, forestStatus: 'ไม่บุกรุก' },
    { id: 'S04', name: 'นายธนาคาร ชาวสวน',     farmName: 'สวนยางระนอง',    province: 'ระนอง',         offeredPrice: 51.00, availableWeight: 1500, isEudr: false, rating: 4, deliveryDays: 4, forestStatus: 'ไม่บุกรุก' },
    { id: 'S05', name: 'นายวิชัย ยางนา',        farmName: 'สวนยางตรัง',     province: 'ตรัง',          offeredPrice: 50.50, availableWeight: 700,  isEudr: false, rating: 5, deliveryDays: 2, forestStatus: 'ไม่บุกรุก' },
  ],
  'SN-H003': [
    { id: 'S04', name: 'นายธนาคาร ชาวสวน',     farmName: 'สวนยางระนอง',    province: 'ระนอง',         offeredPrice: 44.50, availableWeight: 2800, isEudr: false, rating: 4, deliveryDays: 4, forestStatus: 'ไม่บุกรุก' },
  ],
  'SN-H004': [
    { id: 'S09', name: 'นายสมชาย ยางดี',       farmName: 'สวนยางนครศรีฯ',   province: 'นครศรีธรรมราช', offeredPrice: 60.50, availableWeight: 1000, isEudr: true,  rating: 4, deliveryDays: 3, forestStatus: 'ไม่บุกรุก' },
    { id: 'S10', name: 'นายประสิทธิ์ ไร่ยาง',  farmName: 'สวนยางสงขลา',    province: 'สงขลา',         offeredPrice: 60.00, availableWeight: 500,  isEudr: true,  rating: 3, deliveryDays: 4, forestStatus: 'ไม่บุกรุก' },
  ],
  'SN-H005': [
    { id: 'S01', name: 'นายสมศักดิ์ เกษตรกร', farmName: 'สวนยางท่าสะท้อน', province: 'สุราษฎร์ธานี', offeredPrice: 67.50, availableWeight: 3200, isEudr: true,  rating: 5, deliveryDays: 2, forestStatus: 'ไม่บุกรุก' },
  ],
  'SN-H006': [
    { id: 'S08', name: 'สหกรณ์ยางพาราสุราษฎร์', farmName: 'สหกรณ์สุราษฎร์', province: 'สุราษฎร์ธานี', offeredPrice: 53.00, availableWeight: 3500, isEudr: false, rating: 5, deliveryDays: 1, forestStatus: 'ไม่บุกรุก' },
    { id: 'S07', name: 'สหกรณ์ยางพาราสงขลา',  farmName: 'สหกรณ์สงขลา',    province: 'สงขลา',         offeredPrice: 53.00, availableWeight: 2500, isEudr: false, rating: 5, deliveryDays: 1, forestStatus: 'ไม่บุกรุก' },
    { id: 'S04', name: 'นายธนาคาร ชาวสวน',     farmName: 'สวนยางระนอง',    province: 'ระนอง',         offeredPrice: 53.00, availableWeight: 2000, isEudr: false, rating: 4, deliveryDays: 4, forestStatus: 'ไม่บุกรุก' },
    { id: 'S05', name: 'นายวิชัย ยางนา',        farmName: 'สวนยางตรัง',     province: 'ตรัง',          offeredPrice: 53.00, availableWeight: 1500, isEudr: false, rating: 5, deliveryDays: 2, forestStatus: 'ไม่บุกรุก' },
  ],
};

export function getOrderById(id: string): NegotiatedOrder | undefined {
  return HISTORY_ORDERS.find(o => o.id === id);
}
export function getBuyerById(id: string): Buyer | undefined {
  return BUYERS.find(b => b.id === id);
}
export function getOrderSellers(orderId: string): SellerOffer[] {
  return HISTORY_SELLER_OFFERS[orderId] ?? [];
}
