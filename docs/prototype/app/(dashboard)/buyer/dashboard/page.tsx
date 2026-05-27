'use client';

import { Row, Col, Card, Table, Tag, Button, Timeline, Typography } from 'antd';
import {
  TrophyOutlined, DollarOutlined, CarOutlined, FileTextOutlined,
  ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import StatCard from '@/shared/components/stat-card';
import { MOCK_LOTS } from '@/features/lots/services/mock-lots';
import { MOCK_CONTRACTS } from '@/features/contracts/services/mock-contracts';
import { MOCK_NOTIFICATIONS } from '@/features/notifications/services/mock-notifications';
import { formatTappingRange } from '@/shared/utils/tapping-format';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const contractStatusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'warning', label: 'รอชำระเงิน' },
  active: { color: 'processing', label: 'กำลังดำเนินการ' },
  completed: { color: 'success', label: 'เสร็จสิ้น' },
  cancelled: { color: 'error', label: 'ยกเลิก' },
};

export default function BuyerDashboard() {
  const router = useRouter();
  const openLots = MOCK_LOTS.filter(l => l.status === 'open');
  const pendingContracts = MOCK_CONTRACTS.filter(c => c.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stat cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StatCard
            title="LOT เปิดประมูลวันนี้"
            value={openLots.length}
            prefix={<TrophyOutlined style={{ color: '#1a7c3e' }} />}
            accentClass="stat-primary"
            trend={12}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="สัญญารอชำระ"
            value={pendingContracts.length}
            prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
            accentClass="stat-orange"
            trend={-5}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="รอรับมอบยาง"
            value={1}
            prefix={<CarOutlined style={{ color: '#1677ff' }} />}
            accentClass="stat-blue"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="สัญญาทั้งหมด"
            value={MOCK_CONTRACTS.length}
            prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
            accentClass="stat-purple"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Active LOTs */}
        <Col xs={24} lg={14}>
          <Card
            title={<span><TrophyOutlined style={{ marginRight: 8, color: '#389e0d' }} />LOT ที่เปิดประมูลตอนนี้</span>}
            extra={<Button type="link" onClick={() => router.push('/buyer/auction')}>ดูทั้งหมด →</Button>}
          >
            <Table
              dataSource={MOCK_LOTS.filter(l => l.status === 'open')}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  title: 'LOT No.',
                  dataIndex: 'lotNo',
                  render: (v: string, r: any) => (
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{v}</div>
                      <div style={{ fontSize: 12, color: '#bfbfbf' }}>{r.rubberType}</div>
                      {(r.tappingDate || r.drc !== undefined) && (
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                          {r.tappingDate && <>เก็บ {formatTappingRange(r.tappingDate)}</>}
                          {r.drc !== undefined && <span style={{ marginLeft: 6, color: '#722ed1', fontWeight: 600 }}>DRC {r.drc}%</span>}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'น้ำหนัก (กก.)',
                  dataIndex: 'weight',
                  render: (v: number) => v.toLocaleString(),
                  align: 'right',
                },
                {
                  title: 'ราคาปัจจุบัน',
                  dataIndex: 'currentPrice',
                  render: (v: number) => (
                    <span style={{ fontWeight: 600, color: '#1a7c3e' }}>{v?.toFixed(2)} ฿/กก.</span>
                  ),
                  align: 'right',
                },
                {
                  title: '',
                  render: (r: any) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {r.isEudr && <span className="badge-eudr">EUDR</span>}
                      <Tag color="processing" icon={<ClockCircleOutlined />} style={{ fontSize: 11 }}>
                        {r.endTime}
                      </Tag>
                    </div>
                  ),
                },
                {
                  title: '',
                  render: (r: any) => (
                    <Button
                      type="primary" size="small"
                      onClick={() => router.push(`/buyer/auction?lot=${r.id}`)}
                    >
                      เสนอราคา
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* Right column */}
        <Col xs={24} lg={10}>
          {/* Contracts */}
          <Card
            title={<span><FileTextOutlined style={{ marginRight: 8, color: '#1677ff' }} />สัญญาล่าสุด</span>}
            extra={<Button type="link" onClick={() => router.push('/buyer/contracts')}>ดูทั้งหมด →</Button>}
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {MOCK_CONTRACTS.map((c, i) => (
                <div
                  key={c.contractNo}
                  style={{
                    padding: '12px 0',
                    borderTop: i === 0 ? 'none' : '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 14 }}>{c.contractNo}</Text>
                    <Tag color={contractStatusMap[c.status].color} style={{ fontSize: 11 }}>
                      {contractStatusMap[c.status].label}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                    {c.rubberType} · {c.weight.toLocaleString()} กก. · {c.totalAmount.toLocaleString()} ฿
                  </div>
                  <div style={{ fontSize: 12, color: '#bfbfbf' }}>{dayjs(c.createdAt).format('DD/MM/YYYY')}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notifications */}
          <Card title="การแจ้งเตือนล่าสุด">
            <Timeline
              items={MOCK_NOTIFICATIONS.slice(0, 4).map(n => ({
                icon: n.read
                  ? <CheckCircleOutlined style={{ color: '#8c8c8c' }} />
                  : <ExclamationCircleOutlined style={{ color: '#1677ff' }} />,
                content: (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: n.read ? '#bfbfbf' : '#262626' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#bfbfbf' }}>{n.message}</div>
                    <div style={{ fontSize: 12, color: '#d9d9d9', marginTop: 4 }}>
                      {dayjs(n.createdAt).format('DD/MM HH:mm')}
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
