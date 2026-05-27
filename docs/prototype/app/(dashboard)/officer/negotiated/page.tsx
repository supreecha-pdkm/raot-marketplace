'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Tag, Button, Form, InputNumber, Select,
  Modal, Input, Row, Col, Alert, Avatar, Typography, Divider, Descriptions, Space, Checkbox, App, Tabs, DatePicker,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import {
  SwapOutlined, PlusOutlined, UserOutlined, CheckCircleOutlined,
  SafetyCertificateOutlined, EnvironmentOutlined,
  FileTextOutlined, CalendarOutlined, ClockCircleOutlined, SolutionOutlined,
  TeamOutlined, InfoCircleOutlined, UsergroupAddOutlined,
  PrinterOutlined, HistoryOutlined,
  EyeOutlined, ClearOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'waiting_seller' | 'seller_approved' | 'matched' | 'completed';

interface Buyer {
  id: string;
  name: string;
  code: string;          // buyer code
  company?: string;
  phone: string;
}

interface NegotiatedOrder {
  id: string;
  buyerId: string;                // which buyer the order is ON BEHALF OF
  rubberType: string;
  quantity: number;
  targetPrice: number;
  status: OrderStatus;
  createdAt: string;
  sellerCount: number;
  note?: string;
  allowUnlimited?: boolean;
  createdByStaff: string;         // name of the staff who submitted
}

interface SellerOffer {
  id: string;
  name: string;
  farmName: string;
  province: string;
  offeredPrice: number;
  availableWeight: number;
  isEudr: boolean;
  rating: number;
  deliveryDays: number;
  forestStatus: 'ไม่บุกรุก' | 'อยู่ระหว่างตรวจสอบ';
  unlimited?: boolean;
  /** Marks sellers that the staff manually pulled in (not from the order's offered list). */
  invited?: boolean;
}

/** Full seller profile — shown in the "ดูข้อมูลผู้ขาย" sub-modal. */
interface SellerProfile {
  id:        string;
  name:      string;
  nationalId: string;
  farmName:  string;
  province:  string;
  address:   string;
  phone:     string;
  email?:    string;
  joinedAt:  string;
  rating:    number;
  totalSold: number;        // kg sold via the platform total
  isEudr:    boolean;
  forestStatus: 'ไม่บุกรุก' | 'อยู่ระหว่างตรวจสอบ';
}

// ─── Mock buyers ──────────────────────────────────────────────────────────────
const BUYERS: Buyer[] = [
  { id: 'U001', code: 'B-001', name: 'นายสมชาย ใจดี',         company: 'บริษัท กรีนรับเบอร์ จำกัด',  phone: '0812345678' },
  { id: 'U011', code: 'B-002', name: 'นางสาวพรทิพย์ รุ่งเรือง', company: 'หจก.รุ่งเรืองยางพารา',        phone: '0891112222' },
  { id: 'U012', code: 'B-003', name: 'นายธนาคาร ซื้อดี',         company: 'บริษัท สยามยาง อินเตอร์',    phone: '0843334444' },
  { id: 'U013', code: 'B-004', name: 'นายวีระชัย พาณิชย์',       company: 'บริษัท เอเชียรับเบอร์ จำกัด', phone: '0865556666' },
  { id: 'U014', code: 'B-005', name: 'บจก.ไทยแลนด์รับเบอร์',    phone: '0877778888' },
];

// ─── Mock orders (placed on behalf of buyers) ────────────────────────────────
const MOCK_ORDERS: NegotiatedOrder[] = [
  { id: 'SN001', buyerId: 'U001', rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 5000, targetPrice: 70.00, status: 'pending',   createdAt: '2024-04-17', sellerCount: 3, note: 'ต้องการ EUDR certified เท่านั้น', allowUnlimited: true, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่' },
  { id: 'SN002', buyerId: 'U011', rubberType: 'น้ำยางสด',           quantity: 8000, targetPrice: 52.00, status: 'matched',   createdAt: '2024-04-16', sellerCount: 1, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่' },
  { id: 'SN003', buyerId: 'U012', rubberType: 'ยางก้อนถ้วย CL',     quantity: 3000, targetPrice: 45.50, status: 'pending',   createdAt: '2024-04-15', sellerCount: 4, note: 'ต้องการส่งภายใน 3 วัน', allowUnlimited: true, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่' },
  { id: 'SN004', buyerId: 'U013', rubberType: 'ยางแผ่นดิบ USS3',    quantity: 2000, targetPrice: 62.00, status: 'completed', createdAt: '2024-04-14', sellerCount: 2, createdByStaff: 'นายวิศวะ หน้างาน' },
];

// ─── History (completed transactions) — read-only seed for the history tab ──
const HISTORY_ORDERS: NegotiatedOrder[] = [
  { id: 'SN-H001', buyerId: 'U001', rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 4500, targetPrice: 68.00, status: 'completed', createdAt: '2024-04-10', sellerCount: 2, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่' },
  { id: 'SN-H002', buyerId: 'U012', rubberType: 'น้ำยางสด',          quantity: 6200, targetPrice: 51.00, status: 'completed', createdAt: '2024-04-08', sellerCount: 3, createdByStaff: 'นายวิศวะ หน้างาน',     note: 'ตามสัญญา Q2' },
  { id: 'SN-H003', buyerId: 'U013', rubberType: 'ยางก้อนถ้วย CL',    quantity: 2800, targetPrice: 44.50, status: 'completed', createdAt: '2024-04-05', sellerCount: 1, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่' },
  { id: 'SN-H004', buyerId: 'U014', rubberType: 'ยางแผ่นดิบ USS3',    quantity: 1500, targetPrice: 60.50, status: 'completed', createdAt: '2024-04-02', sellerCount: 2, createdByStaff: 'นายวิศวะ หน้างาน' },
  { id: 'SN-H005', buyerId: 'U011', rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 3200, targetPrice: 67.50, status: 'completed', createdAt: '2024-03-28', sellerCount: 1, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่' },
  { id: 'SN-H006', buyerId: 'U001', rubberType: 'น้ำยางสด',          quantity: 9500, targetPrice: 53.00, status: 'completed', createdAt: '2024-03-22', sellerCount: 4, createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่', note: 'รวม 4 ผู้ขาย' },
];

const MOCK_SELLER_OFFERS: Record<string, SellerOffer[]> = {
  SN001: [
    { id: 'S01', name: 'นายสมศักดิ์ เกษตรกร',  farmName: 'สวนยางท่าสะท้อน', province: 'สุราษฎร์ธานี', offeredPrice: 69.50, availableWeight: 5200, isEudr: true,  rating: 5, deliveryDays: 2, forestStatus: 'ไม่บุกรุก' },
    { id: 'S02', name: 'นายมานี รักสวน',        farmName: 'สวนยางชุมพร',      province: 'ชุมพร',         offeredPrice: 70.00, availableWeight: 4800, isEudr: true,  rating: 4, deliveryDays: 3, forestStatus: 'ไม่บุกรุก' },
    { id: 'S03', name: 'นางสาวสุดา ไร่ยาง',     farmName: 'ไร่ยางพัทลุง',     province: 'พัทลุง',        offeredPrice: 68.00, availableWeight: 0,    isEudr: false, rating: 3, deliveryDays: 5, forestStatus: 'อยู่ระหว่างตรวจสอบ', unlimited: true },
  ],
  SN002: [
    { id: 'S08', name: 'สหกรณ์ยางพาราสุราษฎร์', farmName: 'สหกรณ์สุราษฎร์',  province: 'สุราษฎร์ธานี', offeredPrice: 52.00, availableWeight: 8500, isEudr: false, rating: 5, deliveryDays: 1, forestStatus: 'ไม่บุกรุก' },
  ],
  SN003: [
    { id: 'S04', name: 'นายธนาคาร ชาวสวน',      farmName: 'สวนยางระนอง',      province: 'ระนอง',         offeredPrice: 45.00, availableWeight: 3200, isEudr: false, rating: 4, deliveryDays: 4, forestStatus: 'ไม่บุกรุก' },
    { id: 'S05', name: 'นายวิชัย ยางนา',         farmName: 'สวนยางตรัง',       province: 'ตรัง',          offeredPrice: 45.50, availableWeight: 3000, isEudr: false, rating: 5, deliveryDays: 2, forestStatus: 'ไม่บุกรุก' },
    { id: 'S06', name: 'นางประนอม เกษตรดี',      farmName: 'สวนยางกระบี่',     province: 'กระบี่',        offeredPrice: 44.00, availableWeight: 4000, isEudr: false, rating: 3, deliveryDays: 6, forestStatus: 'ไม่บุกรุก' },
    { id: 'S07', name: 'สหกรณ์ยางพาราสงขลา',    farmName: 'สหกรณ์สงขลา',     province: 'สงขลา',         offeredPrice: 46.00, availableWeight: 0,    isEudr: false, rating: 5, deliveryDays: 1, forestStatus: 'ไม่บุกรุก', unlimited: true },
  ],
  SN004: [
    { id: 'S09', name: 'นายสมชาย ยางดี',        farmName: 'สวนยางนครศรีธรรมราช', province: 'นครศรีธรรมราช', offeredPrice: 62.00, availableWeight: 2100, isEudr: true, rating: 4, deliveryDays: 3, forestStatus: 'ไม่บุกรุก' },
    { id: 'S10', name: 'นายประสิทธิ์ ไร่ยาง',   farmName: 'สวนยางสงขลา',      province: 'สงขลา',         offeredPrice: 61.50, availableWeight: 2000, isEudr: true,  rating: 3, deliveryDays: 4, forestStatus: 'ไม่บุกรุก' },
  ],
};

// ─── Seller registry (all known sellers in the system) ──────────────────────
// Staff can pick from this full list when the offered set isn't enough.
const SELLER_REGISTRY: SellerProfile[] = [
  // Sellers who have already submitted offers in MOCK_SELLER_OFFERS
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
  // Sellers NOT in any offered list — staff can invite them via the "เพิ่มผู้ขายอื่น" picker
  { id: 'S11', name: 'นายเกรียงไกร ยางเขียว',  nationalId: '1920900123456', farmName: 'สวนยางยะลา',      province: 'ยะลา',          address: '5/2 หมู่ 4 ต.สะเตง อ.เมือง',           phone: '0912345678',                            joinedAt: '2022-08-15', rating: 4, totalSold: 67800,  isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S12', name: 'นางมะลิ สวนยาง',          nationalId: '1930011234567', farmName: 'สวนยางนราธิวาส',  province: 'นราธิวาส',       address: '32 หมู่ 1 ต.บางนาค อ.เมือง',          phone: '0923456789',                            joinedAt: '2023-12-01', rating: 4, totalSold: 24500,  isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S13', name: 'นายอำนวย ใจกล้า',         nationalId: '1940122345678', farmName: 'สวนยางพังงา',     province: 'พังงา',          address: '60/1 หมู่ 8 ต.โคกกลอย อ.ตะกั่วทุ่ง',    phone: '0934567890',                            joinedAt: '2021-07-20', rating: 5, totalSold: 134200, isEudr: true,  forestStatus: 'ไม่บุกรุก' },
  { id: 'S14', name: 'สหกรณ์ยางพาราภูเก็ต',     nationalId: '0993000345678', farmName: 'สหกรณ์ภูเก็ต',    province: 'ภูเก็ต',         address: '88 ถ.วิชิตสงคราม อ.เมือง',             phone: '0945678901', email: 'phuket@coop.th',  joinedAt: '2018-04-04', rating: 5, totalSold: 880000, isEudr: false, forestStatus: 'ไม่บุกรุก' },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { color: string; label: string; icon?: React.ReactNode }> = {
  pending:         { color: 'warning',    label: 'รอเสนอ' },
  waiting_seller:  { color: 'processing', label: 'รอผู้ขายยืนยัน', icon: <ClockCircleOutlined /> },
  seller_approved: { color: 'success',    label: 'ผู้ขายยืนยันแล้ว', icon: <CheckCircleOutlined /> },
  matched:         { color: 'success',    label: 'จับคู่แล้ว' },
  completed:       { color: 'default',    label: 'เสร็จสิ้น' },
};

// ─── Buyer pill ───────────────────────────────────────────────────────────────
function BuyerPill({ buyer }: { buyer: Buyer | undefined }) {
  if (!buyer) return <Text type="secondary">—</Text>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Avatar size={24} icon={<UserOutlined />} style={{ background: '#1677ff', flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.2 }}>{buyer.name}</div>
        <div style={{ fontSize: 11, color: '#8c8c8c', lineHeight: 1.2 }}>
          {buyer.code}{buyer.company ? ` · ${buyer.company}` : ''}
        </div>
      </div>
    </div>
  );
}

// ─── Seller card ──────────────────────────────────────────────────────────────
function SellerCard({ seller, selected, onSelect, detailHref }: {
  seller: SellerOffer;
  selected?: boolean;
  onSelect?: () => void;
  /** When set, renders a "ดูข้อมูลผู้ขาย" link that opens the seller detail page in a new tab. */
  detailHref?: string;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        border: `2px solid ${selected ? '#1a7c3e' : seller.invited ? '#1677ff55' : '#e8e8e8'}`,
        borderRadius: 10,
        padding: '14px 16px',
        background: selected ? '#f6ffed' : seller.invited ? '#f0f7ff' : '#fff',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'border-color 0.15s, background 0.15s',
        position: 'relative',
      }}
    >
      {selected && (
        <CheckCircleOutlined style={{ position: 'absolute', top: 10, right: 12, color: '#1a7c3e', fontSize: 18 }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <Avatar size={40} icon={<UserOutlined />} style={{ background: seller.invited ? '#1677ff' : '#1a7c3e', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{seller.name}</span>
            {seller.invited && (
              <Tag color="processing" style={{ margin: 0, fontSize: 10 }}>เชิญโดยเจ้าหน้าที่</Tag>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 1 }}>
            <EnvironmentOutlined style={{ marginRight: 3 }} />
            {seller.farmName} · {seller.province}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            {seller.isEudr && (
              <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                <SafetyCertificateOutlined style={{ marginRight: 2 }} />EUDR
              </Tag>
            )}
            <Tag color={seller.forestStatus === 'ไม่บุกรุก' ? 'success' : 'warning'} style={{ margin: 0, fontSize: 11 }}>
              {seller.forestStatus}
            </Tag>
            {!seller.invited && <Tag style={{ margin: 0, fontSize: 11 }}>ส่งใน {seller.deliveryDays} วัน</Tag>}
            {seller.unlimited && (
              <Tag color="gold" style={{ margin: 0, fontSize: 11 }}>ไม่จำกัดปริมาณ</Tag>
            )}
            {detailHref && (
              <Link
                href={detailHref}
                target="_blank"
                rel="noopener"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="small"
                  type="link"
                  icon={<InfoCircleOutlined />}
                  style={{ padding: '0 4px', height: 20, fontSize: 11 }}
                >
                  ดูข้อมูลผู้ขาย
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <Row gutter={8}>
        <Col span={12}>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาเสนอ</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: seller.invited ? '#bfbfbf' : '#1a7c3e' }}>
            {seller.invited
              ? <span style={{ fontSize: 12, fontWeight: 400 }}>รอเสนอ</span>
              : <>{seller.offeredPrice.toFixed(2)}<span style={{ fontSize: 11, fontWeight: 400 }}> ฿/กก.</span></>}
          </div>
        </Col>
        <Col span={12}>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>ปริมาณที่มี</div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {seller.unlimited
              ? <span style={{ color: '#d48806' }}>ไม่จำกัด</span>
              : <>{seller.availableWeight.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400 }}> กก.</span></>}
          </div>
        </Col>
      </Row>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StaffNegotiatedPage() {
  const { message } = App.useApp();
  // Runtime state
  const [orders,         setOrders]         = useState<NegotiatedOrder[]>(MOCK_ORDERS);
  const [orderStatuses,  setOrderStatuses]  = useState<Record<string, OrderStatus>>({});
  const [chosenSellers,  setChosenSellers]  = useState<Record<string, string[]>>({});

  // Modal open states
  const [createOpen,  setCreateOpen]  = useState(false);
  const [selectOpen,  setSelectOpen]  = useState(false);
  const [activeOrder, setActiveOrder] = useState<NegotiatedOrder | null>(null);

  // Select seller flow
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [confirmed,       setConfirmed]       = useState(false);
  // Sellers manually invited per order (extra to whoever already submitted offers)
  const [invitedSellers, setInvitedSellers] = useState<Record<string, string[]>>({});


  // Filter
  const [filterBuyer, setFilterBuyer] = useState<string>('all');

  const [form] = Form.useForm();

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatus = (order: NegotiatedOrder): OrderStatus =>
    orderStatuses[order.id] ?? order.status;

  const getBuyer = (buyerId: string): Buyer | undefined =>
    BUYERS.find(b => b.id === buyerId);

  // The full pool of sellers for an order = the original offered list + any
  // sellers staff has invited from the registry. Invited sellers are
  // synthesized as SellerOffer records (no committed price/qty yet).
  const getOrderSellerPool = (orderId: string): SellerOffer[] => {
    const offered = MOCK_SELLER_OFFERS[orderId] ?? [];
    const invitedIds = invitedSellers[orderId] ?? [];
    const invited: SellerOffer[] = [];
    for (const id of invitedIds) {
      if (offered.some((o) => o.id === id)) continue;
      const p = SELLER_REGISTRY.find((s) => s.id === id);
      if (!p) continue;
      // Invited sellers always carry a number for "available quantity" so
      // the column never shows "—". The mock value scales loosely with the
      // seller's totalSold history (smaller cap so it stays realistic).
      const mockAvailable = Math.max(500, Math.min(8000, Math.round(p.totalSold * 0.05)));
      invited.push({
        id:              p.id,
        name:            p.name,
        farmName:        p.farmName,
        province:        p.province,
        offeredPrice:    0,
        availableWeight: mockAvailable,
        isEudr:          p.isEudr,
        rating:          p.rating,
        deliveryDays:    0,
        forestStatus:    p.forestStatus,
        unlimited:       false,
        invited:         true,
      });
    }
    return [...offered, ...invited];
  };

  const getChosenSellers = (orderId: string): SellerOffer[] => {
    const ids  = chosenSellers[orderId] ?? [];
    const pool = getOrderSellerPool(orderId);
    return ids.map(id => pool.find(s => s.id === id)).filter((s): s is SellerOffer => !!s);
  };

  const toggleSeller = (sellerId: string) => {
    setSelectedSellers(prev =>
      prev.includes(sellerId) ? prev.filter(id => id !== sellerId) : [...prev, sellerId]
    );
  };

  const inviteSeller = (orderId: string, sellerId: string) => {
    setInvitedSellers(prev => {
      const cur = prev[orderId] ?? [];
      if (cur.includes(sellerId)) return prev;
      return { ...prev, [orderId]: [...cur, sellerId] };
    });
    // Auto-select the just-invited seller for convenience
    setSelectedSellers(prev => prev.includes(sellerId) ? prev : [...prev, sellerId]);
    const p = SELLER_REGISTRY.find((s) => s.id === sellerId);
    if (p) message.success(`เพิ่ม ${p.name} เข้ารายการแล้ว`);
  };

  // ── Modal openers ──────────────────────────────────────────────────────────
  const openSelectSeller = (order: NegotiatedOrder, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveOrder(order);
    setSelectedSellers([]);
    setConfirmed(false);
    setSelectOpen(true);
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleSubmitCreate = (values: {
    buyerId: string;
    rubberType: string;
    quantity: number;
    price: number;
    note?: string;
    allowUnlimited?: boolean;
  }) => {
    const newOrder: NegotiatedOrder = {
      id: `SN${String(orders.length + 1).padStart(3, '0')}`,
      buyerId:        values.buyerId,
      rubberType:     values.rubberType,
      quantity:       values.quantity,
      targetPrice:    values.price,
      status:         'pending',
      createdAt:      new Date().toISOString().slice(0, 10),
      sellerCount:    0,
      note:           values.note,
      allowUnlimited: values.allowUnlimited,
      createdByStaff: 'นางสาวรัตนา เจ้าหน้าที่',
    };
    setOrders(prev => [newOrder, ...prev]);
    const buyer = getBuyer(values.buyerId);
    message.success(`แจ้งความต้องการแทน ${buyer?.name ?? ''} แล้ว`);
    form.resetFields();
    setCreateOpen(false);
  };

  const handleConfirmSeller = async () => {
    if (!activeOrder || selectedSellers.length === 0) return;
    await new Promise(r => setTimeout(r, 600));
    setChosenSellers(prev => ({ ...prev, [activeOrder.id]: selectedSellers }));
    // Sellers auto-confirm — go straight to seller_approved (no waiting_seller stop).
    setOrderStatuses(prev => ({ ...prev, [activeOrder.id]: 'seller_approved' }));
    setConfirmed(true);
    setTimeout(() => setSelectOpen(false), 1800);
  };

  // Buyer-side confirmation, recorded by staff on the buyer's behalf.
  // Once both seller_approved + buyer_confirmed, status flips to 'matched'.
  const handleBuyerConfirm = (order: NegotiatedOrder, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOrderStatuses(prev => ({ ...prev, [order.id]: 'matched' }));
    const buyer = getBuyer(order.buyerId);
    message.success(`ยืนยันแทน ${buyer?.name ?? 'ผู้ซื้อ'} แล้ว — พร้อมพิมพ์สัญญา`);
  };

  // Print contract — opens a contract preview modal with a print button.
  const [printOrder, setPrintOrder] = useState<NegotiatedOrder | null>(null);
  const handleOpenPrint = (order: NegotiatedOrder, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPrintOrder(order);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const sellers = activeOrder ? getOrderSellerPool(activeOrder.id) : [];
  const selectedSellerOffers = sellers.filter(s => selectedSellers.includes(s.id));
  const hasUnlimitedSelected = selectedSellerOffers.some(s => s.unlimited);
  const selectedTotalWeight  = selectedSellerOffers.reduce((sum, s) => sum + (s.unlimited ? 0 : s.availableWeight), 0);

  // Sellers in the registry that are NOT yet in the pool — candidates to invite.
  const availableToInvite = activeOrder
    ? SELLER_REGISTRY.filter((p) => !sellers.some((s) => s.id === p.id))
    : [];

  // ── Filtered orders ────────────────────────────────────────────────────────
  const filteredOrders = filterBuyer === 'all'
    ? orders
    : orders.filter(o => o.buyerId === filterBuyer);

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'เลขที่',
      dataIndex: 'id',
      render: (v: string) => <span style={{ fontWeight: 600, color: '#1a7c3e' }}>{v}</span>,
      width: 90,
    },
    {
      title: 'ผู้ซื้อ (ที่ทำแทน)',
      dataIndex: 'buyerId',
      render: (v: string) => <BuyerPill buyer={getBuyer(v)} />,
      width: 240,
    },
    {
      title: 'ชนิดยาง',
      dataIndex: 'rubberType',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: 'ปริมาณ (กก.)',
      dataIndex: 'quantity',
      render: (v: number) => v.toLocaleString(),
      align: 'right' as const,
    },
    {
      title: 'ราคาเป้าหมาย',
      dataIndex: 'targetPrice',
      render: (v: number) => <span style={{ fontWeight: 600, color: '#1a7c3e' }}>{v.toFixed(2)} ฿/กก.</span>,
      align: 'right' as const,
    },
    {
      title: 'ผู้ขายเสนอ',
      dataIndex: 'sellerCount',
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: v > 0 ? '#1a7c3e' : '#8c8c8c' }}>{v} ราย</span>
      ),
      align: 'center' as const,
    },
    {
      title: 'วันที่แจ้ง',
      dataIndex: 'createdAt',
      render: (v: string) => <span style={{ fontSize: 12, color: '#8c8c8c' }}>{v}</span>,
    },
    {
      title: 'สถานะ',
      render: (r: NegotiatedOrder) => {
        const status = getStatus(r);
        const cfg = STATUS_CONFIG[status];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'การดำเนินการ',
      render: (r: NegotiatedOrder) => {
        const status = getStatus(r);
        if (status === 'pending') {
          return (
            <Button size="small" type="primary" icon={<UserOutlined />} onClick={(e) => openSelectSeller(r, e)}>
              เลือกผู้ขาย
            </Button>
          );
        }
        if (status === 'seller_approved') {
          return (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={(e) => handleBuyerConfirm(r, e)}
              style={{ background: '#1677ff', borderColor: '#1677ff' }}
            >
              ผู้ซื้อยืนยัน
            </Button>
          );
        }
        if (status === 'matched') {
          return (
            <Button
              size="small"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={(e) => handleOpenPrint(r, e)}
              style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
            >
              พิมพ์สัญญา
            </Button>
          );
        }
        // Legacy waiting_seller (in case any seed/imported data still uses it)
        if (status === 'waiting_seller') {
          return (
            <Tag icon={<ClockCircleOutlined />} color="processing" style={{ margin: 0 }}>
              รอผู้ขาย
            </Tag>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <Alert
        type="info"
        showIcon
        icon={<SolutionOutlined />}
        title="เจรจาต่อรอง (แทนผู้ซื้อ)"
        description="เจ้าหน้าที่สามารถแจ้งความต้องการซื้อแทนผู้ซื้อที่ลงทะเบียนไว้ในระบบ โดยกรอกข้อมูลเหมือนที่ผู้ซื้อกรอกเอง พร้อมเลือกผู้ซื้อที่จะทำรายการแทน"
      />

      {/* ── Orders + history tabs ─────────────────────────────────────────── */}
      <Tabs
        defaultActiveKey="active"
        items={[
          {
            key: 'active',
            label: (
              <Space size={6}>
                <SwapOutlined />
                <span>รายการปัจจุบัน</span>
                <Tag color="blue" style={{ margin: 0 }}>{orders.length}</Tag>
              </Space>
            ),
            children: (
              <Card
                title={
                  <span>
                    <SwapOutlined style={{ marginRight: 8 }} />
                    รายการเจรจาต่อรอง (แทนผู้ซื้อ)
                  </span>
                }
                extra={
                  <Space>
                    <Select
                      value={filterBuyer}
                      onChange={setFilterBuyer}
                      style={{ width: 220 }}
                      size="middle"
                      suffixIcon={<TeamOutlined />}
                    >
                      <Option value="all">ทุกผู้ซื้อ</Option>
                      {BUYERS.map(b => (
                        <Option key={b.id} value={b.id}>
                          {b.code} · {b.name}
                        </Option>
                      ))}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                      แจ้งความต้องการแทนผู้ซื้อ
                    </Button>
                  </Space>
                }
              >
                <Table
                  dataSource={filteredOrders}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content' }}
                />
              </Card>
            ),
          },
          {
            key: 'history',
            label: (
              <Space size={6}>
                <HistoryOutlined />
                <span>ประวัติการทำรายการ</span>
                <Tag color="default" style={{ margin: 0 }}>{HISTORY_ORDERS.length}</Tag>
              </Space>
            ),
            children: <HistoryTab buyers={BUYERS} statusConfig={STATUS_CONFIG} />,
          },
        ]}
      />

      {/* ── Create order modal ────────────────────────────────────────────── */}
      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        title={
          <span>
            <PlusOutlined style={{ marginRight: 8 }} />
            แจ้งความต้องการซื้อ (แทนผู้ซื้อ)
          </span>
        }
        okText="ส่งคำขอ"
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitCreate}
          style={{ marginTop: 16 }}
          initialValues={{ allowUnlimited: false }}
        >
          {/* Buyer selector — staff-only field */}
          <Form.Item
            label={<span>ผู้ซื้อที่ทำรายการแทน <Text type="danger">*</Text></span>}
            name="buyerId"
            rules={[{ required: true, message: 'กรุณาเลือกผู้ซื้อ' }]}
            extra="เลือกผู้ซื้อที่ลงทะเบียนในระบบ — คำขอนี้จะถูกบันทึกภายใต้ชื่อผู้ซื้อที่เลือก"
          >
            <Select
              placeholder="ค้นหา/เลือกผู้ซื้อ"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={BUYERS.map(b => ({
                value: b.id,
                label: `${b.code} · ${b.name}${b.company ? ` (${b.company})` : ''} · ${b.phone}`,
              }))}
            />
          </Form.Item>

          <Divider style={{ margin: '8px 0 16px' }} />

          {/* Same fields as buyer's own form */}
          <Form.Item label="ชนิดยาง" name="rubberType" rules={[{ required: true, message: 'กรุณาเลือกชนิดยาง' }]}>
            <Select placeholder="เลือกชนิดยาง">
              {['ยางแผ่นรมควัน RSS3', 'น้ำยางสด', 'ยางก้อนถ้วย CL', 'ยางแผ่นดิบ USS3'].map(t => (
                <Option key={t} value={t}>{t}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="ปริมาณ (กก.)" name="quantity" rules={[{ required: true, message: 'กรุณาระบุปริมาณ' }]}>
                <InputNumberSuffix style={{ width: '100%' }} min={100} step={100} suffix="กก." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="ราคาเป้าหมาย" name="price" rules={[{ required: true, message: 'กรุณาระบุราคา' }]}>
                <InputNumberSuffix style={{ width: '100%' }} step={0.5} precision={2} suffix="฿/กก." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea rows={2} placeholder="ระบุเงื่อนไขเพิ่มเติม เช่น ต้องการ EUDR, ระยะเวลาส่ง..." />
          </Form.Item>

          <Form.Item name="allowUnlimited" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>
              <span style={{ fontWeight: 500 }}>อนุญาตให้ผู้ขายเสนอแบบไม่จำกัดปริมาณ</span>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginLeft: 24 }}>
                ผู้ขายสามารถติ๊กว่าพร้อมขายในปริมาณไม่จำกัด (เหมาะกับสหกรณ์/โรงงาน)
              </div>
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Select seller — large centered Modal (80% of viewport) ────────── */}
      <Modal
        open={selectOpen}
        onCancel={() => setSelectOpen(false)}
        footer={null}
        closable={false}
        // 80% of viewport, centered top-and-bottom — gives breathing room
        // around the modal instead of the previous edge-to-edge full-screen.
        width="80vw"
        style={{ top: '10vh', padding: 0, maxWidth: '80vw' }}
        styles={{
          mask:    { background: '#0f3d22cc' },
          header:  { padding: '14px 24px', borderBottom: '1px solid #f0f0f0', margin: 0 },
          body:    { padding: 0, height: 'calc(80vh - 60px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Space>
              <UserOutlined style={{ color: '#1a7c3e', fontSize: 18 }} />
              <span style={{ fontSize: 16 }}>เลือกผู้ขาย — {activeOrder?.rubberType}</span>
              {activeOrder && (
                <Tag color="blue" style={{ margin: 0 }}>
                  ผู้ซื้อ: {getBuyer(activeOrder.buyerId)?.name ?? '—'}
                </Tag>
              )}
            </Space>
            <Button onClick={() => setSelectOpen(false)}>ปิด</Button>
          </div>
        }
      >
        {confirmed ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a' }} />
            <div style={{ marginTop: 20, fontSize: 22, fontWeight: 700, color: '#1a7c3e' }}>ผู้ขายยืนยันรายการแล้ว!</div>
            <div style={{ marginTop: 10, color: '#595959', fontSize: 14 }}>
              <strong>{selectedSellerOffers.map(s => s.name).join(', ')}</strong> ตอบรับเรียบร้อย
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              ขั้นตอนถัดไป: เจ้าหน้าที่กดปุ่ม &ldquo;ผู้ซื้อยืนยัน&rdquo; เพื่อยืนยันแทนผู้ซื้อ
            </div>
          </div>
        ) : (
          <>
            {/* Order summary strip */}
            <div style={{ background: '#f6ffed', borderBottom: '1px solid #b7eb8f', padding: '12px 24px', display: 'flex', gap: 32, flexWrap: 'wrap', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>ต้องการ</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{activeOrder?.quantity.toLocaleString()} กก.</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาเป้าหมาย</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a7c3e' }}>{activeOrder?.targetPrice.toFixed(2)} ฿/กก.</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>ผู้ขายในรายการ</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{sellers.length} ราย</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>เลือกแล้ว</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1677ff' }}>{selectedSellers.length} ราย</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>ปริมาณรวม</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: hasUnlimitedSelected ? '#d48806' : '#1677ff' }}>
                  {hasUnlimitedSelected
                    ? <>{selectedTotalWeight.toLocaleString()} กก. + ไม่จำกัด</>
                    : <>{selectedTotalWeight.toLocaleString()} กก.</>}
                </div>
              </div>
            </div>

            {/* Full order detail — same content as the row-detail modal so
                staff has full context while choosing sellers. */}
            {activeOrder && (() => {
              const buyer = getBuyer(activeOrder.buyerId);
              return (
                <div style={{ padding: '12px 24px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                  <Descriptions
                    bordered
                    size="small"
                    column={{ xs: 1, sm: 2, md: 3 }}
                    title={
                      <Space size={6}>
                        <FileTextOutlined style={{ color: '#1a7c3e' }} />
                        <span style={{ fontSize: 13 }}>รายละเอียดคำขอ — {activeOrder.id}</span>
                      </Space>
                    }
                    items={[
                      {
                        label: 'ผู้ซื้อที่ทำแทน',
                        children: buyer ? (
                          <span style={{ fontWeight: 500 }}>
                            {buyer.name}
                            <span style={{ color: '#8c8c8c', fontWeight: 400, marginLeft: 6 }}>
                              · {buyer.code}{buyer.company ? ` · ${buyer.company}` : ''}
                            </span>
                          </span>
                        ) : '—',
                        span: 3,
                      },
                      { label: 'ผู้ทำรายการ',  children: <Text>{activeOrder.createdByStaff}</Text> },
                      { label: 'ชนิดยาง',     children: <span style={{ fontWeight: 500 }}>{activeOrder.rubberType}</span> },
                      { label: 'วันที่แจ้ง',   children: <span><CalendarOutlined style={{ marginRight: 4 }} />{activeOrder.createdAt}</span> },
                      ...(activeOrder.allowUnlimited ? [{
                        label: 'เงื่อนไขพิเศษ',
                        children: <Tag color="gold" style={{ margin: 0 }}>อนุญาตผู้ขายเสนอแบบไม่จำกัดปริมาณ</Tag>,
                        span: 3 as const,
                      }] : []),
                      ...(activeOrder.note ? [{
                        label: 'หมายเหตุ',
                        children: <Text type="secondary">{activeOrder.note}</Text>,
                        span: 3 as const,
                      }] : []),
                    ]}
                  />
                </div>
              );
            })()}

            {/* Invite picker — pull more sellers from the registry */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
              <UsergroupAddOutlined style={{ color: '#1a7c3e', fontSize: 16 }} />
              <Text strong style={{ fontSize: 13 }}>เพิ่มผู้ขายอื่น (นอกเหนือจากผู้ที่ยื่นมา)</Text>
              <Select
                showSearch
                placeholder="พิมพ์ชื่อ / ทะเบียน / จังหวัด"
                style={{ minWidth: 360, flex: 1, maxWidth: 600 }}
                optionFilterProp="searchText"
                value={undefined}
                onChange={(id) => { if (activeOrder && id) inviteSeller(activeOrder.id, id); }}
                options={availableToInvite.map((p) => ({
                  value: p.id,
                  searchText: `${p.name} ${p.farmName} ${p.province} ${p.nationalId}`,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar size={22} icon={<UserOutlined />} style={{ background: '#1677ff', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          {p.farmName} · {p.province}
                          {p.isEudr && <Tag color="green" style={{ marginLeft: 6, fontSize: 10 }}>EUDR</Tag>}
                        </div>
                      </div>
                    </div>
                  ),
                }))}
                notFoundContent={availableToInvite.length === 0 ? 'ไม่มีผู้ขายเพิ่มเติมในระบบ' : 'ไม่พบ'}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                เลือกแล้วจะถูกเพิ่มเป็น &ldquo;เชิญโดยเจ้าหน้าที่&rdquo; ในรายการ
              </Text>
            </div>

            {/* Warnings */}
            {activeOrder && selectedSellers.length > 0 && !hasUnlimitedSelected && selectedTotalWeight < activeOrder.quantity && (
              <Alert
                type="warning" showIcon style={{ margin: '12px 24px 0' }}
                title={`ปริมาณจากผู้ขายที่เลือกยังน้อยกว่าที่ต้องการ (ขาด ${(activeOrder.quantity - selectedTotalWeight).toLocaleString()} กก.)`}
              />
            )}

            {/* Seller cards */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {sellers.length === 0 ? (
                <Alert type="info" showIcon title="ยังไม่มีผู้ขายในรายการนี้ — ใช้ตัวเลือกด้านบนเพื่อเพิ่มผู้ขาย" />
              ) : (
                <Row gutter={[12, 12]}>
                  {sellers.map(seller => (
                    <Col xs={24} md={12} xl={8} key={seller.id}>
                      <SellerCard
                        seller={seller}
                        selected={selectedSellers.includes(seller.id)}
                        onSelect={() => toggleSeller(seller.id)}
                        detailHref={`/officer/sellers/${seller.id}`}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <Button onClick={() => setSelectOpen(false)}>ยกเลิก</Button>
              <Button
                type="primary"
                disabled={selectedSellers.length === 0}
                icon={<CheckCircleOutlined />}
                onClick={handleConfirmSeller}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              >
                ยืนยันเลือกผู้ขาย ({selectedSellers.length})
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Print contract modal ──────────────────────────────────────────── */}
      <Modal
        open={!!printOrder}
        onCancel={() => setPrintOrder(null)}
        title={
          <span>
            <PrinterOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />
            สัญญาซื้อขายยางพารา (เจรจาต่อรอง) — {printOrder?.id}
          </span>
        }
        footer={
          <Space>
            <Button onClick={() => setPrintOrder(null)}>ปิด</Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
            >
              พิมพ์สัญญา
            </Button>
          </Space>
        }
        width={720}
        destroyOnHidden
      >
        {printOrder && (() => {
          const buyer = getBuyer(printOrder.buyerId);
          const chosen = getChosenSellers(printOrder.id);
          const totalKg = chosen.reduce((s, x) => s + (x.unlimited ? 0 : x.availableWeight), 0);
          const estValue = totalKg * printOrder.targetPrice;
          return (
            <div id="contract-print-area" style={{ paddingTop: 8, color: '#1a1a2e' }}>
              {/* Heading */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0f3d22' }}>
                  สัญญาซื้อขายยางพารา (เจรจาต่อรอง)
                </div>
                <div style={{ fontSize: 13, color: '#595959', marginTop: 4 }}>
                  เลขที่สัญญา <Text strong>{printOrder.id}</Text>
                  {' '} · ลงวันที่ {printOrder.createdAt}
                </div>
              </div>

              {/* Parties */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1677ff', marginBottom: 8 }}>
                    ผู้ซื้อ
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <div><Text strong>{buyer?.name ?? '—'}</Text></div>
                    {buyer?.company && <div>{buyer.company}</div>}
                    <div style={{ color: '#595959' }}>รหัสผู้ซื้อ: {buyer?.code}</div>
                    <div style={{ color: '#595959' }}>โทร: {buyer?.phone}</div>
                  </div>
                </div>
                <div style={{ flex: 1, border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1a7c3e', marginBottom: 8 }}>
                    ผู้ขาย
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    {chosen.length === 0
                      ? <Text type="secondary">—</Text>
                      : chosen.map(s => (
                          <div key={s.id} style={{ marginBottom: 6 }}>
                            <Text strong>{s.name}</Text>
                            <div style={{ color: '#595959', fontSize: 12 }}>
                              {s.farmName} · {s.province}
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              </div>

              {/* Order details */}
              <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>รายละเอียดการซื้อขาย</div>
                <Descriptions size="small" column={{ xs: 1, sm: 2 }} colon>
                  <Descriptions.Item label="ชนิดยาง"><Text strong>{printOrder.rubberType}</Text></Descriptions.Item>
                  <Descriptions.Item label="ปริมาณรวม">
                    <Text strong>{totalKg.toLocaleString()}</Text> กก.
                  </Descriptions.Item>
                  <Descriptions.Item label="ราคาต่อ กก.">
                    <Text strong style={{ color: '#1a7c3e' }}>{printOrder.targetPrice.toFixed(2)}</Text> ฿/กก.
                  </Descriptions.Item>
                  <Descriptions.Item label="มูลค่าโดยประมาณ">
                    <Text strong style={{ color: '#fa8c16' }}>
                      {estValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Text> ฿
                  </Descriptions.Item>
                  {printOrder.note && (
                    <Descriptions.Item label="หมายเหตุ" span={2}>{printOrder.note}</Descriptions.Item>
                  )}
                </Descriptions>
              </div>

              {/* Terms (boilerplate) */}
              <div style={{ fontSize: 12, color: '#595959', lineHeight: 1.7, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: '#1a1a2e' }}>เงื่อนไขการซื้อขาย</div>
                <div>1. ผู้ขายตกลงส่งมอบยางตามจำนวน คุณภาพ และระยะเวลาที่ระบุไว้</div>
                <div>2. ผู้ซื้อตกลงชำระเงินตามราคาและวิธีการที่กำหนด ภายใน 7 วันหลังการส่งมอบ</div>
                <div>3. คู่สัญญาทั้งสองฝ่ายได้อ่านและเข้าใจเงื่อนไขข้างต้น และตกลงยินยอมตามนั้น</div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #1a1a2e', marginBottom: 6, height: 50 }}></div>
                  <div style={{ fontSize: 12 }}>ลงนาม ผู้ซื้อ</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{buyer?.name}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #1a1a2e', marginBottom: 6, height: 50 }}></div>
                  <div style={{ fontSize: 12 }}>ลงนาม ผู้ขาย</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{chosen.map(s => s.name).join(' / ') || '—'}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #1a1a2e', marginBottom: 6, height: 50 }}></div>
                  <div style={{ fontSize: 12 }}>เจ้าหน้าที่</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{printOrder.createdByStaff}</div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

// ─── History tab ────────────────────────────────────────────────────────────
// Read-only history of completed negotiated orders. Filters: status, buyer,
// rubber type, date range. Each row links to a new tab with the detail page.

const { RangePicker } = DatePicker;

function HistoryTab({
  buyers,
  statusConfig,
}: {
  buyers: Buyer[];
  statusConfig: Record<OrderStatus, { color: string; label: string; icon?: React.ReactNode }>;
}) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [buyerFilter,  setBuyerFilter]  = useState<string>('all');
  const [rubberFilter, setRubberFilter] = useState<string>('all');
  const [dateRange,    setDateRange]    = useState<[Dayjs, Dayjs] | null>(null);

  const buyerById = useMemo(
    () => Object.fromEntries(buyers.map(b => [b.id, b])),
    [buyers],
  );

  const rubberTypes = useMemo(
    () => Array.from(new Set(HISTORY_ORDERS.map(o => o.rubberType))),
    [],
  );

  const filtered = useMemo(() => {
    return HISTORY_ORDERS.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (buyerFilter  !== 'all' && o.buyerId    !== buyerFilter) return false;
      if (rubberFilter !== 'all' && o.rubberType !== rubberFilter) return false;
      if (dateRange) {
        const d = dayjs(o.createdAt);
        if (d.isBefore(dateRange[0], 'day') || d.isAfter(dateRange[1], 'day')) return false;
      }
      return true;
    });
  }, [statusFilter, buyerFilter, rubberFilter, dateRange]);

  function clearFilters() {
    setStatusFilter('all');
    setBuyerFilter('all');
    setRubberFilter('all');
    setDateRange(null);
  }

  const cols = [
    { title: 'เลขที่', dataIndex: 'id', width: 100, render: (v: string) => <span style={{ fontWeight: 600, color: '#1a7c3e' }}>{v}</span> },
    {
      title: 'ผู้ซื้อ',
      dataIndex: 'buyerId',
      width: 220,
      render: (v: string) => {
        const b = buyerById[v];
        if (!b) return <Text type="secondary">—</Text>;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={24} icon={<UserOutlined />} style={{ background: '#1677ff', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.2 }}>{b.name}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c', lineHeight: 1.2 }}>{b.code}</div>
            </div>
          </div>
        );
      },
    },
    { title: 'ชนิดยาง',  dataIndex: 'rubberType',  render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: 'ปริมาณ',   dataIndex: 'quantity',    align: 'right' as const, render: (v: number) => `${v.toLocaleString()} กก.` },
    { title: 'ราคา',     dataIndex: 'targetPrice', align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 600, color: '#1a7c3e' }}>{v.toFixed(2)} ฿/กก.</span> },
    { title: 'มูลค่า',    align: 'right' as const,
      render: (r: NegotiatedOrder) => <Text strong style={{ color: '#fa8c16' }}>{(r.quantity * r.targetPrice).toLocaleString()} ฿</Text>,
    },
    { title: 'ผู้ขาย', dataIndex: 'sellerCount', width: 90, align: 'center' as const, render: (v: number) => `${v} ราย` },
    { title: 'วันที่',  dataIndex: 'createdAt', width: 110, render: (v: string) => <span style={{ fontSize: 12 }}>{v}</span> },
    {
      title: 'สถานะ',
      width: 110,
      render: (r: NegotiatedOrder) => {
        const cfg = statusConfig[r.status];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'ดำเนินการ',
      width: 130,
      align: 'center' as const,
      render: (r: NegotiatedOrder) => (
        <Link href={`/officer/negotiated/${r.id}`} target="_blank" rel="noopener">
          <Button size="small" icon={<EyeOutlined />}>ดูรายละเอียด</Button>
        </Link>
      ),
    },
  ];

  const totalValue = filtered.reduce((s, o) => s + o.quantity * o.targetPrice, 0);

  return (
    <Card
      title={
        <Space>
          <HistoryOutlined style={{ color: '#1a7c3e' }} />
          <span>ประวัติการทำรายการ</span>
          <Tag color="blue" style={{ margin: 0 }}>{filtered.length} / {HISTORY_ORDERS.length} รายการ</Tag>
          {filtered.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
              · มูลค่ารวม {totalValue.toLocaleString()} ฿
            </Text>
          )}
        </Space>
      }
    >
      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>กรอง:</Text>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
          size="middle"
          options={[
            { value: 'all',             label: 'ทุกสถานะ' },
            { value: 'completed',       label: 'เสร็จสิ้น' },
            { value: 'matched',         label: 'จับคู่แล้ว' },
            { value: 'seller_approved', label: 'ผู้ขายยืนยัน' },
            { value: 'pending',         label: 'รอเสนอ' },
          ]}
        />
        <Select
          value={buyerFilter}
          onChange={setBuyerFilter}
          style={{ width: 220 }}
          size="middle"
          showSearch
          optionFilterProp="label"
          options={[
            { value: 'all', label: 'ทุกผู้ซื้อ' },
            ...buyers.map(b => ({ value: b.id, label: `${b.code} · ${b.name}` })),
          ]}
        />
        <Select
          value={rubberFilter}
          onChange={setRubberFilter}
          style={{ width: 200 }}
          size="middle"
          options={[
            { value: 'all', label: 'ทุกชนิดยาง' },
            ...rubberTypes.map(t => ({ value: t, label: t })),
          ]}
        />
        <RangePicker
          value={dateRange ?? undefined}
          onChange={(v) => setDateRange(v && v[0] && v[1] ? [v[0], v[1]] : null)}
          format="DD/MM/YYYY"
          style={{ width: 240 }}
          placeholder={['วันที่เริ่ม', 'วันที่สิ้นสุด']}
        />
        <Button size="middle" icon={<ClearOutlined />} onClick={clearFilters}>
          ล้างตัวกรอง
        </Button>
      </div>

      <Table
        dataSource={filtered}
        columns={cols}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: false }}
        size="small"
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: 'ไม่พบรายการประวัติตามตัวกรอง' }}
      />

      <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block', marginTop: 8 }}>
        คลิก &ldquo;ดูรายละเอียด&rdquo; เพื่อเปิดหน้ารายละเอียดในแท็บใหม่
      </Text>
    </Card>
  );
}
