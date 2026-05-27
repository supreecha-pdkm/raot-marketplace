'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card, Table, Tag, Button, Row, Col,
  Select, Badge, Alert, Typography, Space, Segmented,
  App as AntApp,
} from 'antd';
import {
  TrophyOutlined, FilterOutlined, ReloadOutlined,
  DeleteOutlined, LockOutlined, ClockCircleOutlined,
  AppstoreOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  AUCTION_TYPE_OPTIONS, TYPE_OPTIONS, ALL_GRADES,
  type AuctionType, type BoardViewMode,
} from '@/features/auctions/utils/auction-constants';
import {
  type AuctionRound, getRoundWindow, getRoundPhaseForRubberType,
} from '@/features/auctions/services/auction-rounds';
import { RUBBER_ROWS, type RubberRow } from '@/features/auctions/services/auction-mock';
import type { RoundOffer } from '@/features/auctions/hooks/use-offer-flow';
import { useAuctionBoardFilters } from '@/features/auctions/hooks/use-auction-board-filters';
import AuctionRowsGrid from './auction-rows-grid';
import RoundCountdownCard from './round-countdown-card';

const { Text } = Typography;
const { Option } = Select;

interface BoardTabProps {
  buyerMarkets:        string[];
  selectedMarket:      string | null;
  onSelectMarket:      (market: string) => void;
  marketRounds:        AuctionRound[];
  selectedRound:       AuctionRound | null;
  onSelectRoundId:     (roundId: string) => void;
  currentRoundOffers:  RoundOffer[];
  onOpenOffer:         (row: RubberRow) => void;
  onDeleteOffer:       (rowKey: string) => void;
}

/**
 * Live board tab — filters, round countdown, weight-card grid, and the
 * "ราคาที่คุณเสนอ" summary table.
 *
 * The merged offer/review modal is owned by the parent shell so it stays
 * mounted across tab switches.
 */
export default function BoardTab({
  buyerMarkets,
  selectedMarket, onSelectMarket,
  marketRounds,
  selectedRound, onSelectRoundId,
  currentRoundOffers, onOpenOffer, onDeleteOffer,
}: BoardTabProps) {
  const { modal } = AntApp.useApp();

  const {
    filterAuctionType, setFilterAuctionType,
    filterType, handleTypeChange,
    filterGrade, setFilterGrade,
    filterEudr, setFilterEudr,
    viewMode, setViewMode,
    resetFilters,
    gradeOptions,
  } = useAuctionBoardFilters('grid');

  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(id);
  }, []);

  const roundPhase = selectedRound ? getRoundWindow(selectedRound, now).phase : 'closed';
  const rowPhase   = (row: RubberRow) =>
    selectedRound ? getRoundPhaseForRubberType(selectedRound, now, row.typeKey) : 'closed';

  const displayedRows = useMemo(() => RUBBER_ROWS.filter(r => {
    if (!selectedMarket || r.market !== selectedMarket)             return false;
    if (filterAuctionType !== 'all' && r.auctionType !== filterAuctionType) return false;
    if (filterType        !== 'all' && r.typeKey     !== filterType)        return false;
    if (filterGrade       !== ALL_GRADES && r.grade  !== filterGrade)       return false;
    if (filterEudr === 'green'     && !r.isEudr) return false;
    if (filterEudr === 'non-green' && r.isEudr)  return false;
    return true;
  }), [selectedMarket, filterAuctionType, filterType, filterGrade, filterEudr]);

  const totalEstimated = displayedRows.reduce((s, r) => s + r.estimatedWeight, 0);
  const canBid = !!selectedRound && roundPhase === 'open' && displayedRows.some(row => rowPhase(row) === 'open');
  const findMyOffer = (rowKey: string) => currentRoundOffers.find(o => o.rowKey === rowKey);

  const marketOptions = buyerMarkets.map(m => ({ label: m, value: m }));
  const roundOptions  = marketRounds.map(r => ({
    value: r.id,
    label: `${r.name} (${r.startTime}–${r.endTime})`,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>

      {/* ── Filter card ──────────────────────────────────────────────────── */}
      <Card size="small" styles={{ body: { padding: 16 } }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
          <Space size={6}>
            <FilterOutlined style={{ color: '#8c8c8c' }} />
            <Text strong style={{ fontSize: 13 }}>ตัวกรอง</Text>
          </Space>
          <Space size={8}>
            <Segmented
              size="small"
              value={viewMode}
              onChange={value => setViewMode(value as BoardViewMode)}
              options={[
                { label: 'Grid', value: 'grid', icon: <AppstoreOutlined /> },
                { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
              ]}
            />
            <Button size="small" type="text" icon={<ReloadOutlined />} onClick={resetFilters}>รีเซ็ต</Button>
          </Space>
        </div>

        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>
              ตลาดกลาง
              <Text type="secondary" style={{ fontSize: 10, marginLeft: 4 }}>(เฉพาะตลาดที่ลงทะเบียนไว้)</Text>
            </div>
            <Select value={selectedMarket ?? undefined} onChange={onSelectMarket} style={{ width: '100%' }} size="small"
              placeholder="เลือกตลาด" options={marketOptions} disabled={marketOptions.length === 0} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>
              รอบประมูล
              <Text type="secondary" style={{ fontSize: 10, marginLeft: 4 }}>(ตามที่ตลาดตั้งค่าวันนี้)</Text>
            </div>
            <Select value={selectedRound?.id} onChange={onSelectRoundId} size="small" style={{ width: '100%' }}
              placeholder={selectedMarket ? 'เลือกรอบประมูล' : 'เลือกตลาดก่อน'} options={roundOptions}
              disabled={!selectedMarket || roundOptions.length === 0}
              notFoundContent="ตลาดนี้ยังไม่มีรอบประมูลในวันนี้" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>ประเภทประมูล</div>
            <Select value={filterAuctionType} onChange={setFilterAuctionType} style={{ width: '100%' }} size="small">
              {AUCTION_TYPE_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>ชนิดยาง</div>
            <Select value={filterType} onChange={handleTypeChange} style={{ width: '100%' }} size="small">
              {TYPE_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
            </Select>
          </Col>
        </Row>

        <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>เกรด</div>
            <Select value={filterGrade} onChange={setFilterGrade} style={{ width: '100%' }} size="small" options={gradeOptions} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>มาตรฐาน EUDR</div>
            <Select value={filterEudr} onChange={setFilterEudr} style={{ width: '100%' }} size="small"
              options={[
                { label: 'ทั้งหมด',               value: 'all' },
                { label: 'EUDR (Green) เท่านั้น',  value: 'green' },
                { label: 'Non Green เท่านั้น',      value: 'non-green' },
              ]} />
          </Col>
        </Row>
      </Card>

      {/* ── Fallback states ─────────────────────────────────────────────── */}
      {!selectedMarket ? (
        <Alert type="info" showIcon title="กรุณาเลือกตลาดกลาง"
          description="ตัวเลือกตลาดด้านบนแสดงเฉพาะตลาดที่คุณลงทะเบียนไว้ตอนสมัครเข้าใช้งาน" />
      ) : roundOptions.length === 0 ? (
        <Alert type="warning" showIcon icon={<ClockCircleOutlined />}
          title={`${selectedMarket} — ยังไม่มีรอบประมูลในวันนี้`}
          description="ไปที่แท็บ Schedule เพื่อดูรอบประมูลในวันถัดไป หรือรอให้เจ้าหน้าที่ตั้งรอบใหม่" />
      ) : (
        <>
          {selectedRound && <RoundCountdownCard round={selectedRound} />}

          {canBid ? (
            <Alert type="info" showIcon
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge status="processing" />
                  {selectedRound!.name} ({selectedRound!.startTime}–{selectedRound!.endTime}) กำลังเปิด —
                  แสดง <strong>{displayedRows.length}</strong> รายการ
                  {filterAuctionType !== 'all' && ` · ${AUCTION_TYPE_OPTIONS.find(o => o.value === filterAuctionType)?.label}`}
                  {filterType !== 'all' && ` · ${TYPE_OPTIONS.find(o => o.value === filterType)?.label}`}
                  {filterGrade !== ALL_GRADES && ` · ${filterGrade}`}
                  {filterEudr === 'green'     && ' · EUDR (Green)'}
                  {filterEudr === 'non-green' && ' · Non Green'}
                  {' '}· ประมาณรวม <strong>{totalEstimated.toLocaleString()} กก.</strong>
                  <span className="animate-pulse" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#52c41a', marginLeft: 4 }} />
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>Live</span>
                </span>
              }
            />
          ) : (
            <Alert
              type={roundPhase === 'closed' || roundPhase === 'open' ? 'warning' : 'info'}
              showIcon
              icon={roundPhase === 'closed' || roundPhase === 'open' ? <LockOutlined /> : <ClockCircleOutlined />}
              title={
                <strong>
                  {roundPhase === 'closed'
                    ? `${selectedRound?.name ?? 'รอบนี้'} ปิดแล้ว — ไม่สามารถเสนอราคาได้`
                    : roundPhase === 'open'
                      ? 'ชนิดยางที่แสดงปิดรอบแล้ว — ไม่สามารถเสนอราคาได้'
                    : `${selectedRound?.name ?? 'รอบนี้'} ยังไม่เปิด — รอให้ถึงเวลาเปิดรอบก่อน`}
                </strong>
              }
              description={
                roundPhase === 'closed'
                  ? 'หากต้องการเสนอราคา กรุณาเลือกรอบที่กำลังเปิด หรือดูตารางรอบประมูลถัดไปในแท็บ Schedule'
                  : roundPhase === 'open'
                    ? 'ชนิดยางอื่นในรอบเดียวกันอาจยังเปิดอยู่ ลองปรับตัวกรองชนิดยางด้านบน'
                    : 'หน้านี้จะปลดล็อกอัตโนมัติเมื่อถึงเวลาเปิดรอบ — คุณสามารถดูรายการล่วงหน้าได้'
              }
            />
          )}

          <AuctionRowsGrid
            displayedRows={displayedRows}
            viewMode={viewMode}
            rowPhase={rowPhase}
            findMyOffer={findMyOffer}
            onOffer={onOpenOffer}
          />
        </>
      )}

      {/* ── My offers summary ────────────────────────────────────────────── */}
      {currentRoundOffers.length > 0 && selectedRound && (
        <Card
          size="small"
          title={
            <span>
              <TrophyOutlined style={{ color: '#1a7c3e', marginRight: 6 }} />
              ราคาที่คุณเสนอ — {selectedRound.name} ({selectedRound.startTime}–{selectedRound.endTime})
              <Badge count={currentRoundOffers.length} size="small" style={{ marginLeft: 8, background: '#1a7c3e' }} />
            </span>
          }
        >
          <Table
            size="small" pagination={false}
            dataSource={currentRoundOffers} rowKey="rowKey"
            scroll={{ x: 'max-content' }}
            columns={[
              {
                title: 'ชนิดยาง / เกรด',
                render: (r: RoundOffer) => (
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{r.typeName}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.grade}</div>
                  </div>
                ),
              },
              {
                title: 'ราคาเสนอ (฿/กก.)', dataIndex: 'myPrice', align: 'right' as const,
                render: (v: number) => <span style={{ fontWeight: 700, color: '#1677ff' }}>{v.toFixed(2)}</span>,
              },
              {
                title: '',
                render: (r: RoundOffer) => {
                  const row = RUBBER_ROWS.find(x => x.key === r.rowKey);
                  if (!row) return null;
                  const isRowClosed = selectedRound
                    ? getRoundPhaseForRubberType(selectedRound, now, row.typeKey) !== 'open'
                    : true;
                  if (isRowClosed) {
                    return (
                      <Tag icon={<LockOutlined />} style={{ margin: 0, fontSize: 11 }}>
                        ปิดรอบชนิดนี้แล้ว — ราคานี้ถูกล็อก
                      </Tag>
                    );
                  }
                  return (
                    <Space size={4}>
                      <Button size="small" onClick={() => onOpenOffer(row)}>แก้ไข</Button>
                      <Button
                        size="small" danger icon={<DeleteOutlined />}
                        onClick={() => {
                          modal.confirm({
                            title: 'ลบราคาเสนอ?',
                            content: `ต้องการลบราคาเสนอของ ${row.typeName} (${row.grade}) ใน ${selectedRound.name} หรือไม่?`,
                            okText: 'ลบ', okButtonProps: { danger: true },
                            cancelText: 'ยกเลิก',
                            onOk: () => onDeleteOffer(r.rowKey),
                          });
                        }}
                      >ลบ</Button>
                    </Space>
                  );
                },
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
