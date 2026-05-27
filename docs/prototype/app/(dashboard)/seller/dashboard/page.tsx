'use client';

import { Row, Col, Card, Table, Tag, Progress, List, Timeline, Typography, Button } from 'antd';
import {
  BarChartOutlined, QrcodeOutlined, SwapOutlined, BellOutlined,
  ArrowUpOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import StatCard from '@/shared/components/stat-card';
import dayjs from 'dayjs';

const { Text } = Typography;

const mockTransactions = [
  { id: 'T001', date: '2024-04-17', rubberType: 'ยางแผ่นรมควัน RSS3', weight: 3200, price: 71.00, total: 227200, market: 'ตลาดกลางฯ สุราษฎร์', status: 'completed' },
  { id: 'T002', date: '2024-04-16', rubberType: 'ยางก้อนถ้วย', weight: 5100, price: 47.50, total: 242250, market: 'ตลาดกลางฯ สุราษฎร์', status: 'payment_pending' },
  { id: 'T003', date: '2024-04-15', rubberType: 'น้ำยางสด', weight: 2800, price: 53.50, total: 149800, market: 'ตลาดกลางฯ สุราษฎร์', status: 'completed' },
];

const mockQuota = [
  { plot: 'แปลง A — บ้านท่าสะท้อน', area: 15, annualQuota: 18000, used: 12400, remaining: 5600 },
  { plot: 'แปลง B — บ้านคลองขนาน', area: 8, annualQuota: 9600, used: 3200, remaining: 6400 },
];

export default function SellerDashboard() {
  const router = useRouter();
  const totalRemaining = mockQuota.reduce((s, q) => s + q.remaining, 0);
  const totalQuota = mockQuota.reduce((s, q) => s + q.annualQuota, 0);
  const totalEarned = mockTransactions.reduce((s, t) => s + t.total, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StatCard title="Remaining Quota (กก.)" value={totalRemaining.toLocaleString()} prefix={<BarChartOutlined style={{ color: '#1a7c3e' }} />} accentClass="stat-primary" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="รายได้เดือนนี้ (฿)" value={totalEarned.toLocaleString()} prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />} accentClass="stat-primary" trend={8} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="ธุรกรรมทั้งหมด" value={mockTransactions.length} prefix={<SwapOutlined style={{ color: '#1677ff' }} />} accentClass="stat-blue" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="รอรับเงิน" value={1} prefix={<ExclamationCircleOutlined style={{ color: '#fa8c16' }} />} accentClass="stat-orange" />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Quota overview */}
        <Col xs={24} lg={10}>
          <Card
            title={<span><BarChartOutlined style={{ marginRight: 8, color: '#389e0d' }} />ปริมาณผลผลิต (Quota)</span>}
            extra={<Button type="link" onClick={() => router.push('/seller/quota')}>รายละเอียด →</Button>}
          >
            {mockQuota.map(q => (
              <div key={q.plot} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 12 }}>{q.plot}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{q.used.toLocaleString()} / {q.annualQuota.toLocaleString()} กก.</Text>
                </div>
                <Progress
                  percent={Math.round((q.used / q.annualQuota) * 100)}
                  strokeColor={{ from: '#1a7c3e', to: '#52c41a' }}
                  size="small"
                  format={p => <span style={{ fontSize: 12 }}>{p}%</span>}
                />
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                  คงเหลือ: <span style={{ color: '#389e0d', fontWeight: 600 }}>{q.remaining.toLocaleString()} กก.</span> · พื้นที่: {q.area} ไร่
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#f6ffed', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1a7c3e' }}>{totalRemaining.toLocaleString()}</div>
              <div style={{ fontSize: 14, color: '#8c8c8c' }}>Remaining Quota รวมทุกแปลง (กก.)</div>
            </div>
          </Card>
        </Col>

        {/* Recent transactions */}
        <Col xs={24} lg={14}>
          <Card
            title={<span><SwapOutlined style={{ marginRight: 8, color: '#1677ff' }} />ธุรกรรมล่าสุด</span>}
            extra={<Button type="link" onClick={() => router.push('/seller/transactions')}>ดูทั้งหมด →</Button>}
          >
            <Table
              dataSource={mockTransactions}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  title: 'วันที่',
                  dataIndex: 'date',
                  render: (v: string) => dayjs(v).format('DD/MM/YY'),
                  width: 70,
                },
                { title: 'ชนิดยาง', dataIndex: 'rubberType', render: (v: string) => <span style={{ fontSize: 12 }}>{v}</span> },
                { title: 'น้ำหนัก (กก.)', dataIndex: 'weight', render: (v: number) => v.toLocaleString(), align: 'right' },
                { title: 'ราคา', dataIndex: 'price', render: (v: number) => `${v.toFixed(2)} ฿`, align: 'right' },
                {
                  title: 'รายได้ (฿)',
                  dataIndex: 'total',
                  render: (v: number) => <span style={{ fontWeight: 700, color: '#1a7c3e' }}>{v.toLocaleString()}</span>,
                  align: 'right',
                },
                {
                  title: 'สถานะ',
                  dataIndex: 'status',
                  render: (s: string) => (
                    <Tag color={s === 'completed' ? 'success' : 'warning'} style={{ fontSize: 11 }}>
                      {s === 'completed' ? 'รับเงินแล้ว' : 'รอรับเงิน'}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick actions */}
      <Card title="ดำเนินการด่วน">
        <Row gutter={[12, 12]}>
          <Col xs={24} sm="auto">
            <Button type="primary" icon={<QrcodeOutlined />} size="large" block onClick={() => router.push('/seller/qr-code')}>
              สร้าง QR Code ยินยอมขาย
            </Button>
          </Col>
          <Col xs={24} sm="auto">
            <Button icon={<SwapOutlined />} size="large" block onClick={() => router.push('/seller/transactions')}>
              ดูประวัติธุรกรรม
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
