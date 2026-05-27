'use client';

import { useState } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Tag, Button, Form, Select,
  Modal, Input, Row, Col, Alert, Avatar, Typography, Divider, Descriptions, Badge, Space, Checkbox,
} from 'antd';
import { getSession } from '@/features/auth/services/auth';
import {
  SwapOutlined, PlusOutlined, UserOutlined, CheckCircleOutlined,
  SafetyCertificateOutlined, EnvironmentOutlined, StarOutlined,
  FileTextOutlined, CalendarOutlined, ClockCircleOutlined, DollarOutlined,
  AimOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { App as AntApp } from 'antd';
import { useRouter } from 'next/navigation';

const { Option } = Select;
const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'waiting_seller' | 'seller_approved' | 'matched' | 'completed';

interface NegotiatedOrder {
  id: string;
  rubberType: string;
  quantity: number;
  targetPrice: number;
  status: OrderStatus;
  createdAt: string;
  sellerCount: number;
  note?: string;
  allowUnlimited?: boolean;   // buyer allows sellers to offer unlimited weight
  /** Delivery / pickup address for the rubber — shown to sellers when they consider the order */
  deliveryAddress: string;
  /** Optional GPS coordinates "lat,lng" — auto-fill via navigator.geolocation */
  deliveryGps?: string;
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
  unlimited?: boolean;        // seller offers unlimited weight
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ORDERS: NegotiatedOrder[] = [
  {
    id: 'N001', rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 5000, targetPrice: 70.00,
    status: 'pending', createdAt: '2024-04-17', sellerCount: 3,
    note: 'ต้องการ EUDR certified เท่านั้น', allowUnlimited: true,
    deliveryAddress: 'โรงงาน บ.กรีนรับเบอร์ — 99 หมู่ 3 ถ.สุราษฎร์-พุนพิน ต.ท่าข้าม อ.พุนพิน จ.สุราษฎร์ธานี 84130',
    deliveryGps: '9.1297,99.2378',
  },
  {
    id: 'N002', rubberType: 'น้ำยางสด', quantity: 8000, targetPrice: 52.00,
    status: 'matched', createdAt: '2024-04-16', sellerCount: 1,
    deliveryAddress: 'โรงงานน้ำยางสด — 55/2 หมู่ 5 ต.บ้านนา อ.เมือง จ.นครศรีธรรมราช 80000',
    deliveryGps: '8.4304,99.9632',
  },
  {
    id: 'N003', rubberType: 'ยางก้อนถ้วย CL', quantity: 3000, targetPrice: 45.50,
    status: 'pending', createdAt: '2024-04-15', sellerCount: 4,
    note: 'ต้องการส่งภายใน 3 วัน', allowUnlimited: true,
    deliveryAddress: 'ตลาดกลางยางพาราสงขลา — 200 หมู่ 1 ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110',
    deliveryGps: '7.0104,100.4762',
  },
  {
    id: 'N004', rubberType: 'ยางแผ่นดิบ USS3', quantity: 2000, targetPrice: 62.00,
    status: 'completed', createdAt: '2024-04-14', sellerCount: 2,
    deliveryAddress: 'โกดังเก็บยางแผ่นดิบ — 12 ถ.เทศบาล 3 ต.ตลาด อ.เมือง จ.สุราษฎร์ธานี 84000',
    deliveryGps: '9.1382,99.3215',
  },
];

const MOCK_SELLER_OFFERS: Record<string, SellerOffer[]> = {
  N001: [
    { id: 'S01', name: 'นายสมศักดิ์ เกษตรกร',  farmName: 'สวนยางท่าสะท้อน', province: 'สุราษฎร์ธานี', offeredPrice: 69.50, availableWeight: 5200, isEudr: true,  rating: 5, deliveryDays: 2, forestStatus: 'ไม่บุกรุก' },
    { id: 'S02', name: 'นายมานี รักสวน',        farmName: 'สวนยางชุมพร',      province: 'ชุมพร',         offeredPrice: 70.00, availableWeight: 4800, isEudr: true,  rating: 4, deliveryDays: 3, forestStatus: 'ไม่บุกรุก' },
    { id: 'S03', name: 'นางสาวสุดา ไร่ยาง',     farmName: 'ไร่ยางพัทลุง',     province: 'พัทลุง',        offeredPrice: 68.00, availableWeight: 0,    isEudr: false, rating: 3, deliveryDays: 5, forestStatus: 'อยู่ระหว่างตรวจสอบ', unlimited: true },
  ],
  N002: [
    { id: 'S08', name: 'สหกรณ์ยางพาราสุราษฎร์', farmName: 'สหกรณ์สุราษฎร์',  province: 'สุราษฎร์ธานี', offeredPrice: 52.00, availableWeight: 8500, isEudr: false, rating: 5, deliveryDays: 1, forestStatus: 'ไม่บุกรุก' },
  ],
  N003: [
    { id: 'S04', name: 'นายธนาคาร ชาวสวน',      farmName: 'สวนยางระนอง',      province: 'ระนอง',         offeredPrice: 45.00, availableWeight: 3200, isEudr: false, rating: 4, deliveryDays: 4, forestStatus: 'ไม่บุกรุก' },
    { id: 'S05', name: 'นายวิชัย ยางนา',         farmName: 'สวนยางตรัง',       province: 'ตรัง',          offeredPrice: 45.50, availableWeight: 3000, isEudr: false, rating: 5, deliveryDays: 2, forestStatus: 'ไม่บุกรุก' },
    { id: 'S06', name: 'นางประนอม เกษตรดี',      farmName: 'สวนยางกระบี่',     province: 'กระบี่',        offeredPrice: 44.00, availableWeight: 4000, isEudr: false, rating: 3, deliveryDays: 6, forestStatus: 'ไม่บุกรุก' },
    { id: 'S07', name: 'สหกรณ์ยางพาราสงขลา',    farmName: 'สหกรณ์สงขลา',     province: 'สงขลา',         offeredPrice: 46.00, availableWeight: 0,    isEudr: false, rating: 5, deliveryDays: 1, forestStatus: 'ไม่บุกรุก', unlimited: true },
  ],
  N004: [
    { id: 'S09', name: 'นายสมชาย ยางดี',        farmName: 'สวนยางนครศรีธรรมราช', province: 'นครศรีธรรมราช', offeredPrice: 62.00, availableWeight: 2100, isEudr: true, rating: 4, deliveryDays: 3, forestStatus: 'ไม่บุกรุก' },
    { id: 'S10', name: 'นายประสิทธิ์ ไร่ยาง',   farmName: 'สวนยางสงขลา',      province: 'สงขลา',         offeredPrice: 61.50, availableWeight: 2000, isEudr: true,  rating: 3, deliveryDays: 4, forestStatus: 'ไม่บุกรุก' },
  ],
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { color: string; label: string; icon?: React.ReactNode }> = {
  pending:         { color: 'warning', label: 'รอเสนอ' },
  waiting_seller:  { color: 'processing', label: 'รอผู้ขายยืนยัน', icon: <ClockCircleOutlined /> },
  seller_approved: { color: 'success',    label: 'ผู้ขายยืนยันแล้ว', icon: <CheckCircleOutlined /> },
  matched:         { color: 'success', label: 'จับคู่แล้ว' },
  completed:       { color: 'default', label: 'เสร็จสิ้น' },
};

// ─── Seller card ──────────────────────────────────────────────────────────────
function SellerCard({ seller, selected, onSelect }: {
  seller: SellerOffer;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        border: `2px solid ${selected ? '#1a7c3e' : '#e8e8e8'}`,
        borderRadius: 10,
        padding: '14px 16px',
        background: selected ? '#f6ffed' : '#fff',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'border-color 0.15s, background 0.15s',
        position: 'relative',
      }}
    >
      {selected && (
        <CheckCircleOutlined style={{ position: 'absolute', top: 10, right: 12, color: '#1a7c3e', fontSize: 18 }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <Avatar size={40} icon={<UserOutlined />} style={{ background: '#1a7c3e', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{seller.name}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 1 }}>
            <EnvironmentOutlined style={{ marginRight: 3 }} />
            {seller.farmName} · {seller.province}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
            {seller.isEudr && (
              <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                <SafetyCertificateOutlined style={{ marginRight: 2 }} />EUDR
              </Tag>
            )}
            <Tag color={seller.forestStatus === 'ไม่บุกรุก' ? 'success' : 'warning'} style={{ margin: 0, fontSize: 11 }}>
              {seller.forestStatus}
            </Tag>
            <Tag style={{ margin: 0, fontSize: 11 }}>ส่งใน {seller.deliveryDays} วัน</Tag>
            {seller.unlimited && (
              <Tag color="gold" style={{ margin: 0, fontSize: 11 }}>ไม่จำกัดปริมาณ</Tag>
            )}
          </div>
        </div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <Row gutter={8}>
        <Col span={8}>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาเสนอ</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1a7c3e' }}>
            {seller.offeredPrice.toFixed(2)}<span style={{ fontSize: 11, fontWeight: 400 }}> ฿/กก.</span>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>ปริมาณที่มี</div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {seller.unlimited
              ? <span style={{ color: '#d48806' }}>ไม่จำกัด</span>
              : <>{seller.availableWeight.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400 }}> กก.</span></>}
          </div>
        </Col>
        <Col span={8}>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>คะแนน</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
            {Array.from({ length: seller.rating }).map((_, i) => (
              <StarOutlined key={i} style={{ fontSize: 11, color: '#faad14' }} />
            ))}
            {Array.from({ length: 5 - seller.rating }).map((_, i) => (
              <StarOutlined key={`e${i}`} style={{ fontSize: 11, color: '#e8e8e8' }} />
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NegotiatedPage() {
  const router = useRouter();
  const { message, modal } = AntApp.useApp();

  // Order list — held in state so the buyer can delete pending orders.
  const [orders, setOrders] = useState<NegotiatedOrder[]>(MOCK_ORDERS);

  // Per-order runtime state (status overrides + chosen sellers)
  const [orderStatuses, setOrderStatuses] = useState<Record<string, OrderStatus>>({});
  const [chosenSellers,  setChosenSellers]  = useState<Record<string, string[]>>({}); // orderId → sellerIds

  // Modal open states
  const [createOpen,  setCreateOpen]  = useState(false);
  const [detailOpen,  setDetailOpen]  = useState(false);
  const [selectOpen,  setSelectOpen]  = useState(false);
  const [activeOrder, setActiveOrder] = useState<NegotiatedOrder | null>(null);

  // Select seller modal state
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [confirmed,       setConfirmed]       = useState(false);

  const [form] = Form.useForm();

  // Open the create-order modal AND prefill the address field from profile.
  // Read session at click time (not at render time) so SSR doesn't lock an
  // empty value before localStorage is available.
  const openCreate = () => {
    const addr = getSession()?.user.address ?? '';
    form.setFieldsValue({ deliveryAddress: addr });
    setCreateOpen(true);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatus = (order: NegotiatedOrder): OrderStatus =>
    orderStatuses[order.id] ?? order.status;

  const getChosenSellers = (orderId: string): SellerOffer[] => {
    const ids = chosenSellers[orderId] ?? [];
    const offers = MOCK_SELLER_OFFERS[orderId] ?? [];
    return ids.map(id => offers.find(s => s.id === id)).filter((s): s is SellerOffer => !!s);
  };

  const toggleSeller = (sellerId: string) => {
    setSelectedSellers(prev =>
      prev.includes(sellerId) ? prev.filter(id => id !== sellerId) : [...prev, sellerId]
    );
  };

  // ── Modal openers ──────────────────────────────────────────────────────────
  const openDetail = (order: NegotiatedOrder) => {
    setActiveOrder(order);
    setDetailOpen(true);
  };

  const openSelectSeller = (order: NegotiatedOrder, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveOrder(order);
    setSelectedSellers([]);
    setConfirmed(false);
    setSelectOpen(true);
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleConfirmSeller = async () => {
    if (!activeOrder || selectedSellers.length === 0) return;
    await new Promise(r => setTimeout(r, 600));
    setChosenSellers(prev => ({ ...prev, [activeOrder.id]: selectedSellers }));
    setOrderStatuses(prev => ({ ...prev, [activeOrder.id]: 'waiting_seller' }));
    setConfirmed(true);
    setTimeout(() => setSelectOpen(false), 1800);
  };

  // Simulates the seller clicking "approve" on their side
  const handleSimulateSellerApprove = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderStatuses(prev => ({ ...prev, [orderId]: 'seller_approved' }));
  };

  // Delete a buyer request — blocked once the seller has approved (post-contract step).
  const handleDeleteOrder = (order: NegotiatedOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    const status = getStatus(order);
    if (status === 'seller_approved' || status === 'matched' || status === 'completed') {
      message.warning('ไม่สามารถลบรายการนี้ได้ — เข้าสู่ขั้นตอนทำสัญญา/ชำระเงินแล้ว');
      return;
    }
    modal.confirm({
      title: 'ลบคำขอซื้อ?',
      content: (
        <span>
          ต้องการลบคำขอ <Text strong>{order.id}</Text> ({order.rubberType}) หรือไม่?
        </span>
      ),
      okText: 'ลบ',
      okButtonProps: { danger: true },
      cancelText: 'ยกเลิก',
      onOk: () => {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setOrderStatuses(prev => {
          const next = { ...prev };
          delete next[order.id];
          return next;
        });
        setChosenSellers(prev => {
          const next = { ...prev };
          delete next[order.id];
          return next;
        });
        message.success('ลบคำขอแล้ว');
      },
    });
  };

  const handlePay = (order: NegotiatedOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    const chosen = getChosenSellers(order.id);
    const avgPrice = chosen.length > 0
      ? chosen.reduce((s, x) => s + x.offeredPrice, 0) / chosen.length
      : order.targetPrice;
    const amount = Math.round(avgPrice * order.quantity);
    const sellerNames = chosen.map(s => s.name).join(', ');
    router.push(
      `/buyer/payment?ref=${order.id}&lotNo=${order.id}&type=negotiated` +
      `&rubberType=${encodeURIComponent(order.rubberType)}` +
      `&quantity=${order.quantity}&price=${avgPrice.toFixed(2)}&amount=${amount}` +
      `&seller=${encodeURIComponent(sellerNames)}`
    );
  };

  const sellers = activeOrder ? (MOCK_SELLER_OFFERS[activeOrder.id] ?? []) : [];
  const selectedSellerOffers = sellers.filter(s => selectedSellers.includes(s.id));
  const hasUnlimitedSelected = selectedSellerOffers.some(s => s.unlimited);
  const selectedTotalWeight  = selectedSellerOffers.reduce((sum, s) => sum + (s.unlimited ? 0 : s.availableWeight), 0);

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'เลขที่',
      dataIndex: 'id',
      render: (v: string) => <span style={{ fontWeight: 600, color: '#1a7c3e' }}>{v}</span>,
      width: 80,
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
        return (
          <Tag color={cfg.color} icon={cfg.icon}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'การดำเนินการ',
      render: (r: NegotiatedOrder) => {
        const status = getStatus(r);
        const canDelete = status === 'pending' || status === 'waiting_seller';
        const deleteBtn = canDelete ? (
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => handleDeleteOrder(r, e)}
            title="ลบคำขอ"
          />
        ) : null;

        if (status === 'pending') {
          return (
            <Space size={6}>
              <Button size="small" type="primary" icon={<UserOutlined />} onClick={(e) => openSelectSeller(r, e)}>
                เลือกผู้ขาย
              </Button>
              {deleteBtn}
            </Space>
          );
        }
        if (status === 'waiting_seller') {
          return (
            <Space size={6}>
              <Tag icon={<ClockCircleOutlined />} color="processing" style={{ margin: 0 }}>รอผู้ขาย</Tag>
              {/* Demo button — simulates seller approving from their side */}
              <Button size="small" onClick={(e) => handleSimulateSellerApprove(r.id, e)}>
                [Demo] ผู้ขายอนุมัติ
              </Button>
              {deleteBtn}
            </Space>
          );
        }
        if (status === 'seller_approved') {
          return (
            <Button size="small" type="primary" icon={<DollarOutlined />} onClick={(e) => handlePay(r, e)}>
              ชำระเงิน
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Orders table ──────────────────────────────────────────────────── */}
      <Card
        title={<span><SwapOutlined style={{ marginRight: 8 }} />ตกลงราคา (Negotiated Price)</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            แจ้งความต้องการ
          </Button>
        }
      >
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({
            onClick: () => openDetail(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* ── Create order modal ─────────────────────────────────────────────── */}
      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => { form.resetFields(); setCreateOpen(false); }}
        title={<span><PlusOutlined style={{ marginRight: 8 }} />แจ้งความต้องการซื้อ</span>}
        okText="ส่งคำขอ"
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item label="ชนิดยาง" name="rubberType" rules={[{ required: true }]}>
            <Select placeholder="เลือกชนิดยาง">
              {['ยางแผ่นรมควัน RSS3', 'น้ำยางสด', 'ยางก้อนถ้วย CL', 'ยางแผ่นดิบ USS3'].map(t => (
                <Option key={t} value={t}>{t}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="ปริมาณ (กก.)" name="quantity" rules={[{ required: true }]}>
                <InputNumberSuffix style={{ width: '100%' }} min={100} step={100} suffix="กก." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ราคาเป้าหมาย" name="price" rules={[{ required: true }]}>
                <InputNumberSuffix style={{ width: '100%' }} step={0.5} precision={2} suffix="฿/กก." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea rows={2} placeholder="ระบุเงื่อนไขเพิ่มเติม เช่น ต้องการ EUDR, ระยะเวลาส่ง..." />
          </Form.Item>

          <Divider plain style={{ margin: '12px 0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>สถานที่รับมอบยาง</Text>
          </Divider>

          <Form.Item
            label="ที่อยู่รับมอบ"
            name="deliveryAddress"
            rules={[{ required: true, message: 'กรุณากรอกที่อยู่รับมอบ' }]}
            extra="ดึงจากโปรไฟล์ของคุณ — สามารถแก้ไขสำหรับคำขอนี้ได้"
          >
            <Input.TextArea
              rows={2}
              placeholder="เช่น โรงงาน / โกดัง / ตลาดกลาง — บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
            />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <span>พิกัด GPS</span>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>(ถ้ามี — ผู้ขายจะใช้ navigate)</Text>
              </Space>
            }
            name="deliveryGps"
            rules={[{
              pattern: /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/,
              message: 'รูปแบบ: ละติจูด,ลองจิจูด (เช่น 9.1297,99.2378)',
            }]}
          >
            <Input
              placeholder="9.1297,99.2378"
              addonAfter={
                <Button
                  type="link"
                  size="small"
                  icon={<AimOutlined />}
                  style={{ padding: 0, height: 'auto' }}
                  onClick={() => {
                    if (!navigator.geolocation) return;
                    navigator.geolocation.getCurrentPosition(
                      (pos) => form.setFieldValue(
                        'deliveryGps',
                        `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`,
                      ),
                      () => { /* user denied or unavailable — ignore */ },
                    );
                  }}
                >
                  ดึงตำแหน่งปัจจุบัน
                </Button>
              }
            />
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

      {/* ── Order detail modal ─────────────────────────────────────────────── */}
      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={(() => {
          if (!activeOrder) return null;
          const status = getStatus(activeOrder);
          if (status === 'pending') {
            return (
              <Button type="primary" icon={<UserOutlined />}
                onClick={() => { setDetailOpen(false); openSelectSeller(activeOrder!); }}>
                เลือกผู้ขาย
              </Button>
            );
          }
          if (status === 'seller_approved') {
            return (
              <Button type="primary" icon={<DollarOutlined />}
                onClick={(e) => { setDetailOpen(false); handlePay(activeOrder!, e); }}>
                ชำระเงิน
              </Button>
            );
          }
          return null;
        })()}
        title={
          <span>
            <FileTextOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />
            รายละเอียดคำขอ — {activeOrder?.id}
          </span>
        }
        width={560}
      >
        {activeOrder && (() => {
          const status = getStatus(activeOrder);
          const cfg    = STATUS_CONFIG[status];
          const chosenList = getChosenSellers(activeOrder.id);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
              <Descriptions bordered size="small" column={2} items={[
                { label: 'เลขที่คำขอ',       children: <span style={{ fontWeight: 600, color: '#1a7c3e' }}>{activeOrder.id}</span> },
                { label: 'สถานะ',             children: <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag> },
                { label: 'ชนิดยาง',          children: <span style={{ fontWeight: 500 }}>{activeOrder.rubberType}</span>, span: 2 },
                { label: 'ปริมาณที่ต้องการ', children: <span style={{ fontWeight: 600 }}>{activeOrder.quantity.toLocaleString()} กก.</span> },
                { label: 'ราคาเป้าหมาย',     children: <span style={{ fontWeight: 700, color: '#1a7c3e' }}>{activeOrder.targetPrice.toFixed(2)} ฿/กก.</span> },
                { label: 'วันที่แจ้ง',        children: <span><CalendarOutlined style={{ marginRight: 4 }} />{activeOrder.createdAt}</span>, span: 2 },
                ...(activeOrder.allowUnlimited ? [{ label: 'เงื่อนไขพิเศษ', children: (
                  <Tag color="gold">อนุญาตผู้ขายเสนอแบบไม่จำกัดปริมาณ</Tag>
                ), span: 2 as const }] : []),
                ...(activeOrder.note ? [{ label: 'หมายเหตุ', children: <Text type="secondary">{activeOrder.note}</Text>, span: 2 as const }] : []),
                {
                  label: 'ที่อยู่รับมอบ',
                  children: (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <EnvironmentOutlined style={{ color: '#fa8c16', marginTop: 3, flexShrink: 0 }} />
                      <span>{activeOrder.deliveryAddress}</span>
                    </div>
                  ),
                  span: 2 as const,
                },
                ...(activeOrder.deliveryGps ? [{
                  label: 'พิกัด GPS',
                  children: (
                    <Space>
                      <AimOutlined style={{ color: '#1677ff' }} />
                      <Text code style={{ fontSize: 12 }}>{activeOrder.deliveryGps}</Text>
                      <a
                        href={`https://www.google.com/maps?q=${activeOrder.deliveryGps}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12 }}
                      >
                        เปิดใน Google Maps ↗
                      </a>
                    </Space>
                  ),
                  span: 2 as const,
                }] : []),
                ...(chosenList.length > 0 ? [{ label: 'ผู้ขายที่เลือก', children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {chosenList.map(s => (
                      <span key={s.id} style={{ fontWeight: 500 }}>
                        {s.name}
                        <span style={{ color: '#8c8c8c', fontWeight: 400 }}>
                          {' '}· {s.offeredPrice.toFixed(2)} ฿/กก.
                          {' '}· {s.unlimited ? 'ไม่จำกัด' : `${s.availableWeight.toLocaleString()} กก.`}
                        </span>
                      </span>
                    ))}
                  </div>
                ), span: 2 as const }] : []),
              ]} />

              {/* Waiting banner */}
              {status === 'waiting_seller' && (
                <Alert
                  type="warning" showIcon icon={<ClockCircleOutlined />}
                  title={`รอการยืนยันจากผู้ขาย (${chosenList.length} ราย)`}
                  description="ระบบส่งคำขอไปยังผู้ขายแล้ว กรุณารอการยืนยัน"
                />
              )}

              {/* Approved banner */}
              {status === 'seller_approved' && (
                <Alert
                  type="success" showIcon icon={<CheckCircleOutlined />}
                  title="ผู้ขายยืนยันแล้ว — พร้อมชำระเงิน"
                  description={`${chosenList.map(s => s.name).join(', ')} ยืนยันรายการแล้ว`}
                />
              )}

              {/* Seller offers list */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', marginBottom: 10 }}>
                  ผู้ขายที่เสนอ
                  <span style={{ fontWeight: 400, fontSize: 12, color: '#8c8c8c', marginLeft: 6 }}>
                    {MOCK_SELLER_OFFERS[activeOrder.id]?.length ?? 0} ราย
                  </span>
                </div>
                {(MOCK_SELLER_OFFERS[activeOrder.id]?.length ?? 0) === 0 ? (
                  <Alert type="info" showIcon title="ยังไม่มีผู้ขายเสนอสำหรับรายการนี้" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                    {(MOCK_SELLER_OFFERS[activeOrder.id] ?? []).map(s => (
                      <SellerCard
                        key={s.id}
                        seller={s}
                        selected={(chosenSellers[activeOrder.id] ?? []).includes(s.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Select seller modal ───────────────────────────────────────────── */}
      <Modal
        open={selectOpen}
        onCancel={() => setSelectOpen(false)}
        footer={
          !confirmed && sellers.length > 0 ? (
            <Row gutter={8}>
              <Col span={12}>
                <Button block onClick={() => setSelectOpen(false)}>ยกเลิก</Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary" block
                  disabled={selectedSellers.length === 0}
                  icon={<CheckCircleOutlined />}
                  onClick={handleConfirmSeller}
                >
                  ยืนยันเลือกผู้ขาย ({selectedSellers.length})
                </Button>
              </Col>
            </Row>
          ) : null
        }
        title={
          <span>
            <UserOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />
            เลือกผู้ขาย — {activeOrder?.rubberType}
          </span>
        }
        width={640}
        styles={{ body: { maxHeight: '65vh', overflowY: 'auto', paddingTop: 8 } }}
      >
        {confirmed ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a' }} />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 700, color: '#1a7c3e' }}>ส่งคำขอไปยังผู้ขายแล้ว!</div>
            <div style={{ marginTop: 8, color: '#595959' }}>
              รอ <strong>{selectedSellerOffers.map(s => s.name).join(', ')}</strong> ยืนยัน
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#8c8c8c' }}>
              สถานะจะอัปเดตเมื่อผู้ขายตอบรับ
            </div>
          </div>
        ) : (
          <>
            {/* Order summary strip */}
            <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>ต้องการ</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{activeOrder?.quantity.toLocaleString()} กก.</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาเป้าหมาย</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a7c3e' }}>{activeOrder?.targetPrice.toFixed(2)} ฿/กก.</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>ผู้ขายเสนอ</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{sellers.length} ราย</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>เลือกแล้ว</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1677ff' }}>
                  {selectedSellers.length} ราย
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>ปริมาณรวม</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: hasUnlimitedSelected ? '#d48806' : '#1677ff' }}>
                  {hasUnlimitedSelected
                    ? <>{selectedTotalWeight.toLocaleString()} กก. + ไม่จำกัด</>
                    : <>{selectedTotalWeight.toLocaleString()} กก.</>}
                </div>
              </div>
            </div>

            {activeOrder && selectedSellers.length > 0 && !hasUnlimitedSelected && selectedTotalWeight < activeOrder.quantity && (
              <Alert
                type="warning" showIcon style={{ marginBottom: 12 }}
                title={`ปริมาณจากผู้ขายที่เลือกยังน้อยกว่าที่ต้องการ (ขาด ${(activeOrder.quantity - selectedTotalWeight).toLocaleString()} กก.)`}
              />
            )}

            {sellers.length === 0 ? (
              <Alert type="info" showIcon title="ยังไม่มีผู้ขายเสนอสำหรับรายการนี้" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sellers.map(seller => (
                  <SellerCard
                    key={seller.id}
                    seller={seller}
                    selected={selectedSellers.includes(seller.id)}
                    onSelect={() => toggleSeller(seller.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
