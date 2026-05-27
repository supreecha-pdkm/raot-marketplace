'use client';

/**
 * Officer auction-control shell.
 *
 * Mirrors BoardTab layout but with three key differences:
 *   1. Read-only — no "เสนอราคา" button; cards show bidder count + top price.
 *   2. Manual close — a "ปิดรอบประมูล" action lets officers end a round early.
 *   3. Market picker — defaults to officer's home market; other markets selectable.
 */

import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Card, Row, Col, Select, Segmented, Tag, Alert, Typography, Space,
  Button, Badge, Tooltip, App as AntApp,
} from 'antd';
import {
  FilterOutlined, ReloadOutlined, AppstoreOutlined, UnorderedListOutlined,
  LockOutlined, ClockCircleOutlined, StopOutlined,
} from '@ant-design/icons';
import {
  type AuctionRound, getRoundWindow, getRoundsForMarketOnDate,
  closeRoundManually, getRoundPhaseForRubberType,
} from '../services/auction-rounds';
import {
  ALL_MARKETS, AUCTION_TYPE_OPTIONS, TYPE_OPTIONS,
  TYPE_KEY_TO_COLOR, TYPE_KEY_TO_LABEL,
  type AuctionType, type RubberTypeKey, type BoardViewMode,
} from '../utils/auction-constants';
import { RUBBER_ROWS, type RubberRow } from '../services/auction-mock';
import { getBidsForRound, topBidPerRow } from '../services/auction-results';
import { useAuctionBoardFilters } from '../hooks/use-auction-board-filters';
import WeightCard, { type OfficerStats } from './weight-card';
import AuctionRowsGrid from './auction-rows-grid';
import RoundCountdownCard from './round-countdown-card';
import LotDetailDrawer, { type LotDetailTarget } from './lot-detail-drawer';
import { getSession } from '@/features/auth/services/auth';

const { Text } = Typography;
const { Option } = Select;

export default function AuctionControlShell() {
  const { modal, message } = AntApp.useApp();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const officerMarket = useMemo(() => getSession()?.user.market ?? null, []);
  const marketOptions = useMemo(() => ALL_MARKETS.map(m => ({ label: m, value: m })), []);

  const [selectedMarket, setSelectedMarket] = useState<string>(
    () => officerMarket ?? ALL_MARKETS[0],
  );

  const today = useMemo(() => dayjs(), []);
  const marketRounds: AuctionRound[] = useMemo(
    () => getRoundsForMarketOnDate(selectedMarket, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedMarket, today, tick],
  );
  const [pickedRoundId, setPickedRoundId] = useState<string | null>(null);
  const effectiveRoundId = pickedRoundId && marketRounds.some(r => r.id === pickedRoundId)
    ? pickedRoundId
    : (marketRounds[0]?.id ?? null);
  const selectedRound = marketRounds.find(r => r.id === effectiveRoundId) ?? null;

  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(id);
  }, []);
  const roundPhase = selectedRound ? getRoundWindow(selectedRound, now).phase : 'closed';

  const {
    filterAuctionType, setFilterAuctionType,
    filterType, handleTypeChange,
    filterGrade, setFilterGrade,
    filterEudr, setFilterEudr,
    viewMode, setViewMode,
    resetFilters,
    gradeOptions,
  } = useAuctionBoardFilters('list');

  const [detailTarget, setDetailTarget] = useState<LotDetailTarget | null>(null);
  const openDetail = (row: RubberRow) => {
    if (!selectedRound) return;
    setDetailTarget({ row, round: selectedRound });
  };

  const displayedRows = useMemo(() => RUBBER_ROWS.filter(r => {
    if (r.market !== selectedMarket) return false;
    if (selectedRound && r.auctionType !== selectedRound.auctionType) return false;
    if (filterAuctionType !== 'all' && r.auctionType !== filterAuctionType) return false;
    if (filterType        !== 'all' && r.typeKey     !== filterType)        return false;
    if (filterGrade       !== 'ทุกเกรด' && r.grade  !== filterGrade)       return false;
    if (filterEudr === 'green'     && !r.isEudr) return false;
    if (filterEudr === 'non-green' && r.isEudr)  return false;
    return true;
  }), [selectedMarket, selectedRound, filterAuctionType, filterType, filterGrade, filterEudr]);

  const rowPhase = (row: RubberRow) =>
    selectedRound ? getRoundPhaseForRubberType(selectedRound, now, row.typeKey) : 'closed';

  const officerStatsByRow = useMemo(() => {
    if (!selectedRound) return {} as Record<string, OfficerStats>;
    const bids   = getBidsForRound(selectedRound, displayedRows);
    const top    = topBidPerRow(bids);
    const counts: Record<string, number> = {};
    for (const b of bids) counts[b.rowKey] = (counts[b.rowKey] ?? 0) + 1;
    const map: Record<string, OfficerStats> = {};
    for (const row of displayedRows) {
      map[row.key] = {
        bidderCount: counts[row.key] ?? 0,
        topPrice:    top[row.key]?.price,
        masked:      rowPhase(row) === 'open',
      };
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRound, displayedRows, roundPhase, tick]);

  const handleCloseNow = () => {
    if (!selectedRound) return;
    modal.confirm({
      title: `ปิดรอบ ${selectedRound.name} ก่อนเวลาสิ้นสุด?`,
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            รอบนี้กำหนดปิดเวลา <strong>{selectedRound.endTime} น.</strong> —
            หากกดยืนยัน ระบบจะปิดทั้งรอบทันที และผู้ซื้อจะไม่สามารถเสนอราคาได้อีก
          </p>
          <p style={{ marginBottom: 0, color: '#fa8c16' }}>
            <strong>เมื่อปิดแล้ว</strong> สามารถดำเนินขั้นตอน &ldquo;ประกาศผู้ชนะ&rdquo; ได้ในหน้าเมนูประกาศ
          </p>
        </div>
      ),
      okText: 'ปิดทั้งรอบทันที', okButtonProps: { danger: true, icon: <StopOutlined /> },
      cancelText: 'ยกเลิก',
      onOk: () => {
        const officerName = getSession()?.user.fullName ?? 'เจ้าหน้าที่ประมูล';
        closeRoundManually(selectedRound.id, officerName);
        message.success(`ปิด ${selectedRound.name} เรียบร้อย — ไปประกาศผู้ชนะได้ที่เมนูถัดไป`);
        refresh();
      },
    });
  };

  const roundOptions = marketRounds.map(r => ({
    value: r.id,
    label: `${r.name} (${r.startTime}–${r.endTime})`
      + (r.closedManuallyAt ? ' · ปิดเอง' : Object.keys(r.closedRubberTypes ?? {}).length > 0 ? ' · ปิดบางชนิด' : ''),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Filter card ──────────────────────────────────────────────────── */}
      <Card size="small" styles={{ body: { padding: 16 } }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
          <Space size={6}>
            <FilterOutlined style={{ color: '#8c8c8c' }} />
            <Text strong style={{ fontSize: 13 }}>ตัวกรอง (มุมมองเจ้าหน้าที่)</Text>
          </Space>
          <Space size={8}>
            <Segmented
              size="small" value={viewMode}
              onChange={v => setViewMode(v as BoardViewMode)}
              options={[
                { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
                { label: 'Grid', value: 'grid', icon: <AppstoreOutlined /> },
              ]}
            />
            <Button size="small" type="text" icon={<ReloadOutlined />} onClick={resetFilters}>รีเซ็ต</Button>
          </Space>
        </div>

        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>ตลาดกลาง</div>
            <Select value={selectedMarket} onChange={m => { setSelectedMarket(m); setPickedRoundId(null); }}
              style={{ width: '100%' }} size="small" options={marketOptions} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>
              รอบประมูล
              <Text type="secondary" style={{ fontSize: 10, marginLeft: 4 }}>(ตามที่ตลาดตั้งค่าวันนี้)</Text>
            </div>
            <Select value={selectedRound?.id} onChange={v => setPickedRoundId(v)} size="small"
              style={{ width: '100%' }} placeholder="เลือกรอบประมูล" options={roundOptions}
              disabled={roundOptions.length === 0} notFoundContent="ตลาดนี้ยังไม่มีรอบประมูลในวันนี้" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>ประเภทประมูล</div>
            <Select value={filterAuctionType} onChange={v => setFilterAuctionType(v)} style={{ width: '100%' }} size="small">
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
                { label: 'ทั้งหมด', value: 'all' },
                { label: 'EUDR (Green) เท่านั้น', value: 'green' },
                { label: 'Non Green เท่านั้น', value: 'non-green' },
              ]} />
          </Col>
        </Row>
      </Card>

      {/* ── Round countdown + manual close ──────────────────────────────── */}
      {selectedRound ? (
        <>
          <RoundCountdownCard round={selectedRound} />
          <Card size="small" styles={{ body: { padding: '10px 14px' } }}>
            <Row align="middle" justify="space-between" gutter={[12, 8]}>
              <Col xs={24} md="auto">
                {selectedRound.closedManuallyAt ? (
                  <Space size={6}>
                    <LockOutlined style={{ color: '#bfbfbf' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      รอบนี้ถูกปิดเองโดย <strong>{selectedRound.closedManuallyBy ?? 'เจ้าหน้าที่'}</strong> เมื่อ{' '}
                      {dayjs(selectedRound.closedManuallyAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </Space>
                ) : roundPhase === 'open' ? (
                  <div>
                    <Space size={6}>
                      <Badge status="processing" />
                      <Text strong style={{ fontSize: 13 }}>รอบกำลังเปิด — เลือกปิดทั้งรอบหรือปิดเฉพาะชนิดยางที่ตรวจสอบครบถ้วน</Text>
                    </Space>
                    {selectedRound.closedRubberTypes && Object.keys(selectedRound.closedRubberTypes).length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        <Space size={4} wrap>
                          {Object.entries(selectedRound.closedRubberTypes).map(([typeKey, meta]) => (
                            <Tag
                              key={typeKey} icon={<LockOutlined />}
                              style={{
                                margin: 0,
                                color:       TYPE_KEY_TO_COLOR[typeKey as RubberTypeKey],
                                borderColor: `${TYPE_KEY_TO_COLOR[typeKey as RubberTypeKey]}59`,
                                background:  `${TYPE_KEY_TO_COLOR[typeKey as RubberTypeKey]}14`,
                              }}
                            >
                              {TYPE_KEY_TO_LABEL[typeKey as RubberTypeKey]} ปิดแล้ว
                              {meta?.closedBy ? ` · ${meta.closedBy}` : ''}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </div>
                ) : roundPhase === 'upcoming' ? (
                  <Space size={6}>
                    <ClockCircleOutlined style={{ color: '#1677ff' }} />
                    <Text style={{ fontSize: 13 }}>รอบยังไม่เปิด — ไม่จำเป็นต้องปิด</Text>
                  </Space>
                ) : (
                  <Space size={6}>
                    <LockOutlined style={{ color: '#bfbfbf' }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>รอบนี้ปิดแล้วตามเวลาที่กำหนด</Text>
                  </Space>
                )}
              </Col>
              <Col xs={24} md="auto">
                <Tooltip title={roundPhase !== 'open' ? 'ปิดได้เฉพาะรอบที่กำลังเปิดอยู่' : ''}>
                  <Button danger icon={<StopOutlined />} onClick={handleCloseNow} disabled={roundPhase !== 'open'}>
                    ปิดรอบประมูล (Manual)
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </Card>
        </>
      ) : (
        <Alert type="warning" showIcon icon={<ClockCircleOutlined />}
          title={`${selectedMarket} — ยังไม่มีรอบประมูลในวันนี้`}
          description="ตรวจสอบเมนูตั้งค่ารอบประมูล หรือสอบถามผู้ดูแลระบบ" />
      )}

      {/* ── Live header note ─────────────────────────────────────────────── */}
      {selectedRound && (
        <Alert
          type={roundPhase === 'open' ? 'info' : 'warning'}
          showIcon
          icon={roundPhase === 'open' ? undefined : <LockOutlined />}
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedRound.name} ({selectedRound.startTime}–{selectedRound.endTime})
              {' '}— แสดง <strong>{displayedRows.length}</strong> รายการ
              {filterAuctionType !== 'all' && ` · ${AUCTION_TYPE_OPTIONS.find(o => o.value === filterAuctionType)?.label}`}
              {filterType !== 'all' && ` · ${TYPE_OPTIONS.find(o => o.value === filterType)?.label}`}
              {filterGrade !== 'ทุกเกรด' && ` · ${filterGrade}`}
              {filterEudr === 'green'     && ' · EUDR (Green)'}
              {filterEudr === 'non-green' && ' · Non Green'}
            </span>
          }
          description={
            roundPhase === 'open'
              ? 'ราคาเสนอของผู้ซื้อจะถูกปิดด้วย ●●●●● จนกว่ารอบจะปิด เพื่อป้องกันการรั่วไหลของราคา'
              : 'รอบนี้ปิดแล้ว — สามารถเห็นราคาสูงสุดต่อรายการได้แล้ว และไปประกาศผู้ชนะได้ที่เมนูถัดไป'
          }
        />
      )}

      {/* ── WeightCards ─────────────────────────────────────────────────── */}
      <AuctionRowsGrid
        displayedRows={displayedRows}
        viewMode={viewMode}
        rowPhase={rowPhase}
        viewer="officer"
        officerStatsByRow={officerStatsByRow}
        onInspect={openDetail}
      />

      <LotDetailDrawer
        target={detailTarget}
        onClose={() => setDetailTarget(null)}
        onCloseRubberType={refresh}
      />
    </div>
  );
}
