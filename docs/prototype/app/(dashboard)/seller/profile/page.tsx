'use client';
import { Card, Form, Input, Button, Avatar, Tabs, Row, Col, Tag } from 'antd';
import { UserOutlined, SaveOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
export default function SellerProfilePage() {
  const [form] = Form.useForm();
  return (
    <div className="max-w-3xl mx-auto">
      <Tabs items={[
        { key: 'profile', label: <span><UserOutlined style={{ marginRight: 4 }} />ข้อมูลส่วนตัว</span>, children: (
          <Card>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Avatar size={72} icon={<UserOutlined />} style={{ background: '#52c41a', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="text-lg font-bold" style={{ wordBreak: 'break-word' }}>นายสมศักดิ์ เกษตรกร</div>
                <div style={{ marginTop: 4 }}>
                  <Tag color="green">ผู้ขาย (Seller)</Tag>
                  <Tag color="blue">EUDR Verified</Tag>
                </div>
              </div>
            </div>
            <Form form={form} layout="vertical" initialValues={{ fullName: 'นายสมศักดิ์ เกษตรกร', email: 'seller01@example.com', phone: '0823456789' }}>
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}><Form.Item label="ชื่อ-นามสกุล" name="fullName"><Input /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item label="เบอร์โทร" name="phone"><Input /></Form.Item></Col>
                <Col span={24}><Form.Item label="อีเมล" name="email"><Input /></Form.Item></Col>
              </Row>
              <Button type="primary" icon={<SaveOutlined />}>บันทึก</Button>
            </Form>
          </Card>
        )},
        { key: 'bank', label: <span><BankOutlined style={{ marginRight: 4 }} />บัญชีธนาคาร</span>, children: <Card><div className="p-4 rounded-lg" style={{ background: '#fafafa' }}>ธนาคารกรุงไทย (KTB) · 123-4-56789-0 <Tag color="green" style={{ marginLeft: 8 }}>หลัก</Tag></div></Card> },
        { key: 'password', label: <span><LockOutlined style={{ marginRight: 4 }} />รหัสผ่าน</span>, children: <Card><Form layout="vertical" className="max-w-sm"><Form.Item label="รหัสผ่านปัจจุบัน"><Input.Password /></Form.Item><Form.Item label="รหัสผ่านใหม่"><Input.Password /></Form.Item><Button type="primary">เปลี่ยนรหัสผ่าน</Button></Form></Card> },
      ]} />
    </div>
  );
}
