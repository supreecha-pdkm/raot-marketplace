'use client';

/**
 * Auction-officer "ควบคุมการประมูล" page.
 *
 * Replaces the older LOT-table list-view with the same buyer-style board
 * (filter card + WeightCard grid/list) in **officer view mode** — see
 * `AuctionControlShell`. The historical tab (closed/cancelled LOTs from
 * `MOCK_LOTS`) is kept verbatim as a second tab for legacy lookup.
 */

import { useState } from 'react';
import {
  Card, Table, Tag, Space, Typography, Empty, Tabs, Button,
} from 'antd';
import {
  TrophyOutlined, HistoryOutlined, EyeOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_LOTS } from '@/features/lots/services/mock-lots';
import type { AuctionLot } from '@/shared/types';
import AuctionControlShell from '@/features/auctions/components/auction-control-shell';

const { Text } = Typography;

export default function AuctionControlPage() {
  // Local overrides — same pattern as before; kept around so the legacy
  // history table picks up the wizard-driven status changes immediately.
  const [auctionStatus] = useState<Record<string, AuctionLot['status']>>({});
  const displayStatus = (lot: AuctionLot): AuctionLot['status'] =>
    auctionStatus[lot.id] ?? lot.status;

  const historyLots = MOCK_LOTS.filter((l) => {
    const status = displayStatus(l);
    return status === 'closed' || status === 'cancelled';
  });

  const historyCols: ColumnsType<AuctionLot> = [
    { title: 'LOT No', dataIndex: 'lotNo', width: 130, render: (v: string) => <Text strong>{v}</Text> },
    {
      title: 'ชนิดยาง',
      render: (_, r) => (
        <Space size={6}>
          <span>{r.rubberType}</span>
          <Tag>{r.grade}</Tag>
          {r.isEudr && <span className="badge-eudr">EUDR</span>}
        </Space>
      ),
    },
    { title: 'น้ำหนัก (กก.)', dataIndex: 'weight', align: 'right', render: (v: number) => v.toLocaleString() },
    {
      title: 'ราคาปิด (฿/กก.)', align: 'right',
      render: (_, r) => (
        <Text strong style={{ color: '#1a7c3e' }}>
          {(r.currentPrice ?? r.openingPrice).toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'มูลค่ารวม (฿)', align: 'right',
      render: (_, r) => {
        const price = r.currentPrice ?? r.openingPrice;
        return <Text strong>{(price * r.weight).toLocaleString()}</Text>;
      },
    },
    {
      title: 'วันที่ประมูล',
      render: (_, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text>{r.auctionDate}</Text>
          {r.endTime && <Text type="secondary" style={{ fontSize: 11 }}>ปิดเวลา {r.endTime}</Text>}
        </div>
      ),
    },
    {
      title: 'สถานะ',
      render: (_, r) => {
        const status = displayStatus(r);
        return status === 'cancelled'
          ? <Tag color="default">ยกเลิก</Tag>
          : <Tag color="success" icon={<CheckCircleOutlined />}>ปิดแล้ว</Tag>;
      },
    },
    {
      title: 'รายละเอียด', align: 'center',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} href={`/officer/auction-control/${r.id}`}>
          ดูรายละเอียด
        </Button>
      ),
    },
  ];

  const historyContent = historyLots.length === 0
    ? (
      <Card>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="ยังไม่มีรอบประมูลที่ปิดแล้ว" />
      </Card>
    )
    : (
      <Card
        title={
          <Space>
            <HistoryOutlined style={{ color: '#1a7c3e' }} />
            <span>ประวัติการประมูล (LOT-based)</span>
            <Tag color="blue">{historyLots.length} รอบ</Tag>
          </Space>
        }
      >
        <Table
          dataSource={historyLots}
          columns={historyCols}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 'max-content' }}
        />
      </Card>
    );

  return (
    <Tabs
      defaultActiveKey="control"
      items={[
        {
          key: 'control',
          label: <span><TrophyOutlined style={{ marginRight: 6 }} />ควบคุมรอบประมูล</span>,
          children: <AuctionControlShell />,
        },
        {
          key: 'history',
          label: (
            <span>
              <HistoryOutlined style={{ marginRight: 6 }} />
              ประวัติการประมูล
              <Tag color="default" style={{ marginLeft: 6 }}>{historyLots.length}</Tag>
            </span>
          ),
          children: historyContent,
        },
      ]}
    />
  );
}
