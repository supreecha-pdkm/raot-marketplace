'use client';

import { useState } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Table, Tag, Button, Modal, Form, Input, DatePicker,
  Select, InputNumber, Steps, Typography, Row, Col, Alert,
} from 'antd';
import { CarOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { MOCK_DELIVERIES } from '@/features/deliveries/services/mock-deliveries';
import { PROVINCES } from '@/shared/constants/provinces';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

export default function BuyerDeliveryPage() {
  const [requestModal, setRequestModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState('');
  const [pinDone, setPinDone] = useState(false);
  const [form] = Form.useForm();

  const handleSubmitRequest = async () => {
    await form.validateFields();
    setRequestModal(false);
    setStep(0);
  };

  const handleConfirmPin = () => {
    if (pin.length === 6) {
      setPinDone(true);
      setTimeout(() => { setPinModal(false); setPinDone(false); setPin(''); }, 2000);
    }
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'warning', label: 'รอนัดหมาย' },
    approved: { color: 'processing', label: 'อนุมัติแล้ว' },
    completed: { color: 'success', label: 'รับมอบแล้ว' },
  };

  const columns = [
    {
      title: 'สัญญา',
      dataIndex: 'contractNo',
      render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'วันนัดหมาย',
      dataIndex: 'appointmentDate',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    { title: 'ผู้รับ', dataIndex: 'receiverName' },
    { title: 'ทะเบียนรถ', dataIndex: 'vehiclePlate' },
    { title: 'จังหวัด', dataIndex: 'province' },
    { title: 'น้ำหนัก (กก.)', dataIndex: 'weight', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (s: string) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.label}</Tag>,
    },
    {
      title: '',
      render: (r: any) =>
        r.status === 'approved' ? (
          <Button
            type="primary" size="small" icon={<CheckCircleOutlined />}
            onClick={() => { setPinModal(true); setPin(''); }}
          >
            ยืนยันรับมอบ
          </Button>
        ) : null,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card
        title={<span><CarOutlined style={{ marginRight: 8, color: '#1677ff' }} />รายการรับมอบยาง</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setRequestModal(true)}>
            ยื่นคำขอรับมอบ
          </Button>
        }
      >
        <Table dataSource={MOCK_DELIVERIES} columns={columns} rowKey="id" scroll={{ x: 'max-content' }} />
      </Card>

      {/* Request Modal */}
      <Modal
        open={requestModal}
        onCancel={() => setRequestModal(false)}
        onOk={handleSubmitRequest}
        okText="ยื่นคำขอ"
        title={<span><PlusOutlined style={{ marginRight: 8 }} />ยื่นคำขอเข้ารับยาง</span>}
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="เลือกสัญญา" name="contractNo" rules={[{ required: true }]}>
            <Select placeholder="เลือกสัญญา">
              <Option value="CNT-2024-0042">CNT-2024-0042 — ยางแผ่นรมควัน RSS3</Option>
            </Select>
          </Form.Item>
          <Form.Item label="วันที่นัดหมาย" name="appointmentDate" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="เลือกวันนัดหมาย" />
          </Form.Item>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="ชื่อผู้รับ" name="receiverName" rules={[{ required: true }]}>
                <Input placeholder="ชื่อ-นามสกุลผู้รับ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="ทะเบียนรถ" name="vehiclePlate" rules={[{ required: true }]}>
                <Input placeholder="เช่น กข-1234" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="จังหวัด" name="province" rules={[{ required: true }]}>
                <Select placeholder="เลือกจังหวัด">
                  {PROVINCES.map(p => <Option key={p} value={p}>{p}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="น้ำหนักที่รับ (กก.)" name="weight" rules={[{ required: true }]}>
                <InputNumberSuffix style={{ width: '100%' }} min={1} suffix="กก." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="ประเภทรถ" name="vehicleType">
                <Select placeholder="เลือกประเภทรถ">
                  <Option value="truck6">รถ 6 ล้อ</Option>
                  <Option value="truck10">รถ 10 ล้อ</Option>
                  <Option value="trailer">รถพ่วง</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="ยี่ห้อรถ" name="vehicleBrand">
                <Input placeholder="ยี่ห้อรถ" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* PIN Confirmation Modal */}
      <Modal
        open={pinModal}
        onCancel={() => setPinModal(false)}
        footer={null}
        title="ยืนยันการรับมอบยาง"
        width={360}
      >
        {pinDone ? (
          <div style={{ textAlign: 'center', paddingTop: 32, paddingBottom: 32 }}>
            <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a' }} />
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 16, color: '#1a7c3e' }}>รับมอบยางสำเร็จ!</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Alert type="info" showIcon title="กรอก PIN 6 หลัก เพื่อยืนยันการรับมอบ" style={{ marginBottom: 16 }} />
            <Input.OTP
              length={6}
              value={pin}
              onChange={(v) => setPin(v)}
              size="large"
            />
            <Button
              type="primary" block size="large" style={{ marginTop: 16 }}
              disabled={pin.length !== 6}
              onClick={handleConfirmPin}
            >
              ยืนยันการรับมอบ
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
