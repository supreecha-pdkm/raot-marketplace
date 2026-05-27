'use client';
import { Card, Table, Tag, Select, DatePicker, Row, Col, Button } from 'antd';
import { SwapOutlined, DownloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import dayjs from 'dayjs';
const { Option } = Select;
const { RangePicker } = DatePicker;
const mock = [
  { id: 'T001', date: '2024-04-17', rubberType: 'ยางแผ่นรมควัน RSS3', grade: 'RSS3', weight: 3200, price: 71.00, total: 227200, market: 'ตลาดกลางฯ สุราษฎร์', status: 'paid', isEudr: true },
  { id: 'T002', date: '2024-04-16', rubberType: 'ยางก้อนถ้วย', grade: 'CL', weight: 5100, price: 47.50, total: 242250, market: 'ตลาดกลางฯ สุราษฎร์', status: 'pending', isEudr: true },
  { id: 'T003', date: '2024-04-15', rubberType: 'น้ำยางสด', grade: 'Latex', weight: 2800, price: 53.50, total: 149800, market: 'ตลาดกลางฯ สุราษฎร์', status: 'paid', isEudr: false },
];
export default function TransactionsPage() {
  const [filterType, setFilterType] = useState('all');
  const columns = [
    { title: 'วันที่', dataIndex: 'date', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ชนิดยาง', dataIndex: 'rubberType', render: (v: string, r: any) => <div>{v} {r.isEudr && <span className="badge-eudr" style={{ marginLeft: 4 }}>EUDR</span>}</div> },
    { title: 'เกรด', dataIndex: 'grade' },
    { title: 'น้ำหนัก (กก.)', dataIndex: 'weight', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    { title: 'ราคา (฿/กก.)', dataIndex: 'price', render: (v: number) => v.toFixed(2), align: 'right' as const },
    { title: 'รายได้ (฿)', dataIndex: 'total', render: (v: number) => <span className="font-bold" style={{ color: '#1a7c3e' }}>{v.toLocaleString()}</span>, align: 'right' as const },
    { title: 'ตลาด', dataIndex: 'market', render: (v: string) => <span className="text-xs">{v}</span> },
    { title: 'สถานะ', dataIndex: 'status', render: (s: string) => <Tag color={s === 'paid' ? 'success' : 'warning'}>{s === 'paid' ? 'รับเงินแล้ว' : 'รอรับเงิน'}</Tag> },
  ];
  const filtered = filterType === 'all' ? mock : mock.filter(t => t.rubberType.includes(filterType));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card size="small">
        <Row gutter={[12, 8]} align="middle">
          <Col xs={24} sm={12} md="auto">
            <Select value={filterType} onChange={setFilterType} style={{ width: '100%', minWidth: 150 }} size="small">
              <Option value="all">ชนิดยางทั้งหมด</Option>
              <Option value="ยางแผ่น">ยางแผ่นรมควัน</Option>
              <Option value="ยางก้อน">ยางก้อนถ้วย</Option>
              <Option value="น้ำยาง">น้ำยางสด</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md="auto">
            <RangePicker size="small" format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Col>
          <Col flex="auto" />
          <Col xs={24} md="auto">
            <Button size="small" icon={<DownloadOutlined />} block>Export Excel</Button>
          </Col>
        </Row>
      </Card>
      <Card title={<span><SwapOutlined style={{ marginRight: 8 }} />ประวัติธุรกรรม</span>}>
        <Table dataSource={filtered} columns={columns} rowKey="id" scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
}
