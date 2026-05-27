'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Table, Tag, Button, Select, Row, Col, Space } from 'antd';
import { FileTextOutlined, DownloadOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_CONTRACTS } from '@/features/contracts/services/mock-contracts';
import { Contract, TradingType } from '@/shared/types';
import dayjs from 'dayjs';

const { Option } = Select;

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  pending:   { color: 'warning',    label: 'รอชำระเงิน' },
  active:    { color: 'processing', label: 'กำลังดำเนินการ' },
  completed: { color: 'success',    label: 'เสร็จสิ้น' },
  cancelled: { color: 'error',      label: 'ยกเลิก' },
};

const TRADING_TYPE_CFG: Record<TradingType, { label: string; color: string }> = {
  auction:    { label: 'ประมูล',       color: 'orange' },
  negotiated: { label: 'ตกลงราคา',     color: 'cyan'   },
  'bid-ask':  { label: 'Bid / Ask',    color: 'blue'   },
  forward:    { label: 'ตลาดล่วงหน้า', color: 'purple' },
};

export type ViewerRole = 'buyer' | 'seller' | 'officer';

interface ContractsListPanelProps {
  /** Base route used for the "ดูรายละเอียด" link, e.g. "/buyer/contracts" */
  basePath: string;
  /** Determines which counterparty column to show */
  viewerRole: ViewerRole;
}

export default function ContractsListPanel({ basePath, viewerRole }: ContractsListPanelProps) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = MOCK_CONTRACTS.filter(
    (c) => filterStatus === 'all' || c.status === filterStatus,
  );

  const columns: ColumnsType<Contract> = [
    {
      title: 'เลขที่สัญญา',
      dataIndex: 'contractNo',
      render: (v: string) => <span style={{ fontWeight: 600, color: '#0958d9' }}>{v}</span>,
    },
    {
      title: 'ประเภทการซื้อขาย',
      dataIndex: 'tradingType',
      render: (v: TradingType) => {
        const cfg = TRADING_TYPE_CFG[v];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    // Counterparty column — varies by viewer role
    ...(viewerRole === 'buyer'
      ? [{ title: 'ผู้ขาย', dataIndex: 'seller' as const }]
      : viewerRole === 'seller'
        ? [{ title: 'ผู้ซื้อ', dataIndex: 'buyer' as const }]
        : [
            { title: 'ผู้ซื้อ', dataIndex: 'buyer' as const },
            { title: 'ผู้ขาย', dataIndex: 'seller' as const },
          ]
    ),
    { title: 'ชนิดยาง', dataIndex: 'rubberType' },
    { title: 'น้ำหนัก (กก.)', dataIndex: 'weight', render: (v: number) => v.toLocaleString(), align: 'right' as const },
    { title: 'ราคา (฿/กก.)', dataIndex: 'price', render: (v: number) => v.toFixed(2), align: 'right' as const },
    {
      title: 'ยอดรวม (฿)',
      dataIndex: 'totalAmount',
      render: (v: number) => <span style={{ fontWeight: 700 }}>{v.toLocaleString()}</span>,
      align: 'right' as const,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (s: string) => <Tag color={STATUS_CFG[s].color}>{STATUS_CFG[s].label}</Tag>,
    },
    {
      title: 'วันที่ทำสัญญา',
      dataIndex: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: '',
      render: (r: Contract) => (
        <Space>
          <Link href={`${basePath}/${r.contractNo}`} target="_blank" rel="noopener">
            <Button size="small" icon={<EyeOutlined />}>รายละเอียด</Button>
          </Link>
          <Button size="small" icon={<DownloadOutlined />}>PDF</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card size="small">
        <Row gutter={12} align="middle">
          <Col><FilterOutlined style={{ color: '#bfbfbf' }} /></Col>
          <Col>
            <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }} size="small">
              <Option value="all">สถานะทั้งหมด</Option>
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <Option key={k} value={k}>{v.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card title={<span><FileTextOutlined style={{ marginRight: 8 }} />รายการสัญญาซื้อขาย</span>}>
        <Table dataSource={filtered} columns={columns} rowKey="id" scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
}
