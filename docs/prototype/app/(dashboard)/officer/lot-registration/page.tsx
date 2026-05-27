'use client';

import { useState } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Button, Modal, Form, Select, Input, InputNumber,
  Steps, Alert, Tag, Row, Col, Tabs, Upload, Typography, Space,
  Descriptions, Progress, Divider, Tooltip, DatePicker,
} from 'antd';
import {
  QrcodeOutlined, UploadOutlined, CheckCircleOutlined,
  SafetyCertificateOutlined, EnvironmentOutlined, ArrowLeftOutlined,
  ReloadOutlined, FileTextOutlined, AreaChartOutlined,
  PlusOutlined, EditOutlined, UserOutlined, CloseOutlined,
  ThunderboltOutlined, CarOutlined, CameraOutlined, PictureOutlined,
  CalendarOutlined, ExperimentOutlined, InboxOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { MOCK_LOTS } from '@/features/lots/services/mock-lots';
import { RUBBER_TYPES } from '@/shared/constants/rubber';
import { addWaitingLot } from '@/features/lots/services/lot-queue';
import { addCheckoutLot } from '@/features/payments/services/checkout-queue';
import dayjs from 'dayjs';

// ─── Manual-create lookups ────────────────────────────────────────────────────
// Sellers known to the market — used by the search Select in the "สร้าง LOT" tab.
// Officers pick by name or paste an ID card — both are searchable.
const MANUAL_SELLERS = [
  { id: 'S001', name: 'นายสมชาย ใจดี',         idCard: '1840112345678' },
  { id: 'S002', name: 'นายอนันต์ ศรีสะอาด',    idCard: '1850203456789' },
  { id: 'S003', name: 'นางวิภา ทองคำ',         idCard: '1860304567890' },
  { id: 'S004', name: 'นายประสิทธิ์ ยางงาม',    idCard: '1870405678901' },
  { id: 'S005', name: 'นางรัตนา สวนยาง',        idCard: '1880506789012' },
  { id: 'S006', name: 'นายชาญชัย ไร่ยาง',       idCard: '1890607890123' },
  { id: 'S007', name: 'นางสาวเชิดชัย สวนยาง',   idCard: '1900708901234' },
];

const RUBBER_GRADES = ['Premium', 'A', 'B', 'C', 'D'];

// Assumed empty-truck tare (kg) — in production this comes from the truck
// registration / license plate lookup. Used to derive rubber weight from the
// weighbridge's gross reading.
const TRUCK_TARE_KG = 3500;

const { Option } = Select;
const { Text, Title } = Typography;

// ─── Mock scan result ─────────────────────────────────────────────────────────
// One scan returns the seller + the plot the QR was issued for. Quota is the
// seller's original yearly quota (no per-plot accounting).

const mockScanResult = {
  seller:        'นายสมชาย ใจดี',
  idCard:        '1840112345678',
  quotaUsed:     1805,
  quotaTotal:    2300,
  hasDocRight:   true,
  forestStatus:  'not-found' as const,    // 'not-found' = ไม่พบบุกรุกป่า
  /** Weight (kg) the seller declared via QR — what they want to sell from this plot */
  offeredWeight: 320,
  /** Truck identified on arrival — from license-plate scan / registry lookup */
  truck: {
    type:    'รถ 6 ล้อ',
    license: 'กข 1234 สงขลา',
    tare:    3500,    // registered empty weight (kg) from truck DB
  },
  plot: {
    gid:           'GID-00123',
    label:         'แปลงหลัก (บ้านท่าศาลา) · ยางแผ่นดิบ · 12.5 ไร่ · EUDR',
    areaRai:       12.5,
    rubberType:    'ยางแผ่นดิบ',
    gps:           '8.3456, 99.4567',
    drawing:       'วาด',
    deforestation: 'Low' as const,
    eudrEligible:  true,
    riskScore:     12,                    // 0..100, lower is better
    lastAssessed:  '12/03/2568',
    assessedBy:    'ประภา วินิจฉัย',
    ndviSeries: [
      { quarter: 'Q1/2026', score: 0.72, status: 'สมบูรณ์' },
      { quarter: 'Q4/2025', score: 0.77, status: 'สมบูรณ์' },
      { quarter: 'Q3/2025', score: 0.71, status: 'สมบูรณ์' },
      { quarter: 'Q2/2025', score: 0.67, status: 'ปกติ'    },
      { quarter: 'Q1/2025', score: 0.74, status: 'สมบูรณ์' },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ndviTone(score: number) {
  // Green for healthy NDVI, amber for borderline, red for stressed.
  if (score >= 0.70) return { ring: '#52c41a', from: '#a8e063', to: '#56ab2f' };
  if (score >= 0.55) return { ring: '#fa8c16', from: '#fbc687', to: '#f6a43c' };
  return { ring: '#ff4d4f', from: '#fbb6b6', to: '#e75858' };
}

function riskTone(score: number) {
  if (score < 30) return { color: '#52c41a', label: 'ความเสี่ยงต่ำ' };
  if (score < 60) return { color: '#fa8c16', label: 'ความเสี่ยงปานกลาง' };
  return { color: '#ff4d4f', label: 'ความเสี่ยงสูง' };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LotRegistrationPage() {
  const [scanned, setScanned]               = useState(false);
  const [scanLoading, setScanLoading]       = useState(false);
  const [createLotModal, setCreateLotModal] = useState(false);
  // Step 2: weighing the truck (gross weight = truck + rubber).
  // null  = not yet weighed
  // number = kg from the scale
  const [truckWeight, setTruckWeight]       = useState<number | null>(null);
  const [weighingLoading, setWeighingLoading] = useState(false);
  // Grade is officer-selected at weighing time (rubber type comes from QR).
  const [selectedGrade, setSelectedGrade]   = useState<string | undefined>(undefined);
  // Rubber photos captured at weighing — surfaced later on the buyer auction page.
  const [photoFiles, setPhotoFiles]         = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const plot = mockScanResult.plot;
  const quotaRemaining = Math.max(0, mockScanResult.quotaTotal - mockScanResult.quotaUsed);

  function handleScan() {
    setScanLoading(true);
    setTimeout(() => { setScanned(true); setScanLoading(false); }, 900);
  }

  function handleReset() {
    setScanned(false);
    setTruckWeight(null);
    setSelectedGrade(undefined);
    setPhotoFiles([]);
    form.resetFields();
  }

  // Simulate a request to the weighing equipment. In a real deployment this
  // would talk to the scale over serial / HTTP. The result is the GROSS
  // weight (truck + rubber on it).
  function handleReadScale() {
    setWeighingLoading(true);
    setTimeout(() => {
      // Simulated weighbridge: truck tare + declared rubber, with ±2% drift.
      const drift = (Math.random() - 0.5) * 0.04;
      const gross = Math.max(1, Math.round((TRUCK_TARE_KG + mockScanResult.offeredWeight) * (1 + drift)));
      setTruckWeight(gross);
      setWeighingLoading(false);
    }, 1100);
  }

  function handleSaveLot() {
    form.validateFields().then((v) => {
      const lotId = `SLOT-${Date.now()}`;
      const checkedInAt = dayjs().format('HH:mm');

      const photos = photoFiles
        .map((f) => (f.url ?? (f.thumbUrl as string | undefined)))
        .filter((u): u is string => !!u);

      // Push the LOT into the shared queue so it shows up in the weighing page.
      addWaitingLot({
        id:              lotId,
        sellerName:      mockScanResult.seller,
        sellerId:        mockScanResult.idCard,
        rubberType:      v.rubberType,
        grade:           selectedGrade,
        estimatedWeight: v.estimatedWeight,
        eudrType:        v.eudrType,
        source:          'scan',
        createdAt:       checkedInAt,
        photos:          photos.length > 0 ? photos : undefined,
      });

      // Record the weigh-in for the OUT flow. Real rubber weight will be
      // derived later as gross_in − tare_out when the truck leaves.
      if (truckWeight != null) {
        addCheckoutLot({
          id:            lotId,
          sellerName:    mockScanResult.seller,
          sellerId:      mockScanResult.idCard,
          truckPlate:    v.truckLicense,
          rubberType:    v.rubberType,
          qrWeight:      mockScanResult.offeredWeight,
          truckTareDb:   mockScanResult.truck.tare,
          grossWeightIn: truckWeight,
          checkedInAt,
          status:        'pending',
        });
      }

      // One-shot: after save, clear the form, close the modal, and return to
      // the scan view so the next seller can be processed.
      form.resetFields();
      setCreateLotModal(false);
      handleReset();
    });
  }

  const lotColumns = [
    { title: 'LOT No.', dataIndex: 'lotNo', render: (v: string) => <span className="font-semibold">{v}</span> },
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    { title: 'เกรด', dataIndex: 'grade' },
    { title: 'น้ำหนัก (กก.)', dataIndex: 'weight', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    { title: 'EUDR', dataIndex: 'isEudr', render: (v: boolean) => v ? <Tag color="success">EUDR</Tag> : <Tag>Non Green</Tag> },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (s: string) => ({ open: 'เปิดประมูล', pending: 'รอเปิด', closed: 'ปิดแล้ว' }[s] ?? s),
    },
    { title: 'วันที่', dataIndex: 'auctionDate', render: (v: string) => dayjs(v).format('DD/MM/YY') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        items={[
          // ── Tab 1: Scan ────────────────────────────────────────────────────
          {
            key: 'scan',
            label: <span><QrcodeOutlined style={{ marginRight: 4 }} />สแกน QR + เพิ่มเข้า LOT</span>,
            children: scanned
              ? <PostScanView
                  scan={mockScanResult}
                  quotaRemaining={quotaRemaining}
                  onReset={handleReset}
                  onAddToLot={() => setCreateLotModal(true)}
                  truckWeight={truckWeight}
                  weighingLoading={weighingLoading}
                  onReadScale={handleReadScale}
                  selectedGrade={selectedGrade}
                  onChangeGrade={setSelectedGrade}
                  photoFiles={photoFiles}
                  onChangePhotos={setPhotoFiles}
                />
              : <ScanCard loading={scanLoading} onScan={handleScan} />,
          },
          // ── Tab 2: Manual create ───────────────────────────────────────────
          {
            key: 'manual',
            label: <span><EditOutlined style={{ marginRight: 4 }} />สร้าง LOT</span>,
            children: <ManualCreateLot />,
          },
          // ── Tab 3: Today's LOTs ────────────────────────────────────────────
          {
            key: 'today',
            label: <span><FileTextOutlined style={{ marginRight: 4 }} />LOT วันนี้</span>,
            children: (
              <Card title={<span><FileTextOutlined style={{ marginRight: 8 }} />LOT ที่บันทึกวันนี้</span>}>
                <Table dataSource={MOCK_LOTS} columns={lotColumns} rowKey="id" size="small" pagination={{ pageSize: 10 }} scroll={{ x: 'max-content' }} />
              </Card>
            ),
          },
          // ── Tab 3: Excel import ────────────────────────────────────────────
          {
            key: 'excel',
            label: <span><UploadOutlined style={{ marginRight: 4 }} />นำเข้าจาก Excel (สถาบัน)</span>,
            children: (
              <Card title="นำเข้าข้อมูลผู้ขายจากสถาบันเกษตรกร">
                <Alert type="info" showIcon title="ใช้สำหรับสถาบันเกษตรกรที่ส่งรายชื่อสมาชิกมาเป็น Excel" className="mb-4" />
                <Upload.Dragger accept=".xlsx,.xls,.csv" maxCount={1}>
                  <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                  <p className="ant-upload-text">คลิกหรือลากไฟล์ Excel มาวาง</p>
                  <p className="ant-upload-hint">รองรับ .xlsx, .xls, .csv — สูงสุด 10MB</p>
                </Upload.Dragger>
                <Button type="primary" className="mt-4" icon={<CheckCircleOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
                  ตรวจสอบและนำเข้า
                </Button>
              </Card>
            ),
          },
        ]}
      />

      {/* Add-to-LOT modal — single shot, resets the scan on save */}
      <Modal
        open={createLotModal}
        onCancel={() => { form.resetFields(); setCreateLotModal(false); }}
        onOk={handleSaveLot}
        title={
          <span>
            <PlusOutlined style={{ marginRight: 8, color: '#1a7c3e' }} />
            เพิ่มเข้า LOT — {mockScanResult.seller}
          </span>
        }
        width={520}
        okText="บันทึกเข้า LOT"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#1a7c3e', borderColor: '#1a7c3e' } }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          initialValues={{
            rubberType:      plot.rubberType,
            eudrType:        plot.eudrEligible ? 'eudr' : 'non-eudr',
            truckType:       mockScanResult.truck.type,
            truckLicense:    mockScanResult.truck.license,
            // Weight is always sourced from the seller's QR declaration
            // (what they said they'd sell from this plot).
            estimatedWeight: mockScanResult.offeredWeight,
          }}
        >
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            title={
              <span style={{ fontSize: 12 }}>
                น้ำหนักจาก QR: <Text strong>{mockScanResult.offeredWeight.toLocaleString()} กก.</Text>
                {' '} — กรอกอัตโนมัติจากข้อมูลที่ผู้ขายแจ้ง
              </span>
            }
          />

          {truckWeight != null && (
            <Card
              size="small"
              style={{ marginBottom: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}
            >
              <Row gutter={[12, 8]} align="middle">
                <Col xs={24} sm={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>ชั่งเข้า (รวม)</Text>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#595959' }}>
                    {truckWeight.toLocaleString()}
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>กก.</Text>
                  </div>
                </Col>
                <Col xs={12} sm={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tare (ทะเบียน)</Text>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#595959' }}>
                    − {mockScanResult.truck.tare.toLocaleString()}
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>กก.</Text>
                  </div>
                </Col>
                <Col xs={12} sm={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>น้ำหนักยางจริง</Text>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1a7c3e', lineHeight: 1.1 }}>
                    {Math.max(0, truckWeight - mockScanResult.truck.tare).toLocaleString()}
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 400, marginLeft: 4 }}>กก.</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
          <Form.Item label="ชนิดยาง" name="rubberType" rules={[{ required: true }]}>
            <Select disabled>{RUBBER_TYPES.map(t => <Option key={t} value={t}>{t}</Option>)}</Select>
          </Form.Item>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={`น้ำหนัก (กก.) — Quota เหลือ ${quotaRemaining.toLocaleString()}`}
                name="estimatedWeight"
                rules={[
                  { required: true, message: 'กรุณาระบุน้ำหนัก' },
                  () => ({
                    validator(_, v) {
                      if (v == null) return Promise.resolve();
                      if (v > quotaRemaining) {
                        return Promise.reject(new Error(`เกิน Quota คงเหลือ (${quotaRemaining.toLocaleString()} กก.)`));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumberSuffix disabled style={{ width: '100%' }} min={1} max={quotaRemaining || undefined} suffix="กก." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="ประเภท LOT" name="eudrType" rules={[{ required: true }]}>
                <Select disabled>
                  <Option value="eudr">EUDR LOT</Option>
                  <Option value="non-eudr">Non Green LOT</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ fontSize: 12, color: '#8c8c8c', margin: '4px 0 8px', borderTop: '1px dashed #f0f0f0', paddingTop: 12 }}>
            <Space size={4}><CalendarOutlined />วันที่เก็บยาง / รับยาง</Space>
          </div>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <Space size={4}>
                    <CalendarOutlined />
                    <span>วันที่เก็บยาง (ช่วง)</span>
                    <Tooltip title="ระบุช่วงวันที่เกษตรกรเก็บยาง — ถ้าเก็บวันเดียวเลือกวันเดียวกันทั้งสองช่อง">
                      <Text type="secondary" style={{ fontSize: 11 }}>(?)</Text>
                    </Tooltip>
                  </Space>
                }
                name="tappingRange"
                rules={[{ required: true, message: 'กรุณาระบุช่วงวันที่เก็บยาง' }]}
              >
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  allowEmpty={[false, false]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<Space size={4}><InboxOutlined /><span>วันที่ตลาดรับยาง</span></Space>}
                name="receivedDate"
                rules={[{ required: true, message: 'กรุณาระบุวันที่รับยาง' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={
              <Space size={4}>
                <ExperimentOutlined />
                <span>DRC (% เนื้อยางแห้ง)</span>
                <Tooltip title="จำเป็นสำหรับน้ำยางสด — สำหรับยางอื่นใส่ถ้ามีค่า">
                  <Text type="secondary" style={{ fontSize: 11 }}>(?)</Text>
                </Tooltip>
              </Space>
            }
            name="drc"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              step={0.5}
              precision={1}
              placeholder="เช่น 35"
              addonAfter="%"
            />
          </Form.Item>

          <div style={{ fontSize: 12, color: '#8c8c8c', margin: '4px 0 8px', borderTop: '1px dashed #f0f0f0', paddingTop: 12 }}>
            <Space size={4}><CarOutlined />ข้อมูลรถบรรทุก</Space>
          </div>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="ประเภทรถ" name="truckType" rules={[{ required: true, message: 'กรุณาเลือกประเภทรถ' }]}>
                <Select placeholder="เลือกประเภทรถ">
                  <Option value="รถ 6 ล้อ">รถ 6 ล้อ</Option>
                  <Option value="รถ 10 ล้อ">รถ 10 ล้อ</Option>
                  <Option value="ปิคอัพ">ปิคอัพ</Option>
                  <Option value="รถพ่วง">รถพ่วง</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="ทะเบียนรถ" name="truckLicense" rules={[{ required: true, message: 'กรุณากรอกทะเบียนรถ' }]}>
                <Input placeholder="เช่น กข 1234 สงขลา" />
              </Form.Item>
            </Col>
          </Row>

          <Alert
            type="success"
            showIcon
            title="ข้อมูลผู้ขายผ่านการตรวจสอบแล้ว — สามารถบันทึกเข้า LOT ได้"
          />
        </Form>
      </Modal>
    </div>
  );
}

// ─── Pre-scan card ─────────────────────────────────────────────────────────────

function ScanCard({ loading, onScan }: { loading: boolean; onScan: () => void }) {
  return (
    <Row justify="center">
      <Col xs={24} md={14} lg={10}>
        <Card title={<span><QrcodeOutlined style={{ marginRight: 8 }} />สแกน QR Code ผู้ขาย</span>}>
          <div
            onClick={loading ? undefined : onScan}
            style={{
              textAlign: 'center',
              padding: '48px 0',
              borderRadius: 8,
              marginBottom: 16,
              cursor: loading ? 'wait' : 'pointer',
              background: '#fafafa',
              border: '1px dashed #d9d9d9',
            }}
          >
            <QrcodeOutlined style={{ fontSize: 80, color: loading ? '#bfbfbf' : '#1a7c3e' }} />
            <div style={{ marginTop: 16, color: '#8c8c8c' }}>
              {loading ? 'กำลังสแกน...' : 'คลิกเพื่อจำลองการสแกน QR Consent'}
            </div>
          </div>
          <Alert
            type="info"
            showIcon
            title="สแกน QR Code จากแอปมือถือผู้ขาย"
            description="ระบบจะดึงข้อมูล Risk Score · EUDR Status · Quota · NDVI จากระบบ Traceability"
          />
        </Card>
      </Col>
    </Row>
  );
}

// ─── Post-scan view ───────────────────────────────────────────────────────────
// One-shot: shows the scan result and a single "เพิ่มเข้า LOT" button.

function PostScanView({
  scan, quotaRemaining, onReset, onAddToLot,
  truckWeight, weighingLoading, onReadScale,
  selectedGrade, onChangeGrade,
  photoFiles, onChangePhotos,
}: {
  scan: typeof mockScanResult;
  quotaRemaining: number;
  onReset:    () => void;
  onAddToLot: () => void;
  truckWeight:     number | null;
  weighingLoading: boolean;
  onReadScale:     () => void;
  selectedGrade:   string | undefined;
  onChangeGrade:   (g: string | undefined) => void;
  photoFiles:      UploadFile[];
  onChangePhotos:  (files: UploadFile[]) => void;
}) {
  const plot = scan.plot;
  const risk = riskTone(plot.riskScore);
  const quotaPct = scan.quotaTotal > 0
    ? Math.min(Math.round((scan.quotaUsed / scan.quotaTotal) * 100), 100)
    : 0;
  const quotaExhausted = quotaRemaining <= 0;
  const weighed = truckWeight !== null;
  const hasGrade = !!selectedGrade;
  // Steps: Scan ✓ → EUDR ✓ → Weighing (current) → Add to LOT (final).
  // Once truck weight is captured, advance to "Add to LOT".
  const currentStep = weighed ? 3 : 2;

  // Convert the picked File → data URL so it survives navigation via state.
  // The Upload component does not actually upload anywhere (mock flow).
  const beforeUploadPhoto: NonNullable<UploadProps['beforeUpload']> = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const item: UploadFile = {
        uid:    file.uid ?? `${Date.now()}-${file.name}`,
        name:   file.name,
        status: 'done',
        url,
        thumbUrl: url,
      };
      onChangePhotos([...photoFiles, item]);
    };
    reader.readAsDataURL(file);
    return false; // prevent the auto-upload — we already captured the data URL
  };

  const handleRemovePhoto: NonNullable<UploadProps['onRemove']> = (file) => {
    onChangePhotos(photoFiles.filter((p) => p.uid !== file.uid));
    return true;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header + steps */}
      <Card>
        <div style={{ marginBottom: 12 }}>
          <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>ลงทะเบียนยาง — เพิ่มเข้า LOT</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            สแกน QR Consent · ตรวจสอบ EUDR · ชั่งน้ำหนัก · บันทึกเข้า LOT
          </Text>
        </div>
        <Steps
          size="small"
          current={currentStep}
          items={[
            { title: 'Scan Consent',     icon: <CheckCircleOutlined /> },
            { title: 'ตรวจสอบ EUDR',     icon: <SafetyCertificateOutlined /> },
            { title: 'ชั่งน้ำหนัก',        icon: <CarOutlined /> },
            { title: 'เพิ่มเข้า LOT',      icon: <FileTextOutlined /> },
          ]}
        />
      </Card>

      <Row gutter={16}>
        {/* ── Left column: verification (seller + plot/EUDR/NDVI) ─────────── */}
        <Col xs={24} lg={14}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Seller info */}
      <Card>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="ชื่อผู้ขาย" span={2}>
            <Text strong>{scan.seller}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="เลขบัตรประชาชน">
            <Text style={{ fontFamily: 'monospace' }}>{scan.idCard}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Quota">
            <Text strong style={{ color: quotaExhausted ? '#ff4d4f' : '#0f3d22' }}>
              {scan.quotaUsed.toLocaleString()} / {scan.quotaTotal.toLocaleString()} กก.
            </Text>
            <div style={{ marginTop: 4 }}>
              <Progress
                percent={quotaPct}
                size="small"
                strokeColor={quotaExhausted ? '#ff4d4f' : '#52c41a'}
                showInfo={false}
              />
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="เอกสารสิทธิ์">
            {scan.hasDocRight
              ? <Tag color="success">มี</Tag>
              : <Tag color="error">ไม่มี</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="บุกรุกป่า">
            {scan.forestStatus === 'not-found'
              ? <Tag color="success">ไม่พบ</Tag>
              : <Tag color="error">พบ</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Plot / EUDR / Risk / NDVI */}
      <Card title={<Space><SafetyCertificateOutlined style={{ color: '#1a7c3e' }} /><span>ข้อมูลแปลง · EUDR Status · NDVI</span></Space>}>
        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            padding: 16,
          }}
        >
          <Space size={8} align="center" style={{ marginBottom: 12 }} wrap>
            <Text strong style={{ fontSize: 15, color: '#0f3d22' }}>
              {plot.label.split(' · ')[0]}
            </Text>
            {plot.eudrEligible && <Tag color="success">EUDR Ready</Tag>}
            <Tag color={plot.riskScore < 30 ? 'success' : plot.riskScore < 60 ? 'warning' : 'error'}>
              {risk.label}
            </Tag>
          </Space>

          <Descriptions size="small" column={1} colon>
            <Descriptions.Item label="GID">
              <Text style={{ fontFamily: 'monospace' }}>{plot.gid}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="เนื้อที่ (ไร่)">{plot.areaRai}</Descriptions.Item>
            <Descriptions.Item label="ประเภทยาง">{plot.rubberType}</Descriptions.Item>
            <Descriptions.Item label="GPS">
              <Space size={4}>
                <EnvironmentOutlined style={{ color: '#1a7c3e' }} />
                <Text style={{ fontFamily: 'monospace' }}>{plot.gps}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="การวาด">{plot.drawing}</Descriptions.Item>
            <Descriptions.Item label="Deforestation">
              <Tag color={plot.deforestation === 'Low' ? 'success' : 'warning'}>
                {plot.deforestation}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="ประเมินล่าสุด">
              {plot.lastAssessed} · EUDR v2.1 · ผ่าน · โดย {plot.assessedBy}
            </Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: '16px 0' }} />

          {/* Risk Overview + NDVI grid */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ textAlign: 'center', height: '100%' }}>
                <Text type="secondary" style={{ fontSize: 13 }}>Risk Overview</Text>
                <div style={{ margin: '16px 0 8px' }}>
                  <Progress
                    type="dashboard"
                    percent={plot.riskScore}
                    strokeColor={risk.color}
                    width={140}
                    format={(p) => <span style={{ fontSize: 22, fontWeight: 700, color: risk.color }}>{p}%</span>}
                  />
                </div>
                <Tag color={plot.riskScore < 30 ? 'success' : plot.riskScore < 60 ? 'warning' : 'error'} style={{ marginBottom: 8 }}>
                  {risk.label}
                </Tag>
                <div style={{ fontSize: 12 }}>Overall Score: <Text strong>{plot.riskScore}%</Text></div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  ประเมินล่าสุด {plot.lastAssessed} · EUDR v2.1
                </Text>
              </Card>
            </Col>

            <Col xs={24} md={16}>
              <Space size={4} style={{ marginBottom: 8 }}>
                <AreaChartOutlined style={{ color: '#1a7c3e' }} />
                <Text strong style={{ fontSize: 13 }}>NDVI Time-Series</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>(ข้อมูลดาวเทียมจาก Traceability)</Text>
              </Space>
              <Row gutter={[12, 12]}>
                {plot.ndviSeries.map((s) => {
                  const tone = ndviTone(s.score);
                  return (
                    <Col xs={24} sm={12} key={s.quarter}>
                      <div
                        style={{
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: '1px solid #f0f0f0',
                        }}
                      >
                        <div
                          style={{
                            height: 80,
                            background: `linear-gradient(135deg, ${tone.from} 0%, ${tone.to} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 13,
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                          }}
                        >
                          NDVI Satellite Image
                        </div>
                        <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.quarter}</div>
                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>NDVI Score: {s.score.toFixed(2)} · {s.status}</div>
                          </div>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              border: `2px solid ${tone.ring}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                              color: tone.ring,
                            }}
                          >
                            {s.score.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Col>
          </Row>
        </div>
      </Card>

          </div>
        </Col>

        {/* ── Right rail: action flow (offered weight → weigh → add to LOT) ── */}
        <Col xs={24} lg={10}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Offered weight from QR — the seller declared this to sell from this plot */}
      <Card
        size="small"
        style={{
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
        }}
      >
        <Row align="middle" gutter={16}>
          <Col flex="auto">
            <Text type="secondary" style={{ fontSize: 12 }}>น้ำหนักที่ผู้ขายแจ้งใน QR</Text>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1a7c3e', lineHeight: 1.1 }}>
              {scan.offeredWeight.toLocaleString()}
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 400, marginLeft: 6 }}>กก.</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              ระบบจะนำค่านี้ไปกรอกอัตโนมัติในขั้นตอนเพิ่มเข้า LOT (สามารถแก้ไขได้)
            </Text>
          </Col>
          {scan.offeredWeight > quotaRemaining && (
            <Col>
              <Tag color="error" style={{ margin: 0 }}>
                เกิน Quota คงเหลือ ({quotaRemaining.toLocaleString()} กก.)
              </Tag>
            </Col>
          )}
        </Row>
      </Card>

      {/* ── Step 3: Weigh the truck ────────────────────────────────────────
          The seller drives onto the scale; the officer presses the button
          to read the gross weight (truck + rubber) from the equipment. */}
      <Card
        title={
          <Space>
            <CarOutlined style={{ color: '#fa8c16' }} />
            <span>ชั่งน้ำหนัก (รถบรรทุก + ยาง)</span>
            {weighed
              ? <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>ชั่งแล้ว</Tag>
              : <Tag color="warning" style={{ margin: 0 }}>รอชั่ง</Tag>}
          </Space>
        }
      >
        <Row align="middle" gutter={16}>
          <Col flex="auto">
            {weighed ? (
              <>
                <Row gutter={[12, 8]} align="middle">
                  <Col xs={24} sm={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>น้ำหนักรวม (รถ + ยาง)</Text>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#595959', lineHeight: 1.1 }}>
                      {truckWeight!.toLocaleString()}
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 400, marginLeft: 4 }}>กก.</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>น้ำหนักยางจริง</Text>
                    <div style={{ fontSize: 26, fontWeight: 700, color: '#1a7c3e', lineHeight: 1.1 }}>
                      {Math.max(0, truckWeight! - TRUCK_TARE_KG).toLocaleString()}
                      <Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}>กก.</Text>
                    </div>
                  </Col>
                </Row>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  QR แจ้งไว้ {scan.offeredWeight.toLocaleString()} กก. · Tare {TRUCK_TARE_KG.toLocaleString()} กก. (จากทะเบียน)
                </Text>
              </>
            ) : (
              <>
                <Text strong style={{ fontSize: 13, color: '#d46b08' }}>ยังไม่ได้รับค่าน้ำหนัก</Text>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                  ให้ผู้ขายขับรถบรรทุกขึ้นเครื่องชั่ง แล้วกดปุ่ม &ldquo;ชั่งน้ำหนัก&rdquo; เพื่ออ่านค่าจากเครื่องชั่ง
                </div>
              </>
            )}
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              loading={weighingLoading}
              onClick={onReadScale}
              style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
            >
              {weighed ? 'ชั่งใหม่' : 'ชั่งน้ำหนัก'}
            </Button>
          </Col>
        </Row>

        {/* ── ประเภทยาง + Grade ─────────────────────────────────────────────
            ประเภทยางมาจาก QR (อ่านอย่างเดียว) — Grade เลือกที่จุดชั่ง */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px dashed #f0f0f0',
          }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                ประเภทยาง
                <Tag style={{ marginLeft: 6, fontSize: 10 }}>จาก QR</Tag>
              </div>
              <Select
                value={plot.rubberType}
                disabled
                style={{ width: '100%' }}
                options={RUBBER_TYPES.map((t) => ({ label: t, value: t }))}
              />
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                Grade ยาง
                <Tag color={hasGrade ? 'success' : 'warning'} style={{ marginLeft: 6, fontSize: 10 }}>
                  {hasGrade ? 'เลือกแล้ว' : 'ต้องเลือก'}
                </Tag>
              </div>
              <Select
                value={selectedGrade}
                onChange={onChangeGrade}
                placeholder="เลือก Grade ยาง"
                allowClear
                style={{ width: '100%' }}
                options={RUBBER_GRADES.map((g) => ({ label: g, value: g }))}
              />
            </Col>
          </Row>
        </div>

        {/* ── ภาพถ่ายยาง ────────────────────────────────────────────────────
            ใช้แสดงให้ผู้ซื้อในหน้าประมูล (buyer/auction) */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px dashed #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Space size={6}>
              <PictureOutlined style={{ color: '#1a7c3e' }} />
              <Text strong style={{ fontSize: 13 }}>ภาพถ่ายยาง</Text>
              <Tag style={{ margin: 0, fontSize: 10 }}>{photoFiles.length} รูป</Tag>
            </Space>
            <Text type="secondary" style={{ fontSize: 11 }}>
              แสดงให้ผู้ซื้อในหน้าประมูล
            </Text>
          </div>
          <Upload
            listType="picture-card"
            multiple
            accept="image/*"
            fileList={photoFiles}
            beforeUpload={beforeUploadPhoto}
            onRemove={handleRemovePhoto}
          >
            {photoFiles.length >= 8 ? null : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <CameraOutlined style={{ fontSize: 20, color: '#1a7c3e' }} />
                <span style={{ fontSize: 11 }}>ถ่ายภาพ / อัปโหลด</span>
              </div>
            )}
          </Upload>
          <Text type="secondary" style={{ fontSize: 11 }}>
            แนะนำ 3–5 รูป — ภาพรวม, มุมใกล้, แท็ก/ป้ายแปลง (ไม่เกิน 8 รูป)
          </Text>
        </div>
      </Card>

      {/* Footer actions */}
      <Card size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onReset}>
            ย้อนกลับ
          </Button>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={onReset}>สแกนใหม่</Button>
            <Tooltip
              title={
                !weighed ? 'กรุณาชั่งน้ำหนักก่อน'
                : !hasGrade ? 'กรุณาเลือก Grade ยาง'
                : ''
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddToLot}
                disabled={!plot.eudrEligible || quotaExhausted || !weighed || !hasGrade}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              >
                เพิ่มเข้า LOT
              </Button>
            </Tooltip>
          </Space>
        </div>
      </Card>

          </div>
        </Col>
      </Row>
    </div>
  );
}

// ─── Manual create LOT tab ────────────────────────────────────────────────────
// For when there's no QR Consent — officer searches for the seller, picks
// rubber + grade + EUDR type, enters weight, and submits. Recently-created
// LOTs are listed at the bottom for the officer's confirmation.

// LOTs in the session list now carry their own confirmation status. New
// entries land as 'pending' — they live in the list but are NOT pushed to the
// shared queue (= invisible to the weighing page) until the officer hits
// "ยืนยัน" inline. Cancelling removes the row entirely.
interface ManualLot {
  id:         string;
  sellerId:   string;
  sellerName: string;
  rubberType: string;
  grade:      string;
  weight:     number;
  eudrType:   'eudr' | 'non-eudr';
  createdAt:  string;
  status:     'pending' | 'confirmed';
}

function ManualCreateLot() {
  const [form] = Form.useForm<{
    sellerId:   string;
    rubberType: string;
    grade:      string;
    weight:     number;
    eudrType:   'eudr' | 'non-eudr';
  }>();
  const [recent, setRecent] = useState<ManualLot[]>([]);

  function handleSubmit() {
    form.validateFields().then((v) => {
      const seller = MANUAL_SELLERS.find((s) => s.id === v.sellerId);
      if (!seller) return;
      // LOT enters the session list as 'pending' — confirmation happens inline.
      const lot: ManualLot = {
        id:         `MLOT-${Date.now()}`,
        sellerId:   v.sellerId,
        sellerName: seller.name,
        rubberType: v.rubberType,
        grade:      v.grade,
        weight:     v.weight,
        eudrType:   v.eudrType,
        createdAt:  dayjs().format('HH:mm'),
        status:     'pending',
      };
      setRecent((prev) => [lot, ...prev]);
      form.resetFields();
    });
  }

  function handleConfirmRow(id: string) {
    setRecent((prev) =>
      prev.map((l) => {
        if (l.id !== id || l.status === 'confirmed') return l;
        // Push the confirmed LOT to the shared queue → visible in weighing page.
        addWaitingLot({
          id:              l.id,
          sellerId:        l.sellerId,
          sellerName:      l.sellerName,
          rubberType:      l.rubberType,
          grade:           l.grade,
          estimatedWeight: l.weight,
          eudrType:        l.eudrType,
          source:          'manual',
          createdAt:       l.createdAt,
        });
        return { ...l, status: 'confirmed' };
      }),
    );
  }

  function handleCancelRow(id: string) {
    setRecent((prev) => prev.filter((l) => l.id !== id));
  }

  // Bulk confirm — pushes every pending row to the shared queue in one click.
  function handleConfirmAll() {
    setRecent((prev) =>
      prev.map((l) => {
        if (l.status === 'confirmed') return l;
        addWaitingLot({
          id:              l.id,
          sellerId:        l.sellerId,
          sellerName:      l.sellerName,
          rubberType:      l.rubberType,
          grade:           l.grade,
          estimatedWeight: l.weight,
          eudrType:        l.eudrType,
          source:          'manual',
          createdAt:       l.createdAt,
        });
        return { ...l, status: 'confirmed' as const };
      }),
    );
  }

  const pendingCount = recent.filter((l) => l.status === 'pending').length;

  // Compact 5-column layout. Each cell stacks the primary value on top + a
  // smaller secondary line below (status, IDs, EUDR tag etc.) so the table
  // fits inside the right column without horizontal scroll.
  const recentCols = [
    {
      title: 'LOT',
      dataIndex: 'id',
      width: 120,
      render: (v: string, r: ManualLot) => (
        <div>
          <Text strong style={{ fontFamily: 'monospace', fontSize: 11, display: 'block', lineHeight: 1.2 }}>
            {v}
          </Text>
          {r.status === 'confirmed'
            ? (
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: '4px 0 0', fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
                ยืนยันแล้ว
              </Tag>
            )
            : (
              <Tag color="warning" style={{ margin: '4px 0 0', fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
                รอยืนยัน
              </Tag>
            )}
        </div>
      ),
    },
    {
      title: 'ผู้ขาย',
      dataIndex: 'sellerName',
      render: (v: string, r: ManualLot) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{v}</div>
          <Text type="secondary" style={{ fontSize: 10, fontFamily: 'monospace' }}>{r.sellerId}</Text>
        </div>
      ),
    },
    {
      title: 'ยาง',
      width: 130,
      render: (_: unknown, r: ManualLot) => (
        <div>
          <div style={{ fontSize: 11, lineHeight: 1.3 }}>{r.rubberType}</div>
          <Tag color="blue" style={{ margin: '2px 0 0', fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
            {r.grade}
          </Tag>
        </div>
      ),
    },
    {
      title: 'น้ำหนัก',
      dataIndex: 'weight',
      width: 110,
      align: 'right' as const,
      render: (v: number, r: ManualLot) => (
        <div>
          <div style={{ lineHeight: 1.2 }}>
            <Text strong style={{ fontSize: 12 }}>{v.toLocaleString()}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}> กก.</Text>
          </div>
          <div style={{ marginTop: 2, display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
            {r.eudrType === 'eudr'
              ? <Tag color="success" style={{ margin: 0, fontSize: 10, padding: '0 4px', lineHeight: '14px' }}>EUDR</Tag>
              : <Tag style={{ margin: 0, fontSize: 10, padding: '0 4px', lineHeight: '14px' }}>Non Green</Tag>}
            <Text type="secondary" style={{ fontSize: 10 }}>{r.createdAt}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '',
      width: 70,
      align: 'center' as const,
      render: (_: unknown, r: ManualLot) =>
        r.status === 'confirmed'
          ? <Text type="secondary" style={{ fontSize: 10 }}>ส่งแล้ว</Text>
          : (
            <Space size={2}>
              <Tooltip title="ยืนยัน — ส่งไปชั่งน้ำหนัก">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleConfirmRow(r.id)}
                  style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
                />
              </Tooltip>
              <Tooltip title="ยกเลิก">
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleCancelRow(r.id)}
                />
              </Tooltip>
            </Space>
          ),
    },
  ];

  return (
    <Row gutter={16}>
      {/* Left: form */}
      <Col xs={24} md={10} lg={9}>
        <Card title={<Space><EditOutlined style={{ color: '#1a7c3e' }} /><span>สร้าง LOT ด้วยตนเอง</span></Space>}>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            title="ใช้สำหรับกรณีที่ไม่มี QR Consent — เจ้าหน้าที่บันทึกข้อมูลด้วยตนเอง"
          />
          <Form
            form={form}
            layout="vertical"
            initialValues={{ eudrType: 'non-eudr' }}
            onFinish={handleSubmit}
          >
            <Form.Item
              label={<span><UserOutlined style={{ marginRight: 4 }} />ค้นหาผู้ขาย</span>}
              name="sellerId"
              rules={[{ required: true, message: 'กรุณาเลือกผู้ขาย' }]}
            >
              <Select
                showSearch
                placeholder="พิมพ์ชื่อหรือเลขบัตรประชาชน"
                optionFilterProp="searchText"
                options={MANUAL_SELLERS.map((s) => ({
                  value:      s.id,
                  searchText: `${s.name} ${s.idCard}`,
                  label: (
                    <div>
                      <div style={{ fontSize: 13 }}>{s.name}</div>
                      <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                        {s.id} · {s.idCard}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </Form.Item>

            <Row gutter={[12, 0]}>
              <Col xs={24} sm={14}>
                <Form.Item
                  label="ชนิดยาง"
                  name="rubberType"
                  rules={[{ required: true, message: 'กรุณาเลือกชนิดยาง' }]}
                >
                  <Select placeholder="เลือกชนิดยาง">
                    {RUBBER_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={10}>
                <Form.Item
                  label="เกรด"
                  name="grade"
                  rules={[{ required: true, message: 'กรุณาเลือกเกรด' }]}
                >
                  <Select placeholder="เกรด">
                    {RUBBER_GRADES.map((g) => <Option key={g} value={g}>{g}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="น้ำหนัก (กก.)"
              name="weight"
              rules={[{ required: true, message: 'กรุณาระบุน้ำหนัก' }]}
            >
              <InputNumberSuffix
                style={{ width: '100%' }}
                min={1}
                step={50}
                suffix="กก."
                placeholder="เช่น 1500"
              />
            </Form.Item>

            <Form.Item label="ประเภท LOT" name="eudrType" rules={[{ required: true }]}>
              <Select>
                <Option value="eudr">EUDR LOT</Option>
                <Option value="non-eudr">Non Green LOT</Option>
              </Select>
            </Form.Item>

            <Row gutter={[12, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={<Space size={4}><CalendarOutlined /><span>วันที่เก็บยาง (ช่วง)</span></Space>}
                  name="tappingRange"
                  rules={[{ required: true, message: 'กรุณาระบุช่วงวันที่เก็บยาง' }]}
                >
                  <DatePicker.RangePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    allowEmpty={[false, false]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={<Space size={4}><InboxOutlined /><span>วันที่ตลาดรับยาง</span></Space>}
                  name="receivedDate"
                  rules={[{ required: true, message: 'กรุณาระบุวันที่รับยาง' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label={<Space size={4}><ExperimentOutlined /><span>DRC (% เนื้อยางแห้ง)</span></Space>}
              name="drc"
              tooltip="จำเป็นสำหรับน้ำยางสด"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                step={0.5}
                precision={1}
                placeholder="เช่น 35"
                addonAfter="%"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              icon={<PlusOutlined />}
              size="large"
              style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
            >
              สร้าง LOT
            </Button>
          </Form>
        </Card>
      </Col>

      {/* Right: recently-created list */}
      <Col xs={24} md={14} lg={15}>
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1a7c3e' }} />
              <span>LOT ที่สร้างในเซสชันนี้</span>
              <Tag color={recent.length > 0 ? 'success' : 'default'} style={{ margin: 0 }}>
                {recent.length}
              </Tag>
              {pendingCount > 0 && (
                <Tag color="warning" style={{ margin: 0 }}>
                  รอยืนยัน {pendingCount}
                </Tag>
              )}
            </Space>
          }
          extra={
            pendingCount > 0 && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={handleConfirmAll}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
              >
                ยืนยันทั้งหมด ({pendingCount})
              </Button>
            )
          }
        >
          {recent.length === 0 ? (
            <Alert
              type="info"
              showIcon
              title="ยังไม่มี LOT ที่สร้างในเซสชันนี้"
              description="กรอกแบบฟอร์มทางซ้ายและกดปุ่ม &ldquo;สร้าง LOT&rdquo; — รายการจะปรากฏที่นี่ในสถานะ &ldquo;รอยืนยัน&rdquo; ให้คุณยืนยันก่อนส่งไปยังหน้าชั่งน้ำหนัก"
            />
          ) : (
            <Table
              dataSource={recent}
              columns={recentCols}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 'max-content' }}
              onRow={(r) => ({
                style: r.status === 'pending' ? { background: '#fffbe6' } : {},
              })}
            />
          )}
        </Card>
      </Col>

    </Row>
  );
}
