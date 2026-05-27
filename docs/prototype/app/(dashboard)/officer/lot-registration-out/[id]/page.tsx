'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card, Button, Result, Tag, Space, Typography, Descriptions, Row, Col,
  Table, Alert, Form, Input, App, Modal,
} from 'antd';
import {
  ArrowLeftOutlined, LogoutOutlined, CarOutlined, CheckCircleOutlined,
  ThunderboltOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { getCheckoutLot, confirmCheckout, type CheckoutLot } from '@/features/payments/services/checkout-queue';
import { getQueue } from '@/features/lots/services/lot-queue';
import { getSession } from '@/features/auth/services/auth';

const { Text, Title } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deltaTone(absKg: number) {
  if (absKg <= 5)  return { color: '#52c41a', label: 'ใกล้เคียง' };
  if (absKg <= 30) return { color: '#fa8c16', label: 'ต่างเล็กน้อย' };
  return { color: '#ff4d4f', label: 'ต่างมาก' };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LotCheckoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { message, modal } = App.useApp();
  const { id } = use(params);

  const [lot, setLot] = useState<CheckoutLot | null>(null);

  // Scale state — separate from form so we can show a "live" reading and
  // require the officer to click the button (not just type a number).
  const [scaleReading, setScaleReading] = useState<number | null>(null);
  const [scaleLoading, setScaleLoading] = useState(false);

  const [form] = Form.useForm<{ truckTareOut: number; note?: string }>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLot(getCheckoutLot(id) ?? null);
  }, [id]);

  if (!lot) {
    return (
      <Result
        status="404"
        title="ไม่พบรายการ"
        subTitle={`ไม่พบ LOT รหัส ${id}`}
        extra={
          <Link href="/officer/lot-registration-out">
            <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับไปยังรายการ
            </Button>
          </Link>
        }
      />
    );
  }

  const isCheckedOut = lot.status === 'checked-out';

  // Simulate the empty-truck weighing equipment.
  function handleReadScale() {
    if (!lot) return;
    const target = lot;
    setScaleLoading(true);
    setTimeout(() => {
      // Imagine an empty truck — close to the registered tare with ±1.5% drift.
      const drift = (Math.random() - 0.5) * 0.03;
      const tare  = Math.max(1, Math.round(target.truckTareDb * (1 + drift)));
      setScaleReading(tare);
      form.setFieldsValue({ truckTareOut: tare });
      setScaleLoading(false);
      message.success(`รับค่าจากเครื่องชั่ง: ${tare.toLocaleString()} กก.`);
    }, 1100);
  }

  function handleConfirm() {
    if (!lot) return;
    const target = lot;
    form.validateFields().then((v) => {
      modal.confirm({
        title: 'ยืนยันการลงทะเบียนออก?',
        content: `เมื่อยืนยันแล้ว LOT ${target.id} จะถูกบันทึกเป็น "ออกแล้ว" และไม่สามารถแก้ไขได้`,
        okText: 'ยืนยันออก',
        cancelText: 'ยกเลิก',
        okButtonProps: { style: { background: '#1a7c3e', borderColor: '#1a7c3e' } },
        onOk: () => {
          const officer = getSession()?.user.fullName ?? 'เจ้าหน้าที่';
          confirmCheckout(target.id, v.truckTareOut, officer, v.note);
          setLot(getCheckoutLot(id) ?? null);
          message.success(`บันทึกการออก LOT ${target.id} แล้ว`);
        },
      });
    });
  }

  // ── Compare data ────────────────────────────────────────────────────────
  // Sources of truth (kg):
  //  - QR              : seller-declared rubber weight
  //  - Real Rubber     : grossIn − tare. Prefer the measured tare-out when
  //                      we have it; otherwise fall back to the registered
  //                      tare so the officer sees a real rubber weight
  //                      immediately, before the empty-truck weigh-out.
  //  - Truck tare DB   : registered tare for the plate
  //  - Real truck tare : what we just measured
  const tareOut          = isCheckedOut ? lot.truckTareOut! : scaleReading;
  const tareForRubber    = tareOut ?? lot.truckTareDb;
  const tareSourceIsOut  = tareOut != null;
  const realRubber       = Math.max(0, lot.grossWeightIn - tareForRubber);
  const tareDelta        = tareOut != null ? Math.abs(tareOut - lot.truckTareDb) : null;
  const rubberDelta      = Math.abs(realRubber - lot.qrWeight);
  // Panel weight: prefer what's stored on the CheckoutLot; otherwise look up
  // the lot in the weighing queue and use its actualWeight. Fall back to the
  // derived real rubber weight so the row always has a value to show.
  const weighedLot       = getQueue().weighed.find((l) => l.id === lot.id);
  const panelWeight      = lot.panelWeight ?? weighedLot?.actualWeight ?? realRubber;
  const panelSource: 'stored' | 'weighing' | 'derived' =
    lot.panelWeight != null ? 'stored'
      : weighedLot?.actualWeight != null ? 'weighing'
      : 'derived';
  const panelDelta       = Math.abs(panelWeight - realRubber);
  const tareTone         = tareDelta != null ? deltaTone(tareDelta) : null;
  const rubberTone       = deltaTone(rubberDelta);
  const panelTone        = deltaTone(panelDelta);

  const compareRows = [
    {
      key: 'rubber-qr',
      label: 'น้ำหนักยาง (QR แจ้งไว้)',
      value: lot.qrWeight,
      hint:  'จาก QR Consent ของผู้ขาย',
    },
    {
      key: 'gross-in',
      label: 'น้ำหนักชั่งเข้า (รถ + ยาง)',
      value: lot.grossWeightIn,
      hint:  `ชั่งเมื่อ ${lot.checkedInAt} น.`,
    },
    {
      key: 'rubber-real',
      label: 'น้ำหนักยางจริง (Real Rubber)',
      value: realRubber,
      hint:  tareSourceIsOut
        ? `= ชั่งเข้า ${lot.grossWeightIn.toLocaleString()} − รถเปล่า ${tareForRubber.toLocaleString()} (จากเครื่องชั่ง)`
        : `= ชั่งเข้า ${lot.grossWeightIn.toLocaleString()} − รถเปล่า ${tareForRubber.toLocaleString()} (จากทะเบียน · ยังไม่ชั่งออก)`,
      delta: rubberDelta,
      tone:  rubberTone,
    },
    // {
    //   key: 'panel',
    //   label: 'น้ำหนักแผงรวม (ชั่งที่แผง)',
    //   value: panelWeight,
    //   hint:  panelSource === 'stored'   ? 'ชั่งจริงที่แผงยาง · เทียบกับน้ำหนักยางจริง'
    //        : panelSource === 'weighing' ? `จากหน้าชั่งน้ำหนัก (${weighedLot!.weighedAt})`
    //        :                              'ยังไม่ชั่งที่แผง · แสดงค่าโดยประมาณจากชั่งเข้า',
    //   delta: panelDelta,
    //   tone:  panelTone,
    // },
    {
      key: 'truck-real',
      label: 'น้ำหนักรถเปล่าจริง',
      value: tareOut,
      hint:  tareOut != null ? 'จากเครื่องชั่งวันนี้' : 'รอชั่งรถเปล่า',
      delta: tareDelta,
      tone:  tareTone,
    },
  ];

  const compareCols = [
    { title: 'รายการ', dataIndex: 'label', render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: 'น้ำหนัก',
      dataIndex: 'value',
      align: 'right' as const,
      render: (v: number | null) =>
        v == null
          ? <Text type="secondary">—</Text>
          : <span><Text strong style={{ fontSize: 14, color: '#0f3d22' }}>{v.toLocaleString()}</Text> <Text type="secondary">กก.</Text></span>,
    },
    {
      title: 'ส่วนต่าง',
      align: 'right' as const,
      render: (_: unknown, r: typeof compareRows[number]) =>
        r.delta == null
          ? <Text type="secondary">—</Text>
          : (
            <Space size={6}>
              <Text strong style={{ color: r.tone?.color }}>±{r.delta.toLocaleString()} กก.</Text>
              <Tag color={r.tone?.color === '#52c41a' ? 'success' : r.tone?.color === '#fa8c16' ? 'warning' : 'error'} style={{ margin: 0 }}>
                {r.tone?.label}
              </Tag>
            </Space>
          ),
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'hint',
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <Link href="/officer/lot-registration-out">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ padding: 0, color: '#1a7c3e' }}>
            กลับไปยังรายการ
          </Button>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
              <LogoutOutlined style={{ marginRight: 8 }} />
              ลงทะเบียนยาง · ออก — {lot.id}
            </Title>
            <Text type="secondary">ชั่งรถเปล่า เปรียบเทียบน้ำหนัก และยืนยันการออกจากตลาด</Text>
          </div>
          {isCheckedOut
            ? <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: '4px 10px' }}>ออกแล้ว</Tag>
            : <Tag color="warning" style={{ fontSize: 13, padding: '4px 10px' }}>รอออก</Tag>}
        </div>
      </div>

      {/* Truck + lot info */}
      <Card title={<Space><CarOutlined style={{ color: '#1a7c3e' }} /><span>ข้อมูลรถและล็อต</span></Space>}>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="LOT"><Text strong style={{ fontFamily: 'monospace' }}>{lot.id}</Text></Descriptions.Item>
          <Descriptions.Item label="ทะเบียนรถ"><Text strong>{lot.truckPlate}</Text></Descriptions.Item>
          <Descriptions.Item label="ผู้ขาย" span={2}>
            <Text strong>{lot.sellerName}</Text>
            <Text type="secondary" style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 11 }}>({lot.sellerId})</Text>
          </Descriptions.Item>
          <Descriptions.Item label="ชนิดยาง">{lot.rubberType}</Descriptions.Item>
          <Descriptions.Item label="เวลาเข้า">{lot.checkedInAt}</Descriptions.Item>
          <Descriptions.Item label="ชั่งเข้า (รวม)">
            <Text strong>{lot.grossWeightIn.toLocaleString()}</Text> กก.
          </Descriptions.Item>
          {/* <Descriptions.Item label="น้ำหนักรถเปล่า (ทะเบียน)">
            <Text>{lot.truckTareDb.toLocaleString()}</Text> กก.
          </Descriptions.Item> */}
          {isCheckedOut && (
            <>
              <Descriptions.Item label="เวลาออก">{lot.checkedOutAt}</Descriptions.Item>
              <Descriptions.Item label="เจ้าหน้าที่ออก">{lot.checkedOutBy}</Descriptions.Item>
              {lot.note && (
                <Descriptions.Item label="หมายเหตุ" span={2}>{lot.note}</Descriptions.Item>
              )}
            </>
          )}
        </Descriptions>
      </Card>

      {/* Scale */}
      {!isCheckedOut && (
        <Card
          title={
            <Space>
              <CarOutlined style={{ color: '#fa8c16' }} />
              <span>ชั่งรถเปล่า (เครื่องชั่ง)</span>
              {scaleReading != null
                ? <Tag color="success" style={{ margin: 0 }}>รับค่าแล้ว</Tag>
                : <Tag color="warning" style={{ margin: 0 }}>รอชั่ง</Tag>}
            </Space>
          }
          style={{ background: scaleReading != null ? '#f6ffed' : '#fff7e6' }}
        >
          <Row align="middle" gutter={16}>
            <Col flex="auto">
              {scaleReading != null ? (
                <>
                  <Text type="secondary" style={{ fontSize: 12 }}>น้ำหนักรถเปล่าจากเครื่องชั่ง</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1a7c3e', lineHeight: 1.1 }}>
                    {scaleReading.toLocaleString()}
                    <Text type="secondary" style={{ fontSize: 14, fontWeight: 400, marginLeft: 6 }}>กก.</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ทะเบียนระบุไว้ {lot.truckTareDb.toLocaleString()} กก. · ส่วนต่าง {Math.abs(scaleReading - lot.truckTareDb).toLocaleString()} กก.
                  </Text>
                </>
              ) : (
                <>
                  <Text strong style={{ fontSize: 13, color: '#d46b08' }}>ยังไม่ได้รับค่า</Text>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                    ให้ผู้ขายขับรถเปล่าขึ้นเครื่องชั่ง แล้วกดปุ่ม &ldquo;ชั่งรถเปล่า&rdquo;
                  </div>
                </>
              )}
            </Col>
            <Col>
              <Space orientation="vertical" size={4}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ThunderboltOutlined />}
                  loading={scaleLoading}
                  onClick={handleReadScale}
                  style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
                >
                  {scaleReading != null ? 'ชั่งใหม่' : 'ชั่งรถเปล่า'}
                </Button>
                {scaleReading != null && (
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => { setScaleReading(null); form.resetFields(['truckTareOut']); }}
                  >
                    ล้างค่า
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Compare table */}
      <Card title={<Space><CheckCircleOutlined style={{ color: '#1a7c3e' }} /><span>เปรียบเทียบน้ำหนัก</span></Space>}>
        <Table
          dataSource={compareRows}
          columns={compareCols}
          rowKey="key"
          pagination={false}
          size="small"
        />
        <Alert
          type={rubberTone.color === '#52c41a' ? 'success' : rubberTone.color === '#fa8c16' ? 'warning' : 'error'}
          showIcon
          style={{ marginTop: 12 }}
          title={
            <span>
              น้ำหนักยางจริง <Text strong>{realRubber.toLocaleString()} กก.</Text>
              {' '}เทียบกับ QR <Text strong>{lot.qrWeight.toLocaleString()} กก.</Text>
              {' '}— ส่วนต่าง <Text strong>±{rubberDelta.toLocaleString()} กก.</Text> ({rubberTone.label})
              {!tareSourceIsOut && (
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  · ใช้ Tare จากทะเบียน (ยังไม่ชั่งรถเปล่า)
                </Text>
              )}
            </span>
          }
        />
      </Card>

      {/* Confirm */}
      {!isCheckedOut && (
        <Card>
          <Form form={form} layout="vertical">
            <Form.Item
              label="น้ำหนักรถเปล่า (กก.) — รับค่าจากเครื่องชั่งหรือป้อนเอง"
              name="truckTareOut"
              rules={[{ required: true, message: 'กรุณาชั่งรถเปล่าก่อน' }]}
            >
              <Input
                placeholder="กดปุ่ม 'ชั่งรถเปล่า' ด้านบน หรือพิมพ์เอง"
                addonAfter="กก."
                style={{ width: 280 }}
              />
            </Form.Item>
            <Form.Item label="หมายเหตุ" name="note">
              <Input.TextArea rows={2} placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)" />
            </Form.Item>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleConfirm}
              disabled={scaleReading == null}
              style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
            >
              ยืนยันการลงทะเบียนออก
            </Button>
            {scaleReading == null && (
              <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
                ต้องชั่งรถเปล่าจากเครื่องชั่งก่อนจึงจะยืนยันได้
              </Text>
            )}
          </Form>
        </Card>
      )}

      {isCheckedOut && (
        <div style={{ textAlign: 'center', padding: 8 }}>
          <Link href="/officer/lot-registration-out">
            <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับไปยังรายการ
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
