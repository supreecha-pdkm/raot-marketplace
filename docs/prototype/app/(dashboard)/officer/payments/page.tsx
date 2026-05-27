'use client';

import { useMemo, useState } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input,
  Row, Col, Descriptions, Alert, Tabs, Badge, Typography, Space, App as AntApp,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  DollarOutlined, PrinterOutlined, ClockCircleOutlined,
  PhoneOutlined, ExclamationCircleOutlined, BellOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_CONTRACTS } from '@/features/contracts/services/mock-contracts';
import { MOCK_PAYMENTS } from '@/features/payments/services/mock-payments';
import type { Contract, PaymentRecord } from '@/shared/types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

// ─── Row status & color tones ────────────────────────────────────────────────
// All possible states of a contract from finance's perspective.
type RowStatus =
  | 'overdue'      // dueDate passed and no approved payment
  | 'due-soon'     // dueDate within 3 days and no submitted payment
  | 'unsubmitted'  // contract exists, no PaymentRecord yet (still has runway)
  | 'pending'      // payment submitted, awaiting officer review
  | 'approved'     // payment approved → done
  | 'rejected';    // payment proof rejected, buyer must resubmit

interface PaymentRow {
  key:           string;
  contract:      Contract;
  contractNo:    string;
  buyer:         string;
  seller:        string;
  amount:        number;
  dueDate:       string;
  payment?:      PaymentRecord;
  rowStatus:     RowStatus;
  daysUntilDue:  number;   // negative = overdue
}

// Visual tones — bg + left-border accent shown via onRow. Tag color is for the
// status chip in the cell. Order chosen so urgent rows scream visually:
//   red (overdue/rejected)  →  orange (due-soon)  →  yellow (unsubmitted)
//   →  blue (pending)       →  green (approved).
const STATUS_STYLE: Record<RowStatus, {
  bg:     string;
  accent: string;
  tag:    'error' | 'warning' | 'processing' | 'success' | 'default';
  label:  string;
  icon:   React.ReactNode;
  needsFollowUp: boolean;
}> = {
  overdue:     { bg: '#fff1f0', accent: '#ff4d4f', tag: 'error',      label: 'เกินกำหนด',          icon: <ExclamationCircleOutlined />, needsFollowUp: true  },
  rejected:    { bg: '#fff1f0', accent: '#ff4d4f', tag: 'error',      label: 'ปฏิเสธ — รอส่งใหม่', icon: <CloseCircleOutlined />,       needsFollowUp: true  },
  'due-soon':  { bg: '#fff7e6', accent: '#fa8c16', tag: 'warning',    label: 'ใกล้ครบกำหนด',       icon: <WarningOutlined />,           needsFollowUp: true  },
  unsubmitted: { bg: '#fffbe6', accent: '#faad14', tag: 'warning',    label: 'ยังไม่ส่งหลักฐาน',    icon: <PhoneOutlined />,             needsFollowUp: true  },
  pending:     { bg: '#e6f4ff', accent: '#1677ff', tag: 'processing', label: 'รอตรวจสอบ',          icon: <ClockCircleOutlined />,       needsFollowUp: false },
  approved:    { bg: '#f6ffed', accent: '#52c41a', tag: 'success',    label: 'อนุมัติแล้ว',         icon: <CheckCircleOutlined />,       needsFollowUp: false },
};

// ─── Deterministic mock phone (real impl: from buyer profile API) ───────────
function mockPhone(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const last8 = String(hash % 100_000_000).padStart(8, '0');
  return `08${last8.slice(0, 1)}-${last8.slice(1, 4)}-${last8.slice(4)}`;
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function FinancePaymentsPage() {
  const { message } = AntApp.useApp();
  const [detail, setDetail]             = useState<PaymentRow | null>(null);
  const [rejectModal, setRejectModal]   = useState<PaymentRow | null>(null);
  const [proxyModal, setProxyModal]     = useState(false);
  const [followUp, setFollowUp]         = useState<PaymentRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [form] = Form.useForm();

  // Merge contracts + payments into one row per contract.
  const paymentRows: PaymentRow[] = useMemo(() => {
    const today = dayjs();
    return MOCK_CONTRACTS.map((c): PaymentRow => {
      const payment       = MOCK_PAYMENTS.find(p => p.contractNo === c.contractNo);
      const due           = dayjs(c.dueDate);
      const daysUntilDue  = due.diff(today, 'day');

      let rowStatus: RowStatus;
      if      (payment?.status === 'approved')  rowStatus = 'approved';
      else if (payment?.status === 'pending')   rowStatus = 'pending';
      else if (payment?.status === 'rejected')  rowStatus = 'rejected';
      else if (daysUntilDue < 0)                rowStatus = 'overdue';
      else if (daysUntilDue <= 3)               rowStatus = 'due-soon';
      else                                       rowStatus = 'unsubmitted';

      return {
        key:          c.id,
        contract:     c,
        contractNo:   c.contractNo,
        buyer:        c.buyer,
        seller:       c.seller,
        amount:       c.totalAmount,
        dueDate:      c.dueDate,
        payment,
        rowStatus,
        daysUntilDue,
      };
    });
  }, []);

  // Bucket counts per tab.
  const counts = useMemo(() => {
    const followUpRows = paymentRows.filter(r => STATUS_STYLE[r.rowStatus].needsFollowUp);
    return {
      followUp: followUpRows.length,
      pending:  paymentRows.filter(r => r.rowStatus === 'pending').length,
      approved: paymentRows.filter(r => r.rowStatus === 'approved').length,
      total:    paymentRows.length,
    };
  }, [paymentRows]);

  // ── Actions ────────────────────────────────────────────────────────────
  const handleApprove = (row: PaymentRow) => {
    message.success(`อนุมัติการชำระเงินสัญญา ${row.contractNo} แล้ว`);
    setDetail(null);
  };

  const handleConfirmReject = () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) {
      message.error('กรุณาระบุเหตุผลการปฏิเสธ');
      return;
    }
    message.success(`ปฏิเสธสัญญา ${rejectModal.contractNo} แล้ว — ส่งแจ้งผู้ซื้อ`);
    setRejectModal(null);
    setRejectReason('');
  };

  const handleConfirmFollowUp = () => {
    if (!followUp) return;
    message.success(`บันทึกการติดตามสัญญา ${followUp.contractNo} แล้ว`);
    setFollowUp(null);
    setFollowUpNote('');
  };

  // ── Columns ────────────────────────────────────────────────────────────
  const columns: ColumnsType<PaymentRow> = [
    {
      title: 'สัญญา / ผู้ชนะ',
      render: (_, r) => (
        <div>
          <Text strong style={{ color: '#0958d9', fontSize: 12, fontFamily: 'monospace' }}>
            {r.contractNo}
          </Text>
          <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{r.buyer}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            ขาย: {r.seller}
          </div>
        </div>
      ),
    },
    {
      title: 'จำนวน (฿)',
      dataIndex: 'amount',
      align: 'right' as const,
      render: (v: number) => <Text strong style={{ fontSize: 13 }}>{v.toLocaleString()}</Text>,
    },
    {
      title: 'ครบกำหนด',
      render: (_, r) => {
        const overdue = r.daysUntilDue < 0;
        const soon    = r.daysUntilDue >= 0 && r.daysUntilDue <= 3;
        const color   = overdue ? '#ff4d4f' : soon ? '#fa8c16' : '#595959';
        const label   = overdue
          ? `เกินกำหนด ${Math.abs(r.daysUntilDue)} วัน`
          : r.daysUntilDue === 0
            ? 'ครบกำหนดวันนี้'
            : `อีก ${r.daysUntilDue} วัน`;
        return (
          <div>
            <div style={{ fontSize: 12 }}>{dayjs(r.dueDate).format('DD/MM/YYYY')}</div>
            <Text style={{ fontSize: 11, color, fontWeight: overdue || soon ? 600 : 400 }}>
              {label}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'หลักฐาน',
      render: (_, r) => {
        if (!r.payment) {
          return <Text type="secondary" style={{ fontSize: 11 }}>ยังไม่ส่ง</Text>;
        }
        return (
          <div>
            <div style={{ fontSize: 11 }}>
              {({ transfer: 'โอนเงิน', cash: 'เงินสด', qr: 'Thai QR' } as Record<string, string>)[r.payment.method]}
            </div>
            <Text type="secondary" style={{ fontSize: 10 }}>
              ส่ง {dayjs(r.payment.submittedAt).format('DD/MM HH:mm')}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'rowStatus',
      render: (s: RowStatus) => {
        const cfg = STATUS_STYLE[s];
        return <Tag color={cfg.tag} icon={cfg.icon}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'การดำเนินการ',
      fixed: 'right' as const,
      render: (_, r) => (
        <Space size={4} wrap>
          {STATUS_STYLE[r.rowStatus].needsFollowUp && (
            <Button
              size="small"
              type="primary"
              icon={<PhoneOutlined />}
              onClick={() => setFollowUp(r)}
              style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
            >
              โทรติดตาม
            </Button>
          )}
          {r.payment && (
            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)}>
              ดูหลักฐาน
            </Button>
          )}
          {r.rowStatus === 'pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(r)}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              >
                อนุมัติ
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModal(r)}
              >
                ปฏิเสธ
              </Button>
            </>
          )}
          {r.rowStatus === 'approved' && (
            <Button size="small" icon={<PrinterOutlined />}>ออกใบเสร็จ</Button>
          )}
        </Space>
      ),
    },
  ];

  // ── Common row coloring ────────────────────────────────────────────────
  // The whole row gets a soft tinted background + a colored left-border
  // accent that maps to the urgency tone.
  const rowProps = (record: PaymentRow) => ({
    style: {
      background:  STATUS_STYLE[record.rowStatus].bg,
      borderLeft:  `4px solid ${STATUS_STYLE[record.rowStatus].accent}`,
    },
  });

  // ── Tab data buckets ───────────────────────────────────────────────────
  const followUpRows = paymentRows.filter(r => STATUS_STYLE[r.rowStatus].needsFollowUp);
  const pendingRows  = paymentRows.filter(r => r.rowStatus === 'pending');
  const approvedRows = paymentRows.filter(r => r.rowStatus === 'approved');

  // Color-legend helper for the top bar.
  const legend = (
    <Space size={12} wrap style={{ fontSize: 11 }}>
      <span style={{ color: '#595959' }}>คำอธิบายสี:</span>
      {(['overdue', 'due-soon', 'unsubmitted', 'pending', 'approved'] as RowStatus[]).map(s => {
        const cfg = STATUS_STYLE[s];
        return (
          <Space size={4} key={s}>
            <span style={{
              display: 'inline-block', width: 12, height: 12, borderRadius: 2,
              background: cfg.bg, border: `1px solid ${cfg.accent}`,
            }} />
            <Text type="secondary" style={{ fontSize: 11 }}>{cfg.label}</Text>
          </Space>
        );
      })}
    </Space>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
        <Space wrap>
          <Button type="primary" icon={<DollarOutlined />} onClick={() => setProxyModal(true)}>
            ชำระแทนผู้ซื้อ
          </Button>
          <Button icon={<PrinterOutlined />}>จ่ายเงินผู้ขาย</Button>
        </Space>

        {/* Highlighted summary — primary draw to action for unpaid winners */}
        {counts.followUp > 0 && (
          <Alert
            type="warning"
            showIcon
            icon={<PhoneOutlined style={{ color: '#fa8c16' }} />}
            title={
              <span>
                <Text strong>{counts.followUp}</Text> รายการที่ต้องติดตาม —
                {' '}โทรหาผู้ชนะที่ยังไม่ส่งหลักฐานหรือเกินกำหนด
              </span>
            }
            style={{ flex: 1, minWidth: 280 }}
          />
        )}
      </div>

      {/* Color legend */}
      <Card size="small" styles={{ body: { padding: '8px 14px' } }}>
        {legend}
      </Card>

      <Tabs
        items={[
          {
            key: 'follow-up',
            label: (
              <Space size={4}>
                <PhoneOutlined style={{ color: '#fa8c16' }} />
                <span>ต้องติดตาม</span>
                <Badge count={counts.followUp} color="#fa8c16" offset={[6, 0]} />
              </Space>
            ),
            children: (
              <Card>
                <Alert
                  type="info"
                  showIcon
                  icon={<BellOutlined />}
                  style={{ marginBottom: 12 }}
                  title="รายการที่ต้องโทรติดตามผู้ชนะ"
                  description="ผู้ชนะที่ยังไม่ส่งหลักฐาน, เกินกำหนดชำระ, หรือถูกปฏิเสธหลักฐาน กดปุ่ม 'โทรติดตาม' เพื่อเข้าสู่ขั้นตอนการติดต่อและบันทึกผล"
                />
                <Table<PaymentRow>
                  dataSource={followUpRows}
                  columns={columns}
                  rowKey="key"
                  scroll={{ x: 'max-content' }}
                  onRow={rowProps}
                  locale={{ emptyText: 'ไม่มีรายการที่ต้องติดตามในตอนนี้' }}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          {
            key: 'pending',
            label: (
              <Space size={4}>
                <ClockCircleOutlined style={{ color: '#1677ff' }} />
                <span>รอตรวจสอบ</span>
                <Badge count={counts.pending} color="#1677ff" offset={[6, 0]} />
              </Space>
            ),
            children: (
              <Card>
                <Table<PaymentRow>
                  dataSource={pendingRows}
                  columns={columns}
                  rowKey="key"
                  scroll={{ x: 'max-content' }}
                  onRow={rowProps}
                  locale={{ emptyText: 'ไม่มีรายการรอตรวจสอบ' }}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          {
            key: 'approved',
            label: (
              <Space size={4}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>อนุมัติแล้ว</span>
                <Badge count={counts.approved} color="#52c41a" offset={[6, 0]} showZero />
              </Space>
            ),
            children: (
              <Card>
                <Table<PaymentRow>
                  dataSource={approvedRows}
                  columns={columns}
                  rowKey="key"
                  scroll={{ x: 'max-content' }}
                  onRow={rowProps}
                  locale={{ emptyText: 'ยังไม่มีรายการที่อนุมัติ' }}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          {
            key: 'all',
            label: <span>ทั้งหมด <Badge count={counts.total} color="#8c8c8c" offset={[6, 0]} /></span>,
            children: (
              <Card>
                <Table<PaymentRow>
                  dataSource={paymentRows}
                  columns={columns}
                  rowKey="key"
                  scroll={{ x: 'max-content' }}
                  onRow={rowProps}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* ── Detail + Proof Modal ───────────────────────────────────────── */}
      <Modal
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={detail?.rowStatus === 'pending' ? [
          <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={() => { setRejectModal(detail); setDetail(null); }}>ปฏิเสธ</Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
            onClick={() => detail && handleApprove(detail)}
          >
            อนุมัติ
          </Button>,
        ] : [<Button key="close" onClick={() => setDetail(null)}>ปิด</Button>]}
        title={<span><EyeOutlined style={{ marginRight: 8 }} />ตรวจสอบหลักฐานการชำระเงิน</span>}
        width={560}
      >
        {detail?.payment && (
          <>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="สัญญา">{detail.contractNo}</Descriptions.Item>
              <Descriptions.Item label="ผู้ซื้อ">{detail.buyer}</Descriptions.Item>
              <Descriptions.Item label="จำนวน">{detail.amount.toLocaleString()} ฿</Descriptions.Item>
              <Descriptions.Item label="วิธีชำระ">
                {({ transfer: 'โอนเงิน', cash: 'เงินสด', qr: 'Thai QR' } as Record<string, string>)[detail.payment.method]}
              </Descriptions.Item>
              <Descriptions.Item label="วันที่ส่ง" span={2}>
                {dayjs(detail.payment.submittedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
            <div
              style={{
                background: '#f5f5f5',
                color: '#bfbfbf',
                borderRadius: 8,
                padding: 16,
                textAlign: 'center',
                height: 160,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 13 }}>หลักฐานการโอนเงิน (Mock)</div>
                <div style={{ fontSize: 11 }}>Slip_CNT_{detail.contractNo}.jpg</div>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* ── Follow-up Modal ─────────────────────────────────────────────── */}
      <Modal
        open={!!followUp}
        onCancel={() => { setFollowUp(null); setFollowUpNote(''); }}
        onOk={handleConfirmFollowUp}
        okText="บันทึกการติดตาม"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#fa8c16', borderColor: '#fa8c16' } }}
        title={
          <Space>
            <PhoneOutlined style={{ color: '#fa8c16' }} />
            <span>โทรติดตามการชำระเงิน</span>
          </Space>
        }
        width={520}
      >
        {followUp && (
          <>
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              title={`สถานะปัจจุบัน: ${STATUS_STYLE[followUp.rowStatus].label}`}
              description={
                followUp.daysUntilDue < 0
                  ? `เกินกำหนดชำระแล้ว ${Math.abs(followUp.daysUntilDue)} วัน — แจ้งให้ผู้ซื้อชำระโดยเร็ว`
                  : 'ติดต่อผู้ซื้อเพื่อสอบถามและแจ้งกำหนดการชำระ'
              }
            />

            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="สัญญา">
                <Text strong style={{ fontFamily: 'monospace' }}>{followUp.contractNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="ผู้ซื้อ">{followUp.buyer}</Descriptions.Item>
              <Descriptions.Item label="เบอร์ติดต่อ">
                <Space>
                  <PhoneOutlined style={{ color: '#1a7c3e' }} />
                  <Text strong style={{ fontFamily: 'monospace', fontSize: 14 }}>
                    {mockPhone(followUp.buyer)}
                  </Text>
                  <Tag color="default" style={{ margin: 0, fontSize: 10 }}>Mock</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="จำนวนที่ต้องชำระ">
                <Text strong style={{ color: '#1a7c3e' }}>
                  {followUp.amount.toLocaleString()} ฿
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="ครบกำหนด">
                {dayjs(followUp.dueDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
            </Descriptions>

            <Form layout="vertical">
              <Form.Item label="บันทึกผลการติดตาม">
                <TextArea
                  rows={3}
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="เช่น โทรครั้งที่ 1 — ผู้ซื้อรับสาย แจ้งจะชำระภายในวันพรุ่งนี้"
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* ── Reject Modal ────────────────────────────────────────────────── */}
      <Modal
        open={!!rejectModal}
        onCancel={() => { setRejectModal(null); setRejectReason(''); }}
        onOk={handleConfirmReject}
        okText="ยืนยันปฏิเสธ" okType="danger"
        title="ระบุเหตุผลการปฏิเสธ"
      >
        <Alert type="warning" showIcon title="ระบบจะแจ้งเตือนผู้ซื้อให้ส่งหลักฐานใหม่" style={{ marginBottom: 16 }} />
        <TextArea
          rows={4}
          placeholder="ระบุเหตุผล..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* ── Proxy Payment Modal ─────────────────────────────────────────── */}
      <Modal
        open={proxyModal} onCancel={() => setProxyModal(false)}
        onOk={() => { form.resetFields(); setProxyModal(false); }}
        title="ชำระเงินแทนผู้ซื้อ" okText="บันทึกการชำระ"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="ค้นหาสัญญา" name="contract" rules={[{ required: true }]}>
            <Input placeholder="กรอกเลขที่สัญญา" />
          </Form.Item>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="จำนวนเงิน (฿)" name="amount" rules={[{ required: true }]}>
                <Input placeholder="จำนวนเงิน" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="วิธีชำระ" name="method" rules={[{ required: true }]}>
                <Input placeholder="โอน / เงินสด / QR" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="หมายเหตุ" name="note">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
