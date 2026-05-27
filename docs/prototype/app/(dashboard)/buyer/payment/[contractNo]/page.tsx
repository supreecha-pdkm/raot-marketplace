'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card, Form, Select, Upload, Steps, Alert, Statistic, Row, Col, Typography,
  Button, Descriptions, Tag, Result, Divider, Space,
} from 'antd';
import {
  DollarOutlined, UploadOutlined, CheckCircleOutlined, BankOutlined,
  QrcodeOutlined, ArrowLeftOutlined, FileTextOutlined, ClockCircleOutlined,
  HourglassOutlined, SafetyOutlined,
} from '@ant-design/icons';
import { MOCK_CONTRACTS } from '@/features/contracts/services/mock-contracts';
import { TradingType } from '@/shared/types';
import {
  getPaymentStatus, markWaitingVerify, markVerified,
  type PaymentStatus,
} from '@/features/payments/services/payment-state';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;

const BANKS = [
  'ธนาคารกรุงไทย (KTB)', 'ธนาคารไทยพาณิชย์ (SCB)',
  'ธนาคารกสิกรไทย (KBANK)', 'ธนาคารกรุงเทพ (BBL)',
  'ธนาคารออมสิน', 'ธนาคารเพื่อการเกษตรและสหกรณ์ (BAAC)',
];

const TRADING_TYPE_CFG: Record<TradingType, { label: string; color: string }> = {
  auction:     { label: 'ประมูล',          color: 'orange' },
  negotiated:  { label: 'ตกลงราคา',        color: 'cyan'   },
  'bid-ask':   { label: 'Bid / Ask',       color: 'blue'   },
  forward:     { label: 'ตลาดล่วงหน้า',    color: 'purple' },
};

interface PaymentFormValues {
  payType: 'full' | 'partial';
  method: 'transfer' | 'cash' | 'qr';
  bank: string;
  proof: unknown;
}

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ contractNo: string }>;
}) {
  const { contractNo } = use(params);
  const contract = MOCK_CONTRACTS.find(c => c.contractNo === contractNo);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('waiting');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [currentStep,   setCurrentStep]   = useState(0);
  const [paymentType,   setPaymentType]   = useState<'full' | 'partial'>('full');
  const [submitting,    setSubmitting]    = useState(false);
  const [form]                            = Form.useForm<PaymentFormValues>();

  // Read localStorage on mount — hydrate client-only payment status.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaymentStatus(getPaymentStatus(contractNo));
  }, [contractNo]);

  // ── Not found ───────────────────────────────────────────────────────────
  if (!contract) {
    return (
      <Result
        status="404"
        title="ไม่พบสัญญา"
        subTitle={`ไม่พบสัญญาเลขที่ ${contractNo}`}
        extra={
          <Link href="/buyer/payment">
            <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับไปหน้ารายการชำระเงิน
            </Button>
          </Link>
        }
      />
    );
  }

  const tradingCfg = TRADING_TYPE_CFG[contract.tradingType];
  const payAmount = paymentType === 'full'
    ? contract.totalAmount
    : Math.round(contract.totalAmount * 0.8);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handlePay = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    setCurrentStep(2);
    await new Promise(r => setTimeout(r, 1000));
    // Submit → awaits admin verification (not final "paid" yet)
    markWaitingVerify(contract.contractNo);
    setPaymentStatus('waiting_verify');
    setJustSubmitted(true);
    setCurrentStep(3);
    setSubmitting(false);
  };

  // [Demo] simulate admin approval — in production this is done from admin panel
  const handleSimulateAdminVerify = () => {
    markVerified(contract.contractNo);
    setPaymentStatus('verified');
    setJustSubmitted(false);
  };

  // ── Shell layout ────────────────────────────────────────────────────────
  const headerChip = (
    <Link
      href="/buyer/payment"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 999,
        background: '#f5f5f5',
        border: '1px solid #e8e8e8',
        color: '#1a7c3e',
        fontSize: 12,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <ArrowLeftOutlined />
      กลับไปหน้ารายการชำระเงิน
    </Link>
  );

  // ── Header (always visible) ─────────────────────────────────────────────
  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
      <div>
        <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          ชำระเงิน — {contract.contractNo}
        </Title>
        <Text type="secondary">
          <Tag color={tradingCfg.color} style={{ marginLeft: 4 }}>{tradingCfg.label}</Tag>
          {contract.rubberType}
        </Text>
      </div>
      {headerChip}
    </div>
  );

  // ── Contract info card (always visible) ─────────────────────────────────
  const contractInfo = (
    <Card title={<Space><FileTextOutlined style={{ color: '#1a7c3e' }} /><span>รายละเอียดสัญญา</span></Space>}>
      <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1a7c3e' }}>
            <Statistic title="น้ำหนัก" value={contract.weight} suffix="กก." styles={{ content: { color: '#0f3d22' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic title="ราคา" value={contract.price} precision={2} suffix="฿/กก." styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#ff4d4f' }}>
            <Statistic
              title="ยอดรวม"
              value={contract.totalAmount}
              suffix="฿"
              styles={{ content: { color: '#ff4d4f', fontWeight: 700 } }}
            />
          </Card>
        </Col>
      </Row>

      <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label="เลขที่สัญญา"><Text strong>{contract.contractNo}</Text></Descriptions.Item>
        <Descriptions.Item label="ประเภทการซื้อขาย"><Tag color={tradingCfg.color}>{tradingCfg.label}</Tag></Descriptions.Item>
        <Descriptions.Item label="ชนิดยาง">{contract.rubberType}</Descriptions.Item>
        <Descriptions.Item label="ครบกำหนด">
          {(() => {
            const overdue = dayjs(contract.dueDate).isBefore(dayjs());
            return <Tag color={overdue ? 'error' : 'warning'}>{dayjs(contract.dueDate).format('DD/MM/YYYY')}</Tag>;
          })()}
        </Descriptions.Item>
        <Descriptions.Item label="ผู้ซื้อ">{contract.buyer}</Descriptions.Item>
        <Descriptions.Item label="ผู้ขาย">{contract.seller}</Descriptions.Item>
        <Descriptions.Item label="วันที่ทำสัญญา" span={2}>{dayjs(contract.createdAt).format('DD/MM/YYYY')}</Descriptions.Item>
      </Descriptions>
    </Card>
  );

  // ── Waiting-verify state (submitted, awaiting admin approval) ───────────
  if (paymentStatus === 'waiting_verify') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {header}
        {contractInfo}

        <Card>
          <Result
            status="info"
            icon={<HourglassOutlined style={{ fontSize: 56, color: '#1677ff' }} />}
            title={justSubmitted ? 'ส่งหลักฐานการชำระเงินเรียบร้อย' : 'สัญญานี้อยู่ระหว่างตรวจสอบ'}
            subTitle="รอเจ้าหน้าที่ตรวจสอบและอนุมัติภายใน 1 วันทำการ — สถานะในลิสต์จะเปลี่ยนเป็น 'ชำระเงินสำเร็จ' เมื่อได้รับการอนุมัติ"
            extra={
              <Space wrap>
                <Link href="/buyer/payment">
                  <Button icon={<ArrowLeftOutlined />}>กลับไปรายการ</Button>
                </Link>
                <Button
                  type="dashed"
                  icon={<SafetyOutlined />}
                  onClick={handleSimulateAdminVerify}
                >
                  [Demo] จำลองเจ้าหน้าที่อนุมัติ
                </Button>
              </Space>
            }
          />
        </Card>
      </div>
    );
  }

  // ── Verified state (admin approved — final success) ────────────────────
  if (paymentStatus === 'verified') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {header}
        {contractInfo}

        <Card>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a' }} />}
            title="ชำระเงินสำเร็จ — ได้รับการอนุมัติแล้ว"
            subTitle="เจ้าหน้าที่ยืนยันการชำระเงินแล้ว — สามารถดาวน์โหลดใบเสร็จได้ที่หน้าสัญญาซื้อขาย"
            extra={
              <Space>
                <Link href="/buyer/payment">
                  <Button icon={<ArrowLeftOutlined />}>กลับไปรายการ</Button>
                </Link>
                <Link href="/buyer/contracts">
                  <Button type="primary" icon={<FileTextOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
                    ดูสัญญาทั้งหมด
                  </Button>
                </Link>
              </Space>
            }
          />
        </Card>
      </div>
    );
  }

  // ── Payment form (not yet paid) ─────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {header}
      {contractInfo}

      <Card title={<Space><DollarOutlined style={{ color: '#1a7c3e' }} /><span>ชำระเงิน</span></Space>}>
        <Steps
          current={currentStep}
          size="small"
          responsive
          style={{ marginBottom: 24 }}
          items={[
            { title: 'เลือกวิธีชำระ' },
            { title: 'แนบหลักฐาน' },
            { title: 'ยืนยัน' },
          ]}
        />

        <div style={{ marginBottom: 16, padding: 12, background: '#e6f4ff', borderRadius: 8 }}>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <Statistic
                title="ยอดรวมตามสัญญา"
                value={contract.totalAmount}
                suffix="฿"
                styles={{ content: { fontSize: 18, fontWeight: 700, color: '#1f2937' } }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="ยอดที่ต้องชำระ"
                value={payAmount}
                suffix="฿"
                styles={{ content: { fontSize: 18, fontWeight: 700, color: '#1677ff' } }}
              />
            </Col>
          </Row>
        </div>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title="รองรับ 2 รูปแบบการชำระ"
          description="ชำระเต็ม 100% หรือ ชำระงวดแรก 80% และงวดสอง 20%"
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{ payType: 'full' }}
          onValuesChange={(changed) => {
            if (changed.payType) setPaymentType(changed.payType);
            if (currentStep < 1) setCurrentStep(1);
          }}
        >
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="รูปแบบการชำระ" name="payType">
                <Select>
                  <Option value="full">ชำระเต็ม 100%</Option>
                  <Option value="partial">ชำระงวดแรก 80%</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="วิธีชำระเงิน" name="method" rules={[{ required: true, message: 'เลือกวิธีชำระ' }]}>
                <Select placeholder="เลือกวิธีชำระ">
                  <Option value="transfer"><BankOutlined /> โอนเงิน</Option>
                  <Option value="qr"><QrcodeOutlined /> Thai QR</Option>
                  <Option value="cash">เงินสด</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="ธนาคาร" name="bank" rules={[{ required: true, message: 'เลือกธนาคาร' }]}>
            <Select placeholder="เลือกธนาคาร">
              {BANKS.map(b => <Option key={b} value={b}>{b}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            label="แนบหลักฐานการโอนเงิน (แนบได้หลายไฟล์)"
            name="proof"
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
            rules={[{
              validator: (_, v) =>
                Array.isArray(v) && v.length > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error('กรุณาแนบหลักฐานอย่างน้อย 1 ไฟล์')),
            }]}
            extra="สามารถแนบไฟล์เพิ่มได้ต่อเนื่อง — เช่น สลิปโอนเงินงวดแรก + งวดสอง + หลักฐานอื่นๆ"
          >
            <Upload.Dragger
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              listType="picture"
              beforeUpload={() => false}
            >
              <p className="ant-upload-drag-icon"><UploadOutlined /></p>
              <p className="ant-upload-text">คลิกหรือลากไฟล์มาวาง — แนบได้หลายไฟล์</p>
              <p className="ant-upload-hint">รองรับ JPG, PNG, PDF · ขนาดสูงสุด 10MB ต่อไฟล์</p>
            </Upload.Dragger>
          </Form.Item>

          <Divider />

          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12}>
              <Link href="/buyer/payment">
                <Button block icon={<ArrowLeftOutlined />}>ยกเลิก / กลับไปรายการ</Button>
              </Link>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                type="primary"
                block
                size="large"
                loading={submitting}
                icon={<DollarOutlined />}
                onClick={handlePay}
                style={{ background: '#1a7c3e', borderColor: '#1a7c3e', height: 44 }}
              >
                {submitting ? 'กำลังส่ง...' : 'ยืนยันการชำระเงิน'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Alert
        type="warning"
        showIcon
        icon={<ClockCircleOutlined />}
        title="กระบวนการตรวจสอบการชำระเงิน"
        description="หลังจากยืนยัน ระบบจะบันทึกสถานะเป็น 'รอเจ้าหน้าที่ตรวจสอบ' และส่งให้เจ้าหน้าที่การเงินอนุมัติ — เมื่ออนุมัติแล้วสถานะจะเปลี่ยนเป็น 'ชำระเงินสำเร็จ'"
      />
    </div>
  );
}
