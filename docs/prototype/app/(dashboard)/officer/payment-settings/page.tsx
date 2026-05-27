'use client';

import { useState } from 'react';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Form, Input, InputNumber, Select, Switch, Button,
  Alert, Tabs, Table, Tag, Modal, Typography, Divider, Row, Col,
} from 'antd';
import { DollarOutlined, SettingOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text, Title } = Typography;

const bankAccounts = [
  { id: 'BNK-01', bank: 'ธนาคารกรุงไทย', accountNo: '123-4-56789-0', accountName: 'ตลาดยางสงขลา', type: 'ออมทรัพย์', active: true },
  { id: 'BNK-02', bank: 'ธนาคารกสิกรไทย', accountNo: '234-5-67890-1', accountName: 'ตลาดยางสงขลา', type: 'กระแสรายวัน', active: true },
];

const feeRules = [
  { id: 'FEE-01', name: 'ค่าธรรมเนียมผู้ซื้อ', type: 'percent', value: 1.5, active: true },
  { id: 'FEE-02', name: 'ค่าธรรมเนียมผู้ขาย', type: 'percent', value: 1.0, active: true },
  { id: 'FEE-03', name: 'ค่าชั่งน้ำหนัก', type: 'fixed', value: 50, active: true },
];

export default function AdminPaymentSettingsPage() {
  const [addBankModal, setAddBankModal] = useState(false);
  const [editFeeModal, setEditFeeModal] = useState<any>(null);
  const [bankForm] = Form.useForm();
  const [generalForm] = Form.useForm();

  const bankCols = [
    { title: 'ธนาคาร', dataIndex: 'bank', render: (v: string) => <span className="font-semibold">{v}</span> },
    { title: 'เลขบัญชี', dataIndex: 'accountNo', render: (v: string) => <span className="font-mono">{v}</span> },
    { title: 'ชื่อบัญชี', dataIndex: 'accountName' },
    { title: 'ประเภท', dataIndex: 'type', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'ใช้งาน', dataIndex: 'active', render: (v: boolean) => <Switch checked={v} size="small" /> },
    { title: '', render: (r: any) => <Button size="small" icon={<EditOutlined />}>แก้ไข</Button> },
  ];

  const feeCols = [
    { title: 'ชื่อค่าธรรมเนียม', dataIndex: 'name', render: (v: string) => <span className="font-semibold">{v}</span> },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      render: (v: string) => <Tag color={v === 'percent' ? 'blue' : 'orange'}>{v === 'percent' ? 'เปอร์เซ็นต์' : 'คงที่ (฿)'}</Tag>,
    },
    {
      title: 'ค่า',
      dataIndex: 'value',
      render: (v: number, r: any) => <span className="font-bold">{r.type === 'percent' ? `${v}%` : `${v.toLocaleString()} ฿`}</span>,
      align: 'right' as const,
    },
    { title: 'ใช้งาน', dataIndex: 'active', render: (v: boolean) => <Switch checked={v} size="small" /> },
    { title: '', render: (r: any) => <Button size="small" icon={<EditOutlined />} onClick={() => setEditFeeModal(r)}>แก้ไข</Button> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert type="info" showIcon title="การตั้งค่าระบบการชำระเงิน" description="กำหนดบัญชีรับโอน ค่าธรรมเนียม และเงื่อนไขการชำระเงิน" />

      <Tabs
        items={[
          {
            key: 'general',
            label: 'ทั่วไป',
            children: (
              <Card title={<span><SettingOutlined style={{ marginRight: 8, color: '#722ed1' }} />การตั้งค่าทั่วไป</span>}>
                <Form form={generalForm} layout="vertical">
                  <Row gutter={24}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="เปอร์เซ็นต์งวดแรก (%)" name="firstPaymentPercent" initialValue={80}>
                        <InputNumberSuffix style={{ width: '100%' }} min={50} max={100} suffix="%" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="เปอร์เซ็นต์งวดที่ 2 (%)" name="secondPaymentPercent" initialValue={20}>
                        <InputNumberSuffix style={{ width: '100%' }} min={0} max={50} suffix="%" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="ระยะเวลาชำระเงิน (วัน)" name="paymentDays" initialValue={3}>
                        <InputNumberSuffix style={{ width: '100%' }} min={1} suffix="วัน" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="วิธีชำระที่รองรับ" name="methods" initialValue={['transfer', 'qr']}>
                        <Select mode="multiple">
                          <Option value="transfer">โอนเงิน</Option>
                          <Option value="cash">เงินสด</Option>
                          <Option value="qr">Thai QR</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="primary" icon={<SettingOutlined />}>บันทึกการตั้งค่า</Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'banks',
            label: 'บัญชีธนาคาร',
            children: (
              <Card
                title={<span><DollarOutlined style={{ marginRight: 8, color: '#722ed1' }} />บัญชีรับโอนเงิน</span>}
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setAddBankModal(true); bankForm.resetFields(); }}>เพิ่มบัญชี</Button>}
              >
                <Table dataSource={bankAccounts} columns={bankCols} rowKey="id" scroll={{ x: 'max-content' }} />
              </Card>
            ),
          },
          {
            key: 'fees',
            label: 'ค่าธรรมเนียม',
            children: (
              <Card title={<span><DollarOutlined style={{ marginRight: 8, color: '#722ed1' }} />ค่าธรรมเนียม</span>}>
                <Table dataSource={feeRules} columns={feeCols} rowKey="id" scroll={{ x: 'max-content' }} />
              </Card>
            ),
          },
        ]}
      />

      {/* Add Bank Modal */}
      <Modal
        open={addBankModal} onCancel={() => setAddBankModal(false)}
        onOk={() => { bankForm.resetFields(); setAddBankModal(false); }}
        okText="เพิ่มบัญชี" title="เพิ่มบัญชีธนาคาร"
      >
        <Form form={bankForm} layout="vertical" className="mt-4">
          <Form.Item label="ธนาคาร" name="bank" rules={[{ required: true }]}>
            <Select placeholder="เลือกธนาคาร">
              <Option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย (KTB)</Option>
              <Option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย (KBANK)</Option>
              <Option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์ (SCB)</Option>
              <Option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ (BBL)</Option>
            </Select>
          </Form.Item>
          <Form.Item label="เลขบัญชี" name="accountNo" rules={[{ required: true }]}>
            <Input placeholder="xxx-x-xxxxx-x" />
          </Form.Item>
          <Form.Item label="ชื่อบัญชี" name="accountName" rules={[{ required: true }]}>
            <Input placeholder="ชื่อบัญชี" />
          </Form.Item>
          <Form.Item label="ประเภทบัญชี" name="type" rules={[{ required: true }]}>
            <Select>
              <Option value="ออมทรัพย์">ออมทรัพย์</Option>
              <Option value="กระแสรายวัน">กระแสรายวัน</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Fee Modal */}
      <Modal
        open={!!editFeeModal} onCancel={() => setEditFeeModal(null)}
        onOk={() => setEditFeeModal(null)}
        okText="บันทึก" title={`แก้ไขค่าธรรมเนียม — ${editFeeModal?.name}`} width={400}
      >
        {editFeeModal && (
          <Form layout="vertical" className="mt-4">
            <Form.Item label={editFeeModal.type === 'percent' ? 'เปอร์เซ็นต์ (%)' : 'จำนวน (฿)'} name="value" initialValue={editFeeModal.value}>
              <InputNumberSuffix style={{ width: '100%' }} min={0} step={editFeeModal.type === 'percent' ? 0.1 : 10}
                suffix={editFeeModal.type === 'percent' ? '%' : '฿'} />
            </Form.Item>
            <Form.Item label="ใช้งาน" name="active" valuePropName="checked" initialValue={editFeeModal.active}>
              <Switch />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
