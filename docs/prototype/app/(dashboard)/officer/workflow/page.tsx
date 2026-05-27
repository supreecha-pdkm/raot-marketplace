'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card, Tabs, Table, Tag, Button, Space, Typography, Alert, Modal,
  Form, Input, Select, Row, Col, Badge, Tooltip, Empty, App as AntApp,
  Descriptions, Divider,
} from 'antd';
import {
  InboxOutlined, ExperimentOutlined, DollarOutlined,
  FileDoneOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, EyeOutlined, SwapOutlined, BankOutlined,
  PrinterOutlined, NotificationOutlined, RollbackOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  MOCK_CONTRACTS, APPROVER_LABELS, PHASE_META,
} from '@/features/contracts/services/mock-contracts';
import type {
  Contract, WorkflowPhase, ApproverRole, QcResult,
} from '@/shared/types';

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function FinanceWorkflowPage() {
  const { message } = AntApp.useApp();
  const searchParams = useSearchParams();
  const phaseParam = searchParams.get('phase');
  const initialTab = phaseParam && ['1', '2', '3', '4'].includes(phaseParam) ? phaseParam : '1';

  // Local overrides — POC: phase transitions stay client-side only.
  // Shape: { contractId: { phase?, qcResult?, qcNote?, paymentMethod?, approverRole?, approved? } }
  type Override = Partial<Pick<
    Contract,
    'workflowPhase' | 'qcResult' | 'qcNote' | 'paymentMethod' | 'approverRole' | 'directorApproved'
  >>;
  const [overrides, setOverrides] = useState<Record<string, Override>>({});

  const merged = useMemo<Contract[]>(
    () => MOCK_CONTRACTS.map(c => ({ ...c, ...overrides[c.id] })),
    [overrides],
  );

  const apply = (id: string, patch: Override) =>
    setOverrides(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  // ── Group by phase ─────────────────────────────────────────────────────
  const byPhase = (n: WorkflowPhase) => merged.filter(c => (c.workflowPhase ?? 1) === n);
  const phase1 = byPhase(1);
  const phase2 = byPhase(2);
  const phase3 = byPhase(3);
  const phase4 = byPhase(4);

  // ── Modals ─────────────────────────────────────────────────────────────
  const [qcTarget,       setQcTarget]       = useState<Contract | null>(null);
  const [qcForm]                             = Form.useForm<{ result: 'pass' | 'fail'; note?: string }>();
  const [invoiceTarget,  setInvoiceTarget]  = useState<Contract | null>(null);
  const [invoiceForm]                        = Form.useForm<{ paymentMethod: 'transfer' | 'cash'; approverRole: ApproverRole }>();
  const [approveTarget,  setApproveTarget]  = useState<Contract | null>(null);

  // ── Phase 1: move to QC ────────────────────────────────────────────────
  const sendToQc = (c: Contract) => {
    apply(c.id, { workflowPhase: 2, qcResult: 'pending' });
    message.success(`ส่งสัญญา ${c.contractNo} ไปยังขั้นตอนตรวจคุณภาพ (Phase 2)`);
  };

  // ── Phase 2: QC submit ─────────────────────────────────────────────────
  const submitQc = async () => {
    if (!qcTarget) return;
    const v = await qcForm.validateFields().catch(() => null);
    if (!v) return;
    if (v.result === 'pass') {
      apply(qcTarget.id, {
        workflowPhase: 3, qcResult: 'pass', qcNote: v.note,
        paymentMethod: 'transfer', approverRole: 'director', directorApproved: false,
      });
      message.success(`สัญญา ${qcTarget.contractNo} ผ่าน QC → ส่งต่อ Phase 3`);
    } else {
      apply(qcTarget.id, { qcResult: 'fail', qcNote: v.note });
      message.warning(`สัญญา ${qcTarget.contractNo} ไม่ผ่าน QC — แจ้งย้อนกลับให้ผู้ขายแก้ไข`);
    }
    setQcTarget(null);
    qcForm.resetFields();
  };

  // QC retry — buyer/seller has fixed the issue, send back into the QC queue.
  const retryQc = (c: Contract) => {
    apply(c.id, { qcResult: 'pending', qcNote: undefined });
    message.info(`รีเซ็ตการตรวจ QC ของสัญญา ${c.contractNo} → กลับเข้าคิวรอตรวจ`);
  };

  // ── Phase 3: invoice issue ─────────────────────────────────────────────
  const submitInvoice = async () => {
    if (!invoiceTarget) return;
    const v = await invoiceForm.validateFields().catch(() => null);
    if (!v) return;
    apply(invoiceTarget.id, {
      paymentMethod: v.paymentMethod,
      approverRole:  v.approverRole,
    });
    message.success(`ออกใบแจ้งชำระสัญญา ${invoiceTarget.contractNo} — ${APPROVER_LABELS[v.approverRole]} เป็นผู้อนุมัติ`);
    setInvoiceTarget(null);
    invoiceForm.resetFields();
  };

  // ── Phase 3: approve & close → moves to Phase 4 ────────────────────────
  const approveAndClose = () => {
    if (!approveTarget) return;
    apply(approveTarget.id, { directorApproved: true, workflowPhase: 4 });
    message.success(`อนุมัติสัญญา ${approveTarget.contractNo} — ส่งต่อ Phase 4 (ปิดงาน)`);
    setApproveTarget(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        defaultActiveKey={initialTab}
        items={[
          {
            key: '1',
            label: (
              <Badge count={phase1.length} offset={[10, -2]} color={PHASE_META[1].color}>
                <Space size={4}><InboxOutlined />Phase 1 · รับเอกสาร</Space>
              </Badge>
            ),
            children: (
              <Phase1Inbox rows={phase1} onSendToQc={sendToQc} />
            ),
          },
          {
            key: '2',
            label: (
              <Badge count={phase2.length} offset={[10, -2]} color={PHASE_META[2].color}>
                <Space size={4}><ExperimentOutlined />Phase 2 · QC</Space>
              </Badge>
            ),
            children: (
              <Phase2Quality
                rows={phase2}
                onOpenQc={(c) => { setQcTarget(c); qcForm.resetFields(); }}
                onRetry={retryQc}
              />
            ),
          },
          {
            key: '3',
            label: (
              <Badge count={phase3.length} offset={[10, -2]} color={PHASE_META[3].color}>
                <Space size={4}><DollarOutlined />Phase 3 · ชำระเงิน</Space>
              </Badge>
            ),
            children: (
              <Phase3Payment
                rows={phase3}
                onOpenInvoice={(c) => {
                  setInvoiceTarget(c);
                  invoiceForm.setFieldsValue({
                    paymentMethod: c.paymentMethod ?? 'transfer',
                    approverRole:  c.approverRole  ?? 'director',
                  });
                }}
                onOpenApprove={setApproveTarget}
              />
            ),
          },
          {
            key: '4',
            label: (
              <Badge count={phase4.length} offset={[10, -2]} color={PHASE_META[4].color}>
                <Space size={4}><FileDoneOutlined />Phase 4 · สรุปงาน</Space>
              </Badge>
            ),
            children: <Phase4Summary rows={phase4} />,
          },
        ]}
      />

      {/* ── QC modal ────────────────────────────────────────────────────── */}
      <Modal
        open={!!qcTarget}
        onCancel={() => setQcTarget(null)}
        onOk={submitQc}
        title={
          <Space>
            <ExperimentOutlined style={{ color: PHASE_META[2].color }} />
            <span>ตรวจคัดคุณภาพยาง — {qcTarget?.contractNo}</span>
          </Space>
        }
        okText="บันทึกผลตรวจ"
        cancelText="ยกเลิก"
        destroyOnHidden
      >
        {qcTarget && (
          <>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              title={`${qcTarget.rubberType} · น้ำหนัก ${qcTarget.weight.toLocaleString()} กก.`}
              description={`ผู้ขาย: ${qcTarget.seller} · ผู้ซื้อ: ${qcTarget.buyer}`}
            />
            <Form form={qcForm} layout="vertical" initialValues={{ result: 'pass' }}>
              <Form.Item label="ผลการตรวจ" name="result" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: <Space><CheckCircleOutlined style={{ color: '#52c41a' }} />ผ่าน — ส่งต่อ Phase 3</Space>, value: 'pass' },
                    { label: <Space><CloseCircleOutlined style={{ color: '#ff4d4f' }} />ไม่ผ่าน — แจ้งย้อนกลับ</Space>, value: 'fail' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="หมายเหตุ / สาเหตุที่ไม่ผ่าน"
                name="note"
                tooltip="ถ้าไม่ผ่าน ระบบจะส่งหมายเหตุนี้กลับให้ผู้ขายเพื่อแก้ไข"
              >
                <TextArea rows={3} placeholder="เช่น ความชื้นเกินมาตรฐาน / มีสิ่งเจือปน" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* ── Invoice / payment-method modal ──────────────────────────────── */}
      <Modal
        open={!!invoiceTarget}
        onCancel={() => setInvoiceTarget(null)}
        onOk={submitInvoice}
        title={
          <Space>
            <DollarOutlined style={{ color: PHASE_META[3].color }} />
            <span>ออกใบแจ้งชำระ — {invoiceTarget?.contractNo}</span>
          </Space>
        }
        okText="บันทึก + ออกใบแจ้ง"
        cancelText="ยกเลิก"
        destroyOnHidden
      >
        {invoiceTarget && (
          <>
            <Alert
              type="success"
              showIcon
              icon={<SafetyCertificateOutlined />}
              style={{ marginBottom: 12 }}
              title="สัญญาผ่าน QC แล้ว"
              description={`มูลค่าที่ต้องชำระ: ${invoiceTarget.totalAmount.toLocaleString()} ฿`}
            />
            <Form form={invoiceForm} layout="vertical">
              <Form.Item label="วิธีชำระเงิน" name="paymentMethod" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: <Space><BankOutlined />โอนเงิน (Bank Transfer)</Space>, value: 'transfer' },
                    { label: <Space><DollarOutlined />ชำระเงินสด (Cash)</Space>,       value: 'cash' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label={
                  <Space size={4}>
                    <span>ผู้อนุมัติสัญญา</span>
                    <Tooltip title="ปกติคือผู้อำนวยการตลาด — สามารถเปลี่ยนผู้อนุมัติได้หากผู้อำนวยการไม่ว่าง">
                      <SwapOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                  </Space>
                }
                name="approverRole"
                rules={[{ required: true }]}
              >
                <Select
                  options={(Object.keys(APPROVER_LABELS) as ApproverRole[]).map(k => ({
                    label: APPROVER_LABELS[k] + (k === 'director' ? ' (ค่าเริ่มต้น)' : ''),
                    value: k,
                  }))}
                />
              </Form.Item>
              <Alert
                type="warning"
                showIcon
                title="การมอบหมายผู้อนุมัติแทนจะถูกบันทึกใน audit log"
              />
            </Form>
          </>
        )}
      </Modal>

      {/* ── Approve & close modal ───────────────────────────────────────── */}
      <Modal
        open={!!approveTarget}
        onCancel={() => setApproveTarget(null)}
        onOk={approveAndClose}
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>อนุมัติสัญญา — {approveTarget?.contractNo}</span>
          </Space>
        }
        okText="ยืนยันอนุมัติ + ปิดงาน"
        okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
        cancelText="ยกเลิก"
        destroyOnHidden
      >
        {approveTarget && (
          <>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="ผู้อนุมัติ">
                <Text strong>{APPROVER_LABELS[approveTarget.approverRole ?? 'director']}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="วิธีชำระ">
                {approveTarget.paymentMethod === 'cash' ? 'เงินสด' : 'โอนเงิน'}
              </Descriptions.Item>
              <Descriptions.Item label="มูลค่าสัญญา">
                <Text strong style={{ color: '#1a7c3e' }}>
                  {approveTarget.totalAmount.toLocaleString()} ฿
                </Text>
              </Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '12px 0' }} />
            <Alert
              type="info"
              showIcon
              title="เมื่อกดอนุมัติ สัญญาจะย้ายไป Phase 4 (สรุปและปิดงาน) อัตโนมัติ"
            />
          </>
        )}
      </Modal>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 1 — Inbox: list of new contracts; action = send to QC
// ────────────────────────────────────────────────────────────────────────────
function Phase1Inbox({
  rows, onSendToQc,
}: {
  rows: Contract[];
  onSendToQc: (c: Contract) => void;
}) {
  const cols: ColumnsType<Contract> = [
    { title: 'เลขสัญญา', dataIndex: 'contractNo', render: (v) => <Text strong style={{ color: '#0958d9' }}>{v}</Text> },
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    { title: 'ผู้ขาย', dataIndex: 'seller' },
    { title: 'ผู้ซื้อ', dataIndex: 'buyer' },
    { title: 'น้ำหนัก', dataIndex: 'weight', align: 'right', render: (v) => `${v.toLocaleString()} กก.` },
    { title: 'มูลค่า', dataIndex: 'totalAmount', align: 'right', render: (v) => <Text strong>{v.toLocaleString()} ฿</Text> },
    {
      title: 'การดำเนินการ',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} href={`/officer/contracts/${r.id}`}>
            ดู
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<ExperimentOutlined />}
            onClick={() => onSendToQc(r)}
            style={{ background: PHASE_META[2].color, borderColor: PHASE_META[2].color }}
          >
            ส่งตรวจคุณภาพ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PhaseCard phase={1} count={rows.length}>
      {rows.length === 0
        ? <EmptyState text="ยังไม่มีสัญญาใหม่เข้าระบบ" />
        : <Table dataSource={rows} columns={cols} rowKey="id" pagination={false} size="small" scroll={{ x: 'max-content' }} />}
    </PhaseCard>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 2 — Quality check: pass → Phase 3, fail → stay (loop) + show retry
// ────────────────────────────────────────────────────────────────────────────
function Phase2Quality({
  rows, onOpenQc, onRetry,
}: {
  rows: Contract[];
  onOpenQc: (c: Contract) => void;
  onRetry:  (c: Contract) => void;
}) {
  const cols: ColumnsType<Contract> = [
    { title: 'เลขสัญญา', dataIndex: 'contractNo', render: (v) => <Text strong style={{ color: '#0958d9' }}>{v}</Text> },
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    { title: 'ผู้ขาย',  dataIndex: 'seller' },
    {
      title: 'ผล QC',
      render: (_, r) => <QcResultTag result={r.qcResult ?? 'pending'} />,
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'qcNote',
      render: (v) => v ? <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> : '—',
    },
    {
      title: 'การดำเนินการ',
      render: (_, r) => (
        <Space>
          {r.qcResult === 'pending' && (
            <Button
              size="small"
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => onOpenQc(r)}
              style={{ background: PHASE_META[2].color, borderColor: PHASE_META[2].color }}
            >
              บันทึกผลตรวจ
            </Button>
          )}
          {r.qcResult === 'fail' && (
            <>
              <Tooltip title="ส่งกลับเข้าคิวตรวจใหม่หลังผู้ขายแก้ไขแล้ว">
                <Button size="small" icon={<RollbackOutlined />} onClick={() => onRetry(r)}>
                  รีเซ็ตเข้าคิวใหม่
                </Button>
              </Tooltip>
              <Button size="small" type="primary" icon={<SafetyCertificateOutlined />} onClick={() => onOpenQc(r)}>
                บันทึกผลใหม่
              </Button>
            </>
          )}
          <Button size="small" icon={<EyeOutlined />} href={`/officer/contracts/${r.id}`}>
            ดู
          </Button>
        </Space>
      ),
    },
  ];

  const failedCount = rows.filter(r => r.qcResult === 'fail').length;

  return (
    <PhaseCard phase={2} count={rows.length}>
      {failedCount > 0 && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
          title={`มีสัญญาไม่ผ่าน QC ${failedCount} รายการ — รอผู้ขายแก้ไขแล้วรีเซ็ตเข้าคิวใหม่`}
        />
      )}
      {rows.length === 0
        ? <EmptyState text="ไม่มีสัญญารอตรวจคุณภาพ" />
        : <Table dataSource={rows} columns={cols} rowKey="id" pagination={false} size="small" scroll={{ x: 'max-content' }} />}
    </PhaseCard>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 3 — Invoice + payment method + approver (can be delegated)
// ────────────────────────────────────────────────────────────────────────────
function Phase3Payment({
  rows, onOpenInvoice, onOpenApprove,
}: {
  rows: Contract[];
  onOpenInvoice: (c: Contract) => void;
  onOpenApprove: (c: Contract) => void;
}) {
  const cols: ColumnsType<Contract> = [
    { title: 'เลขสัญญา', dataIndex: 'contractNo', render: (v) => <Text strong style={{ color: '#0958d9' }}>{v}</Text> },
    { title: 'มูลค่า', dataIndex: 'totalAmount', align: 'right', render: (v) => <Text strong>{v.toLocaleString()} ฿</Text> },
    {
      title: 'วิธีชำระ',
      render: (_, r) => r.paymentMethod === 'cash'
        ? <Tag color="gold" icon={<DollarOutlined />}>เงินสด</Tag>
        : r.paymentMethod === 'transfer'
          ? <Tag color="geekblue" icon={<BankOutlined />}>โอนเงิน</Tag>
          : <Tag>—</Tag>,
    },
    {
      title: 'ผู้อนุมัติ',
      render: (_, r) => {
        const role = r.approverRole ?? 'director';
        const isDelegated = role !== 'director';
        return (
          <Space size={4}>
            <Text strong>{APPROVER_LABELS[role]}</Text>
            {isDelegated && (
              <Tooltip title="มอบหมายให้ผู้อื่นอนุมัติแทนผู้อำนวยการ">
                <Tag color="warning" style={{ margin: 0, fontSize: 10 }} icon={<SwapOutlined />}>มอบหมาย</Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'สถานะ',
      render: (_, r) => r.directorApproved
        ? <Tag color="success" icon={<CheckCircleOutlined />}>อนุมัติแล้ว</Tag>
        : <Tag color="processing" icon={<ClockCircleOutlined />}>รออนุมัติ</Tag>,
    },
    {
      title: 'การดำเนินการ',
      render: (_, r) => (
        <Space wrap>
          <Button size="small" icon={<PrinterOutlined />} onClick={() => onOpenInvoice(r)}>
            ออกใบแจ้ง / เปลี่ยนผู้อนุมัติ
          </Button>
          {!r.directorApproved && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => onOpenApprove(r)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              อนุมัติ + ปิดงาน
            </Button>
          )}
          <Button size="small" icon={<EyeOutlined />} href={`/officer/contracts/${r.id}`}>
            ดู
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PhaseCard phase={3} count={rows.length}>
      {rows.length === 0
        ? <EmptyState text="ไม่มีสัญญาที่ผ่าน QC รอชำระเงิน" />
        : <Table dataSource={rows} columns={cols} rowKey="id" pagination={false} size="small" scroll={{ x: 'max-content' }} />}
    </PhaseCard>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 4 — Summary & close: report + archive
// ────────────────────────────────────────────────────────────────────────────
function Phase4Summary({ rows }: { rows: Contract[] }) {
  const totalValue = rows.reduce((s, r) => s + r.totalAmount, 0);
  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);

  const cols: ColumnsType<Contract> = [
    { title: 'เลขสัญญา', dataIndex: 'contractNo', render: (v) => <Text strong style={{ color: '#0958d9' }}>{v}</Text> },
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    { title: 'ผู้ซื้อ', dataIndex: 'buyer' },
    { title: 'มูลค่า', dataIndex: 'totalAmount', align: 'right', render: (v) => <Text strong>{v.toLocaleString()} ฿</Text> },
    { title: 'อนุมัติเมื่อ', dataIndex: 'approvedAt', render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
    { title: 'อนุมัติโดย', dataIndex: 'approvedBy', render: (v) => v ?? '—' },
    {
      title: '',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} href={`/officer/contracts/${r.id}`}>
          ดู
        </Button>
      ),
    },
  ];

  return (
    <PhaseCard phase={4} count={rows.length}>
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={8}>
          <StatBox label="สัญญาที่ปิดแล้ว" value={`${rows.length} ฉบับ`} color="#52c41a" />
        </Col>
        <Col xs={24} sm={8}>
          <StatBox label="น้ำหนักรวม" value={`${totalWeight.toLocaleString()} กก.`} color="#1677ff" />
        </Col>
        <Col xs={24} sm={8}>
          <StatBox label="มูลค่ารวม" value={`${totalValue.toLocaleString()} ฿`} color="#1a7c3e" />
        </Col>
      </Row>

      <Space style={{ marginBottom: 12 }} wrap>
        <Button type="primary" icon={<NotificationOutlined />} style={{ background: PHASE_META[4].color, borderColor: PHASE_META[4].color }}>
          ส่งรายงานสรุปประจำวัน
        </Button>
        <Button icon={<PrinterOutlined />}>พิมพ์รายงาน</Button>
        <Button icon={<FileDoneOutlined />} href="/officer/reports">
          ไปหน้ารายงานเต็ม
        </Button>
      </Space>

      {rows.length === 0
        ? <EmptyState text="ยังไม่มีสัญญาที่ปิดในวันนี้" />
        : <Table dataSource={rows} columns={cols} rowKey="id" pagination={false} size="small" scroll={{ x: 'max-content' }} />}
    </PhaseCard>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────────────────
function PhaseCard({
  phase, count, children,
}: {
  phase:    WorkflowPhase;
  count:    number;
  children: React.ReactNode;
}) {
  const meta = PHASE_META[phase];
  return (
    <Card
      title={
        <Space>
          <span style={{ color: meta.color }}>{meta.fullLabel}</span>
          <Tag>{count} รายการ</Tag>
        </Space>
      }
      extra={<Text type="secondary" style={{ fontSize: 12 }}>{meta.description}</Text>}
    >
      {children}
    </Card>
  );
}

function QcResultTag({ result }: { result: QcResult }) {
  if (result === 'pass') return <Tag color="success" icon={<CheckCircleOutlined />}>ผ่าน</Tag>;
  if (result === 'fail') return <Tag color="error" icon={<CloseCircleOutlined />}>ไม่ผ่าน — แจ้งย้อนกลับ</Tag>;
  return <Tag color="processing" icon={<ClockCircleOutlined />}>รอตรวจ</Tag>;
}

function EmptyState({ text }: { text: string }) {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Text type="secondary">{text}</Text>} />;
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card size="small" style={{ borderLeft: `3px solid ${color}` }} styles={{ body: { padding: 12 } }}>
      <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
      <Title level={5} style={{ margin: '4px 0 0', color }}>{value}</Title>
    </Card>
  );
}
