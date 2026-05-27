'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card, Button, Result, Tag, Space, Typography, Descriptions, Row, Col,
  Table, Alert, Statistic,
} from 'antd';
import {
  ArrowLeftOutlined, AppstoreOutlined, UserOutlined, TrophyOutlined,
  ClockCircleOutlined, ExportOutlined, SafetyCertificateOutlined,
  CheckCircleOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { MASTER_PANELS } from '@/features/panels/services/master-panels';
import { getQueue, type WeighSplit } from '@/features/lots/services/lot-queue';
import { getCheckoutLot } from '@/features/payments/services/checkout-queue';

const { Text, Title } = Typography;

// ─── Same demo seeds + helpers as the list page (kept local on purpose) ────

interface AuctionResult {
  winner:       string;
  pricePerKg:   number;
  auctionRound: string;
  closedAt:     string;
}

const MOCK_AUCTION_RESULTS: Record<string, AuctionResult> = {
  'L004': {
    winner:       'บจก.สยามรับเบอร์ จำกัด',
    pricePerKg:   65.50,
    auctionRound: 'รอบเช้า · 21/04/2024',
    closedAt:     '2024-04-21T11:30:00',
  },
  'L002': {
    winner:       'บจก.ยางพาราใต้ จำกัด',
    pricePerKg:   38.25,
    auctionRound: 'รอบเช้า · 21/04/2024',
    closedAt:     '2024-04-21T11:45:00',
  },
};

const BORROW_DEMO: Record<string, {
  deliveredAt: string; deliveredBy: string; deliveredTo: string; borrowedByBuyer: boolean;
}> = {
  'PNL-05': {
    deliveredAt:     '2024-04-20T15:30:00',
    deliveredBy:     'เจ้าหน้าที่ A',
    deliveredTo:     'บจก.รับเบอร์เจริญ จำกัด',
    borrowedByBuyer: true,
  },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PanelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const master = MASTER_PANELS.find((p) => p.id === id);

  // Find the weighed lot whose split lands on this panel.
  const [splitInfo, setSplitInfo] = useState<{
    lotId: string; sellerName: string; sellerId?: string; rubberType: string;
    grade?: string; eudrType: 'eudr' | 'non-eudr'; weight: number; moisture: number;
    weighedAt: string; allSplits: WeighSplit[]; estimatedWeight: number;
    note?: string;
  } | null>(null);

  // Truck info from the IN registration (linked via lot id)
  const [truckInfo, setTruckInfo] = useState<{
    plate: string; tareDb: number; grossWeightIn: number; checkedInAt: string;
    qrWeight: number;
  } | null>(null);

  useEffect(() => {
    let foundSplit: typeof splitInfo = null;
    let foundLotId: string | null = null;
    for (const lot of getQueue().weighed) {
      const matched = (lot.splits ?? []).find((s) => s.panelId === id);
      if (matched) {
        foundLotId = lot.id;
        foundSplit = {
          lotId:           lot.id,
          sellerName:      lot.sellerName,
          sellerId:        lot.sellerId,
          rubberType:      lot.rubberType,
          grade:           lot.grade,
          eudrType:        lot.eudrType,
          weight:          matched.weight,
          moisture:        matched.moisture,
          weighedAt:       matched.weighedAt,
          allSplits:       lot.splits ?? [],
          estimatedWeight: lot.estimatedWeight,
          note:            lot.note,
        };
        break;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSplitInfo(foundSplit);

    if (foundLotId) {
      const cl = getCheckoutLot(foundLotId);
      if (cl) {
        setTruckInfo({
          plate:         cl.truckPlate,
          tareDb:        cl.truckTareDb,
          grossWeightIn: cl.grossWeightIn,
          checkedInAt:   cl.checkedInAt,
          qrWeight:      cl.qrWeight,
        });
      }
    }
  }, [id]);

  if (!master) {
    return (
      <Result
        status="404"
        title="ไม่พบแผง"
        subTitle={`ไม่พบแผงรหัส ${id}`}
        extra={
          <Link href="/officer/panels">
            <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับไปยังรายการแผง
            </Button>
          </Link>
        }
      />
    );
  }

  const borrow   = BORROW_DEMO[id];
  const auction  = splitInfo ? MOCK_AUCTION_RESULTS[splitInfo.lotId] : undefined;
  const status: 'empty' | 'occupied' | 'borrowed' =
    borrow ? 'borrowed' : splitInfo ? 'occupied' : 'empty';

  // Header tag config
  const STATUS_CFG = {
    empty:    { label: 'ว่าง',         color: 'default'    as const, icon: <AppstoreOutlined /> },
    occupied: { label: 'มียาง',        color: 'processing' as const, icon: <AppstoreOutlined /> },
    borrowed: { label: 'ผู้ซื้อยืมไป', color: 'warning'    as const, icon: <ExportOutlined /> },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <Link href="/officer/panels">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ padding: 0, color: '#1a7c3e' }}>
            กลับไปยังรายการแผง
          </Button>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              แผง {master.id}
            </Title>
            <Text type="secondary">
              รหัสครุภัณฑ์: <Text strong style={{ fontFamily: 'monospace' }}>{master.code}</Text>
              {' '}· ความจุอ้างอิง {master.panelWeight.toLocaleString()} กก.
            </Text>
          </div>
          <Tag color={STATUS_CFG[status].color} icon={STATUS_CFG[status].icon} style={{ fontSize: 13, padding: '4px 10px' }}>
            {STATUS_CFG[status].label}
          </Tag>
        </div>
      </div>

      {/* Empty state */}
      {status === 'empty' && (
        <Card>
          <Result
            icon={<AppstoreOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
            title="แผงนี้ว่าง"
            subTitle="ยังไม่มีล็อตยางในแผงนี้"
            extra={
              <Link href="/officer/panels">
                <Button type="primary" style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
                  กลับไปยังรายการแผง
                </Button>
              </Link>
            }
          />
        </Card>
      )}

      {/* Borrowed state */}
      {status === 'borrowed' && borrow && (
        <Card title={<Space><ExportOutlined style={{ color: '#fa8c16' }} /><span>ผู้ซื้อยืมแผงไป</span></Space>}>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="ผู้ที่ยืม"><Text strong>{borrow.deliveredTo}</Text></Descriptions.Item>
            <Descriptions.Item label="วันที่ส่งมอบ">{dayjs(borrow.deliveredAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="เจ้าหน้าที่">{borrow.deliveredBy}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Occupied — full detail */}
      {status === 'occupied' && splitInfo && (
        <>
          {/* Top stats */}
          <Row gutter={12}>
            <Col xs={12} md={6}>
              <Card size="small" style={{ borderColor: '#1a7c3e' }}>
                <Statistic
                  title="ล็อต"
                  value={splitInfo.lotId}
                  styles={{ content: { color: '#0f3d22', fontFamily: 'monospace', fontSize: 18 } }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small" style={{ borderColor: '#1677ff' }}>
                <Statistic
                  title="น้ำหนักในแผงนี้"
                  value={splitInfo.weight}
                  suffix="กก."
                  styles={{ content: { color: '#1677ff', fontSize: 18 } }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small" style={{ borderColor: '#52c41a' }}>
                <Statistic
                  title="ความชื้น"
                  value={splitInfo.moisture}
                  precision={1}
                  suffix="%"
                  styles={{ content: { color: '#52c41a', fontSize: 18 } }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small" style={{ borderColor: auction ? '#faad14' : '#bfbfbf' }}>
                <div style={{ marginBottom: 4, color: '#8c8c8c', fontSize: 14 }}>สถานะการประมูล</div>
                {auction
                  ? <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 13 }}>ปิดประมูลแล้ว</Tag>
                  : <Tag color="warning" icon={<ClockCircleOutlined />} style={{ fontSize: 13 }}>รอประกาศผล</Tag>}
              </Card>
            </Col>
          </Row>

          {/* Rubber detail */}
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#1a7c3e' }} />
                <span>รายละเอียดยาง</span>
                {splitInfo.eudrType === 'eudr'
                  ? <Tag color="success" style={{ margin: 0 }}>EUDR</Tag>
                  : <Tag style={{ margin: 0 }}>Non Green</Tag>}
              </Space>
            }
          >
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="ชนิดยาง"><Text strong>{splitInfo.rubberType}</Text></Descriptions.Item>
              <Descriptions.Item label="เกรด">
                {splitInfo.grade
                  ? <Tag color="blue" style={{ margin: 0 }}>{splitInfo.grade}</Tag>
                  : <Text type="secondary">—</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="มาตรฐาน EUDR">
                {splitInfo.eudrType === 'eudr'
                  ? <Tag color="success">ผ่านมาตรฐาน EUDR (Green Rubber)</Tag>
                  : <Tag color="default">Non Green — ไม่ผ่านการตรวจสอบ EUDR</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="ความชื้น">
                <Text strong>{splitInfo.moisture.toFixed(1)}%</Text>
              </Descriptions.Item>
              <Descriptions.Item label="น้ำหนักในแผงนี้">
                <Text strong>{splitInfo.weight.toLocaleString()}</Text> กก.
              </Descriptions.Item>
              <Descriptions.Item label="น้ำหนักประมาณ (ทั้งล็อต)">
                {splitInfo.estimatedWeight.toLocaleString()} กก.
              </Descriptions.Item>
              <Descriptions.Item label="เวลาชั่งลงแผง">{splitInfo.weighedAt}</Descriptions.Item>
              <Descriptions.Item label="แผงทั้งหมดของล็อตนี้">
                <Space size={4} wrap>
                  {splitInfo.allSplits.map((s, i) => (
                    <Tag
                      key={`${s.panelId}-${i}`}
                      color={s.panelId === id ? 'success' : 'default'}
                      style={{ fontFamily: 'monospace', margin: 0, fontSize: 11 }}
                    >
                      {s.panelId === id ? '★ ' : ''}{s.panelId}: {s.weight.toLocaleString()}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              {splitInfo.note && (
                <Descriptions.Item label="หมายเหตุการชั่ง" span={2}>{splitInfo.note}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Seller info */}
          <Card title={<Space><UserOutlined style={{ color: '#1a7c3e' }} /><span>ข้อมูลผู้ขาย</span></Space>}>
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="ชื่อ-นามสกุล" span={2}>
                <Text strong style={{ fontSize: 14 }}>{splitInfo.sellerName}</Text>
              </Descriptions.Item>
              {splitInfo.sellerId && (
                <Descriptions.Item label="เลขบัตรประชาชน">
                  <Text style={{ fontFamily: 'monospace' }}>{splitInfo.sellerId}</Text>
                </Descriptions.Item>
              )}
              {truckInfo && (
                <Descriptions.Item label="ทะเบียนรถ">
                  <Text strong>{truckInfo.plate}</Text>
                </Descriptions.Item>
              )}
              {truckInfo && (
                <>
                  <Descriptions.Item label="น้ำหนักจาก QR">
                    {truckInfo.qrWeight.toLocaleString()} กก.
                  </Descriptions.Item>
                  <Descriptions.Item label="ชั่งเข้า (รถ + ยาง)">
                    {truckInfo.grossWeightIn.toLocaleString()} กก.
                  </Descriptions.Item>
                  <Descriptions.Item label="น้ำหนักรถเปล่า (ทะเบียน)">
                    {truckInfo.tareDb.toLocaleString()} กก.
                  </Descriptions.Item>
                  <Descriptions.Item label="เวลาเข้าตลาด">
                    <Space size={4}>
                      <EnvironmentOutlined style={{ color: '#1a7c3e' }} />
                      <Text>{truckInfo.checkedInAt} น.</Text>
                    </Space>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>

          {/* Auction result */}
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: auction ? '#faad14' : '#8c8c8c' }} />
                <span>ผลการประมูล</span>
                {auction
                  ? <Tag color="success" style={{ margin: 0 }}>ปิดประมูลแล้ว</Tag>
                  : <Tag color="warning" style={{ margin: 0 }}>รอประกาศผล</Tag>}
              </Space>
            }
          >
            {auction ? (
              <>
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="ผู้ชนะการประมูล" span={2}>
                    <Space>
                      <TrophyOutlined style={{ color: '#52c41a' }} />
                      <Text strong style={{ fontSize: 14, color: '#0f3d22' }}>{auction.winner}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="ราคาที่ชนะ">
                    <Text strong style={{ color: '#1a7c3e', fontSize: 16 }}>
                      {auction.pricePerKg.toFixed(2)}
                    </Text>
                    <Text type="secondary"> ฿/กก.</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="มูลค่าในแผงนี้">
                    <Text strong style={{ color: '#fa8c16', fontSize: 16 }}>
                      {(splitInfo.weight * auction.pricePerKg).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Text>
                    <Text type="secondary"> ฿</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="รอบประมูล">{auction.auctionRound}</Descriptions.Item>
                  <Descriptions.Item label="ปิดประมูลเมื่อ">
                    {dayjs(auction.closedAt).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                </Descriptions>
                <Alert
                  type="success"
                  showIcon
                  style={{ marginTop: 12 }}
                  title={
                    <span>
                      ผู้ชนะ <Text strong>{auction.winner}</Text> รอรับมอบยางจากแผงนี้
                      {' '}— มูลค่ารวม{' '}
                      <Text strong style={{ color: '#fa8c16' }}>
                        {(splitInfo.weight * auction.pricePerKg).toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                      </Text>
                    </span>
                  }
                />
              </>
            ) : (
              <Alert
                type="info"
                showIcon
                title="ยังไม่ปิดประมูลสำหรับล็อตนี้"
                description="ผลการประมูลจะปรากฏที่นี่หลังจากการประมูลปิดและประกาศผู้ชนะ"
              />
            )}
          </Card>
        </>
      )}

      {/* Other splits in this lot table — only shown for occupied */}
      {status === 'occupied' && splitInfo && splitInfo.allSplits.length > 1 && (
        <Card title={<Space><AppstoreOutlined style={{ color: '#1a7c3e' }} /><span>การกระจายของล็อตนี้ลงแผงอื่น</span></Space>}>
          <Table
            dataSource={splitInfo.allSplits}
            rowKey={(_, i) => `s-${i}`}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
            columns={[
              {
                title: 'แผง',
                dataIndex: 'panelId',
                render: (v: string) => {
                  const meta = MASTER_PANELS.find((p) => p.id === v);
                  const isThis = v === id;
                  return (
                    <div>
                      <Tag color={isThis ? 'success' : 'blue'} style={{ fontFamily: 'monospace', margin: 0 }}>
                        {isThis ? '★ ' : ''}{v}
                      </Tag>
                      {meta && <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>{meta.code}</div>}
                    </div>
                  );
                },
              },
              {
                title: 'น้ำหนัก',
                dataIndex: 'weight',
                align: 'right',
                render: (v: number) => <span><Text strong>{v.toLocaleString()}</Text> <Text type="secondary">กก.</Text></span>,
              },
              { title: 'ความชื้น', dataIndex: 'moisture', align: 'right', render: (v: number) => `${v.toFixed(1)}%` },
              { title: 'เวลา', dataIndex: 'weighedAt', render: (v: string) => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
            ] as ColumnsType<WeighSplit>}
          />
        </Card>
      )}

      <div style={{ textAlign: 'center', padding: 8 }}>
        <Link href="/officer/panels">
          <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
            กลับไปยังรายการแผง
          </Button>
        </Link>
      </div>
    </div>
  );
}
