'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card, Table, Tag, Button, Modal, Form, DatePicker, Space, Typography,
  Descriptions, Alert, Divider, Empty, App,
} from 'antd';
import {
  CheckCircleOutlined, FileTextOutlined, EnvironmentOutlined,
  AimOutlined, DollarOutlined, ClockCircleOutlined, EditOutlined,
  SolutionOutlined, ExclamationCircleOutlined, DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  type Match, type ViewerRole, type MatchStage,
  getMatchStage, STAGE_CFG,
} from '@/features/bid-ask/services/bidask-match-data';

const { Text } = Typography;

interface MatchingPanelProps {
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  viewerRole: ViewerRole;
}

/**
 * Returns the counterparty party (the "other" side from the viewer's perspective).
 */
function counterparty(m: Match, role: ViewerRole) {
  return role === 'buyer' ? m.seller : m.buyer;
}

/** True if the viewer has already confirmed the match (stage 1) */
function viewerHasMatched(m: Match, role: ViewerRole): boolean {
  return role === 'buyer' ? !!m.buyerMatchedAt : !!m.sellerMatchedAt;
}

/** True if the viewer has already signed the contract (stage 2) */
function viewerHasSigned(m: Match, role: ViewerRole): boolean {
  return role === 'buyer' ? !!m.buyerSignedAt : !!m.sellerSignedAt;
}

export default function MatchingPanel({ matches, setMatches, viewerRole }: MatchingPanelProps) {
  const { message, modal } = App.useApp();

  const router = useRouter();
  const [confirmMatchOpen, setConfirmMatchOpen] = useState<Match | null>(null);
  const [signContractOpen, setSignContractOpen] = useState<Match | null>(null);
  const [detailOpen,       setDetailOpen]       = useState<Match | null>(null);
  const [matchForm]        = Form.useForm<{ deliveryDate: Dayjs }>();

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Stage 1: viewer confirms the match, optionally setting/accepting delivery date */
  const handleConfirmMatch = () => {
    if (!confirmMatchOpen) return;
    matchForm.validateFields().then((v) => {
      const now = new Date().toISOString();
      const deliveryDate = v.deliveryDate.format('YYYY-MM-DD');
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== confirmMatchOpen.id) return m;
          const updated: Match = {
            ...m,
            deliveryDate,
            ...(viewerRole === 'buyer' ? { buyerMatchedAt: now } : { sellerMatchedAt: now }),
          };
          // If BOTH parties have now matched → auto-generate contract number
          if (updated.buyerMatchedAt && updated.sellerMatchedAt && !updated.contractNo) {
            const dateTag = now.slice(0, 10).replace(/-/g, '');
            updated.contractNo = `BA-${dateTag}-${m.id.replace('M-', '')}`;
          }
          return updated;
        }),
      );
      message.success('ยืนยันการจับคู่เรียบร้อย');
      matchForm.resetFields();
      setConfirmMatchOpen(null);
    });
  };

  /** Stage 2: viewer signs the draft contract */
  const handleSignContract = () => {
    if (!signContractOpen) return;
    const now = new Date().toISOString();
    setMatches((prev) =>
      prev.map((m) =>
        m.id !== signContractOpen.id
          ? m
          : { ...m, ...(viewerRole === 'buyer' ? { buyerSignedAt: now } : { sellerSignedAt: now }) },
      ),
    );
    message.success('ลงนามสัญญาเรียบร้อย');
    setSignContractOpen(null);
  };

  /** Stage 3 (buyer only): navigate to the payment page with match context */
  const goToPayment = (m: Match) => {
    const amount = Math.round(m.price * m.quantity);
    const params = new URLSearchParams({
      ref:          m.contractNo ?? m.id,
      type:         'bid-ask-match',
      rubberType:   m.rubberType,
      quantity:     String(m.quantity),
      price:        m.price.toFixed(2),
      amount:       String(amount),
      seller:       m.seller.name,
      ...(m.deliveryDate ? { deliveryDate: m.deliveryDate } : {}),
    });
    router.push(`/buyer/payment?${params.toString()}`);
  };

  /** Delete the match — only allowed before the contract is fully signed by both parties */
  const handleDeleteMatch = (m: Match) => {
    const stage = getMatchStage(m);
    if (stage === 'contract_signed' || stage === 'paid') {
      message.warning('ไม่สามารถลบรายการนี้ได้ — ลงนามสัญญาแล้ว');
      return;
    }
    modal.confirm({
      title: 'ลบรายการจับคู่?',
      content: (
        <span>
          ต้องการลบรายการ <Text strong>{m.id}</Text>
          {m.contractNo && <> (ร่างสัญญา <Text code>{m.contractNo}</Text>)</>}
          {' '}หรือไม่? การลบจะไม่สามารถกู้คืนได้
        </span>
      ),
      okText: 'ลบ',
      okButtonProps: { danger: true },
      cancelText: 'ยกเลิก',
      onOk: () => {
        setMatches((prev) => prev.filter((x) => x.id !== m.id));
        message.success('ลบรายการจับคู่แล้ว');
      },
    });
  };

  /** Demo helper — simulates the counterparty taking the current action */
  const handleSimulateCounterparty = (m: Match) => {
    const now = new Date().toISOString();
    const stage = getMatchStage(m);
    setMatches((prev) =>
      prev.map((x) => {
        if (x.id !== m.id) return x;
        if (stage === 'awaiting_counterparty') {
          // The other party confirms the match
          const updated: Match = {
            ...x,
            ...(viewerRole === 'buyer'
              ? { sellerMatchedAt: now }
              : { buyerMatchedAt: now }),
          };
          if (updated.buyerMatchedAt && updated.sellerMatchedAt && !updated.contractNo) {
            updated.contractNo = `BA-${now.slice(0, 10).replace(/-/g, '')}-${m.id.replace('M-', '')}`;
          }
          return updated;
        }
        if (stage === 'contract_drafted') {
          // The other party signs the contract
          const viewerSigned = viewerHasSigned(x, viewerRole);
          if (!viewerSigned) return x;   // viewer must sign first
          return {
            ...x,
            ...(viewerRole === 'buyer'
              ? { sellerSignedAt: now }
              : { buyerSignedAt: now }),
          };
        }
        return x;
      }),
    );
    message.info('[Demo] จำลองการยืนยันของอีกฝ่ายแล้ว');
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnsType<Match> = [
    {
      title: 'เลขที่จับคู่',
      dataIndex: 'id',
      width: 110,
      render: (v: string, r) => (
        <>
          <div style={{ fontWeight: 600, color: '#1a7c3e' }}>{v}</div>
          {r.contractNo && <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.contractNo}</div>}
        </>
      ),
    },
    { title: 'ชนิดยาง', dataIndex: 'rubberType', render: (v: string) => <Tag color="blue">{v}</Tag> },
    {
      title: 'ราคา (฿/กก.)',
      dataIndex: 'price',
      align: 'right',
      render: (v: number) => <Text strong style={{ color: '#1a7c3e' }}>{v.toFixed(2)}</Text>,
    },
    {
      title: 'ปริมาณ (กก.)',
      dataIndex: 'quantity',
      align: 'right',
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: viewerRole === 'buyer' ? 'ผู้ขาย' : 'ผู้ซื้อ',
      render: (_, r) => {
        const cp = counterparty(r, viewerRole);
        return (
          <div>
            <Text strong>{cp.name}</Text>
            <div style={{ fontSize: 11, color: '#8c8c8c' }} className="line-clamp-1">
              <EnvironmentOutlined style={{ marginRight: 2 }} />{cp.address.slice(0, 40)}…
            </div>
          </div>
        );
      },
    },
    {
      title: 'วันส่งมอบ',
      dataIndex: 'deliveryDate',
      width: 100,
      render: (v?: string) => v
        ? <Text style={{ fontSize: 12 }}>{dayjs(v).format('DD/MM/YY')}</Text>
        : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'สถานะ',
      render: (_, r) => {
        const stage = getMatchStage(r);
        const cfg = STAGE_CFG[stage];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'การดำเนินการ',
      align: 'center',
      width: 240,
      render: (_, r) => {
        const stage = getMatchStage(r);
        const mySigned = viewerHasSigned(r, viewerRole);
        const myMatched = viewerHasMatched(r, viewerRole);
        const canDelete = stage !== 'contract_signed' && stage !== 'paid';

        const deleteBtn = canDelete ? (
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => { e.stopPropagation(); handleDeleteMatch(r); }}
            title="ลบรายการ"
          />
        ) : null;

        // Stage 1: confirm match (if I haven't yet)
        if (stage === 'awaiting_match' || (stage === 'awaiting_counterparty' && !myMatched)) {
          return (
            <Space size={4} wrap>
              <Button
                size="small" type="primary"
                icon={<EditOutlined />}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
                onClick={(e) => { e.stopPropagation(); setConfirmMatchOpen(r); }}
              >
                ยืนยันการจับคู่
              </Button>
              {deleteBtn}
            </Space>
          );
        }
        // I confirmed but counterparty hasn't
        if (stage === 'awaiting_counterparty' && myMatched) {
          return (
            <Space size={4} wrap>
              <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
                รออีกฝ่าย
              </Tag>
              <Button size="small" onClick={(e) => { e.stopPropagation(); handleSimulateCounterparty(r); }}>
                [Demo] อีกฝ่ายยืนยัน
              </Button>
              {deleteBtn}
            </Space>
          );
        }
        // Stage 2: contract drafted — sign if not yet
        if (stage === 'contract_drafted') {
          if (!mySigned) {
            return (
              <Space size={4} wrap>
                <Button
                  size="small" type="primary"
                  icon={<SolutionOutlined />}
                  style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
                  onClick={(e) => { e.stopPropagation(); setSignContractOpen(r); }}
                >
                  ลงนามสัญญา
                </Button>
                {deleteBtn}
              </Space>
            );
          }
          return (
            <Space size={4} wrap>
              <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
                รออีกฝ่ายลงนาม
              </Tag>
              <Button size="small" onClick={(e) => { e.stopPropagation(); handleSimulateCounterparty(r); }}>
                [Demo] อีกฝ่ายลงนาม
              </Button>
              {deleteBtn}
            </Space>
          );
        }
        // Stage 3: buyer must pay
        if (stage === 'contract_signed') {
          if (viewerRole === 'buyer') {
            return (
              <Button
                size="small" type="primary"
                icon={<DollarOutlined />}
                style={{ background: '#1677ff', borderColor: '#1677ff' }}
                onClick={(e) => { e.stopPropagation(); goToPayment(r); }}
              >
                ชำระเงิน
              </Button>
            );
          }
          return (
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              รอผู้ซื้อชำระเงิน
            </Tag>
          );
        }
        // Paid
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            เสร็จสิ้น
          </Tag>
        );
      },
    },
  ];

  // Pending counts shown in card title
  const pendingMyAction = matches.filter((m) => {
    const stage = getMatchStage(m);
    if (stage === 'awaiting_match') return true;
    if (stage === 'awaiting_counterparty' && !viewerHasMatched(m, viewerRole)) return true;
    if (stage === 'contract_drafted' && !viewerHasSigned(m, viewerRole)) return true;
    if (stage === 'contract_signed' && viewerRole === 'buyer') return true;
    return false;
  }).length;

  return (
    <>
      <Card
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1a7c3e' }} />
            <span>การจับคู่ (Matching) ของฉัน</span>
            {pendingMyAction > 0 && (
              <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                {pendingMyAction} รายการรอดำเนินการ
              </Tag>
            )}
          </Space>
        }
      >
        {matches.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="ยังไม่มีการจับคู่ — เมื่อราคาเสนอซื้อและเสนอขายตรงกัน ระบบจะสร้างรายการจับคู่อัตโนมัติ"
          />
        ) : (
          <Table
            dataSource={matches}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 'max-content' }}
            onRow={(record) => ({
              onClick: () => setDetailOpen(record),
              style: { cursor: 'pointer' },
            })}
          />
        )}
      </Card>

      {/* ── Confirm-Match Modal (stage 1) ────────────────────────────────── */}
      <Modal
        open={!!confirmMatchOpen}
        onCancel={() => { setConfirmMatchOpen(null); matchForm.resetFields(); }}
        onOk={handleConfirmMatch}
        okText="ยืนยันการจับคู่"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        title={
          <span>
            <EditOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />
            ยืนยันการจับคู่ — {confirmMatchOpen?.id}
          </span>
        }
        width={520}
      >
        {confirmMatchOpen && (() => {
          const cp = counterparty(confirmMatchOpen, viewerRole);
          return (
            <>
              <Alert
                type="info"
                showIcon
                title="กรุณาตรวจสอบข้อมูลอีกฝ่าย แล้วระบุวันส่งมอบที่ตกลงร่วมกัน"
                style={{ marginBottom: 16 }}
              />

              <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="ชนิดยาง"><Tag color="blue">{confirmMatchOpen.rubberType}</Tag></Descriptions.Item>
                <Descriptions.Item label="ราคา"><Text strong style={{ color: '#1a7c3e' }}>{confirmMatchOpen.price.toFixed(2)} ฿/กก.</Text></Descriptions.Item>
                <Descriptions.Item label="ปริมาณ"><Text strong>{confirmMatchOpen.quantity.toLocaleString()} กก.</Text></Descriptions.Item>
                <Descriptions.Item label="มูลค่ารวม"><Text strong style={{ color: '#fa8c16' }}>{(confirmMatchOpen.price * confirmMatchOpen.quantity).toLocaleString()} ฿</Text></Descriptions.Item>
              </Descriptions>

              <Divider plain style={{ margin: '12px 0' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ข้อมูล{viewerRole === 'buyer' ? 'ผู้ขาย' : 'ผู้ซื้อ'}
                </Text>
              </Divider>

              <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>{cp.name}</Text>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#595959' }}>
                  <EnvironmentOutlined style={{ color: '#fa8c16', marginTop: 2, flexShrink: 0 }} />
                  <span>{cp.address}</span>
                </div>
                {cp.gps && (
                  <div style={{ marginTop: 6 }}>
                    <AimOutlined style={{ color: '#1677ff', marginRight: 4 }} />
                    <Text code style={{ fontSize: 11 }}>{cp.gps}</Text>{' '}
                    <a
                      href={`https://www.google.com/maps?q=${cp.gps}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11 }}
                    >
                      เปิดใน Google Maps ↗
                    </a>
                  </div>
                )}
              </div>

              <Form
                form={matchForm}
                layout="vertical"
                initialValues={
                  confirmMatchOpen.deliveryDate
                    ? { deliveryDate: dayjs(confirmMatchOpen.deliveryDate) }
                    : undefined
                }
              >
                <Form.Item
                  label="วันส่งมอบที่ตกลง"
                  name="deliveryDate"
                  rules={[{ required: true, message: 'กรุณาเลือกวันส่งมอบ' }]}
                  extra={
                    confirmMatchOpen.deliveryDate
                      ? `อีกฝ่ายเสนอ: ${dayjs(confirmMatchOpen.deliveryDate).format('DD/MM/YYYY')} — แก้ไขได้`
                      : 'อีกฝ่ายยังไม่เสนอวันส่งมอบ'
                  }
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Form>
            </>
          );
        })()}
      </Modal>

      {/* ── Sign-Contract Modal (stage 2) ────────────────────────────────── */}
      <Modal
        open={!!signContractOpen}
        onCancel={() => setSignContractOpen(null)}
        onOk={handleSignContract}
        okText="ลงนามสัญญา"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#fa8c16', borderColor: '#fa8c16' } }}
        title={
          <span>
            <SolutionOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
            ลงนามสัญญา — {signContractOpen?.contractNo}
          </span>
        }
        width={520}
      >
        {signContractOpen && (
          <>
            <Alert
              type="warning"
              showIcon
              title="ตรวจสอบรายละเอียดสัญญาก่อนลงนาม — เมื่อทั้งสองฝ่ายลงนามแล้วจะไม่สามารถยกเลิกได้"
              style={{ marginBottom: 16 }}
            />

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="เลขที่สัญญา"><Text strong>{signContractOpen.contractNo}</Text></Descriptions.Item>
              <Descriptions.Item label="คู่สัญญา">
                <div>
                  <div><Text strong>ผู้ซื้อ:</Text> {signContractOpen.buyer.name}</div>
                  <div><Text strong>ผู้ขาย:</Text> {signContractOpen.seller.name}</div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="ชนิดยาง">{signContractOpen.rubberType}</Descriptions.Item>
              <Descriptions.Item label="ราคา × ปริมาณ">
                <Text strong style={{ color: '#1a7c3e' }}>{signContractOpen.price.toFixed(2)} ฿/กก.</Text>
                {' × '}
                <Text strong>{signContractOpen.quantity.toLocaleString()} กก.</Text>
                {' = '}
                <Text strong style={{ color: '#fa8c16' }}>
                  {(signContractOpen.price * signContractOpen.quantity).toLocaleString()} ฿
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="วันส่งมอบ">
                {signContractOpen.deliveryDate
                  ? dayjs(signContractOpen.deliveryDate).format('DD/MM/YYYY')
                  : '—'}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* ── Detail Modal (row click — read-only view) ────────────────────── */}
      <Modal
        open={!!detailOpen}
        onCancel={() => setDetailOpen(null)}
        footer={<Button onClick={() => setDetailOpen(null)}>ปิด</Button>}
        title={
          <span>
            <FileTextOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />
            รายละเอียดการจับคู่ — {detailOpen?.id}
          </span>
        }
        width={560}
      >
        {detailOpen && (() => {
          const stage = getMatchStage(detailOpen);
          const cfg = STAGE_CFG[stage];
          const cp = counterparty(detailOpen, viewerRole);
          return (
            <>
              <div style={{ marginBottom: 16 }}>
                <Tag color={cfg.color} style={{ fontSize: 13, padding: '4px 10px' }}>{cfg.label}</Tag>
              </div>

              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="เลขที่จับคู่"><Text strong>{detailOpen.id}</Text></Descriptions.Item>
                {detailOpen.contractNo && (
                  <Descriptions.Item label="เลขที่สัญญา"><Text strong style={{ color: '#1a7c3e' }}>{detailOpen.contractNo}</Text></Descriptions.Item>
                )}
                <Descriptions.Item label="ชนิดยาง"><Tag color="blue">{detailOpen.rubberType}</Tag></Descriptions.Item>
                <Descriptions.Item label="ราคา × ปริมาณ">
                  <Text strong style={{ color: '#1a7c3e' }}>{detailOpen.price.toFixed(2)} ฿/กก.</Text>
                  {' × '}<Text strong>{detailOpen.quantity.toLocaleString()} กก.</Text>
                  {' = '}<Text strong style={{ color: '#fa8c16' }}>{(detailOpen.price * detailOpen.quantity).toLocaleString()} ฿</Text>
                </Descriptions.Item>
                <Descriptions.Item label="วันส่งมอบ">
                  {detailOpen.deliveryDate ? dayjs(detailOpen.deliveryDate).format('DD/MM/YYYY') : '—'}
                </Descriptions.Item>
                <Descriptions.Item label={viewerRole === 'buyer' ? 'ผู้ขาย' : 'ผู้ซื้อ'}>
                  <div>
                    <Text strong>{cp.name}</Text>
                    <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                      <EnvironmentOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                      {cp.address}
                    </div>
                    {cp.gps && (
                      <div style={{ marginTop: 4 }}>
                        <AimOutlined style={{ color: '#1677ff', marginRight: 4 }} />
                        <Text code style={{ fontSize: 11 }}>{cp.gps}</Text>{' '}
                        <a href={`https://www.google.com/maps?q=${cp.gps}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11 }}>
                          เปิดใน Google Maps ↗
                        </a>
                      </div>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="ลำดับการยืนยัน">
                  <Space orientation="vertical" size={4}>
                    <div>
                      {detailOpen.buyerMatchedAt
                        ? <Tag color="success" icon={<CheckCircleOutlined />}>ผู้ซื้อยืนยันจับคู่</Tag>
                        : <Tag>ผู้ซื้อยังไม่ยืนยัน</Tag>}
                    </div>
                    <div>
                      {detailOpen.sellerMatchedAt
                        ? <Tag color="success" icon={<CheckCircleOutlined />}>ผู้ขายยืนยันจับคู่</Tag>
                        : <Tag>ผู้ขายยังไม่ยืนยัน</Tag>}
                    </div>
                    {detailOpen.contractNo && (
                      <>
                        <div>
                          {detailOpen.buyerSignedAt
                            ? <Tag color="success" icon={<CheckCircleOutlined />}>ผู้ซื้อลงนาม</Tag>
                            : <Tag color="warning">ผู้ซื้อยังไม่ลงนาม</Tag>}
                        </div>
                        <div>
                          {detailOpen.sellerSignedAt
                            ? <Tag color="success" icon={<CheckCircleOutlined />}>ผู้ขายลงนาม</Tag>
                            : <Tag color="warning">ผู้ขายยังไม่ลงนาม</Tag>}
                        </div>
                      </>
                    )}
                    {detailOpen.paidAt && (
                      <div><Tag color="success" icon={<DollarOutlined />}>ชำระเงินแล้ว</Tag></div>
                    )}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </>
          );
        })()}
      </Modal>
    </>
  );
}

/** Re-export the stage type for convenience */
export type { MatchStage };
