'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card, Tag, Button, Modal, Form, Row, Col, Calendar, Drawer, Empty,
  Segmented, Space, Alert, Typography, App as AntApp,
} from 'antd';
import {
  SettingOutlined, PlusOutlined, EditOutlined,
  CalendarOutlined, AppstoreOutlined,
  LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  MARKET_OPTIONS, AUCTION_TYPE_OPTIONS,
  type AuctionType, type RoundPhase,
} from '../utils/auction-constants';
import {
  type AuctionRound,
  getAuctionRounds, setAuctionRounds, getRoundPhase,
} from '../services/auction-rounds';
import AdminRoundCard from './admin-round-card';
import RoundForm from './round-form';

const { Text } = Typography;

export default function AdminAuctionRoundsShell() {
  const { message, modal } = AntApp.useApp();

  const [rounds, setRounds] = useState<AuctionRound[]>(() => getAuctionRounds());
  const [now,    setNow]    = useState(() => dayjs());

  const persistRounds = (
    next: AuctionRound[] | ((prev: AuctionRound[]) => AuctionRound[]),
  ) => {
    setRounds(prev => {
      const value = typeof next === 'function' ? next(prev) : next;
      setAuctionRounds(value);
      return value;
    });
  };

  const [filterMarket,  setFilterMarket]  = useState<string>('all');
  const [filterAuction, setFilterAuction] = useState<'all' | AuctionType>('all');
  const [viewMode,      setViewMode]      = useState<'calendar' | 'list'>('calendar');
  const [calendarValue, setCalendarValue] = useState<Dayjs>(dayjs());
  const [dayDrawer,     setDayDrawer]     = useState<string | null>(null);

  const [createOpen,   setCreateOpen]   = useState(false);
  const [createPreset, setCreatePreset] = useState<Dayjs | undefined>(undefined);
  const [editTarget,   setEditTarget]   = useState<AuctionRound | null>(null);
  const [form]     = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 60_000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => rounds.filter(r => {
    if (filterMarket  !== 'all' && r.market      !== filterMarket)  return false;
    if (filterAuction !== 'all' && r.auctionType !== filterAuction) return false;
    return true;
  }), [rounds, filterMarket, filterAuction]);

  const byDate = useMemo(() => {
    const m = new Map<string, AuctionRound[]>();
    for (const r of filtered) {
      const list = m.get(r.date) ?? [];
      list.push(r);
      m.set(r.date, list);
    }
    m.forEach(list => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return m;
  }, [filtered]);

  const next7 = useMemo(() => {
    const out: { date: string; rounds: AuctionRound[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().add(i, 'day').format('YYYY-MM-DD');
      out.push({ date: d, rounds: byDate.get(d) ?? [] });
    }
    return out;
  }, [byDate]);

  const drawerRounds = dayDrawer ? (byDate.get(dayDrawer) ?? []) : [];

  // ── Actions ──────────────────────────────────────────────────────────────
  const openCreate = (presetDate?: Dayjs) => {
    setCreatePreset(presetDate);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    const v = await form.validateFields().catch(() => null);
    if (!v) return;
    const newRound: AuctionRound = {
      id:          `RND-${Date.now()}`,
      name:        v.name,
      date:        (v.date as Dayjs).format('YYYY-MM-DD'),
      startTime:   (v.startTime as Dayjs).format('HH:mm'),
      endTime:     (v.endTime as Dayjs).format('HH:mm'),
      market:      v.market,
      auctionType: v.auctionType,
      feePerKg:    Number(v.feePerKg),
      active:      v.active ?? true,
    };
    persistRounds(prev => [...prev, newRound]);
    message.success(`สร้างรอบประมูล "${newRound.name}" — ${dayjs(newRound.date).format('DD/MM/YYYY')} แล้ว`);
    setCreateOpen(false);
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    const v = await editForm.validateFields().catch(() => null);
    if (!v) return;
    persistRounds(prev => prev.map(r => r.id === editTarget.id ? {
      ...r,
      name:        v.name,
      date:        (v.date as Dayjs).format('YYYY-MM-DD'),
      startTime:   (v.startTime as Dayjs).format('HH:mm'),
      endTime:     (v.endTime as Dayjs).format('HH:mm'),
      market:      v.market,
      auctionType: v.auctionType,
      feePerKg:    Number(v.feePerKg),
      active:      v.active ?? true,
    } : r));
    message.success(`บันทึกการแก้ไขรอบ "${v.name}" แล้ว`);
    setEditTarget(null);
  };

  const confirmDelete = (r: AuctionRound) => {
    modal.confirm({
      title: `ลบรอบ "${r.name}"?`,
      content: `รอบประมูลวันที่ ${dayjs(r.date).format('DD/MM/YYYY')} เวลา ${r.startTime}–${r.endTime} จะถูกลบออกจากระบบ`,
      okText: 'ลบ',
      okButtonProps: { danger: true },
      cancelText: 'ยกเลิก',
      onOk: () => {
        persistRounds(prev => prev.filter(x => x.id !== r.id));
        message.success('ลบรอบประมูลแล้ว');
      },
    });
  };

  const toggleActive = (r: AuctionRound, next: boolean) => {
    persistRounds(prev => prev.map(x => x.id === r.id ? { ...x, active: next } : x));
  };

  const phaseOf = (r: AuctionRound): RoundPhase => getRoundPhase(r, now);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert
        type="info" showIcon
        title="การตั้งค่ารอบประมูล"
        description="สร้างรอบประมูลรายวันเป็นรอบต่อรอบ — ระบุวันที่ เวลา ตลาดกลาง และประเภทประมูล ผู้ซื้อจะเห็นรอบเหล่านี้ในหน้า Schedule"
      />

      {/* Toolbar */}
      <Card size="small" styles={{ body: { padding: 12 } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md="auto">
            <Space size={6}>
              <SettingOutlined style={{ color: '#722ed1' }} />
              <Text strong>ตารางรอบประมูล</Text>
              <Tag style={{ margin: 0 }}>{filtered.length} รอบ</Tag>
            </Space>
          </Col>
          <Col flex="auto" />
          <Col xs={24} sm={12} md={6}>
            <select
              value={filterAuction}
              onChange={e => setFilterAuction(e.target.value as 'all' | AuctionType)}
              style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13 }}
            >
              {AUCTION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <select
              value={filterMarket}
              onChange={e => setFilterMarket(e.target.value)}
              style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13 }}
            >
              {MARKET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Col>
          <Col xs={24} md="auto">
            <Segmented
              size="small"
              value={viewMode}
              onChange={v => setViewMode(v as 'calendar' | 'list')}
              options={[
                { label: <span><CalendarOutlined /> ปฏิทิน</span>, value: 'calendar' },
                { label: <span><AppstoreOutlined /> รายการ</span>,  value: 'list' },
              ]}
            />
          </Col>
          <Col xs={24} md="auto">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openCreate()}
              style={{ background: '#722ed1', borderColor: '#722ed1' }}
            >
              สร้างรอบใหม่
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Calendar view */}
      {viewMode === 'calendar' && (
        <Card
          styles={{ body: { padding: 12 } }}
          title={
            <Space>
              <CalendarOutlined style={{ color: '#722ed1' }} />
              <span>ปฏิทินรอบประมูล</span>
              <Text type="secondary" style={{ fontSize: 12 }}>คลิกที่วันเพื่อดูรอบประมูลทั้งหมดของวันนั้น</Text>
            </Space>
          }
        >
          <Calendar
            value={calendarValue}
            onChange={setCalendarValue}
            onSelect={(d, info) => {
              if (info?.source === 'date') {
                setCalendarValue(d);
                setDayDrawer(d.format('YYYY-MM-DD'));
              }
            }}
            cellRender={(date, info) => {
              if (info.type !== 'date') return null;
              const key  = date.format('YYYY-MM-DD');
              const list = byDate.get(key) ?? [];
              if (list.length === 0) return null;
              const isToday = date.isSame(dayjs(), 'day');
              const counts = {
                upcoming: list.filter(r => phaseOf(r) === 'upcoming').length,
                open:     list.filter(r => phaseOf(r) === 'open').length,
                closed:   list.filter(r => phaseOf(r) === 'closed').length,
              };
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                    background: isToday ? '#722ed1' : '#f9f0ff',
                    color:      isToday ? '#fff'    : '#722ed1',
                    border:     `1px solid ${isToday ? '#722ed1' : '#d3adf7'}`,
                    width: 'fit-content',
                  }}>
                    {list.length} รอบ
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {counts.open     > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c41a' }} />}
                    {counts.upcoming > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1677ff' }} />}
                    {counts.closed   > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#bfbfbf' }} />}
                  </div>
                </div>
              );
            }}
            headerRender={({ value, onChange }) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px 12px', flexWrap: 'wrap', gap: 8 }}>
                <Space size={4}>
                  <Button size="small" icon={<LeftOutlined />}  onClick={() => onChange(value.subtract(1, 'month'))} />
                  <Button size="small" onClick={() => { const t = dayjs(); onChange(t); setCalendarValue(t); }}>วันนี้</Button>
                  <Button size="small" icon={<RightOutlined />} onClick={() => onChange(value.add(1, 'month'))} />
                </Space>
                <Text strong style={{ fontSize: 16 }}>{value.format('MMMM YYYY')}</Text>
                <Space size={10}>
                  {[['#52c41a','เปิดอยู่'],['#1677ff','เปิดเร็ว ๆ นี้'],['#bfbfbf','ปิดแล้ว']].map(([c, l]) => (
                    <Text key={l} type="secondary" style={{ fontSize: 11 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, marginRight: 4 }} />
                      {l}
                    </Text>
                  ))}
                </Space>
              </div>
            )}
          />
        </Card>
      )}

      {/* List view: next 7 days */}
      {viewMode === 'list' && (
        <Card title={<Space><AppstoreOutlined style={{ color: '#722ed1' }} /><span>รอบประมูลใน 7 วันข้างหน้า</span></Space>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {next7.map(({ date, rounds: dayRounds }) => {
              const d       = dayjs(date);
              const isToday = d.isSame(dayjs(), 'day');
              return (
                <div key={date}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
                    <Text strong style={{ fontSize: 14, color: isToday ? '#722ed1' : '#1a1a2e' }}>
                      {d.format('dddd D MMMM YYYY')}
                    </Text>
                    {isToday && <Tag color="purple" style={{ margin: 0 }}>วันนี้</Tag>}
                    <Tag style={{ margin: 0 }}>{dayRounds.length} รอบ</Tag>
                    <div style={{ flex: 1 }} />
                    <Button size="small" icon={<PlusOutlined />} onClick={() => openCreate(d)}>เพิ่มรอบในวันนี้</Button>
                  </div>
                  {dayRounds.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Text type="secondary" style={{ fontSize: 12 }}>ไม่มีรอบประมูลในวันนี้</Text>} style={{ margin: '8px 0' }} />
                  ) : (
                    <Row gutter={[12, 12]}>
                      {dayRounds.map(r => (
                        <Col xs={24} sm={12} lg={8} key={r.id}>
                          <AdminRoundCard item={r} phase={phaseOf(r)} onEdit={setEditTarget} onDelete={confirmDelete} onToggleActive={toggleActive} />
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Day drawer */}
      <Drawer
        open={!!dayDrawer}
        onClose={() => setDayDrawer(null)}
        styles={{ wrapper: { width: 'min(560px, calc(100vw - 40px))' } }}
        title={dayDrawer ? <Space><CalendarOutlined style={{ color: '#722ed1' }} /><span>รอบประมูลวันที่ {dayjs(dayDrawer).format('dddd D MMMM YYYY')}</span></Space> : null}
        extra={dayDrawer && (
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openCreate(dayjs(dayDrawer))} style={{ background: '#722ed1', borderColor: '#722ed1' }}>
            เพิ่มรอบ
          </Button>
        )}
      >
        {drawerRounds.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="ยังไม่มีรอบประมูลในวันนี้ — กดปุ่ม &ldquo;เพิ่มรอบ&rdquo; เพื่อสร้าง" style={{ marginTop: 32 }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ทั้งหมด <strong>{drawerRounds.length}</strong> รอบ ·{' '}
              เปิดใช้งาน <strong>{drawerRounds.filter(r => r.active).length}</strong> ·{' '}
              ปิด <strong>{drawerRounds.filter(r => !r.active).length}</strong>
            </Text>
            {drawerRounds.map(r => (
              <AdminRoundCard key={r.id} item={r} phase={phaseOf(r)} onEdit={setEditTarget} onDelete={confirmDelete} onToggleActive={toggleActive} expanded />
            ))}
          </div>
        )}
      </Drawer>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={submitCreate}
        title={<Space><PlusOutlined style={{ color: '#722ed1' }} /><span>สร้างรอบประมูลใหม่</span></Space>}
        okText="สร้างรอบ" cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#722ed1', borderColor: '#722ed1' } }}
        width={560} destroyOnHidden
        afterOpenChange={open => {
          if (open) {
            form.resetFields();
            form.setFieldsValue({ date: createPreset ?? dayjs(), auctionType: 'location', feePerKg: 0.25, active: true });
          }
        }}
      >
        <RoundForm form={form} />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onCancel={() => setEditTarget(null)}
        onOk={submitEdit}
        title={<Space><EditOutlined style={{ color: '#722ed1' }} /><span>แก้ไขรอบ — {editTarget?.name}</span></Space>}
        okText="บันทึก" cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#722ed1', borderColor: '#722ed1' } }}
        width={560} destroyOnHidden
        afterOpenChange={open => {
          if (open && editTarget) {
            editForm.setFieldsValue({
              name:        editTarget.name,
              date:        dayjs(editTarget.date),
              startTime:   dayjs(editTarget.startTime, 'HH:mm'),
              endTime:     dayjs(editTarget.endTime, 'HH:mm'),
              market:      editTarget.market,
              auctionType: editTarget.auctionType,
              feePerKg:    editTarget.feePerKg,
              active:      editTarget.active,
            });
          }
        }}
      >
        <RoundForm form={editForm} editing />
      </Modal>
    </div>
  );
}
