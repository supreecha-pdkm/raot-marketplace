'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import {
  Card, Button, Result, Tag, Space, Typography, Descriptions, Row, Col,
  Table, Alert, Form, Select, InputNumber, Input, App, Modal, Progress,
} from 'antd';
import {
  ArrowLeftOutlined, ScissorOutlined, CheckCircleOutlined,
  ThunderboltOutlined, AppstoreAddOutlined, DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getQueue, getWaitingLot, getWeighedLot, markWeighed,
  type WaitingLot, type WeighedLot, type WeighSplit,
} from '@/features/lots/services/lot-queue';
import { setCheckoutPanelWeight } from '@/features/payments/services/checkout-queue';
import { MASTER_PANELS } from '@/features/panels/services/master-panels';

const { Text, Title } = Typography;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WeighingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { message, modal } = App.useApp();
  const { id } = use(params);
  const router = useRouter();

  // The page can land on a LOT in either lifecycle stage:
  //  - 'weigh' : LOT is in the waiting queue → run the iterative weighing flow
  //  - 'view'  : LOT is already in the weighed queue → render a read-only summary
  const [lot, setLot] = useState<WaitingLot | null>(null);
  const [weighedView, setWeighedView] = useState<WeighedLot | null>(null);
  const mode: 'weigh' | 'view' | 'missing' =
    lot ? 'weigh' : weighedView ? 'view' : 'missing';

  // Splits accumulated in this session, before the officer hits "ยืนยัน".
  const [splits, setSplits] = useState<WeighSplit[]>([]);

  // Per-step state: the panel currently selected, and the most recent scale
  // reading for that panel. Cleared after each split is added.
  const [selectedPanelId, setSelectedPanelId] = useState<string | undefined>(undefined);
  const [scaleReading, setScaleReading] = useState<{ weight: number; moisture: number } | null>(null);
  const [scaleLoading, setScaleLoading] = useState(false);

  const [form] = Form.useForm<{ weight: number; moisture: number; note?: string }>();

  useEffect(() => {
    // Try waiting first; otherwise fall back to weighed (read-only view).
    const w = getWaitingLot(id);
    if (w) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLot(w);
      return;
    }
    const done = getWeighedLot(id);
    if (done) {
      setWeighedView(done);
    }
  }, [id]);

  // Empty panels = master panels not used by:
  //  - any already-weighed lot in the queue, AND
  //  - any split already recorded in this session.
  const usedPanelIds = useMemo(() => {
    const fromQueue = getQueue().weighed.flatMap((w) => (w.splits ?? []).map((s) => s.panelId));
    const fromSession = splits.map((s) => s.panelId);
    return new Set([...fromQueue, ...fromSession]);
  }, [splits]);

  const emptyPanels = useMemo(
    () => MASTER_PANELS.filter((p) => !usedPanelIds.has(p.id)),
    [usedPanelIds],
  );

  if (mode === 'missing') {
    return (
      <Result
        status="404"
        title="ไม่พบ LOT"
        subTitle={`ไม่พบ LOT รหัส ${id}`}
        extra={
          <Link href="/officer/weighing">
            <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับไปยังรายการ
            </Button>
          </Link>
        }
      />
    );
  }

  if (mode === 'view') {
    return <WeighedReadOnlyView lot={weighedView!} />;
  }

  // From here on `mode === 'weigh'` so `lot` is guaranteed non-null. The
  // explicit narrow tells TypeScript what we already proved via the mode flag.
  if (!lot) return null;

  const sessionWeight = splits.reduce((s, x) => s + x.weight, 0);
  const remaining     = Math.max(0, lot.estimatedWeight - sessionWeight);
  const allocatedPct  = lot.estimatedWeight > 0
    ? Math.min(Math.round((sessionWeight / lot.estimatedWeight) * 100), 100)
    : 0;
  const overflow = sessionWeight > lot.estimatedWeight;

  // Simulate fetching weight + moisture for the selected panel.
  function handleReadScale() {
    if (!selectedPanelId) {
      message.warning('กรุณาเลือกแผงก่อน');
      return;
    }
    setScaleLoading(true);
    setTimeout(() => {
      // Suggest a portion close to the remaining unallocated weight (or an
      // even split if remaining is zero), with ±3% drift so it's realistic.
      const target = remaining > 0 ? remaining : Math.round(lot!.estimatedWeight / 2);
      const drift = (Math.random() - 0.5) * 0.06;
      const w = Math.max(1, Math.round(target * (1 + drift)));
      const m = Number((Math.random() * 4 + 2).toFixed(1));   // 2.0% – 6.0%
      setScaleReading({ weight: w, moisture: m });
      form.setFieldsValue({ weight: w, moisture: m });
      setScaleLoading(false);
      message.success(`รับค่าจากเครื่องชั่ง: ${w.toLocaleString()} กก. · ความชื้น ${m}%`);
    }, 1100);
  }

  function handleAddSplit() {
    if (!selectedPanelId) {
      message.warning('กรุณาเลือกแผงก่อน');
      return;
    }
    if (!scaleReading) {
      message.warning('กรุณาอ่านค่าจากเครื่องชั่งก่อน');
      return;
    }
    form.validateFields().then((v) => {
      setSplits((prev) => [
        ...prev,
        {
          panelId:   selectedPanelId,
          weight:    v.weight,
          moisture:  v.moisture,
          weighedAt: dayjs().format('HH:mm'),
        },
      ]);
      // Reset the per-step state so the officer can pick the next panel
      setSelectedPanelId(undefined);
      setScaleReading(null);
      form.resetFields(['weight', 'moisture']);
      message.success('เพิ่มเข้าแผงแล้ว — เลือกแผงถัดไปหากยังมียางเหลือ');
    });
  }

  function handleRemoveSplit(idx: number) {
    setSplits((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleConfirm() {
    if (splits.length === 0) {
      message.warning('กรุณาเพิ่ม split อย่างน้อย 1 รายการก่อนยืนยัน');
      return;
    }
    modal.confirm({
      title: 'ยืนยันการชั่งน้ำหนัก?',
      content: `LOT ${lot!.id} จะถูกบันทึกเป็น "ชั่งแล้ว" แบ่งลง ${splits.length} แผง รวม ${sessionWeight.toLocaleString()} กก.`,
      okText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      okButtonProps: { style: { background: '#1a7c3e', borderColor: '#1a7c3e' } },
      onOk: () => {
        const note = form.getFieldValue('note') as string | undefined;
        const totalWeight = splits.reduce((s, x) => s + x.weight, 0);
        const avgMoisture = splits.reduce((s, x) => s + x.moisture, 0) / splits.length;
        const weighedAt   = splits[splits.length - 1].weighedAt;
        markWeighed({
          ...lot!,
          splits,
          actualWeight: totalWeight,
          moisture:     Number(avgMoisture.toFixed(2)),
          panelId:      splits[0].panelId,
          weighedAt,
          note,
        });
        // Sync the panel-weighing total to the checkout queue (no-op when the
        // lot wasn't created via the scan flow).
        setCheckoutPanelWeight(lot!.id, totalWeight);
        message.success(`บันทึกการชั่ง LOT ${lot!.id} แล้ว`);
        // Back to the list so the officer can pick the next LOT.
        router.push('/officer/weighing');
      },
    });
  }

  // ── Splits table ─────────────────────────────────────────────────────────

  const splitsCols: ColumnsType<WeighSplit> = [
    { title: '#', width: 50, align: 'center', render: (_, __, i) => i + 1 },
    {
      title: 'แผง',
      dataIndex: 'panelId',
      width: 120,
      render: (v: string) => {
        const meta = MASTER_PANELS.find((p) => p.id === v);
        return (
          <div>
            <Tag color="blue" style={{ fontFamily: 'monospace', margin: 0 }}>{v}</Tag>
            {meta && <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>{meta.code}</div>}
          </div>
        );
      },
    },
    {
      title: 'น้ำหนัก',
      dataIndex: 'weight',
      align: 'right',
      width: 130,
      render: (v: number) => <span><Text strong>{v.toLocaleString()}</Text> <Text type="secondary">กก.</Text></span>,
    },
    { title: 'ความชื้น', dataIndex: 'moisture', align: 'right', width: 100, render: (v: number) => `${v.toFixed(1)}%` },
    { title: 'เวลา', dataIndex: 'weighedAt', width: 80, render: (v: string) => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
    {
      title: '',
      width: 60,
      align: 'center',
      render: (_, __, i) => (
        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveSplit(i)} />
      ),
    },
  ];

  // ── UI ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <Link href="/officer/weighing">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ padding: 0, color: '#1a7c3e' }}>
            กลับไปยังรายการชั่ง
          </Button>
        </Link>
        <Title level={4} style={{ margin: '8px 0 0', color: '#0f3d22' }}>
          <ScissorOutlined style={{ marginRight: 8 }} />
          ชั่งน้ำหนัก — {lot.id}
        </Title>
        <Text type="secondary">เลือกแผง · ชั่ง · ทำซ้ำจนกว่าจะแบ่งยางครบ · ยืนยัน</Text>
      </div>

      {/* Lot info */}
      <Card>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="ผู้ขาย" span={2}>
            <Text strong>{lot.sellerName}</Text>
            {lot.sellerId && (
              <Text type="secondary" style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 11 }}>
                ({lot.sellerId})
              </Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="ชนิดยาง">{lot.rubberType}</Descriptions.Item>
          <Descriptions.Item label="เกรด">
            {lot.grade ? <Tag color="blue" style={{ margin: 0 }}>{lot.grade}</Tag> : <Text type="secondary">—</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="น้ำหนักประมาณ">
            <Text strong>{lot.estimatedWeight.toLocaleString()}</Text> กก.
          </Descriptions.Item>
          <Descriptions.Item label="ประเภท">
            {lot.eudrType === 'eudr' ? <Tag color="success">EUDR</Tag> : <Tag>Non Green</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Progress */}
      <Card>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space size={12} wrap>
              <Text type="secondary" style={{ fontSize: 12 }}>ชั่งแล้ว</Text>
              <Text strong style={{ fontSize: 18, color: overflow ? '#fa8c16' : '#1a7c3e' }}>
                {sessionWeight.toLocaleString()}
              </Text>
              <Text type="secondary">/ {lot.estimatedWeight.toLocaleString()} กก.</Text>
              {remaining > 0
                ? <Tag color="warning">เหลืออีก {remaining.toLocaleString()} กก.</Tag>
                : overflow
                  ? <Tag color="warning">เกินเป้าหมาย {(sessionWeight - lot.estimatedWeight).toLocaleString()} กก.</Tag>
                  : <Tag color="success">ครบตามเป้าหมาย</Tag>}
            </Space>
            <Progress
              percent={allocatedPct}
              strokeColor={overflow ? '#fa8c16' : '#1a7c3e'}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Step: select panel + read scale + add split */}
      <Card
        title={
          <Space>
            <AppstoreAddOutlined style={{ color: '#1a7c3e' }} />
            <span>ขั้นตอนถัดไป — เลือกแผง · ชั่ง · เพิ่มเข้าแผง</span>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          {/* Step 1: pick a panel */}
          <Form.Item
            label={
              <Space size={4}>
                <span>1) เลือกแผงปลายทาง</span>
                <Tag color={emptyPanels.length > 0 ? 'success' : 'error'} style={{ margin: 0, fontSize: 10 }}>
                  ว่าง {emptyPanels.length}
                </Tag>
              </Space>
            }
            extra="แสดงเฉพาะแผงว่างเท่านั้น (ไม่รวมแผงที่ใช้แล้วในเซสชันนี้)"
          >
            <Select
              value={selectedPanelId}
              onChange={(v) => { setSelectedPanelId(v); setScaleReading(null); form.resetFields(['weight', 'moisture']); }}
              placeholder={emptyPanels.length > 0 ? 'เลือกแผงว่าง' : 'ไม่มีแผงว่าง'}
              disabled={emptyPanels.length === 0}
              showSearch
              optionFilterProp="searchText"
              notFoundContent="ไม่มีแผงว่าง"
              options={emptyPanels.map((p) => ({
                value:      p.id,
                searchText: `${p.id} ${p.code}`,
                label: (
                  <span>
                    <Text strong style={{ fontFamily: 'monospace', marginRight: 6 }}>{p.id}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{p.code}</Text>
                  </span>
                ),
              }))}
            />
          </Form.Item>

          {/* Step 2: scale */}
          <Card
            size="small"
            style={{
              marginBottom: 16,
              background: scaleReading ? '#f6ffed' : '#fff7e6',
              border: `1px solid ${scaleReading ? '#b7eb8f' : '#ffd591'}`,
            }}
            bodyStyle={{ padding: 12 }}
          >
            <Row align="middle" gutter={12}>
              <Col flex="auto">
                {!selectedPanelId ? (
                  <Text type="secondary" style={{ fontSize: 12 }}>เลือกแผงด้านบนก่อน แล้วจึงกดชั่ง</Text>
                ) : scaleReading ? (
                  <>
                    <Text type="secondary" style={{ fontSize: 12 }}>ค่าจากเครื่องชั่ง</Text>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1a7c3e', lineHeight: 1.1 }}>
                      {scaleReading.weight.toLocaleString()}
                      <Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 6 }}>
                        กก. · ความชื้น {scaleReading.moisture}%
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      แก้ไขด้วยมือได้ในแบบฟอร์มด้านล่าง
                    </Text>
                  </>
                ) : (
                  <>
                    <Text strong style={{ fontSize: 13, color: '#d46b08' }}>2) กดชั่ง — ยังไม่ได้รับค่า</Text>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                      เครื่องชั่งจะอ่านน้ำหนัก + ความชื้นของยางที่อยู่บนแผง <Text strong>{selectedPanelId}</Text>
                    </div>
                  </>
                )}
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  loading={scaleLoading}
                  disabled={!selectedPanelId}
                  onClick={handleReadScale}
                  style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
                >
                  {scaleReading ? 'อ่านใหม่' : 'อ่านน้ำหนักจากเครื่องชั่ง'}
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Step 3: weight + moisture form */}
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="น้ำหนักลงแผงนี้ (กก.)"
                name="weight"
                rules={[{ required: true, message: 'กรุณาอ่านค่าจากเครื่องชั่งหรือป้อนเอง' }]}
              >
                <InputNumberSuffix style={{ width: '100%' }} min={1} suffix="กก." disabled={!selectedPanelId} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="ความชื้น (%)"
                name="moisture"
                rules={[{ required: true, message: 'กรุณาระบุ' }]}
              >
                <InputNumberSuffix style={{ width: '100%' }} min={0} max={100} step={0.1} suffix="%" disabled={!selectedPanelId} />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddSplit}
            disabled={!selectedPanelId || !scaleReading}
            block
            style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
          >
            3) เพิ่มเข้าแผงนี้ → เริ่มแผงถัดไป
          </Button>
        </Form>
      </Card>

      {/* Splits accumulated so far */}
      <Card
        title={
          <Space>
            <ScissorOutlined style={{ color: '#1a7c3e' }} />
            <span>รายการชั่งในเซสชันนี้</span>
            <Tag color={splits.length > 0 ? 'success' : 'default'} style={{ margin: 0 }}>
              {splits.length} แผง
            </Tag>
            {sessionWeight > 0 && (
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                · รวม {sessionWeight.toLocaleString()} กก.
              </Text>
            )}
          </Space>
        }
      >
        {splits.length === 0 ? (
          <Alert
            type="info"
            showIcon
            title="ยังไม่มีรายการชั่ง"
            description="ทำตามขั้นตอน 1-2-3 ด้านบนเพื่อเพิ่มแผงแรก"
          />
        ) : (
          <Table
            dataSource={splits}
            columns={splitsCols}
            rowKey={(_, i) => `split-${i}`}
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>รวม</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong style={{ color: '#1a7c3e' }}>{sessionWeight.toLocaleString()} กก.</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={3} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        )}
      </Card>

      {/* Confirm */}
      <Card>
        <Form form={form} layout="vertical">
          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea rows={2} placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)" />
          </Form.Item>
        </Form>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {remaining > 0 && splits.length > 0 && (
              <Text type="warning" style={{ fontSize: 12 }}>
                * ยังเหลือยางอีก {remaining.toLocaleString()} กก. ที่ยังไม่ถูกชั่ง — สามารถยืนยันได้ถ้าครบแล้ว
              </Text>
            )}
          </div>
          <Space>
            <Link href="/officer/weighing">
              <Button>กลับ</Button>
            </Link>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleConfirm}
              disabled={splits.length === 0}
              style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}
            >
              ยืนยันการชั่ง ({splits.length} แผง · {sessionWeight.toLocaleString()} กก.)
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}

// ─── Read-only view for an already-weighed LOT ─────────────────────────────

function WeighedReadOnlyView({ lot }: { lot: WeighedLot }) {
  const splitsCols: ColumnsType<WeighSplit> = [
    { title: '#', width: 50, align: 'center', render: (_, __, i) => i + 1 },
    {
      title: 'แผง',
      dataIndex: 'panelId',
      width: 130,
      render: (v: string) => {
        const meta = MASTER_PANELS.find((p) => p.id === v);
        return (
          <div>
            <Tag color="blue" style={{ fontFamily: 'monospace', margin: 0 }}>{v}</Tag>
            {meta && <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>{meta.code}</div>}
          </div>
        );
      },
    },
    {
      title: 'น้ำหนัก',
      dataIndex: 'weight',
      align: 'right',
      width: 130,
      render: (v: number) => <span><Text strong>{v.toLocaleString()}</Text> <Text type="secondary">กก.</Text></span>,
    },
    { title: 'ความชื้น', dataIndex: 'moisture', align: 'right', width: 100, render: (v: number) => `${v.toFixed(1)}%` },
    { title: 'เวลา', dataIndex: 'weighedAt', width: 80, render: (v: string) => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
  ];

  const total = lot.actualWeight ?? lot.splits.reduce((s, x) => s + x.weight, 0);
  const diff  = total - lot.estimatedWeight;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <Link href="/officer/weighing">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ padding: 0, color: '#1a7c3e' }}>
            กลับไปยังรายการชั่ง
          </Button>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#0f3d22' }}>
              <CheckCircleOutlined style={{ marginRight: 8 }} />
              รายละเอียดการชั่ง — {lot.id}
            </Title>
            <Text type="secondary">บันทึกเมื่อ {lot.weighedAt} · ชั่งแบ่ง {lot.splits.length} แผง</Text>
          </div>
          <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: '4px 10px' }}>
            ชั่งแล้ว
          </Tag>
        </div>
      </div>

      {/* Lot info */}
      <Card>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="ผู้ขาย" span={2}>
            <Text strong>{lot.sellerName}</Text>
            {lot.sellerId && (
              <Text type="secondary" style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 11 }}>
                ({lot.sellerId})
              </Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="ชนิดยาง">{lot.rubberType}</Descriptions.Item>
          <Descriptions.Item label="เกรด">
            {lot.grade ? <Tag color="blue" style={{ margin: 0 }}>{lot.grade}</Tag> : <Text type="secondary">—</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="น้ำหนักประมาณ">
            <Text>{lot.estimatedWeight.toLocaleString()}</Text> กก.
          </Descriptions.Item>
          <Descriptions.Item label="ประเภท">
            {lot.eudrType === 'eudr' ? <Tag color="success">EUDR</Tag> : <Tag>Non Green</Tag>}
          </Descriptions.Item>
          {lot.note && (
            <Descriptions.Item label="หมายเหตุ" span={2}>{lot.note}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Totals */}
      <Card>
        <Row gutter={16}>
          <Col xs={12} md={8}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>น้ำหนักจริงรวม</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1a7c3e', lineHeight: 1.2 }}>
                {total.toLocaleString()}
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 6 }}>กก.</Text>
              </div>
            </div>
          </Col>
          <Col xs={12} md={8}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>ความชื้นเฉลี่ย</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f3d22', lineHeight: 1.2 }}>
                {lot.moisture.toFixed(1)}%
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>ส่วนต่างจากประมาณ</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: diff >= 0 ? '#1a7c3e' : '#fa8c16', lineHeight: 1.2 }}>
                {diff >= 0 ? '+' : ''}{diff.toLocaleString()}
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 6 }}>กก.</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                ประมาณ {lot.estimatedWeight.toLocaleString()} กก.
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Splits */}
      <Card
        title={
          <Space>
            <ScissorOutlined style={{ color: '#1a7c3e' }} />
            <span>การแบ่งลงแผง</span>
            <Tag color="success" style={{ margin: 0 }}>{lot.splits.length} แผง</Tag>
          </Space>
        }
      >
        <Table
          dataSource={lot.splits}
          columns={splitsCols}
          rowKey={(_, i) => `split-${i}`}
          pagination={false}
          size="small"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong>รวม</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ color: '#1a7c3e' }}>{total.toLocaleString()} กก.</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={2} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      <div style={{ textAlign: 'center', padding: 8 }}>
        <Link href="/officer/weighing">
          <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
            กลับไปยังรายการชั่ง
          </Button>
        </Link>
      </div>
    </div>
  );
}
