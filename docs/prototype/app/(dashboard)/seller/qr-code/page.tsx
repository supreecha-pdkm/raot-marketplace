'use client';

import { useState, useEffect } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Button, Modal, Form, Select, InputNumber, Row, Col,
  Table, Tag, Alert, Typography, Tabs, QRCode, Input, Descriptions, Space, Progress,
  App as AntApp,
} from 'antd';
import {
  QrcodeOutlined, PlusOutlined, UserOutlined, FilePdfOutlined,
  InfoCircleOutlined, CalendarOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

// ─── Types ────────────────────────────────────────────────────────────────────
interface QRRecord {
  id: string;
  plotKey: string;
  typeKey: string;
  plot: string;
  rubberType: string;
  isEudr: boolean;
  quota: number;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
  qrValue: string;
}

interface RubberTypeMeta {
  label: string;
  isEudr: boolean;
}

const RUBBER_TYPES: Record<string, RubberTypeMeta> = {
  RSS3:  { label: 'ยางแผ่นรมควัน RSS3', isEudr: true  },
  CL:    { label: 'ยางก้อนถ้วย',          isEudr: true  },
  Latex: { label: 'น้ำยางสด',             isEudr: false },
};

const PLOT_LABEL: Record<string, string> = {
  plotA: 'แปลง A — บ้านท่าสะท้อน (15 ไร่)',
  plotB: 'แปลง B — บ้านคลองขนาน (8 ไร่)',
};

// EUDR quota per (plot × rubberType) in kg — only EUDR-certified plots/types listed
const EUDR_QUOTA: Record<string, Record<string, number>> = {
  plotA: { RSS3: 5000, CL: 3000 },
  plotB: { RSS3: 4000, CL: 2500 },
};

// ─── Mock history ─────────────────────────────────────────────────────────────
const INITIAL_HISTORY: QRRecord[] = [
  {
    id: 'QR001', plotKey: 'plotA', typeKey: 'RSS3',
    plot: PLOT_LABEL.plotA, rubberType: RUBBER_TYPES.RSS3.label, isEudr: true,
    quota: 3200, createdAt: '2024-04-17T08:00:00', expiresAt: '2024-04-17T08:15:00',
    status: 'used', qrValue: 'RAOT-QR-001-plotA-RSS3',
  },
  {
    id: 'QR002', plotKey: 'plotB', typeKey: 'CL',
    plot: PLOT_LABEL.plotB, rubberType: RUBBER_TYPES.CL.label, isEudr: true,
    quota: 1500, createdAt: '2024-04-16T07:30:00', expiresAt: '2024-04-16T07:45:00',
    status: 'expired', qrValue: 'RAOT-QR-002-plotB-CL',
  },
  {
    id: 'QR003', plotKey: 'plotA', typeKey: 'Latex',
    plot: PLOT_LABEL.plotA, rubberType: RUBBER_TYPES.Latex.label, isEudr: false,
    quota: 2800, createdAt: '2024-04-17T09:00:00', expiresAt: '2024-04-17T09:15:00',
    status: 'active', qrValue: 'RAOT-QR-003-plotA-Latex',
  },
];

const STATUS_TAG: Record<string, React.ReactNode> = {
  active:  <Tag color="success">ใช้งานได้</Tag>,
  used:    <Tag color="default">ใช้แล้ว</Tag>,
  expired: <Tag color="error">หมดอายุ</Tag>,
};

// Available EUDR quota = initial − sum of (active + used) QRs of same plot×type.
// Expired QRs return their quota.
function getAvailableQuota(plotKey: string, typeKey: string, history: QRRecord[]): number {
  const initial = EUDR_QUOTA[plotKey]?.[typeKey] ?? 0;
  const consumed = history
    .filter(r => r.plotKey === plotKey && r.typeKey === typeKey && r.isEudr && r.status !== 'expired')
    .reduce((sum, r) => sum + r.quota, 0);
  return Math.max(0, initial - consumed);
}

// ─── PDF export ───────────────────────────────────────────────────────────────
async function exportToPDF(record: {
  qrValue: string; plot: string; rubberType: string; quota: number;
  id: string; createdAt: string;
}, qrCanvasEl: HTMLCanvasElement | null) {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
  const pageW = doc.internal.pageSize.getWidth();

  // ── Header ─────────────────────────────────────────────────────────────────
  doc.setFillColor(26, 124, 62);          // #1a7c3e
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RAOT Market', pageW / 2, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('QR Code ยินยอมการขายยาง', pageW / 2, 20, { align: 'center' });

  // ── QR Code image ──────────────────────────────────────────────────────────
  let qrDataUrl = '';
  if (qrCanvasEl) {
    qrDataUrl = qrCanvasEl.toDataURL('image/png');
  } else {
    const domQr = document.getElementById('qr-canvas-export');
    const canvas = domQr?.querySelector('canvas');
    if (canvas) qrDataUrl = canvas.toDataURL('image/png');
  }

  const qrSize = 60;
  const qrX = (pageW - qrSize) / 2;
  if (qrDataUrl) doc.addImage(qrDataUrl, 'PNG', qrX, 34, qrSize, qrSize);

  // ── Details table ──────────────────────────────────────────────────────────
  doc.setTextColor(26, 26, 46);
  const startY = 102;
  const rowH   = 10;
  const labelX = 14;
  const valueX = 70;

  const rows = [
    ['เลขที่ QR Code',  record.id],
    ['แปลงยาง',        record.plot],
    ['ชนิดยาง',        record.rubberType],
    ['น้ำหนักโดยประมาณ', `${record.quota.toLocaleString()} กก.`],
    ['วันที่สร้าง',    dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')],
  ];

  rows.forEach(([label, value], i) => {
    const y = startY + i * rowH;
    if (i % 2 === 0) {
      doc.setFillColor(246, 255, 237);
      doc.rect(12, y - 6, pageW - 24, rowH, 'F');
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(89, 89, 89);
    doc.text(label, labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 26, 46);
    doc.text(String(value), valueX, y);
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footerY = startY + rows.length * rowH + 8;
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.setFont('helvetica', 'italic');
  doc.text('QR Code มีอายุ 15 นาที — ห้ามแชร์กับผู้ที่ไม่เกี่ยวข้อง', pageW / 2, footerY, { align: 'center' });

  doc.save(`RAOT-QR-${record.id}-${dayjs(record.createdAt).format('YYYYMMDD')}.pdf`);
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SellerQRCodePage() {
  const { modal } = AntApp.useApp();
  const [form]         = Form.useForm();
  const [delegateForm] = Form.useForm();

  // Watch selections so the EUDR quota panel can render reactively
  const watchPlot = Form.useWatch('plot', form);
  const watchType = Form.useWatch('rubberType', form);
  const watchWeight = Form.useWatch('estimatedWeight', form);

  const [qrGenerated,   setQrGenerated]   = useState(false);
  const [currentQR,     setCurrentQR]     = useState<QRRecord | null>(null);
  const [countdown,     setCountdown]     = useState(900);
  const [delegateModal, setDelegateModal] = useState(false);
  const [detailModal,   setDetailModal]   = useState(false);
  const [detailRecord,  setDetailRecord]  = useState<QRRecord | null>(null);
  const [history,       setHistory]       = useState<QRRecord[]>(INITIAL_HISTORY);
  const [pdfLoading,    setPdfLoading]    = useState(false);

  // EUDR quota context (only when a plot+type are picked AND the type is EUDR)
  const isEudrPick = watchType ? RUBBER_TYPES[watchType]?.isEudr ?? false : false;
  const eudrInitial =
    watchPlot && watchType && isEudrPick ? EUDR_QUOTA[watchPlot]?.[watchType] ?? 0 : 0;
  const eudrAvailable =
    watchPlot && watchType && isEudrPick ? getAvailableQuota(watchPlot, watchType, history) : 0;
  const eudrCertified = isEudrPick && eudrInitial > 0;
  const overQuota = eudrCertified && (watchWeight ?? 0) > eudrAvailable;

  // ── Auto-expire active QRs once the 15-minute window passes ────────────────
  // This is what lets quota return automatically (per requirement #4).
  useEffect(() => {
    const t = setInterval(() => {
      const now = dayjs();
      setHistory(prev => {
        let changed = false;
        const next = prev.map(r => {
          if (r.status === 'active' && now.isAfter(dayjs(r.expiresAt))) {
            changed = true;
            return { ...r, status: 'expired' as const };
          }
          return r;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Keep the visible "current QR" panel in sync with history (status flips on expiry)
  useEffect(() => {
    if (!currentQR) return;
    const fresh = history.find(r => r.id === currentQR.id);
    if (fresh && fresh.status !== currentQR.status) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentQR(fresh);
    }
  }, [history, currentQR]);

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    await form.validateFields();
    const data = form.getFieldsValue();

    // Block over-quota generation (requirement #2)
    const isE = RUBBER_TYPES[data.rubberType]?.isEudr ?? false;
    if (isE) {
      const avail = getAvailableQuota(data.plot, data.rubberType, history);
      if ((data.estimatedWeight ?? 0) > avail) {
        modal.error({
          title: 'โควต้า EUDR ไม่เพียงพอ',
          content: `โควต้าคงเหลือสำหรับแปลง/ชนิดยางนี้ ${avail.toLocaleString()} กก. — ไม่สามารถสร้าง QR Code ได้`,
        });
        return;
      }
    }

    const now  = dayjs();
    const rec: QRRecord = {
      id:          `QR${String(history.length + 1).padStart(3, '0')}`,
      plotKey:     data.plot,
      typeKey:     data.rubberType,
      plot:        PLOT_LABEL[data.plot]   ?? data.plot,
      rubberType:  RUBBER_TYPES[data.rubberType]?.label ?? data.rubberType,
      isEudr:      isE,
      quota:       data.estimatedWeight ?? 0,
      createdAt:   now.toISOString(),
      expiresAt:   now.add(15, 'minute').toISOString(),
      status:      'active',
      qrValue:     `RAOT-QR-${Date.now()}-${data.plot}-${data.rubberType}`,
    };
    setCurrentQR(rec);
    setQrGenerated(true);
    setCountdown(900);
    setHistory(prev => [rec, ...prev]);
    let s = 900;
    const t = setInterval(() => { s--; setCountdown(s); if (s <= 0) clearInterval(t); }, 1000);
  };

  // ── PDF export ─────────────────────────────────────────────────────────────
  const handleSavePDF = async (record: QRRecord) => {
    setPdfLoading(true);
    try {
      const canvasEl = document
        .getElementById(`qr-canvas-${record.id}`)
        ?.querySelector('canvas') ?? null;
      await exportToPDF(record, canvasEl);
    } finally {
      setPdfLoading(false);
    }
  };

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  // ── History columns ────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'แปลง',
      dataIndex: 'plot',
      render: (v: string, r: QRRecord) => (
        <span>
          <span style={{ fontWeight: 500 }}>{v}</span>
          {r.isEudr && (
            <Tag color="green" style={{ marginLeft: 6 }} icon={<SafetyCertificateOutlined />}>
              EUDR
            </Tag>
          )}
        </span>
      ),
    },
    { title: 'ชนิดยาง',   dataIndex: 'rubberType' },
    { title: 'โควต้า (กก.)', dataIndex: 'quota', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    { title: 'สร้างเมื่อ', dataIndex: 'createdAt', render: (v: string) => <span style={{ fontSize: 12, color: '#8c8c8c' }}>{dayjs(v).format('DD/MM/YYYY HH:mm')}</span> },
    { title: 'สถานะ',     dataIndex: 'status',    render: (s: string) => STATUS_TAG[s] },
    {
      title: 'การดำเนินการ',
      render: (r: QRRecord) => (
        <Space size={6}>
          <Button
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => { setDetailRecord(r); setDetailModal(true); }}
          >
            รายละเอียด
          </Button>
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => handleSavePDF(r)}
            loading={pdfLoading}
          >
            PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        items={[
          // ── Tab 1: Generate ────────────────────────────────────────────────
          {
            key: 'generate',
            label: <span><PlusOutlined style={{ marginRight: 4 }} />สร้าง QR Code</span>,
            children: (
              <Row gutter={16}>
                {/* Form */}
                <Col xs={24} md={12}>
                  <Card title={<span><QrcodeOutlined style={{ marginRight: 8 }} />สร้าง QR Code ยินยอมการขาย</span>}>
                    <Alert
                      type="info" showIcon style={{ marginBottom: 16 }}
                      title="QR Code มีอายุ 15 นาที"
                      description="สร้าง QR Code แล้วมอบให้เจ้าหน้าที่ตลาดสแกน เพื่อยืนยันการนำยางเข้าตลาด"
                    />
                    <Form form={form} layout="vertical">
                      {/* EUDR quota overview — always visible, sits above the plot selector
                          so the seller can see what's available before choosing. */}
                      <div
                        style={{
                          background: '#f6ffed',
                          border: '1px solid #b7eb8f',
                          borderRadius: 8,
                          padding: '12px 14px',
                          marginBottom: 16,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a7c3e', marginBottom: 10 }}>
                          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
                          โควต้า EUDR คงเหลือ
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {Object.entries(EUDR_QUOTA).flatMap(([plotKey, byType]) =>
                            Object.entries(byType).map(([typeKey, initial]) => {
                              const avail   = getAvailableQuota(plotKey, typeKey, history);
                              const percent = initial ? Math.round((avail / initial) * 100) : 0;
                              const exhausted = avail === 0;
                              const highlight =
                                watchPlot === plotKey && watchType === typeKey;
                              return (
                                <div
                                  key={`${plotKey}-${typeKey}`}
                                  style={{
                                    background: highlight ? '#fff' : 'transparent',
                                    border: highlight ? '1px solid #52c41a' : '1px solid transparent',
                                    borderRadius: 6,
                                    padding: highlight ? '6px 8px' : '0 8px',
                                    transition: 'all 0.15s',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                                    <span style={{ color: '#595959' }}>
                                      {PLOT_LABEL[plotKey]?.split(' — ')[0] ?? plotKey}
                                      {' · '}
                                      <span style={{ color: '#1a1a2e' }}>{RUBBER_TYPES[typeKey]?.label ?? typeKey}</span>
                                    </span>
                                    <span style={{ color: exhausted ? '#ff4d4f' : '#595959' }}>
                                      <span style={{ fontWeight: 700, color: exhausted ? '#ff4d4f' : '#1a7c3e' }}>
                                        {avail.toLocaleString()}
                                      </span>
                                      {' / '}
                                      {initial.toLocaleString()} กก.
                                    </span>
                                  </div>
                                  <Progress
                                    percent={percent}
                                    size="small"
                                    strokeColor={exhausted ? '#ff4d4f' : '#52c41a'}
                                    showInfo={false}
                                  />
                                </div>
                              );
                            }),
                          )}
                        </div>
                      </div>

                      <Form.Item label="เลือกแปลง" name="plot" rules={[{ required: true }]}>
                        <Select placeholder="เลือกแปลงยาง">
                          {Object.entries(PLOT_LABEL).map(([k, v]) => (
                            <Option key={k} value={k}>{v}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item label="ชนิดยาง" name="rubberType" rules={[{ required: true }]}>
                        <Select placeholder="เลือกชนิดยาง">
                          {Object.entries(RUBBER_TYPES).map(([k, meta]) => (
                            <Option key={k} value={k}>
                              {meta.label}
                              {meta.isEudr && (
                                <Tag color="green" style={{ marginLeft: 8 }}>EUDR</Tag>
                              )}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="ปริมาณโดยประมาณ (กก.)"
                        name="estimatedWeight"
                        rules={[
                          { required: true, message: 'กรุณาระบุน้ำหนัก' },
                          () => ({
                            validator(_, value) {
                              if (!eudrCertified) return Promise.resolve();
                              if (value == null) return Promise.resolve();
                              if (value > eudrAvailable) {
                                return Promise.reject(
                                  new Error(`เกินโควต้า EUDR คงเหลือ (${eudrAvailable.toLocaleString()} กก.)`),
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <InputNumberSuffix
                          style={{ width: '100%' }}
                          min={1}
                          max={eudrCertified ? eudrAvailable : undefined}
                          suffix="กก."
                        />
                      </Form.Item>
                      <Button
                        type="primary"
                        block
                        icon={<QrcodeOutlined />}
                        size="large"
                        onClick={handleGenerate}
                        disabled={eudrCertified && (eudrAvailable === 0 || overQuota)}
                      >
                        สร้าง QR Code
                      </Button>
                    </Form>
                  </Card>
                </Col>

                {/* QR display */}
                <Col xs={24} md={12}>
                  {qrGenerated && currentQR ? (
                    <Card title="QR Code ยินยอมการขาย">
                      <div style={{ textAlign: 'center' }}>
                        <div id={`qr-canvas-${currentQR.id}`} style={{ display: 'inline-block' }}>
                          <QRCode value={currentQR.qrValue} size={220} bordered />
                        </div>

                        <div style={{ marginTop: 16, fontSize: 24, fontWeight: 700, color: countdown < 60 ? '#ff4d4f' : '#1a7c3e' }}>
                          ⏱ {mins}:{String(secs).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: 14, color: '#8c8c8c', marginTop: 4 }}>อายุการใช้งานที่เหลือ</div>

                        <div style={{ textAlign: 'left', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '10px 14px', margin: '12px 0' }}>
                          {[
                            ['แปลง',    currentQR.plot],
                            ['ชนิดยาง', currentQR.rubberType],
                            ['น้ำหนัก', `${currentQR.quota.toLocaleString()} กก.`],
                          ].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                              <span style={{ color: '#8c8c8c' }}>{label}</span>
                              <span style={{ fontWeight: 500 }}>{val}</span>
                            </div>
                          ))}
                          {currentQR.isEudr && (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #b7eb8f', fontSize: 12, color: '#1a7c3e' }}>
                              <SafetyCertificateOutlined style={{ marginRight: 4 }} />
                              ใช้โควต้า EUDR — หากไม่ได้ใช้และหมดอายุ ระบบจะคืนโควต้าโดยอัตโนมัติ
                            </div>
                          )}
                        </div>

                        <Alert type="warning" showIcon title="ห้ามแชร์ QR Code กับผู้ที่ไม่เกี่ยวข้อง" style={{ marginBottom: 10 }} />

                        <Space style={{ width: '100%', justifyContent: 'center' }}>
                          <Button icon={<UserOutlined />} onClick={() => setDelegateModal(true)}>
                            มอบอำนาจให้ผู้อื่น
                          </Button>
                          <Button
                            type="primary"
                            icon={<FilePdfOutlined />}
                            loading={pdfLoading}
                            onClick={() => handleSavePDF(currentQR)}
                          >
                            บันทึก PDF
                          </Button>
                        </Space>
                      </div>
                    </Card>
                  ) : (
                    <Card>
                      <div style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 48, color: '#bfbfbf' }}>
                        <QrcodeOutlined style={{ fontSize: 64 }} />
                        <div style={{ marginTop: 16 }}>กรอกข้อมูลและกดสร้าง QR Code</div>
                      </div>
                    </Card>
                  )}
                </Col>
              </Row>
            ),
          },

          // ── Tab 2: History ─────────────────────────────────────────────────
          {
            key: 'history',
            label: 'ประวัติ QR Code',
            children: (
              <Card>
                <Table
                  dataSource={history}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* ── Delegate modal ──────────────────────────────────────────────────── */}
      <Modal
        open={delegateModal}
        onCancel={() => setDelegateModal(false)}
        onOk={() => { delegateForm.resetFields(); setDelegateModal(false); }}
        title={<span><UserOutlined style={{ marginRight: 8 }} />มอบอำนาจให้ผู้อื่นขายแทน</span>}
        okText="ยืนยัน"
      >
        <Alert type="warning" showIcon title="การมอบอำนาจจะผูกกับ QR Code นี้เท่านั้น" style={{ marginBottom: 16 }} />
        <Form form={delegateForm} layout="vertical">
          <Form.Item label="เลขบัตรประชาชนผู้รับมอบอำนาจ" name="idCard" rules={[{ required: true }]}>
            <Input maxLength={13} placeholder="1234567890123" />
          </Form.Item>
          <Form.Item label="ชื่อ-นามสกุลผู้รับมอบอำนาจ" name="name" rules={[{ required: true }]}>
            <Input placeholder="ชื่อ-นามสกุล" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── QR Detail modal ─────────────────────────────────────────────────── */}
      <Modal
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={
          detailRecord ? (
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              loading={pdfLoading}
              onClick={() => handleSavePDF(detailRecord)}
            >
              บันทึก PDF
            </Button>
          ) : null
        }
        title={
          <span>
            <QrcodeOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />
            รายละเอียด QR Code — {detailRecord?.id}
          </span>
        }
        width={480}
      >
        {detailRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div id={`qr-canvas-${detailRecord.id}`} style={{ display: 'inline-block' }}>
                <QRCode value={detailRecord.qrValue} size={180} bordered />
              </div>
              <div style={{ marginTop: 8 }}>
                {STATUS_TAG[detailRecord.status]}
                {detailRecord.isEudr && (
                  <Tag color="green" style={{ marginLeft: 6 }} icon={<SafetyCertificateOutlined />}>
                    EUDR
                  </Tag>
                )}
              </div>
            </div>

            <Descriptions bordered size="small" column={1} items={[
              { label: 'เลขที่ QR',   children: <span style={{ fontWeight: 600, color: '#1a7c3e' }}>{detailRecord.id}</span> },
              { label: 'แปลงยาง',    children: <span style={{ fontWeight: 500 }}>{detailRecord.plot}</span> },
              { label: 'ชนิดยาง',    children: detailRecord.rubberType },
              { label: 'น้ำหนักโดยประมาณ', children: <span style={{ fontWeight: 600 }}>{detailRecord.quota.toLocaleString()} กก.</span> },
              {
                label: 'สร้างเมื่อ',
                children: (
                  <span>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {dayjs(detailRecord.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                ),
              },
              {
                label: 'หมดอายุ',
                children: (
                  <span style={{ color: '#ff4d4f' }}>
                    {dayjs(detailRecord.expiresAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                ),
              },
              { label: 'QR Value',   children: <Text copyable style={{ fontSize: 11 }}>{detailRecord.qrValue}</Text> },
            ]} />
          </div>
        )}
      </Modal>
    </div>
  );
}
