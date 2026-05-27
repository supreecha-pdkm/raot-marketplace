'use client';
import { Card, Table, Progress, Row, Col, Statistic, Tag } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
const mockQuota = [
  { id: 'P1', plot: 'แปลง A — บ้านท่าสะท้อน', area: 15, rubberAge: 8, annualQuota: 18000, used: 12400, remaining: 5600, eudrStatus: 'passed' },
  { id: 'P2', plot: 'แปลง B — บ้านคลองขนาน', area: 8, rubberAge: 5, annualQuota: 9600, used: 3200, remaining: 6400, eudrStatus: 'passed' },
];
export default function QuotaPage() {
  const columns = [
    { title: 'แปลง', dataIndex: 'plot' },
    { title: 'พื้นที่ (ไร่)', dataIndex: 'area', align: 'right' as const },
    { title: 'อายุยาง (ปี)', dataIndex: 'rubberAge', align: 'right' as const },
    { title: 'โควต้าต่อปี (กก.)', dataIndex: 'annualQuota', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    { title: 'ใช้แล้ว (กก.)', dataIndex: 'used', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    { title: 'คงเหลือ (กก.)', dataIndex: 'remaining', render: (v: number) => <span className="font-bold" style={{ color: '#1a7c3e' }}>{v.toLocaleString()}</span>, align: 'right' as const },
    { title: 'EUDR', dataIndex: 'eudrStatus', render: (v: string) => <Tag color={v === 'passed' ? 'success' : 'error'}>{v === 'passed' ? 'ผ่าน' : 'ไม่ผ่าน'}</Tag> },
    {
      title: 'การใช้งาน',
      render: (r: any) => (
        <Progress percent={Math.round((r.used / r.annualQuota) * 100)} size="small" strokeColor={r.used / r.annualQuota > 0.8 ? '#ff4d4f' : '#1a7c3e'} style={{ width: 120 }} />
      ),
    },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row gutter={[16, 12]}>
        <Col xs={12} md={6}><Card><Statistic title="โควต้ารวมทั้งหมด (กก.)" value={27600} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="ใช้แล้ว (กก.)" value={15600} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="คงเหลือ (กก.)" value={12000} styles={{ content: { color: '#1a7c3e' } }} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="จำนวนแปลง" value={2} suffix="แปลง" /></Card></Col>
      </Row>
      <Card title={<span><BarChartOutlined style={{ marginRight: 8 }} />ปริมาณผลผลิตคาดการณ์รายแปลง</span>}>
        <Table dataSource={mockQuota} columns={columns} rowKey="id" scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
}
