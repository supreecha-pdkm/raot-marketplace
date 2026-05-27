'use client';

import { useState } from 'react';
import { useMemo } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select,
  Row, Col, Alert, Tabs, Badge, Typography, Descriptions, Space, Divider,
} from 'antd';
import {
  SwapOutlined, SendOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, FileTextOutlined, DollarOutlined, ExclamationCircleOutlined,
  EnvironmentOutlined, AimOutlined, FilterOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { App as AntApp } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────
type OfferStatus =
  | 'submitted'     // seller submitted, waiting for buyer to choose
  | 'selected'      // buyer chose this seller — seller must accept or decline
  | 'accepted'      // seller accepted — waiting for buyer to pay
  | 'declined'      // seller declined the buyer's selection
  | 'rejected';     // buyer did not select this seller

type PaymentStatus = 'unpaid' | 'paid' | 'overdue';

interface BuyerRequest {
  id: string;
  rubberType: string;
  quantity: number;
  targetPrice: number;
  createdAt: string;
  note?: string;
  buyerName: string;
  /** Market the buyer is registered with — used for the seller's market filter */
  market: string;
  /** Buyer's preferred delivery / pickup address */
  buyerAddress: string;
  /** Buyer's GPS "lat,lng" — optional */
  buyerGps?: string;
}

interface MyOffer {
  id: string;
  requestId: string;
  rubberType: string;
  quantity: number;
  buyerName: string;
  offeredPrice: number;
  availableWeight: number;
  submittedAt: string;
  status: OfferStatus;
  paymentStatus?: PaymentStatus;
  declineReason?: string;
  /** Copied from the buyer request when the offer is created */
  market: string;
  buyerAddress: string;
  buyerGps?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const BUYER_REQUESTS: BuyerRequest[] = [
  {
    id: 'N001', rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 5000, targetPrice: 70.00,
    createdAt: '2024-04-17', buyerName: 'บ.ยางดี จำกัด',
    note: 'ต้องการ EUDR certified เท่านั้น',
    market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    buyerAddress: 'โรงงาน บ.กรีนรับเบอร์ — 99 หมู่ 3 ถ.สุราษฎร์-พุนพิน ต.ท่าข้าม อ.พุนพิน จ.สุราษฎร์ธานี 84130',
    buyerGps: '9.1297,99.2378',
  },
  {
    id: 'N003', rubberType: 'ยางก้อนถ้วย CL', quantity: 3000, targetPrice: 45.50,
    createdAt: '2024-04-15', buyerName: 'นายสมชาย ใจดี',
    note: 'ต้องการส่งภายใน 3 วัน',
    market: 'ตลาดกลางยางพาราสงขลา',
    buyerAddress: '200 หมู่ 1 ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110',
    buyerGps: '7.0104,100.4762',
  },
  {
    id: 'N005', rubberType: 'น้ำยางสด', quantity: 6000, targetPrice: 52.00,
    createdAt: '2024-04-18', buyerName: 'สหกรณ์ผู้ซื้อยางสงขลา', note: '',
    market: 'ตลาดกลางยางพาราสงขลา',
    buyerAddress: 'สหกรณ์ยางพาราสงขลา — 77/5 หมู่ 2 ต.ทุ่งลาน อ.คลองหอยโข่ง จ.สงขลา 90230',
    buyerGps: '6.9344,100.4021',
  },
];

const INITIAL_OFFERS: MyOffer[] = [
  {
    id: 'MO001', requestId: 'N002', rubberType: 'น้ำยางสด', quantity: 8000,
    buyerName: 'บ.ยางส่งออก จำกัด', offeredPrice: 52.00, availableWeight: 8500,
    submittedAt: '2024-04-16T10:00:00', status: 'selected',
    market: 'ตลาดกลางยางพารานครศรีธรรมราช',
    buyerAddress: 'โรงงานน้ำยางสด — 55/2 หมู่ 5 ต.บ้านนา อ.เมือง จ.นครศรีธรรมราช 80000',
    buyerGps: '8.4304,99.9632',
  },
  {
    id: 'MO002', requestId: 'N006', rubberType: 'ยางแผ่นดิบ USS3', quantity: 2000,
    buyerName: 'นายธนาคาร ชาวสวน', offeredPrice: 62.00, availableWeight: 2100,
    submittedAt: '2024-04-14T09:00:00', status: 'accepted', paymentStatus: 'paid',
    market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    buyerAddress: 'โกดังเก็บยาง — 12 ถ.เทศบาล 3 ต.ตลาด อ.เมือง จ.สุราษฎร์ธานี 84000',
    buyerGps: '9.1382,99.3215',
  },
  {
    id: 'MO003', requestId: 'N007', rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 4000,
    buyerName: 'บ.สยามรับเบอร์ จำกัด', offeredPrice: 71.00, availableWeight: 4200,
    submittedAt: '2024-04-12T14:00:00', status: 'accepted', paymentStatus: 'unpaid',
    market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    buyerAddress: 'บ.สยามรับเบอร์ — 33 ถ.ชนเกษม ต.มะขามเตี้ย อ.เมือง จ.สุราษฎร์ธานี 84000',
    buyerGps: '9.1413,99.3290',
  },
];

// Distinct markets across all requests — options for the seller's market filter
const MARKET_OPTIONS = [
  { value: 'all', label: 'ทุกตลาด' },
  { value: 'ตลาดกลางยางพาราสุราษฎร์ธานี',  label: 'สุราษฎร์ธานี' },
  { value: 'ตลาดกลางยางพาราสงขลา',         label: 'สงขลา' },
  { value: 'ตลาดกลางยางพารานครศรีธรรมราช', label: 'นครศรีธรรมราช' },
];

// ─── Status config ────────────────────────────────────────────────────────────
const OFFER_STATUS_CFG: Record<OfferStatus, { color: string; label: string; icon?: React.ReactNode }> = {
  submitted: { color: 'processing', label: 'รอผู้ซื้อพิจารณา',     icon: <ClockCircleOutlined /> },
  selected:  { color: 'warning',    label: 'ผู้ซื้อเลือกคุณแล้ว',  icon: <ExclamationCircleOutlined /> },
  accepted:  { color: 'success',    label: 'ยอมรับแล้ว',            icon: <CheckCircleOutlined /> },
  declined:  { color: 'error',      label: 'คุณปฏิเสธแล้ว' },
  rejected:  { color: 'default',    label: 'ไม่ได้รับเลือก' },
};

const PAYMENT_STATUS_CFG: Record<PaymentStatus, { color: string; label: string; icon?: React.ReactNode }> = {
  unpaid:  { color: 'warning', label: 'รอชำระเงิน',  icon: <ClockCircleOutlined /> },
  paid:    { color: 'success', label: 'ชำระแล้ว',    icon: <CheckCircleOutlined /> },
  overdue: { color: 'error',   label: 'เกินกำหนด',   icon: <CloseCircleOutlined /> },
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SellerNegotiatedPage() {
  const { message, modal } = AntApp.useApp();
  const [offers,        setOffers]       = useState<MyOffer[]>(INITIAL_OFFERS);
  const [offerModal,    setOfferModal]   = useState<BuyerRequest | null>(null);
  const [detailModal,   setDetailModal]  = useState<MyOffer | null>(null);
  const [declineModal,  setDeclineModal] = useState<MyOffer | null>(null);
  const [offerSuccess,  setOfferSuccess] = useState(false);
  const [actionResult,  setActionResult] = useState<'accepted' | 'declined' | null>(null);
  const [marketFilter,  setMarketFilter] = useState<string>('all');
  const [form]         = Form.useForm();
  const [declineForm]  = Form.useForm();

  // Requests that seller hasn't offered on yet + market filter
  const openRequests = useMemo(() => {
    const offeredIds = new Set(offers.map(o => o.requestId));
    return BUYER_REQUESTS.filter(r =>
      !offeredIds.has(r.id) &&
      (marketFilter === 'all' || r.market === marketFilter),
    );
  }, [offers, marketFilter]);
  const pendingSelection  = offers.filter(o => o.status === 'selected').length;

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleSubmitOffer = async (values: { price: number; weight: number; note?: string }) => {
    if (!offerModal) return;
    await new Promise(r => setTimeout(r, 500));
    const newOffer: MyOffer = {
      id:              `MO${String(Date.now()).slice(-4)}`,
      requestId:       offerModal.id,
      rubberType:      offerModal.rubberType,
      quantity:        offerModal.quantity,
      buyerName:       offerModal.buyerName,
      offeredPrice:    values.price,
      availableWeight: values.weight,
      submittedAt:     new Date().toISOString(),
      status:          'submitted',
      market:          offerModal.market,
      buyerAddress:    offerModal.buyerAddress,
      buyerGps:        offerModal.buyerGps,
    };
    setOffers(prev => [newOffer, ...prev]);
    setOfferSuccess(true);
    setTimeout(() => { setOfferModal(null); setOfferSuccess(false); form.resetFields(); }, 1800);
  };

  const handleAccept = (offer: MyOffer) => {
    setOffers(prev =>
      prev.map(o => o.id === offer.id ? { ...o, status: 'accepted', paymentStatus: 'unpaid' } : o),
    );
    setActionResult('accepted');
    // sync detailModal if open
    setDetailModal(prev =>
      prev?.id === offer.id ? { ...prev, status: 'accepted', paymentStatus: 'unpaid' } : prev,
    );
  };

  const handleDeclineSubmit = (values: { reason?: string }) => {
    if (!declineModal) return;
    setOffers(prev =>
      prev.map(o => o.id === declineModal.id ? { ...o, status: 'declined', declineReason: values.reason } : o),
    );
    setActionResult('declined');
    setDetailModal(null);
    declineForm.resetFields();
    setTimeout(() => { setDeclineModal(null); setActionResult(null); }, 1800);
  };

  const openDecline = (offer: MyOffer) => {
    setDetailModal(null);
    setTimeout(() => { setDeclineModal(offer); setActionResult(null); declineForm.resetFields(); }, 100);
  };

  // Delete an offer — only allowed before the seller has accepted (i.e., before
  // a contract is formed). Once status === 'accepted' the offer is bound to a
  // pending payment, so deletion is blocked.
  const handleDeleteOffer = (offer: MyOffer) => {
    if (offer.status === 'accepted') {
      message.warning('ไม่สามารถลบข้อเสนอนี้ได้ — ทำสัญญาขายแล้ว');
      return;
    }
    modal.confirm({
      title: 'ลบข้อเสนอ?',
      content: `ต้องการลบข้อเสนอ ${offer.id} (${offer.rubberType}) ที่เสนอให้ ${offer.buyerName} หรือไม่?`,
      okText: 'ลบ',
      okButtonProps: { danger: true },
      cancelText: 'ยกเลิก',
      onOk: () => {
        setOffers(prev => prev.filter(o => o.id !== offer.id));
        message.success('ลบข้อเสนอแล้ว');
      },
    });
  };

  // [Demo] simulate buyer paying — for development preview only
  const handleSimulatePay = (offerId: string) => {
    setOffers(prev =>
      prev.map(o => o.id === offerId ? { ...o, paymentStatus: 'paid' } : o),
    );
    setDetailModal(prev =>
      prev?.id === offerId ? { ...prev, paymentStatus: 'paid' } : prev,
    );
  };

  // ── Columns ──────────────────────────────────────────────────────────────────
  const requestColumns = [
    { title: 'ผู้ซื้อ', dataIndex: 'buyerName', render: (v: string) => <Text strong>{v}</Text> },
    {
      title: 'ตลาด',
      dataIndex: 'market',
      render: (v: string) => (
        <Tag color="blue" style={{ fontSize: 11 }}>
          {MARKET_OPTIONS.find(o => o.value === v)?.label ?? v}
        </Tag>
      ),
    },
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    { title: 'ต้องการ (กก.)', dataIndex: 'quantity', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    {
      title: 'ราคาเป้าหมาย', dataIndex: 'targetPrice', align: 'right' as const,
      render: (v: number) => <Text strong style={{ color: '#1a7c3e' }}>{v.toFixed(2)} ฿/กก.</Text>,
    },
    { title: 'วันที่', dataIndex: 'createdAt', render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'หมายเหตุ', dataIndex: 'note', render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v || '—'}</Text> },
    {
      title: '',
      render: (_: unknown, r: BuyerRequest) => (
        <Button size="small" type="primary" icon={<SendOutlined />}
          onClick={() => { setOfferModal(r); setOfferSuccess(false); form.resetFields(); }}>
          ยื่นเสนอราคา
        </Button>
      ),
    },
  ];

  const offerColumns = [
    { title: 'ผู้ซื้อ', dataIndex: 'buyerName', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    {
      title: 'ราคาที่เสนอ', dataIndex: 'offeredPrice', align: 'right' as const,
      render: (v: number) => <Text strong style={{ color: '#1a7c3e' }}>{v.toFixed(2)} ฿/กก.</Text>,
    },
    {
      title: 'ปริมาณ', dataIndex: 'availableWeight', align: 'right' as const,
      render: (v: number) => `${v.toLocaleString()} กก.`,
    },
    {
      title: 'วันที่ยื่น', dataIndex: 'submittedAt',
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(v).format('DD/MM/YY HH:mm')}</Text>,
    },
    {
      title: 'สถานะข้อเสนอ', dataIndex: 'status',
      render: (s: OfferStatus) => {
        const cfg = OFFER_STATUS_CFG[s];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'สถานะชำระเงิน', dataIndex: 'paymentStatus',
      render: (p?: PaymentStatus) => {
        if (!p) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
        const cfg = PAYMENT_STATUS_CFG[p];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'การดำเนินการ',
      render: (_: unknown, r: MyOffer) => {
        // Delete is allowed for any pre-contract status (submitted / selected /
        // declined / rejected). Once accepted → contract → cannot delete.
        const canDelete = r.status !== 'accepted';
        const deleteBtn = canDelete ? (
          <Button
            size="small" danger
            icon={<DeleteOutlined />}
            onClick={(e) => { e.stopPropagation(); handleDeleteOffer(r); }}
            title="ลบข้อเสนอ"
          />
        ) : null;

        if (r.status === 'selected') {
          return (
            <Space>
              <Button
                size="small" type="primary" icon={<CheckCircleOutlined />}
                onClick={(e) => { e.stopPropagation(); handleAccept(r); }}
              >ยอมรับ</Button>
              <Button
                size="small" danger icon={<CloseCircleOutlined />}
                onClick={(e) => { e.stopPropagation(); openDecline(r); }}
              >ปฏิเสธ</Button>
              {deleteBtn}
            </Space>
          );
        }
        return (
          <Space>
            <Button size="small" icon={<FileTextOutlined />}
              onClick={(e) => { e.stopPropagation(); setDetailModal(r); setActionResult(null); }}>
              รายละเอียด
            </Button>
            {deleteBtn}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        items={[
          // ── Tab 1: Buyer Requests ──────────────────────────────────────────
          {
            key: 'requests',
            label: (
              <span>
                <SwapOutlined style={{ marginRight: 4 }} />คำขอจากผู้ซื้อ
                <Badge count={openRequests.length} size="small"
                  style={{ marginLeft: 6, background: '#1a7c3e' }} />
              </span>
            ),
            children: (
              <Card
                title={<span><SwapOutlined style={{ marginRight: 8 }} />คำขอซื้อที่เปิดรับข้อเสนอ</span>}
                extra={
                  <Space>
                    <FilterOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>ตลาด:</Text>
                    <Select
                      size="small"
                      value={marketFilter}
                      onChange={setMarketFilter}
                      style={{ width: '100%', minWidth: 150 }}
                      options={MARKET_OPTIONS}
                    />
                  </Space>
                }
              >
                {openRequests.length === 0
                  ? <Alert
                      type="info"
                      showIcon
                      title={
                        marketFilter === 'all'
                          ? 'ไม่มีคำขอใหม่ในขณะนี้'
                          : `ไม่มีคำขอจากตลาด "${MARKET_OPTIONS.find(o => o.value === marketFilter)?.label}" ในขณะนี้`
                      }
                    />
                  : <Table dataSource={openRequests} columns={requestColumns} rowKey="id" pagination={false} scroll={{ x: 'max-content' }} />}
              </Card>
            ),
          },

          // ── Tab 2: My Offers ───────────────────────────────────────────────
          {
            key: 'offers',
            label: (
              <span>
                ข้อเสนอของฉัน
                {pendingSelection > 0 && (
                  <Badge count={pendingSelection} size="small"
                    style={{ marginLeft: 6, background: '#fa8c16' }} />
                )}
              </span>
            ),
            children: (
              <Card title="ข้อเสนอที่ฉันยื่นไป">
                {pendingSelection > 0 && (
                  <Alert type="warning" showIcon style={{ marginBottom: 12 }}
                    title={`มี ${pendingSelection} รายการที่ผู้ซื้อเลือกคุณแล้ว — กรุณายอมรับหรือปฏิเสธ`} />
                )}
                <Table
                  dataSource={offers}
                  columns={offerColumns}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                  onRow={(record) => ({
                    onClick: () => { setDetailModal(record); setActionResult(null); },
                    style: {
                      cursor: 'pointer',
                      background: record.status === 'selected' ? '#fffbe6' : undefined,
                    },
                  })}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* ── Submit Offer Modal ─────────────────────────────────────────────── */}
      <Modal
        open={!!offerModal}
        onCancel={() => { setOfferModal(null); setOfferSuccess(false); form.resetFields(); }}
        footer={null}
        title={<span><SendOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />ยื่นเสนอราคา</span>}
        width={480}
      >
        {offerSuccess ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a' }} />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 700, color: '#1a7c3e' }}>ยื่นข้อเสนอสำเร็จ!</div>
            <div style={{ marginTop: 6, color: '#595959' }}>รอผู้ซื้อพิจารณาข้อเสนอของคุณ</div>
          </div>
        ) : offerModal && (
          <>
            <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: 11, color: '#8c8c8c' }}>ผู้ซื้อ</div><div style={{ fontWeight: 600, fontSize: 13 }}>{offerModal.buyerName}</div></div>
              <div><div style={{ fontSize: 11, color: '#8c8c8c' }}>ชนิดยาง</div><div style={{ fontWeight: 500, fontSize: 13 }}>{offerModal.rubberType}</div></div>
              <div><div style={{ fontSize: 11, color: '#8c8c8c' }}>ต้องการ</div><div style={{ fontWeight: 600, fontSize: 13 }}>{offerModal.quantity.toLocaleString()} กก.</div></div>
              <div><div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาเป้าหมาย</div><div style={{ fontWeight: 700, fontSize: 13, color: '#1a7c3e' }}>{offerModal.targetPrice.toFixed(2)} ฿/กก.</div></div>
            </div>

            <Alert
              type="info"
              showIcon
              icon={<EnvironmentOutlined />}
              style={{ marginBottom: 16 }}
              title={<Text strong style={{ fontSize: 13 }}>ที่อยู่รับมอบของผู้ซื้อ</Text>}
              description={
                <div style={{ fontSize: 12 }}>
                  <div>{offerModal.buyerAddress}</div>
                  {offerModal.buyerGps && (
                    <div style={{ marginTop: 4 }}>
                      <AimOutlined style={{ color: '#1677ff', marginRight: 4 }} />
                      <Text code style={{ fontSize: 11 }}>{offerModal.buyerGps}</Text>{' '}
                      <a
                        href={`https://www.google.com/maps?q=${offerModal.buyerGps}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 11 }}
                      >
                        เปิดใน Google Maps ↗
                      </a>
                    </div>
                  )}
                </div>
              }
            />
            <Form form={form} layout="vertical" onFinish={handleSubmitOffer}>
              <Row gutter={[12, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="ราคาที่เสนอ (฿/กก.)" name="price" rules={[{ required: true }]}>
                    <InputNumberSuffix style={{ width: '100%' }} min={0} step={0.5} precision={2} suffix="฿/กก." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="ปริมาณที่มี (กก.)" name="weight" rules={[{ required: true }]}>
                    <InputNumberSuffix style={{ width: '100%' }} min={100} step={100} suffix="กก." />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="หมายเหตุ" name="note">
                <Input.TextArea rows={2} placeholder="ระบุเงื่อนไขเพิ่มเติม เช่น ระยะเวลาส่ง..." />
              </Form.Item>
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={12}><Button block onClick={() => setOfferModal(null)}>ยกเลิก</Button></Col>
                <Col xs={24} sm={12}><Button type="primary" block htmlType="submit" icon={<SendOutlined />}>ยืนยันข้อเสนอ</Button></Col>
              </Row>
            </Form>
          </>
        )}
      </Modal>

      {/* ── Detail Modal ───────────────────────────────────────────────────── */}
      <Modal
        open={!!detailModal}
        onCancel={() => { setDetailModal(null); setActionResult(null); }}
        title={<span><FileTextOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />รายละเอียดข้อเสนอ — {detailModal?.id}</span>}
        width={500}
        footer={(() => {
          if (!detailModal) return null;
          if (actionResult === 'accepted') {
            return <Button type="primary" onClick={() => { setDetailModal(null); setActionResult(null); }}>ปิด</Button>;
          }
          if (detailModal.status === 'selected') {
            return (
              <Space>
                <Button onClick={() => { setDetailModal(null); setActionResult(null); }}>ปิด</Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => openDecline(detailModal)}>ปฏิเสธ</Button>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleAccept(detailModal)}>ยอมรับการขาย</Button>
              </Space>
            );
          }
          return <Button onClick={() => { setDetailModal(null); setActionResult(null); }}>ปิด</Button>;
        })()}
      >
        {actionResult === 'accepted' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a' }} />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 700, color: '#1a7c3e' }}>ยอมรับการขายสำเร็จ!</div>
            <div style={{ marginTop: 6, color: '#595959' }}>ระบบจะแจ้งผู้ซื้อให้ชำระเงินต่อไป</div>
          </div>
        ) : detailModal && (
          <div style={{ paddingTop: 8 }}>
            {detailModal.status === 'selected' && (
              <Alert type="warning" showIcon icon={<ExclamationCircleOutlined />}
                title="ผู้ซื้อเลือกข้อเสนอของคุณแล้ว — กรุณายอมรับหรือปฏิเสธเพื่อดำเนินการต่อ"
                style={{ marginBottom: 16 }} />
            )}
            {detailModal.status === 'accepted' && (
              <Alert
                type={detailModal.paymentStatus === 'paid' ? 'success' : 'info'}
                showIcon
                icon={<DollarOutlined />}
                title={
                  detailModal.paymentStatus === 'paid'
                    ? 'ผู้ซื้อชำระเงินแล้ว — การซื้อขายเสร็จสมบูรณ์'
                    : 'รอผู้ซื้อชำระเงิน'
                }
                style={{ marginBottom: 16 }}
              />
            )}
            {detailModal.status === 'declined' && (
              <Alert type="error" showIcon title={`คุณปฏิเสธรายการนี้แล้ว${detailModal.declineReason ? ` — ${detailModal.declineReason}` : ''}`}
                style={{ marginBottom: 16 }} />
            )}

            <Descriptions bordered size="small" column={1} items={[
              { label: 'เลขที่ข้อเสนอ',    children: <Text strong style={{ color: '#1a7c3e' }}>{detailModal.id}</Text> },
              { label: 'ผู้ซื้อ',           children: detailModal.buyerName },
              { label: 'ตลาด',              children: <Tag color="blue">{MARKET_OPTIONS.find(o => o.value === detailModal.market)?.label ?? detailModal.market}</Tag> },
              { label: 'ชนิดยาง',          children: detailModal.rubberType },
              { label: 'ราคาที่เสนอ',      children: <Text strong style={{ color: '#1a7c3e' }}>{detailModal.offeredPrice.toFixed(2)} ฿/กก.</Text> },
              { label: 'ปริมาณที่มี',      children: `${detailModal.availableWeight.toLocaleString()} กก.` },
              { label: 'มูลค่าประมาณ',     children: <Text strong>{(detailModal.offeredPrice * detailModal.availableWeight).toLocaleString()} ฿</Text> },
              {
                label: 'สถานะข้อเสนอ',
                children: (() => {
                  const cfg = OFFER_STATUS_CFG[detailModal.status];
                  return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
                })(),
              },
              ...(detailModal.paymentStatus ? [{
                label: 'สถานะชำระเงิน',
                children: (() => {
                  const cfg = PAYMENT_STATUS_CFG[detailModal.paymentStatus!];
                  return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
                })(),
              }] : []),
              { label: 'วันที่ยื่น', children: <Text type="secondary">{dayjs(detailModal.submittedAt).format('DD/MM/YYYY HH:mm')}</Text> },
              {
                label: 'ที่อยู่รับมอบของผู้ซื้อ',
                children: (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <EnvironmentOutlined style={{ color: '#fa8c16', marginTop: 3, flexShrink: 0 }} />
                    <span>{detailModal.buyerAddress}</span>
                  </div>
                ),
              },
              ...(detailModal.buyerGps ? [{
                label: 'พิกัด GPS',
                children: (
                  <Space wrap>
                    <AimOutlined style={{ color: '#1677ff' }} />
                    <Text code style={{ fontSize: 12 }}>{detailModal.buyerGps}</Text>
                    <a
                      href={`https://www.google.com/maps?q=${detailModal.buyerGps}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12 }}
                    >
                      เปิดใน Google Maps ↗
                    </a>
                  </Space>
                ),
              }] : []),
            ]} />

            {/* Demo helper — simulate buyer paying */}
            {detailModal.status === 'accepted' && detailModal.paymentStatus === 'unpaid' && (
              <>
                <Divider dashed style={{ margin: '16px 0 8px' }} />
                <Alert
                  type="warning" showIcon
                  title={
                    <span>
                      <Text type="secondary" style={{ fontSize: 12 }}>[Demo] จำลองการชำระเงินของผู้ซื้อ — </Text>
                      <Button type="link" size="small" style={{ padding: 0, fontSize: 12 }}
                        onClick={() => handleSimulatePay(detailModal.id)}>
                        กดที่นี่เพื่อจำลอง
                      </Button>
                    </span>
                  }
                />
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ── Decline Reason Modal ───────────────────────────────────────────── */}
      <Modal
        open={!!declineModal}
        onCancel={() => { setDeclineModal(null); setActionResult(null); declineForm.resetFields(); }}
        title={<span><CloseCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />ปฏิเสธการขาย</span>}
        width={420}
        footer={null}
      >
        {actionResult === 'declined' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CloseCircleOutlined style={{ fontSize: 56, color: '#ff4d4f' }} />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 700 }}>ปฏิเสธแล้ว</div>
            <div style={{ marginTop: 6, color: '#595959' }}>ระบบจะแจ้งผู้ซื้อทราบเพื่อเลือกผู้ขายรายอื่น</div>
          </div>
        ) : declineModal && (
          <>
            <Alert type="error" showIcon style={{ marginBottom: 16 }}
              title={`คุณกำลังจะปฏิเสธการขายให้ ${declineModal.buyerName}`}
              description="ผู้ซื้อจะถูกแจ้งและสามารถเลือกผู้ขายรายอื่นได้" />
            <Form form={declineForm} layout="vertical" onFinish={handleDeclineSubmit}>
              <Form.Item label="เหตุผล (ถ้ามี)" name="reason">
                <Input.TextArea rows={3} placeholder="เช่น ยางหมด, ติดปัญหาการขนส่ง..." />
              </Form.Item>
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={12}>
                  <Button block onClick={() => { setDeclineModal(null); declineForm.resetFields(); }}>ยกเลิก</Button>
                </Col>
                <Col xs={24} sm={12}>
                  <Button danger block htmlType="submit" icon={<CloseCircleOutlined />}>ยืนยันปฏิเสธ</Button>
                </Col>
              </Row>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
