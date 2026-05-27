'use client';

import { Card, Form, Input, Button, Avatar, Tabs, List, Tag, Row, Col, Divider, Typography } from 'antd';
import { UserOutlined, BankOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function BuyerProfilePage() {
  const [form] = Form.useForm();
  const [pwForm] = Form.useForm();

  return (
    <div className="max-w-3xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        items={[
          {
            key: 'profile',
            label: <span><UserOutlined style={{ marginRight: 4 }} />ข้อมูลส่วนตัว</span>,
            children: (
              <Card>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <Avatar size={80} icon={<UserOutlined />} style={{ background: '#1677ff', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Title level={4} className="mb-0" style={{ marginBottom: 0 }}>นายสมชาย ใจดี</Title>
                    <Text type="secondary" style={{ display: 'block', wordBreak: 'break-word' }}>
                      รหัสผู้ซื้อ: U001 · ตลาดกลางยางพาราสุราษฎร์ธานี
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color="blue">ผู้ซื้อ (Buyer)</Tag>
                      <Tag color="success">ยืนยันตัวตนแล้ว</Tag>
                    </div>
                  </div>
                </div>
                <Form form={form} layout="vertical" initialValues={{
                  fullName: 'นายสมชาย ใจดี', email: 'buyer01@example.com',
                  phone: '0812345678', idCard: '1234567890123',
                  address: '123 ถ.สุราษฎร์ อ.เมือง จ.สุราษฎร์ธานี 84000',
                }}>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}><Form.Item label="ชื่อ-นามสกุล" name="fullName"><Input /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="เลขบัตรประชาชน" name="idCard"><Input /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="อีเมล" name="email"><Input /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="เบอร์โทรศัพท์" name="phone"><Input /></Form.Item></Col>
                    <Col span={24}><Form.Item label="ที่อยู่" name="address"><Input.TextArea rows={2} /></Form.Item></Col>
                  </Row>
                  <Button type="primary" icon={<SaveOutlined />}>บันทึกข้อมูล</Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'bank',
            label: <span><BankOutlined style={{ marginRight: 4 }} />บัญชีธนาคาร</span>,
            children: (
              <Card title="บัญชีธนาคาร">
                <List
                  dataSource={[
                    { bank: 'ธนาคารกรุงไทย (KTB)', account: '123-4-56789-0', name: 'นายสมชาย ใจดี', primary: true },
                    { bank: 'ธนาคารไทยพาณิชย์ (SCB)', account: '987-6-54321-0', name: 'นายสมชาย ใจดี', primary: false },
                  ]}
                  renderItem={b => (
                    <List.Item extra={b.primary ? <Tag color="green">หลัก</Tag> : <Button size="small">ตั้งเป็นหลัก</Button>}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<BankOutlined />} />}
                        title={b.bank}
                        description={`${b.account} · ${b.name}`}
                      />
                    </List.Item>
                  )}
                />
                <Button icon={<BankOutlined />} className="mt-2">+ เพิ่มบัญชีธนาคาร</Button>
              </Card>
            ),
          },
          {
            key: 'password',
            label: <span><LockOutlined style={{ marginRight: 4 }} />เปลี่ยนรหัสผ่าน</span>,
            children: (
              <Card>
                <Form form={pwForm} layout="vertical" className="max-w-sm">
                  <Form.Item label="รหัสผ่านปัจจุบัน" name="current" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item label="รหัสผ่านใหม่" name="new" rules={[{ required: true, min: 8 }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item label="ยืนยันรหัสผ่านใหม่" name="confirm" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Button type="primary" icon={<LockOutlined />}>เปลี่ยนรหัสผ่าน</Button>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
