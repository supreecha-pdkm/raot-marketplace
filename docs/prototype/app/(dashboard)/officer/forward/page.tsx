'use client';

import { useState } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Button, Tag, Modal, Form, DatePicker, Input,
  Steps, Row, Col, Typography, Divider, Select, InputNumber,
  Alert, Progress, Space, Statistic, Radio, Empty, Tabs,
  Descriptions,
} from 'antd';
import {
  TrophyOutlined, TeamOutlined, FileProtectOutlined, PlusOutlined,
  CheckCircleOutlined, CalendarOutlined, DeleteOutlined,
  ExclamationCircleOutlined, FileTextOutlined, HistoryOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

// ─── Types ────────────────────────────────────────────────────────────────────

type RoundStep   = 0 | 1 | 2;
type RoundStatus = 'active' | 'completed' | 'cancelled';
type ContractStatus  = 'pending_sign' | 'signed';
type AllocationMode  = 'all' | 'cut';
type ShortageChoice  = 'accept' | 'cancel';

interface BuyerBid {
  id: string;
  buyerName: string;
  rubberType: string;    // buyer specifies rubber type when bidding
  targetWeight: number;  // weight buyer wants
  offerPrice: number;
  submittedAt: string;
  winner?: boolean;
}

interface SellerSubmission {
  id: string;
  seq: number;
  sellerName: string;
  offeredQty: number;
  deliveryDate?: string;  // seller-specified delivery date
  submittedAt: string;
  allocatedQty?: number;
}

interface ForwardContract {
  contractNo: string;
  buyerName: string;
  sellerName: string;
  rubberType: string;
  quantity: number;
  price: number;
  totalValue: number;
  deliveryDate: string;
  status: ContractStatus;
}

interface ForwardRound {
  id: string;
  topic: string;           // staff sets topic only — no weight/price/rubberType
  step: RoundStep;
  status: RoundStatus;
  /** datetime "YYYY-MM-DD HH:mm" — when buyer bidding becomes available */
  biddingOpensAt?: string;
  bidDeadline?: string;
  deliveryDate?: string;
  /** smallest weight (kg) a buyer can bid */
  minBuyerWeight?: number;
  /** smallest price (฿/kg) a buyer can offer */
  minBuyerPrice?: number;
  remark?: string;
  buyerBids: BuyerBid[];
  winnerAnnounced: boolean;
  winner?: BuyerBid;
  submissions: SellerSubmission[];
  allocationChoice: AllocationMode;  // reflects the buyer's choice (staff is read-only)
  buyerDecided: boolean;             // true once the buyer has confirmed the allocation
  shortageChoice: ShortageChoice;
  contracts: ForwardContract[];
  createdAt: string;
  completedAt?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_ROUNDS: ForwardRound[] = [
  {
    id: 'FWD-001',
    topic: 'รับซื้อยางแผ่นรมควัน Q2/2569',
    step: 0,
    status: 'active',
    biddingOpensAt: '2026-04-18 08:00',
    bidDeadline:    '2026-04-20 17:00',
    minBuyerWeight: 1000,
    minBuyerPrice:  60.00,
    remark: '',
    buyerBids: [
      { id: 'b1', buyerName: 'บริษัท ยางไทยพาณิชย์ จำกัด', rubberType: 'ยางแผ่นรมควัน RSS3', targetWeight: 5000, offerPrice: 68.50, submittedAt: '2026-04-18 09:00' },
      { id: 'b2', buyerName: 'ห้างหุ้นส่วน เกษตรไทย',      rubberType: 'ยางแผ่นดิบ',         targetWeight: 3000, offerPrice: 65.00, submittedAt: '2026-04-18 09:30' },
      { id: 'b3', buyerName: 'บริษัท สยามยาง จำกัด',        rubberType: 'ยางแผ่นรมควัน RSS3', targetWeight: 4000, offerPrice: 60.00, submittedAt: '2026-04-18 10:00' },
    ],
    winnerAnnounced: false,
    submissions: [],
    allocationChoice: 'all',
    buyerDecided:     true,
    shortageChoice:   'accept',
    contracts:        [],
    createdAt:        '2026-04-18 08:00',
  },
  {
    id: 'FWD-002',
    topic: 'รับซื้อน้ำยางสด ล็อตเดือนพฤษภาคม',
    step: 1,
    status: 'active',
    biddingOpensAt: '2026-04-15 09:00',
    bidDeadline:    '2026-04-17 17:00',
    deliveryDate:   '2026-05-20',
    minBuyerWeight: 2000,
    minBuyerPrice:  35.00,
    remark: '',
    buyerBids: [
      { id: 'b4', buyerName: 'บริษัท น้ำยางสยาม จำกัด', rubberType: 'น้ำยางสด', targetWeight: 8000, offerPrice: 42.00, submittedAt: '2026-04-16 08:00', winner: true },
      { id: 'b5', buyerName: 'สหกรณ์ยางพารา จำกัด',      rubberType: 'น้ำยางสด', targetWeight: 5000, offerPrice: 40.50, submittedAt: '2026-04-16 09:00' },
    ],
    winnerAnnounced: true,
    winner: { id: 'b4', buyerName: 'บริษัท น้ำยางสยาม จำกัด', rubberType: 'น้ำยางสด', targetWeight: 8000, offerPrice: 42.00, submittedAt: '2026-04-16 08:00', winner: true },
    submissions: [
      { id: 's1', seq: 1, sellerName: 'อนันต์ ศรีสะอาด', offeredQty: 3000, deliveryDate: '2026-05-18', submittedAt: '2026-04-17 09:00' },
      { id: 's2', seq: 2, sellerName: 'วิภา ทองคำ',       offeredQty: 2500, deliveryDate: '2026-05-22', submittedAt: '2026-04-17 10:30' },
    ],
    allocationChoice: 'all',
    buyerDecided:     true,
    shortageChoice:   'accept',
    contracts:        [],
    createdAt:        '2026-04-15 08:00',
  },
  // Step 2 round with EXCESS — buyer has not yet picked an allocation.
  // Used to demonstrate the "รอผู้ซื้อตัดสินใจ" state that replaces the old staff radio.
  {
    id: 'FWD-003',
    topic: 'รับซื้อยางแผ่นรมควัน ล็อตพิเศษ',
    step: 2,
    status: 'active',
    biddingOpensAt: '2026-04-09 09:00',
    bidDeadline:    '2026-04-12 17:00',
    deliveryDate:   '2026-05-25',
    minBuyerWeight: 1000,
    minBuyerPrice:  60.00,
    remark: '',
    buyerBids: [
      { id: 'b6', buyerName: 'บริษัท กรีนรับเบอร์ จำกัด', rubberType: 'ยางแผ่นรมควัน RSS3', targetWeight: 5000, offerPrice: 70.00, submittedAt: '2026-04-11 10:00', winner: true },
    ],
    winnerAnnounced: true,
    winner:          { id: 'b6', buyerName: 'บริษัท กรีนรับเบอร์ จำกัด', rubberType: 'ยางแผ่นรมควัน RSS3', targetWeight: 5000, offerPrice: 70.00, submittedAt: '2026-04-11 10:00', winner: true },
    submissions: [
      { id: 's3', seq: 1, sellerName: 'เชิดชัย สวนยาง',    offeredQty: 3000, deliveryDate: '2026-05-25', submittedAt: '2026-04-13 09:00' },
      { id: 's4', seq: 2, sellerName: 'สมหมาย ยางดี',       offeredQty: 2500, deliveryDate: '2026-05-25', submittedAt: '2026-04-13 09:30' },
      { id: 's5', seq: 3, sellerName: 'นิรันดร์ ยางทอง',    offeredQty: 2000, deliveryDate: '2026-05-25', submittedAt: '2026-04-13 10:00' },
    ],
    // Sellers offered 7,500 kg vs target 5,000 kg → excess 2,500 kg
    allocationChoice: 'all',
    buyerDecided:     false,        // waiting for buyer to pick
    shortageChoice:   'accept',
    contracts:        [],
    createdAt:        '2026-04-11 08:00',
  },
];

const HISTORY_ROUNDS: ForwardRound[] = [
  {
    id: 'FWD-H001',
    topic: 'รับซื้อยางก้อนถ้วย รอบแรกปี 2569',
    step: 2,
    status: 'completed',
    biddingOpensAt: '2026-04-08 08:00',
    bidDeadline:    '2026-04-10 17:00',
    deliveryDate:   '2026-05-30',
    minBuyerWeight: 2000,
    minBuyerPrice:  35.00,
    remark: 'รอบแรกของปี 2569',
    buyerBids: [
      { id: 'bh1', buyerName: 'ห้างหุ้นส่วน ยางเหนือ',        rubberType: 'ยางก้อนถ้วย',         targetWeight: 9000,  offerPrice: 37.50, submittedAt: '2026-04-09 09:00', winner: true },
      { id: 'bh2', buyerName: 'บริษัท ยางอุตสาหกรรม จำกัด',  rubberType: 'ยางก้อนถ้วย',         targetWeight: 10000, offerPrice: 35.00, submittedAt: '2026-04-09 08:00' },
      { id: 'bh3', buyerName: 'บริษัท โกลบอลรับเบอร์ จำกัด', rubberType: 'ยางแผ่นรมควัน RSS3', targetWeight: 8000,  offerPrice: 36.00, submittedAt: '2026-04-09 10:00' },
    ],
    winnerAnnounced: true,
    winner: { id: 'bh1', buyerName: 'ห้างหุ้นส่วน ยางเหนือ', rubberType: 'ยางก้อนถ้วย', targetWeight: 9000, offerPrice: 37.50, submittedAt: '2026-04-09 09:00', winner: true },
    submissions: [
      { id: 'sh1', seq: 1, sellerName: 'ประสิทธิ์ ยางงาม', offeredQty: 4000, deliveryDate: '2026-05-28', submittedAt: '2026-04-11 08:30', allocatedQty: 4000 },
      { id: 'sh2', seq: 2, sellerName: 'รัตนา สวนยาง',      offeredQty: 3000, deliveryDate: '2026-05-30', submittedAt: '2026-04-11 09:00', allocatedQty: 3000 },
      { id: 'sh3', seq: 3, sellerName: 'ชาญชัย ไร่ยาง',     offeredQty: 2000, deliveryDate: '2026-05-30', submittedAt: '2026-04-11 10:00', allocatedQty: 2000 },
    ],
    allocationChoice: 'all',
    buyerDecided:     true,
    shortageChoice:   'accept',
    contracts: [
      { contractNo: 'FC-20260530-001', buyerName: 'ห้างหุ้นส่วน ยางเหนือ', sellerName: 'ประสิทธิ์ ยางงาม', rubberType: 'ยางก้อนถ้วย', quantity: 4000, price: 37.50, totalValue: 150000, deliveryDate: '2026-05-30', status: 'signed' },
      { contractNo: 'FC-20260530-002', buyerName: 'ห้างหุ้นส่วน ยางเหนือ', sellerName: 'รัตนา สวนยาง',      rubberType: 'ยางก้อนถ้วย', quantity: 3000, price: 37.50, totalValue: 112500, deliveryDate: '2026-05-30', status: 'signed' },
      { contractNo: 'FC-20260530-003', buyerName: 'ห้างหุ้นส่วน ยางเหนือ', sellerName: 'ชาญชัย ไร่ยาง',     rubberType: 'ยางก้อนถ้วย', quantity: 2000, price: 37.50, totalValue: 75000,  deliveryDate: '2026-05-30', status: 'signed' },
    ],
    createdAt: '2026-04-08 08:00',
    completedAt: '2026-04-12 15:30',
  },
  {
    id: 'FWD-H002',
    topic: 'รับซื้อ RSS3 มีนาคม 2569',
    step: 2,
    status: 'completed',
    biddingOpensAt: '2026-03-23 09:00',
    bidDeadline:    '2026-03-25 17:00',
    deliveryDate:   '2026-05-10',
    minBuyerWeight: 1500,
    minBuyerPrice:  65.00,
    remark: '',
    buyerBids: [
      { id: 'bh4', buyerName: 'บริษัท กรีนรับเบอร์ จำกัด', rubberType: 'ยางแผ่นรมควัน RSS3', targetWeight: 6000, offerPrice: 71.00, submittedAt: '2026-03-24 10:00', winner: true },
      { id: 'bh5', buyerName: 'สหกรณ์ยางพาราใต้',           rubberType: 'ยางแผ่นรมควัน RSS3', targetWeight: 5000, offerPrice: 69.50, submittedAt: '2026-03-24 11:00' },
    ],
    winnerAnnounced: true,
    winner: { id: 'bh4', buyerName: 'บริษัท กรีนรับเบอร์ จำกัด', rubberType: 'ยางแผ่นรมควัน RSS3', targetWeight: 6000, offerPrice: 71.00, submittedAt: '2026-03-24 10:00', winner: true },
    submissions: [
      { id: 'sh4', seq: 1, sellerName: 'สมศักดิ์ ไร่ยางทอง', offeredQty: 3500, deliveryDate: '2026-05-08', submittedAt: '2026-03-26 09:00', allocatedQty: 3500 },
      { id: 'sh5', seq: 2, sellerName: 'นิภา สวนยางสุข',      offeredQty: 2500, deliveryDate: '2026-05-10', submittedAt: '2026-03-26 10:00', allocatedQty: 2500 },
    ],
    allocationChoice: 'all',
    buyerDecided:     true,
    shortageChoice:   'accept',
    contracts: [
      { contractNo: 'FC-20260510-001', buyerName: 'บริษัท กรีนรับเบอร์ จำกัด', sellerName: 'สมศักดิ์ ไร่ยางทอง', rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 3500, price: 71.00, totalValue: 248500, deliveryDate: '2026-05-10', status: 'signed' },
      { contractNo: 'FC-20260510-002', buyerName: 'บริษัท กรีนรับเบอร์ จำกัด', sellerName: 'นิภา สวนยางสุข',      rubberType: 'ยางแผ่นรมควัน RSS3', quantity: 2500, price: 71.00, totalValue: 177500, deliveryDate: '2026-05-10', status: 'signed' },
    ],
    createdAt: '2026-03-23 08:00',
    completedAt: '2026-03-27 14:00',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeAllocation(submissions: SellerSubmission[], target: number, mode: AllocationMode): SellerSubmission[] {
  if (mode === 'all') return submissions.map((s) => ({ ...s, allocatedQty: s.offeredQty }));
  let rem = target;
  return submissions.map((s) => {
    if (rem <= 0) return { ...s, allocatedQty: 0 };
    const give = Math.min(s.offeredQty, rem);
    rem -= give;
    return { ...s, allocatedQty: give };
  });
}

function stepLabel(step: RoundStep): { color: string; text: string } {
  const map: Record<RoundStep, { color: string; text: string }> = {
    0: { color: 'processing', text: 'ประมูลผู้ซื้อ' },
    1: { color: 'warning',    text: 'รับปริมาณผู้ขาย' },
    2: { color: 'success',    text: 'ออกสัญญา' },
  };
  return map[step];
}

const RUBBER_TYPES = ['ยางแผ่นรมควัน RSS3', 'ยางแผ่นดิบ', 'ยางก้อนถ้วย', 'น้ำยางสด'];

const STEP_ITEMS = [
  { title: 'เปิดประมูลฝั่งผู้ซื้อ', icon: <TrophyOutlined /> },
  { title: 'รับปริมาณผู้ขาย',       icon: <TeamOutlined /> },
  { title: 'ออกสัญญา',              icon: <FileProtectOutlined /> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function WinnerCard({ winner }: { winner: BuyerBid }) {
  return (
    <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 16 }}>
      <Space size="large" wrap>
        <Space>
          <TrophyOutlined style={{ color: '#52c41a', fontSize: 18 }} />
          <Text strong style={{ color: '#0f3d22' }}>ผู้ชนะ:</Text>
          <Text strong>{winner.buyerName}</Text>
        </Space>
        <Tag color="blue">{winner.rubberType}</Tag>
        <Text type="secondary">น้ำหนัก: <Text strong>{winner.targetWeight.toLocaleString()} กก.</Text></Text>
        <Text type="secondary">ราคา: <Text strong style={{ color: '#1a7c3e' }}>{winner.offerPrice.toFixed(2)} ฿/กก.</Text></Text>
      </Space>
    </Card>
  );
}

// ─── Step 0: เปิดประมูลฝั่งผู้ซื้อ ────────────────────────────────────────────

function Step0({
  round,
  onAddBid,
  onSelectWinner,
}: {
  round: ForwardRound;
  onAddBid: (bid: Omit<BuyerBid, 'id' | 'submittedAt'>) => void;
  onSelectWinner: (bid: BuyerBid) => void;
}) {
  const [bidModal, setBidModal]     = useState(false);
  const [confirmBid, setConfirmBid] = useState<BuyerBid | null>(null);
  const [form] = Form.useForm<{ buyerName: string; rubberType: string; targetWeight: number; offerPrice: number }>();

  function handleAdd() {
    form.validateFields().then((v) => {
      onAddBid({ buyerName: v.buyerName, rubberType: v.rubberType, targetWeight: Number(v.targetWeight), offerPrice: Number(v.offerPrice) });
      form.resetFields();
      setBidModal(false);
    });
  }

  const winner = round.buyerBids.find((b) => b.winner);

  const cols: ColumnsType<BuyerBid> = [
    { title: 'ลำดับ', render: (_, __, i) => i + 1, width: 60, align: 'center' },
    { title: 'ผู้ซื้อ', dataIndex: 'buyerName' },
    { title: 'ชนิดยาง', dataIndex: 'rubberType', render: (v: string) => <Tag color="blue">{v}</Tag> },
    {
      title: 'น้ำหนักที่ต้องการ (กก.)',
      dataIndex: 'targetWeight',
      align: 'right',
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: 'ราคาเสนอ (฿/กก.)',
      dataIndex: 'offerPrice',
      align: 'right',
      render: (v: number, r) => (
        <Text strong style={{ color: r.winner ? '#1a7c3e' : undefined }}>{v.toFixed(2)}</Text>
      ),
    },
    { title: 'เวลายื่น', dataIndex: 'submittedAt' },
    {
      title: 'สถานะ',
      render: (_, r) => {
        if (!round.winnerAnnounced) return <Tag color="default">รอประกาศ</Tag>;
        return r.winner
          ? <Tag color="success" icon={<CheckCircleOutlined />}>ผู้ชนะ</Tag>
          : <Tag color="default">ไม่ได้รับคัดเลือก</Tag>;
      },
    },
    {
      title: 'ดำเนินการ',
      render: (_, r) => {
        if (round.winnerAnnounced) {
          return r.winner
            ? <Text type="secondary" style={{ fontSize: 12 }}>ประกาศแล้ว</Text>
            : null;
        }
        return (
          <Button
            size="small"
            type="primary"
            icon={<TrophyOutlined />}
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
            onClick={() => setConfirmBid(r)}
          >
            เลือกเป็นผู้ชนะ
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Card
        title={<Space><TrophyOutlined style={{ color: '#1a7c3e' }} /><span>การเสนอราคาของผู้ซื้อ</span></Space>}
        extra={
          <Button
            icon={<PlusOutlined />}
            disabled={round.winnerAnnounced}
            onClick={() => setBidModal(true)}
          >
            เพิ่มการเสนอราคา [Demo]
          </Button>
        }
      >
        {winner && (
          <Alert
            type="success"
            showIcon
            title={`ประกาศผลแล้ว — ผู้ชนะ: ${winner.buyerName} | ${winner.rubberType} | ${winner.targetWeight.toLocaleString()} กก. | ${winner.offerPrice.toFixed(2)} ฿/กก.`}
            style={{ marginBottom: 16 }}
          />
        )}
        {!round.winnerAnnounced && round.buyerBids.length === 0 && (
          <Alert
            type="info"
            showIcon
            title="ยังไม่มีผู้ซื้อยื่นราคา — กดปุ่ม 'เพิ่มการเสนอราคา' เพื่อจำลองการยื่น"
            style={{ marginBottom: 16 }}
          />
        )}
        {!round.winnerAnnounced && round.buyerBids.length > 0 && (
          <Alert
            type="warning"
            showIcon
            title="กรุณาเลือกผู้ชนะจากตารางด้านล่าง — กดปุ่ม 'เลือกเป็นผู้ชนะ' ที่แถวของผู้ซื้อที่ต้องการ"
            style={{ marginBottom: 16 }}
          />
        )}
        <Table
          dataSource={round.buyerBids}
          columns={cols}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: 'ยังไม่มีการเสนอราคา' }}
          onRow={(r) => ({ style: r.winner ? { background: '#f6ffed' } : {} })}
        />
      </Card>

      {/* Add bid modal */}
      <Modal
        open={bidModal}
        title={<span><PlusOutlined style={{ marginRight: 8 }} />เพิ่มการเสนอราคา (Demo)</span>}
        onCancel={() => { setBidModal(false); form.resetFields(); }}
        onOk={handleAdd}
        okText="เพิ่ม"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="ชื่อผู้ซื้อ" name="buyerName" rules={[{ required: true, message: 'กรุณาระบุชื่อผู้ซื้อ' }]}>
            <Input placeholder="ชื่อบริษัท / นิติบุคคล" />
          </Form.Item>
          <Form.Item label="ชนิดยางที่ต้องการซื้อ" name="rubberType" rules={[{ required: true, message: 'กรุณาเลือกชนิดยาง' }]}>
            <Select placeholder="เลือกชนิดยาง">
              {RUBBER_TYPES.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
            </Select>
          </Form.Item>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={`น้ำหนักที่ต้องการ (กก.)${round.minBuyerWeight ? ` — ขั้นต่ำ ${round.minBuyerWeight.toLocaleString()}` : ''}`}
                name="targetWeight"
                rules={[
                  { required: true, message: 'กรุณาระบุ' },
                  () => ({
                    validator(_, value) {
                      if (value == null || round.minBuyerWeight == null) return Promise.resolve();
                      return value >= round.minBuyerWeight
                        ? Promise.resolve()
                        : Promise.reject(new Error(`ต้องไม่ต่ำกว่า ${round.minBuyerWeight.toLocaleString()} กก.`));
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={round.minBuyerWeight ?? 100} step={100} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={`ราคาเสนอ (฿/กก.)${round.minBuyerPrice ? ` — ขั้นต่ำ ${round.minBuyerPrice.toFixed(2)}` : ''}`}
                name="offerPrice"
                rules={[
                  { required: true, message: 'กรุณาระบุ' },
                  () => ({
                    validator(_, value) {
                      if (value == null || round.minBuyerPrice == null) return Promise.resolve();
                      return value >= round.minBuyerPrice
                        ? Promise.resolve()
                        : Promise.reject(new Error(`ต้องไม่ต่ำกว่า ${round.minBuyerPrice.toFixed(2)} ฿/กก.`));
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={round.minBuyerPrice ?? 1} step={0.5} precision={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Confirm winner modal */}
      <Modal
        open={!!confirmBid}
        title={<span><TrophyOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />ยืนยันการเลือกผู้ชนะ</span>}
        onCancel={() => setConfirmBid(null)}
        onOk={() => { if (confirmBid) { onSelectWinner(confirmBid); setConfirmBid(null); } }}
        okText="ยืนยันผู้ชนะ"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
      >
        {confirmBid && (
          <div style={{ marginTop: 8 }}>
            <Alert
              type="info"
              showIcon
              title="เมื่อยืนยันแล้วจะไม่สามารถเปลี่ยนผู้ชนะได้ และระบบจะเปิดรับปริมาณจากผู้ขายทันที"
              style={{ marginBottom: 16 }}
            />
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="ผู้ซื้อ"><Text strong>{confirmBid.buyerName}</Text></Descriptions.Item>
              <Descriptions.Item label="ชนิดยาง"><Tag color="blue">{confirmBid.rubberType}</Tag></Descriptions.Item>
              <Descriptions.Item label="น้ำหนักที่ต้องการ"><Text strong>{confirmBid.targetWeight.toLocaleString()} กก.</Text></Descriptions.Item>
              <Descriptions.Item label="ราคาเสนอ"><Text strong style={{ color: '#1a7c3e' }}>{confirmBid.offerPrice.toFixed(2)} ฿/กก.</Text></Descriptions.Item>
              <Descriptions.Item label="เวลายื่น">{confirmBid.submittedAt}</Descriptions.Item>
              <Descriptions.Item label="มูลค่าประมาณ">
                <Text strong style={{ color: '#fa8c16' }}>
                  {(confirmBid.targetWeight * confirmBid.offerPrice).toLocaleString()} ฿
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </>
  );
}

// ─── Step 1: รับปริมาณผู้ขาย ──────────────────────────────────────────────────

function Step1({
  round,
  onAddSeller,
  onCloseSubmissions,
}: {
  round: ForwardRound;
  onAddSeller: (name: string, qty: number, deliveryDate?: string) => void;
  onCloseSubmissions: () => void;
}) {
  const [sellerModal, setSellerModal] = useState(false);
  const [closeModal,  setCloseModal]  = useState(false);
  const [sellerForm]  = Form.useForm<{ sellerName: string; offeredQty: number; deliveryDate: Dayjs | null }>();

  const targetWeight = round.winner?.targetWeight ?? 0;
  const total   = round.submissions.reduce((s, r) => s + r.offeredQty, 0);
  const percent = targetWeight > 0 ? Math.min(Math.round((total / targetWeight) * 100), 100) : 0;

  function handleAddSeller() {
    sellerForm.validateFields().then((v) => {
      onAddSeller(v.sellerName, Number(v.offeredQty), v.deliveryDate ? v.deliveryDate.format('YYYY-MM-DD') : undefined);
      sellerForm.resetFields();
      setSellerModal(false);
    });
  }

  function handleClose() {
    onCloseSubmissions();
    setCloseModal(false);
  }

  const cols: ColumnsType<SellerSubmission> = [
    { title: 'ลำดับ', dataIndex: 'seq', width: 60, align: 'center' },
    { title: 'ผู้ขาย', dataIndex: 'sellerName' },
    { title: 'ปริมาณที่เสนอ (กก.)', dataIndex: 'offeredQty', align: 'right', render: (v: number) => v.toLocaleString() },
    {
      title: 'วันส่งมอบ (ผู้ขาย)',
      dataIndex: 'deliveryDate',
      render: (v?: string) => v ?? <Text type="secondary">—</Text>,
    },
    { title: 'เวลายื่น', dataIndex: 'submittedAt' },
    { title: 'สถานะ', render: () => <Tag color="processing">รอดำเนินการ</Tag> },
  ];

  return (
    <>
      <Card
        title={<Space><TeamOutlined style={{ color: '#1a7c3e' }} /><span>ผู้ขายเสนอปริมาณ</span></Space>}
        extra={
          <Space>
            <Button icon={<PlusOutlined />} onClick={() => setSellerModal(true)}>
              เพิ่มผู้ขาย [Demo]
            </Button>
            <Button
              type="primary"
              style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              disabled={total === 0}
              onClick={() => setCloseModal(true)}
            >
              ปิดรับและออกสัญญา
            </Button>
          </Space>
        }
      >
        {round.winner && <WinnerCard winner={round.winner} />}

        <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
          <Row gutter={24} align="middle">
            <Col flex="auto">
              <Progress
                percent={percent}
                strokeColor="#1a7c3e"
                format={() => `${total.toLocaleString()} / ${targetWeight.toLocaleString()} กก.`}
              />
            </Col>
            <Col>
              {total >= targetWeight && targetWeight > 0
                ? <Tag color="success">ครบจำนวน</Tag>
                : <Tag color="warning">รอผู้ขายเพิ่ม</Tag>}
            </Col>
          </Row>
        </Card>

        <Table
          dataSource={round.submissions}
          columns={cols}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: 'ยังไม่มีผู้ขายเสนอปริมาณ' }}
        />
      </Card>

      <Modal
        open={sellerModal}
        title={<span><PlusOutlined style={{ marginRight: 8 }} />เพิ่มผู้ขาย (Demo)</span>}
        onCancel={() => { setSellerModal(false); sellerForm.resetFields(); }}
        onOk={handleAddSeller}
        okText="เพิ่ม"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
      >
        <Form form={sellerForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="ชื่อผู้ขาย" name="sellerName" rules={[{ required: true, message: 'กรุณาระบุชื่อ' }]}>
            <Input placeholder="ชื่อ-นามสกุล / ชื่อนิติบุคคล" />
          </Form.Item>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="ปริมาณที่เสนอ (กก.)" name="offeredQty" rules={[{ required: true, message: 'กรุณาระบุ' }]}>
                <InputNumber style={{ width: '100%' }} min={1} step={100} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="วันส่งมอบ" name="deliveryDate" rules={[{ required: true, message: 'กรุณาเลือกวัน' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        open={closeModal}
        title={<Space><FileProtectOutlined style={{ color: '#1a7c3e' }} />ยืนยันปิดรับปริมาณและดำเนินการออกสัญญา</Space>}
        onCancel={() => setCloseModal(false)}
        onOk={handleClose}
        okText="ยืนยันปิดรับ"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        width={480}
      >
        {/* Weight summary */}
        <div style={{ marginTop: 8 }}>
          <Row gutter={[12, 8]} style={{ marginBottom: 12 }}>
            <Col xs={24} sm={12}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
                <Statistic title="ปริมาณที่ผู้ซื้อต้องการ" value={targetWeight} suffix="กก." styles={{ content: { color: '#0f3d22', fontSize: 18 } }} />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" style={{ textAlign: 'center', borderColor: total >= targetWeight ? '#52c41a' : '#faad14' }}>
                <Statistic title="ปริมาณรวมจากผู้ขาย" value={total} suffix="กก." styles={{ content: { color: total >= targetWeight ? '#52c41a' : '#faad14', fontSize: 18 } }} />
              </Card>
            </Col>
          </Row>

          {/* Per-seller breakdown */}
          <Card size="small" style={{ marginBottom: 12 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>รายละเอียดผู้ขาย</Text>
            {round.submissions.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text style={{ fontSize: 13 }}>{s.sellerName}</Text>
                <Space>
                  <Text strong style={{ fontSize: 13 }}>{s.offeredQty.toLocaleString()} กก.</Text>
                  {s.deliveryDate && <Text type="secondary" style={{ fontSize: 12 }}>{s.deliveryDate}</Text>}
                </Space>
              </div>
            ))}
          </Card>

          {total >= targetWeight
            ? <Alert type="success" showIcon title="ปริมาณครบตามเป้าหมาย — สามารถดำเนินการออกสัญญาได้ทันที" />
            : <Alert type="warning" showIcon title={`ปริมาณยังขาด ${(targetWeight - total).toLocaleString()} กก. — เมื่อยืนยันจะแจ้งให้ผู้ซื้อตัดสินใจ`} />
          }
          <Alert
            type="info"
            showIcon
            style={{ marginTop: 8 }}
            title="เมื่อยืนยันแล้วจะปิดรับปริมาณและย้ายไปขั้นตอนออกสัญญา ไม่สามารถย้อนกลับได้"
          />
        </div>
      </Modal>
    </>
  );
}

// ─── Step 2: ออกสัญญา ─────────────────────────────────────────────────────────

function Step2({
  round,
  onShortageChange,
  onBuyerDecideDemo,
  onIssueContracts,
  onIssueOne,
  onIssueAll,
}: {
  round: ForwardRound;
  onShortageChange: (v: ShortageChoice) => void;
  /** Demo-only: simulates the buyer picking an allocation on their page */
  onBuyerDecideDemo: (v: AllocationMode) => void;
  onIssueContracts: () => void;
  onIssueOne: (contractNo: string) => void;
  onIssueAll: () => void;
}) {
  const targetWeight  = round.winner?.targetWeight ?? 0;
  const total         = round.submissions.reduce((s, r) => s + r.offeredQty, 0);
  const diff          = total - targetWeight;
  const allocated     = computeAllocation(round.submissions, targetWeight, round.allocationChoice);
  const pendingCount  = round.contracts.filter((c) => c.status === 'pending_sign').length;
  const contractsDone = round.contracts.length > 0;

  const allocCols: ColumnsType<SellerSubmission> = [
    { title: 'ลำดับ', dataIndex: 'seq', width: 60, align: 'center' },
    { title: 'ผู้ขาย', dataIndex: 'sellerName' },
    { title: 'เสนอ (กก.)', dataIndex: 'offeredQty', align: 'right', render: (v: number) => v.toLocaleString() },
    {
      title: 'ได้รับจัดสรร (กก.)', align: 'right',
      render: (_, r) => {
        const a = allocated.find((x) => x.id === r.id);
        return <Text strong>{(a?.allocatedQty ?? 0).toLocaleString()}</Text>;
      },
    },
    {
      title: 'สถานะ',
      render: (_, r) => {
        const a = allocated.find((x) => x.id === r.id);
        const qty = a?.allocatedQty ?? 0;
        if (qty === 0)             return <Tag color="default">ตัดปริมาณ</Tag>;
        if (qty < r.offeredQty)    return <Tag color="warning">ตัดปริมาณบางส่วน</Tag>;
        return <Tag color="success">ยืนยัน</Tag>;
      },
    },
  ];

  const contractCols: ColumnsType<ForwardContract> = [
    { title: 'เลขสัญญา', dataIndex: 'contractNo', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'ผู้ซื้อ', dataIndex: 'buyerName' },
    { title: 'ผู้ขาย', dataIndex: 'sellerName' },
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    { title: 'ปริมาณ (กก.)', dataIndex: 'quantity', align: 'right', render: (v: number) => v.toLocaleString() },
    { title: 'ราคา (฿/กก.)', dataIndex: 'price', align: 'right', render: (v: number) => v.toFixed(2) },
    { title: 'มูลค่ารวม (฿)', dataIndex: 'totalValue', align: 'right', render: (v: number) => v.toLocaleString() },
    { title: 'กำหนดส่งมอบ', dataIndex: 'deliveryDate' },
    {
      title: 'สถานะ', dataIndex: 'status',
      render: (s: ContractStatus) => s === 'signed'
        ? <Tag color="success" icon={<CheckCircleOutlined />}>ลงนามแล้ว</Tag>
        : <Tag color="warning">รอลงนาม</Tag>,
    },
    {
      title: 'ดำเนินการ',
      render: (_, r) => r.status === 'pending_sign'
        ? <Button size="small" type="primary" style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }} onClick={() => onIssueOne(r.contractNo)}>ออกสัญญา</Button>
        : <Text type="secondary" style={{ fontSize: 12 }}>เสร็จสิ้น</Text>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {round.winner && <WinnerCard winner={round.winner} />}

      {!contractsDone && (
        <Card title={<Space><ExclamationCircleOutlined style={{ color: '#fa8c16' }} /><span>ตรวจสอบและจัดสรรปริมาณ</span></Space>}>
          <Row gutter={24} style={{ marginBottom: 16 }}>
            <Col><Statistic title="ปริมาณที่ผู้ซื้อชนะ (กก.)" value={targetWeight} /></Col>
            <Col><Statistic title="ปริมาณรวมผู้ขาย (กก.)" value={total} /></Col>
            <Col>
              <Statistic
                title="ผลต่าง (กก.)"
                value={Math.abs(diff)}
                prefix={diff > 0 ? '+' : diff < 0 ? '-' : ''}
                styles={{ content: { color: diff > 0 ? '#ff4d4f' : diff < 0 ? '#fa8c16' : '#52c41a' } }}
              />
            </Col>
          </Row>

          {diff > 0 && (
            <>
              <Alert type="warning" showIcon title={`ปริมาณเกินเป้าหมาย ${diff.toLocaleString()} กก. — การตัดสินใจเป็นของผู้ซื้อ`} style={{ marginBottom: 12 }} />
              <Card
                size="small"
                style={{
                  background: round.buyerDecided ? '#f6ffed' : '#fffbe6',
                  border: `1px solid ${round.buyerDecided ? '#b7eb8f' : '#ffe58f'}`,
                  marginBottom: 12,
                }}
              >
                <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    เจ้าหน้าที่ไม่สามารถเลือกแทนผู้ซื้อได้ — ผู้ซื้อต้องเลือกเองจากหน้า &ldquo;ตลาดล่วงหน้า&rdquo; ของตนเอง
                  </Text>
                  {round.buyerDecided ? (
                    <Space>
                      <Text strong>ผู้ซื้อเลือก:</Text>
                      <Tag
                        color={round.allocationChoice === 'all' ? 'success' : 'warning'}
                        icon={<CheckCircleOutlined />}
                      >
                        {round.allocationChoice === 'all'
                          ? 'รับทั้งหมดจากผู้ขายทุกราย'
                          : 'รับเท่าปริมาณที่ชนะประมูล (ตัดตามลำดับ)'}
                      </Tag>
                    </Space>
                  ) : (
                    <Space wrap>
                      <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
                        รอผู้ซื้อตัดสินใจ
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>— จำลอง:</Text>
                      <Button size="small" onClick={() => onBuyerDecideDemo('all')}>
                        [Demo] ผู้ซื้อเลือก: รับทั้งหมด
                      </Button>
                      <Button size="small" onClick={() => onBuyerDecideDemo('cut')}>
                        [Demo] ผู้ซื้อเลือก: ตัดตามลำดับ
                      </Button>
                    </Space>
                  )}
                </Space>
              </Card>
              <Table dataSource={allocated} columns={allocCols} rowKey="id" pagination={false} size="small" style={{ marginBottom: 8 }} scroll={{ x: 'max-content' }} />
            </>
          )}
          {diff === 0 && (
            <Alert type="success" showIcon title="ปริมาณพอดีกับเป้าหมาย — พร้อมออกสัญญาทันที" style={{ marginBottom: 12 }} />
          )}
          {diff < 0 && (
            <>
              <Alert type="info" showIcon title={`ปริมาณยังไม่ถึงเป้า ${Math.abs(diff).toLocaleString()} กก.`} description="สอบถามผู้ซื้อ: รับตามที่มีหรือยกเลิกรอบนี้" style={{ marginBottom: 12 }} />
              <Card size="small" style={{ background: '#e6f4ff', border: '1px solid #91caff', marginBottom: 12 }}>
                <Text strong>การตัดสินใจของผู้ซื้อ: </Text>
                <Radio.Group value={round.shortageChoice} onChange={(e) => onShortageChange(e.target.value)} style={{ marginLeft: 8 }}>
                  <Radio value="accept">รับตามที่มี ({total.toLocaleString()} กก.)</Radio>
                  <Radio value="cancel">ยกเลิกรอบนี้</Radio>
                </Radio.Group>
              </Card>
            </>
          )}

          {diff < 0 && round.shortageChoice === 'cancel'
            ? <Button danger>ยกเลิกรอบการซื้อขาย</Button>
            : (
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
                onClick={onIssueContracts}
                disabled={diff > 0 && !round.buyerDecided}
              >
                {diff > 0 && !round.buyerDecided ? 'รอผู้ซื้อตัดสินใจก่อนออกสัญญา' : 'สร้างสัญญาทั้งหมด'}
              </Button>
            )}
        </Card>
      )}

      {contractsDone && (
        <Card
          title={<Space><FileProtectOutlined style={{ color: '#1a7c3e' }} /><span>สัญญาซื้อขายล่วงหน้า</span></Space>}
          extra={
            <Button
              type="primary"
              style={{ background: '#0f3d22', borderColor: '#0f3d22' }}
              disabled={pendingCount === 0}
              onClick={onIssueAll}
            >
              ออกสัญญาทั้งหมด ({pendingCount})
            </Button>
          }
        >
          <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
            <Col xs={12} md={6}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
                <Statistic title="จำนวนสัญญา" value={round.contracts.length} suffix="ฉบับ" styles={{ content: { color: '#0f3d22' } }} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
                <Statistic title="ปริมาณรวม (กก.)" value={round.contracts.reduce((s, c) => s + c.quantity, 0)} styles={{ content: { color: '#1677ff' } }} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#fa8c16' }}>
                <Statistic title="มูลค่ารวม (฿)" value={round.contracts.reduce((s, c) => s + c.totalValue, 0)} styles={{ content: { color: '#fa8c16' } }} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#52c41a' }}>
                <Statistic title="ผู้ขายทั้งหมด" value={round.contracts.length} suffix="ราย" styles={{ content: { color: '#52c41a' } }} />
              </Card>
            </Col>
          </Row>
          <Table dataSource={round.contracts} columns={contractCols} rowKey="contractNo" pagination={false} size="small" scroll={{ x: 'max-content' }} />
        </Card>
      )}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab({ history }: { history: ForwardRound[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expanded = history.find((r) => r.id === expandedId);

  const summaryCols: ColumnsType<ForwardRound> = [
    { title: 'รหัสรอบ', dataIndex: 'id', render: (v: string) => <Text strong>{v}</Text>, width: 110 },
    { title: 'หัวข้อรอบ', dataIndex: 'topic' },
    { title: 'ชนิดยาง (ผู้ชนะ)', render: (_, r) => r.winner ? <Tag color="blue">{r.winner.rubberType}</Tag> : '-' },
    { title: 'ผู้ชนะประมูล', render: (_, r) => r.winner?.buyerName ?? '-' },
    { title: 'ราคา (฿/กก.)', align: 'right', render: (_, r) => r.winner ? <Text strong style={{ color: '#1a7c3e' }}>{r.winner.offerPrice.toFixed(2)}</Text> : '-' },
    { title: 'ปริมาณรวม (กก.)', align: 'right', render: (_, r) => r.contracts.reduce((s, c) => s + c.quantity, 0).toLocaleString() },
    { title: 'มูลค่ารวม (฿)', align: 'right', render: (_, r) => <Text strong>{r.contracts.reduce((s, c) => s + c.totalValue, 0).toLocaleString()}</Text> },
    { title: 'จำนวนสัญญา', align: 'center', render: (_, r) => <Tag color="blue">{r.contracts.length} ฉบับ</Tag> },
    { title: 'กำหนดส่งมอบ', dataIndex: 'deliveryDate' },
    { title: 'เสร็จสิ้นเมื่อ', dataIndex: 'completedAt' },
    {
      title: 'รายละเอียด',
      render: (_, r) => (
        <Button size="small" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
          {expandedId === r.id ? 'ซ่อน' : 'ดูสัญญา'}
        </Button>
      ),
    },
  ];

  const contractCols: ColumnsType<ForwardContract> = [
    { title: 'เลขสัญญา', dataIndex: 'contractNo', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'ผู้ซื้อ', dataIndex: 'buyerName' },
    { title: 'ผู้ขาย', dataIndex: 'sellerName' },
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    { title: 'ปริมาณ (กก.)', dataIndex: 'quantity', align: 'right', render: (v: number) => v.toLocaleString() },
    { title: 'ราคา (฿/กก.)', dataIndex: 'price', align: 'right', render: (v: number) => v.toFixed(2) },
    { title: 'มูลค่ารวม (฿)', dataIndex: 'totalValue', align: 'right', render: (v: number) => v.toLocaleString() },
    { title: 'กำหนดส่งมอบ', dataIndex: 'deliveryDate' },
    {
      title: 'สถานะ',
      render: () => <Tag color="success" icon={<CheckCircleOutlined />}>ลงนามแล้ว</Tag>,
    },
  ];

  if (history.length === 0) {
    return (
      <Card>
        <Empty description="ยังไม่มีประวัติรอบตลาดล่วงหน้าที่เสร็จสิ้น" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary stats */}
      <Row gutter={[16, 12]}>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
            <Statistic
              title="รอบที่เสร็จสิ้นทั้งหมด"
              value={history.length}
              suffix="รอบ"
              styles={{ content: { color: '#0f3d22' } }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic
              title="สัญญาทั้งหมด"
              value={history.reduce((s, r) => s + r.contracts.length, 0)}
              suffix="ฉบับ"
              styles={{ content: { color: '#1677ff' } }}
              prefix={<FileProtectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#52c41a' }}>
            <Statistic
              title="ปริมาณรวมทั้งหมด (กก.)"
              value={history.reduce((s, r) => s + r.contracts.reduce((cs, c) => cs + c.quantity, 0), 0)}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#fa8c16' }}>
            <Statistic
              title="มูลค่ารวมทั้งหมด (฿)"
              value={history.reduce((s, r) => s + r.contracts.reduce((cs, c) => cs + c.totalValue, 0), 0)}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* History table */}
      <Card title={<Space><HistoryOutlined /><span>ประวัติรอบตลาดล่วงหน้าที่เสร็จสิ้น</span></Space>}>
        <Table
          dataSource={history}
          columns={summaryCols}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Expanded contract detail */}
      {expanded && (
        <Card
          title={
            <Space>
              <FileProtectOutlined style={{ color: '#1a7c3e' }} />
              <span>สัญญาของรอบ {expanded.id}</span>
              {expanded.winner && <Tag color="blue">{expanded.winner.rubberType}</Tag>}
              {expanded.winner && (
                <Text type="secondary" style={{ fontWeight: 400 }}>
                  ผู้ชนะ: {expanded.winner.buyerName} | {expanded.winner.offerPrice.toFixed(2)} ฿/กก.
                </Text>
              )}
            </Space>
          }
          extra={<Button size="small" onClick={() => setExpandedId(null)}>ปิด</Button>}
          style={{ borderColor: '#1a7c3e' }}
        >
          <Table
            dataSource={expanded.contracts}
            columns={contractCols}
            rowKey="contractNo"
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffForwardPage() {
  const [rounds,     setRounds]     = useState<ForwardRound[]>(INITIAL_ROUNDS);
  const [history]                   = useState<ForwardRound[]>(HISTORY_ROUNDS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_ROUNDS[0]?.id ?? '');
  const [mainTab,    setMainTab]    = useState<'active' | 'history'>('active');
  const [createModal, setCreateModal] = useState(false);
  const [createForm] = Form.useForm<{
    topic: string;
    biddingOpensAt: Dayjs | null;
    bidDeadline: Dayjs | null;
    deliveryDate: Dayjs | null;
    minBuyerWeight: number;
    minBuyerPrice: number;
    remark?: string;
  }>();

  const round = rounds.find((r) => r.id === selectedId);

  function updateRound(updated: ForwardRound) {
    setRounds((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  // Create new round
  function handleCreate() {
    createForm.validateFields().then((v) => {
      const seq  = rounds.length + 1;
      const id   = `FWD-${String(seq).padStart(3, '0')}`;
      const now  = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const newRound: ForwardRound = {
        id,
        topic:           v.topic,
        step:            0,
        status:          'active',
        biddingOpensAt:  v.biddingOpensAt ? v.biddingOpensAt.format('YYYY-MM-DD HH:mm') : undefined,
        bidDeadline:     v.bidDeadline    ? v.bidDeadline.format('YYYY-MM-DD HH:mm')   : undefined,
        deliveryDate:    v.deliveryDate   ? v.deliveryDate.format('YYYY-MM-DD')        : undefined,
        minBuyerWeight:  v.minBuyerWeight,
        minBuyerPrice:   v.minBuyerPrice,
        remark:          v.remark,
        buyerBids:       [],
        winnerAnnounced: false,
        submissions:     [],
        allocationChoice:'all',
        buyerDecided:    false,
        shortageChoice:  'accept',
        contracts:       [],
        createdAt:       now,
      };
      setRounds((prev) => [...prev, newRound]);
      setSelectedId(id);
      createForm.resetFields();
      setCreateModal(false);
    });
  }

  // Delete round
  function handleDelete(id: string) {
    confirm({
      title: `ยืนยันลบรอบ ${id}`,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'การลบรอบนี้ไม่สามารถย้อนกลับได้',
      okText: 'ลบรอบ',
      okButtonProps: { danger: true },
      cancelText: 'ยกเลิก',
      onOk: () => {
        setRounds((prev) => {
          const next = prev.filter((r) => r.id !== id);
          if (id === selectedId) setSelectedId(next[0]?.id ?? '');
          return next;
        });
      },
    });
  }

  // Step 0: add buyer bid
  function handleAddBid(bid: Omit<BuyerBid, 'id' | 'submittedAt'>) {
    if (!round) return;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    updateRound({
      ...round,
      // eslint-disable-next-line react-hooks/purity
      buyerBids: [...round.buyerBids, { ...bid, id: `b-${Date.now()}`, submittedAt: now }],
    });
  }

  // Step 0: staff manually selects winner → advance to step 1
  function handleSelectWinner(bid: BuyerBid) {
    if (!round) return;
    updateRound({
      ...round,
      winner:          { ...bid, winner: true },
      winnerAnnounced: true,
      buyerBids:       round.buyerBids.map((b) => ({ ...b, winner: b.id === bid.id })),
      step:            1,
    });
  }

  // Step 1: add seller
  function handleAddSeller(name: string, qty: number, deliveryDate?: string) {
    if (!round) return;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    updateRound({
      ...round,
      submissions: [
        ...round.submissions,
        // eslint-disable-next-line react-hooks/purity
        { id: `s-${Date.now()}`, seq: round.submissions.length + 1, sellerName: name, offeredQty: qty, deliveryDate, submittedAt: now },
      ],
    });
  }

  // Step 1: close submissions → step 2
  function handleCloseSubmissions() {
    if (!round) return;
    updateRound({ ...round, step: 2 });
  }

  // Step 2: issue contracts
  function handleIssueContracts() {
    if (!round) return;
    const targetWeight = round.winner?.targetWeight ?? 0;
    const total = round.submissions.reduce((s, r) => s + r.offeredQty, 0);
    const diff  = total - targetWeight;
    const mode: AllocationMode = diff > 0 ? round.allocationChoice : 'all';
    const allocated  = computeAllocation(round.submissions, targetWeight, mode);
    const dateTag    = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const contracts: ForwardContract[] = allocated
      .filter((s) => (s.allocatedQty ?? 0) > 0)
      .map((s, i) => ({
        contractNo:   `FC-${dateTag}-${String(i + 1).padStart(3, '0')}`,
        buyerName:    round.winner?.buyerName ?? '-',
        sellerName:   s.sellerName,
        rubberType:   round.winner?.rubberType ?? '-',
        quantity:     s.allocatedQty ?? 0,
        price:        round.winner?.offerPrice ?? 0,
        totalValue:   (s.allocatedQty ?? 0) * (round.winner?.offerPrice ?? 0),
        deliveryDate: s.deliveryDate ?? '-',   // each seller's own delivery date
        status:       'pending_sign' as ContractStatus,
      }));
    updateRound({ ...round, contracts });
  }

  // Step 2: sign one
  function handleIssueOne(contractNo: string) {
    if (!round) return;
    updateRound({
      ...round,
      contracts: round.contracts.map((c) =>
        c.contractNo === contractNo ? { ...c, status: 'signed' as ContractStatus } : c,
      ),
    });
  }

  // Step 2: sign all
  function handleIssueAll() {
    if (!round) return;
    updateRound({
      ...round,
      contracts: round.contracts.map((c) => ({ ...c, status: 'signed' as ContractStatus })),
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            ตลาดล่วงหน้า (Forward Contract)
          </Title>
          <Text type="secondary">UC-SYS04-013 | FR-SYS04-050 ถึง FR-SYS04-054</Text>
        </div>
        {mainTab === 'active' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
            onClick={() => setCreateModal(true)}
          >
            สร้างรอบใหม่
          </Button>
        )}
      </div>

      {/* Main tabs: รอบปัจจุบัน | ประวัติ */}
      <Tabs
        activeKey={mainTab}
        onChange={(k) => setMainTab(k as 'active' | 'history')}
        items={[
          {
            key: 'active',
            label: <Space><ClockCircleOutlined />รอบปัจจุบัน<Tag color="blue">{rounds.length}</Tag></Space>,
            children: (
              rounds.length === 0 ? (
                <Card>
                  <Empty description="ยังไม่มีรอบตลาดล่วงหน้า" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<PlusOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }} onClick={() => setCreateModal(true)}>
                      สร้างรอบแรก
                    </Button>
                  </Empty>
                </Card>
              ) : (
                <Row gutter={[16, 16]} align="top">
                  {/* Round list */}
                  <Col xs={24} md={8} lg={6}>
                    <Card title="รอบตลาดล่วงหน้า" bodyStyle={{ padding: 0 }} size="small">
                      {rounds.map((r) => {
                        const sl     = stepLabel(r.step);
                        const active = r.id === selectedId;
                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedId(r.id)}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              borderLeft:   active ? '3px solid #1a7c3e' : '3px solid transparent',
                              background:   active ? '#f6ffed' : 'transparent',
                              borderBottom: '1px solid #f0f0f0',
                              transition:   'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ color: active ? '#0f3d22' : '#262626', fontSize: 12 }}>{r.id}</Text>
                              <Button
                                size="small" type="text" danger icon={<DeleteOutlined />}
                                onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                              />
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <Text style={{ fontSize: 12, color: '#595959' }} ellipsis>{r.topic}</Text>
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <Tag color={sl.color} style={{ fontSize: 11 }}>{sl.text}</Tag>
                            </div>
                          </div>
                        );
                      })}
                    </Card>
                  </Col>

                  {/* Round detail */}
                  <Col xs={24} md={16} lg={18}>
                    {round && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Card bodyStyle={{ padding: '16px 24px' }}>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong style={{ color: '#0f3d22' }}>{round.topic}</Text>
                          </div>
                          <Row align="middle" gutter={16}>
                            <Col flex="auto">
                              <Steps current={round.step} size="small" items={STEP_ITEMS} />
                            </Col>
                            <Col>
                              <Space split={<Divider type="vertical" />} wrap>
                                {round.biddingOpensAt && (
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    เปิดประมูล: {round.biddingOpensAt}
                                  </Text>
                                )}
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  <CalendarOutlined style={{ marginRight: 4 }} />
                                  ปิดประมูล: {round.bidDeadline ?? '—'}
                                </Text>
                                {round.deliveryDate && (
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    ส่งมอบ: {round.deliveryDate}
                                  </Text>
                                )}
                                {round.minBuyerWeight != null && (
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    ขั้นต่ำ: {round.minBuyerWeight.toLocaleString()} กก.
                                    {round.minBuyerPrice != null && ` / ${round.minBuyerPrice.toFixed(2)} ฿/กก.`}
                                  </Text>
                                )}
                              </Space>
                            </Col>
                          </Row>
                        </Card>

                        {round.step === 0 && (
                          <Step0
                            round={round}
                            onAddBid={handleAddBid}
                            onSelectWinner={handleSelectWinner}
                          />
                        )}
                        {round.step === 1 && (
                          <Step1
                            round={round}
                            onAddSeller={handleAddSeller}
                            onCloseSubmissions={handleCloseSubmissions}
                          />
                        )}
                        {round.step === 2 && (
                          <Step2
                            round={round}
                            onShortageChange={(v) => updateRound({ ...round, shortageChoice: v })}
                            onBuyerDecideDemo={(v) => updateRound({ ...round, allocationChoice: v, buyerDecided: true })}
                            onIssueContracts={handleIssueContracts}
                            onIssueOne={handleIssueOne}
                            onIssueAll={handleIssueAll}
                          />
                        )}
                      </div>
                    )}
                  </Col>
                </Row>
              )
            ),
          },
          {
            key: 'history',
            label: <Space><HistoryOutlined />ประวัติ<Tag color="default">{history.length}</Tag></Space>,
            children: <HistoryTab history={history} />,
          },
        ]}
      />

      {/* Create round modal */}
      <Modal
        open={createModal}
        title={<span><CalendarOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />สร้างรอบตลาดล่วงหน้าใหม่</span>}
        onCancel={() => { setCreateModal(false); createForm.resetFields(); }}
        onOk={handleCreate}
        okText="สร้างรอบ"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        width={480}
      >
        <Divider style={{ margin: '12px 0' }} />
        <Form form={createForm} layout="vertical">
          <Form.Item label="หัวข้อรอบ" name="topic" rules={[{ required: true, message: 'กรุณาระบุหัวข้อ' }]}>
            <Input placeholder="เช่น รับซื้อยางแผ่นรมควัน Q2/2569" />
          </Form.Item>

          {/* ── Buyer-bidding window ─────────────────────────────────────── */}
          <Form.Item
            label="วัน-เวลาที่เปิดรับประมูลฝั่งผู้ซื้อ"
            name="biddingOpensAt"
            rules={[{ required: true, message: 'กรุณาเลือกวัน-เวลาเปิดรับประมูล' }]}
            extra="ก่อนวัน-เวลานี้ ปุ่มเสนอราคาฝั่งผู้ซื้อจะถูกปิดไว้"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY HH:mm"
              showTime={{ format: 'HH:mm', minuteStep: 5 }}
              placeholder="เลือกวันและเวลา"
            />
          </Form.Item>

          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="วัน-เวลาปิดรับประมูลผู้ซื้อ"
                name="bidDeadline"
                dependencies={['biddingOpensAt']}
                rules={[
                  { required: true, message: 'กรุณาเลือกวัน-เวลา' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const open = getFieldValue('biddingOpensAt') as Dayjs | null;
                      if (!value || !open) return Promise.resolve();
                      return value.isAfter(open)
                        ? Promise.resolve()
                        : Promise.reject(new Error('ต้องอยู่หลังวัน-เวลาเปิดรับประมูล'));
                    },
                  }),
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY HH:mm"
                  showTime={{ format: 'HH:mm', minuteStep: 5 }}
                  placeholder="เลือกวันและเวลา"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="วันส่งมอบ"
                name="deliveryDate"
                dependencies={['bidDeadline']}
                rules={[
                  { required: true, message: 'กรุณาเลือกวันส่งมอบ' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const bid = getFieldValue('bidDeadline') as Dayjs | null;
                      if (!value || !bid) return Promise.resolve();
                      return value.isAfter(bid, 'day')
                        ? Promise.resolve()
                        : Promise.reject(new Error('วันส่งมอบต้องหลังวันปิดรับประมูล'));
                    },
                  }),
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Buyer-bid minimums ───────────────────────────────────────── */}
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="น้ำหนักขั้นต่ำที่ผู้ซื้อเสนอได้"
                name="minBuyerWeight"
                rules={[{ required: true, message: 'กรุณาระบุน้ำหนักขั้นต่ำ' }]}
              >
                <InputNumberSuffix
                  style={{ width: '100%' }}
                  min={1}
                  step={100}
                  suffix="กก."
                  placeholder="เช่น 1000"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="ราคาขั้นต่ำที่ผู้ซื้อเสนอได้"
                name="minBuyerPrice"
                rules={[{ required: true, message: 'กรุณาระบุราคาขั้นต่ำ' }]}
              >
                <InputNumberSuffix
                  style={{ width: '100%' }}
                  min={1}
                  step={0.5}
                  precision={2}
                  suffix="฿/กก."
                  placeholder="เช่น 60.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุ (ไม่บังคับ)" name="remark">
            <TextArea rows={2} placeholder="เงื่อนไขเพิ่มเติม..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
