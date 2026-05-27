'use client';
import { Card, Table, Tag, Button, Modal, Typography } from 'antd';
import { FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
const { Text } = Typography;
const mock = [
  { id: 'A001', market: 'ตลาดกลางยางพาราสุราษฎร์ธานี', rubberType: 'ยางแผ่นรมควัน RSS3', status: 'accepted', acceptedAt: '2024-01-20' },
  { id: 'A002', market: 'ตลาดกลางยางพาราสุราษฎร์ธานี', rubberType: 'ยางก้อนถ้วย', status: 'pending', acceptedAt: null },
  { id: 'A003', market: 'ตลาดกลางยางพาราสุราษฎร์ธานี', rubberType: 'น้ำยางสด', status: 'accepted', acceptedAt: '2024-01-20' },
];
export default function AgreementsPage() {
  const [detail, setDetail] = useState<any>(null);
  const columns = [
    { title: 'ตลาด', dataIndex: 'market' },
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    { title: 'สถานะ', dataIndex: 'status', render: (s: string) => <Tag color={s === 'accepted' ? 'success' : 'warning'}>{s === 'accepted' ? 'ยอมรับแล้ว' : 'รอยอมรับ'}</Tag> },
    { title: 'วันที่ยอมรับ', dataIndex: 'acceptedAt', render: (v: string) => v || '—' },
    { title: '', render: (r: any) => <Button size="small" type={r.status === 'pending' ? 'primary' : 'default'} icon={r.status === 'pending' ? <CheckCircleOutlined /> : <FileTextOutlined />} onClick={() => setDetail(r)}>{r.status === 'pending' ? 'ยอมรับข้อตกลง' : 'ดูรายละเอียด'}</Button> },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title={<span><FileTextOutlined style={{ marginRight: 8 }} />ข้อตกลงซื้อขาย</span>}>
        <Table dataSource={mock} columns={columns} rowKey="id" scroll={{ x: 'max-content' }} />
      </Card>
      <Modal open={!!detail} onCancel={() => setDetail(null)} onOk={() => setDetail(null)} title="ข้อตกลงซื้อขาย" okText={detail?.status === 'pending' ? 'ยอมรับข้อตกลง' : 'ปิด'}>
        <Text>เงื่อนไขข้อตกลงซื้อขายยาง{detail?.rubberType} ณ {detail?.market} — ข้อตกลงฉบับนี้มีผลผูกพันตามกฎหมาย ผู้ขายตกลงยินยอมขายผลผลิตตามเงื่อนไขที่กำหนด</Text>
      </Modal>
    </div>
  );
}
