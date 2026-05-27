'use client';

import { Card, Table, Button, Row, Col, DatePicker, Select, Tabs, Statistic } from 'antd';
import { BarChartOutlined, DownloadOutlined, PrinterOutlined, ArrowUpOutlined } from '@ant-design/icons';
import StatCard from '@/shared/components/stat-card';

const { RangePicker } = DatePicker;
const { Option } = Select;

const auctionSummary = [
  { date: '2024-04-17', session: 1, lotsAuctioned: 5, totalWeight: 24300, totalValue: 1670850, avgPrice: 68.75 },
  { date: '2024-04-16', session: 2, lotsAuctioned: 7, totalWeight: 38500, totalValue: 2624800, avgPrice: 68.18 },
  { date: '2024-04-15', session: 1, lotsAuctioned: 4, totalWeight: 18200, totalValue: 1235260, avgPrice: 67.87 },
];

const auctionCols = [
  { title: 'วันที่', dataIndex: 'date' },
  { title: 'รอบที่', dataIndex: 'session', align: 'center' as const },
  { title: 'LOT ประมูล', dataIndex: 'lotsAuctioned', align: 'right' as const },
  { title: 'น้ำหนักรวม (กก.)', dataIndex: 'totalWeight', render: (v: number) => v.toLocaleString(), align: 'right' as const },
  { title: 'มูลค่ารวม (฿)', dataIndex: 'totalValue', render: (v: number) => v.toLocaleString(), align: 'right' as const },
  { title: 'ราคาเฉลี่ย (฿/กก.)', dataIndex: 'avgPrice', render: (v: number) => v.toFixed(2), align: 'right' as const },
];

export default function AuctionOfficerReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
        <RangePicker format="DD/MM/YYYY" style={{ minWidth: 220 }} />
        <Select defaultValue="all" style={{ width: 140, minWidth: 140 }}>
          <Option value="all">ทุกชนิดยาง</Option>
          <Option value="RSS3">RSS3</Option>
          <Option value="cup_lump">Cup Lump</Option>
        </Select>
        <Button icon={<PrinterOutlined />}>พิมพ์</Button>
        <Button type="primary" icon={<DownloadOutlined />}>ส่งออก Excel</Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><StatCard title="LOT ประมูลสัปดาห์นี้" value={16} prefix={<BarChartOutlined style={{ color: '#fa8c16' }} />} accentClass="stat-orange" /></Col>
        <Col xs={12} sm={6}><StatCard title="น้ำหนักรวม (กก.)" value="81,000" prefix={<ArrowUpOutlined style={{ color: '#1a7c3e' }} />} accentClass="stat-primary" /></Col>
        <Col xs={12} sm={6}><StatCard title="มูลค่ารวม (฿)" value="5,530,910" accentClass="stat-blue" /></Col>
        <Col xs={12} sm={6}><StatCard title="ราคาเฉลี่ย RSS3 (฿/กก.)" value="68.27" accentClass="stat-purple" /></Col>
      </Row>

      <Tabs
        items={[
          {
            key: 'auction',
            label: 'สรุปผลประมูล',
            children: (
              <Card title={<span><BarChartOutlined style={{ marginRight: 8, color: '#fa8c16' }} />ผลการประมูลรายวัน</span>}>
                <Table dataSource={auctionSummary} columns={auctionCols} rowKey="date" pagination={false} scroll={{ x: 'max-content' }} />
              </Card>
            ),
          },
          {
            key: 'weighing',
            label: 'สรุปการชั่งน้ำหนัก',
            children: (
              <Card title="สรุปการชั่งน้ำหนักรายวัน">
                <Table
                  dataSource={auctionSummary.map(r => ({ ...r, lotsWeighed: r.lotsAuctioned, avgMoisture: 4.1 }))}
                  columns={[
                    { title: 'วันที่', dataIndex: 'date' },
                    { title: 'LOT ชั่ง', dataIndex: 'lotsWeighed', align: 'right' as const },
                    { title: 'น้ำหนักรวม (กก.)', dataIndex: 'totalWeight', render: (v: number) => v.toLocaleString(), align: 'right' as const },
                    { title: 'ความชื้นเฉลี่ย (%)', dataIndex: 'avgMoisture', align: 'right' as const },
                  ]}
                  rowKey="date" pagination={false} scroll={{ x: 'max-content' }}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
