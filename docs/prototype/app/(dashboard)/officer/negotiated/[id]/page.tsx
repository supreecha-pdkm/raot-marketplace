'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Card, Button, Result, Tag, Space, Typography, Descriptions, Row, Col,
  Avatar, Divider, Statistic,
} from 'antd';
import {
  ArrowLeftOutlined, FileTextOutlined, UserOutlined, TrophyOutlined,
  EnvironmentOutlined, SafetyCertificateOutlined, CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import {
  getOrderById, getBuyerById, getOrderSellers,
} from '@/features/negotiated/services/negotiated-data';

const { Text, Title } = Typography;

const STATUS_LABEL: Record<string, { color: string; label: string }> = {
  pending:         { color: 'warning',    label: 'รอเสนอ' },
  waiting_seller:  { color: 'processing', label: 'รอผู้ขายยืนยัน' },
  seller_approved: { color: 'success',    label: 'ผู้ขายยืนยันแล้ว' },
  matched:         { color: 'success',    label: 'จับคู่แล้ว' },
  completed:       { color: 'default',    label: 'เสร็จสิ้น' },
};

export default function NegotiatedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const order  = getOrderById(id);

  if (!order) {
    return (
      <Result
        status="404"
        title="ไม่พบรายการ"
        subTitle={`ไม่พบรายการเจรจาต่อรองรหัส ${id}`}
        extra={
          <Link href="/officer/negotiated">
            <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับไปยังรายการ
            </Button>
          </Link>
        }
      />
    );
  }

  const buyer   = getBuyerById(order.buyerId);
  const sellers = getOrderSellers(order.id);
  const cfg     = STATUS_LABEL[order.status] ?? STATUS_LABEL.pending;
  const totalQty = sellers.reduce((s, x) => s + (x.unlimited ? 0 : x.availableWeight), 0);
  const value    = order.quantity * order.targetPrice;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <Link href="/officer/negotiated">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ padding: 0, color: '#1a7c3e' }}>
            กลับไปยังรายการ
          </Button>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              รายการเจรจาต่อรอง — {order.id}
            </Title>
            <Text type="secondary">
              ลงวันที่ {order.createdAt} · โดย {order.createdByStaff}
            </Text>
          </div>
          <Tag color={cfg.color} style={{ fontSize: 13, padding: '4px 10px' }}>
            {cfg.label}
          </Tag>
        </div>
      </div>

      {/* Stat row */}
      <Row gutter={12}>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderColor: '#1a7c3e' }}>
            <Statistic title="ปริมาณที่ขอซื้อ" value={order.quantity} suffix="กก." styles={{ content: { color: '#0f3d22', fontSize: 18 } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderColor: '#1677ff' }}>
            <Statistic title="ราคาเป้าหมาย" value={order.targetPrice} precision={2} suffix="฿/กก." styles={{ content: { color: '#1677ff', fontSize: 18 } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderColor: '#fa8c16' }}>
            <Statistic title="มูลค่าโดยประมาณ" value={value} suffix="฿" styles={{ content: { color: '#fa8c16', fontSize: 18 } }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderColor: '#52c41a' }}>
            <Statistic title="จำนวนผู้ขาย" value={sellers.length} suffix="ราย" styles={{ content: { color: '#52c41a', fontSize: 18 } }} />
          </Card>
        </Col>
      </Row>

      {/* Order info */}
      <Card title={<Space><FileTextOutlined style={{ color: '#1a7c3e' }} /><span>ข้อมูลคำขอ</span></Space>}>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="เลขที่คำขอ">
            <Text strong style={{ color: '#1a7c3e' }}>{order.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="สถานะ">
            <Tag color={cfg.color}>{cfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="ผู้ซื้อที่ทำแทน" span={2}>
            {buyer ? (
              <span>
                <Text strong>{buyer.name}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  · {buyer.code}{buyer.company ? ` · ${buyer.company}` : ''} · {buyer.phone}
                </Text>
              </span>
            ) : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="ผู้ทำรายการ" span={2}>{order.createdByStaff}</Descriptions.Item>
          <Descriptions.Item label="ชนิดยาง" span={2}>
            <Text strong>{order.rubberType}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="ปริมาณ">
            <Text strong>{order.quantity.toLocaleString()}</Text> กก.
          </Descriptions.Item>
          <Descriptions.Item label="ราคาเป้าหมาย">
            <Text strong style={{ color: '#1a7c3e' }}>{order.targetPrice.toFixed(2)}</Text> ฿/กก.
          </Descriptions.Item>
          <Descriptions.Item label="วันที่แจ้ง" span={2}>
            <CalendarOutlined style={{ marginRight: 6 }} />{order.createdAt}
          </Descriptions.Item>
          {order.allowUnlimited && (
            <Descriptions.Item label="เงื่อนไขพิเศษ" span={2}>
              <Tag color="gold">อนุญาตผู้ขายเสนอแบบไม่จำกัดปริมาณ</Tag>
            </Descriptions.Item>
          )}
          {order.note && (
            <Descriptions.Item label="หมายเหตุ" span={2}>
              <Text type="secondary">{order.note}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Seller list */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: '#1a7c3e' }} />
            <span>ผู้ขายที่จับคู่แล้ว</span>
            <Tag color="success" style={{ margin: 0 }}>{sellers.length} ราย</Tag>
            {totalQty > 0 && (
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                · ปริมาณรวม {totalQty.toLocaleString()} กก.
              </Text>
            )}
          </Space>
        }
      >
        {sellers.length === 0 ? (
          <Text type="secondary">ไม่มีผู้ขายในรายการนี้</Text>
        ) : (
          <Row gutter={[12, 12]}>
            {sellers.map(s => (
              <Col xs={24} md={12} key={s.id}>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Avatar size={40} icon={<UserOutlined />} style={{ background: '#1a7c3e', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 1 }}>
                        <EnvironmentOutlined style={{ marginRight: 3 }} />
                        {s.farmName} · {s.province}
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                        {s.isEudr && (
                          <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                            <SafetyCertificateOutlined style={{ marginRight: 2 }} />EUDR
                          </Tag>
                        )}
                        <Tag color={s.forestStatus === 'ไม่บุกรุก' ? 'success' : 'warning'} style={{ margin: 0, fontSize: 11 }}>
                          {s.forestStatus}
                        </Tag>
                        <Tag style={{ margin: 0, fontSize: 11 }}>ส่งใน {s.deliveryDays} วัน</Tag>
                      </div>
                    </div>
                  </div>
                  <Divider style={{ margin: '10px 0' }} />
                  <Row gutter={8}>
                    <Col span={12}>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาเสนอ</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#1a7c3e' }}>
                        {s.offeredPrice.toFixed(2)}<span style={{ fontSize: 11, fontWeight: 400 }}> ฿/กก.</span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>ปริมาณ</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {s.unlimited
                          ? <span style={{ color: '#d48806' }}>ไม่จำกัด</span>
                          : <>{s.availableWeight.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400 }}> กก.</span></>}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Outcome summary */}
      {order.status === 'completed' && (
        <Card style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f3d22' }}>
                รายการนี้เสร็จสิ้นเรียบร้อยแล้ว
              </div>
              <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>
                ผู้ซื้อ {buyer?.name ?? '—'} ทำรายการกับผู้ขาย {sellers.length} ราย รวมมูลค่า{' '}
                <Text strong style={{ color: '#fa8c16' }}>{value.toLocaleString()} ฿</Text>
              </div>
            </div>
          </Space>
        </Card>
      )}

      <div style={{ textAlign: 'center', padding: 8 }}>
        <Link href="/officer/negotiated">
          <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
            กลับไปยังรายการ
          </Button>
        </Link>
      </div>
    </div>
  );
}
