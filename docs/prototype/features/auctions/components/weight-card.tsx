'use client';

import { useEffect, useState } from 'react';
import { Card, Tag, Button, Row, Col, Tooltip, Typography } from 'antd';
import {
  TrophyOutlined, ClockCircleOutlined, LockOutlined,
  TeamOutlined, EyeInvisibleOutlined,
} from '@ant-design/icons';
import AnimatedNumber from '@/shared/components/animated-number';
import TappingInfo from '@/features/auctions/components/tapping-info';
import type { RubberRow } from '@/features/auctions/services/auction-mock';
import type { RoundPhase } from '@/features/auctions/utils/auction-constants';

const { Text } = Typography;

/**
 * Drives the "live weight" pulse on the auction board. Each card increments
 * its actual weight every ~2.2s with random ±jitter until it caps at `max`.
 *
 * The jitter (`Math.random() * 1000`) is captured once at mount on purpose —
 * each card ends up with a slightly different cadence, so the board doesn't
 * pulse in lockstep.
 */
function useLiveWeight(start: number, max: number, intervalMs = 2200): number {
  const [val, setVal] = useState(start);
  useEffect(() => {
    const id = setInterval(() => {
      setVal(v => Math.min(v + Math.floor(Math.random() * 60 + 10), max));
    }, intervalMs + Math.random() * 1000);
    return () => clearInterval(id);
  }, [max, intervalMs]);
  return val;
}

export interface RoundOfferLite {
  myPrice: number | null;
}

/** Officer-only stats overlay — masked while the round is open
 *  (anti-collusion), revealed once the round closes. */
export interface OfficerStats {
  bidderCount: number;
  /** Top bid price for the row — undefined while masked. */
  topPrice?:   number;
  /** True iff the round is open and the price must stay masked
   *  (anti-collusion). When false, `topPrice` is revealed. */
  masked:      boolean;
}

interface WeightCardProps {
  row:        RubberRow;
  myOffer:    RoundOfferLite | undefined;
  onOffer:    (row: RubberRow) => void;
  /** Round phase — controls whether the offer button is active.
   *  Bidding is only allowed when `phase === 'open'`. */
  roundPhase: RoundPhase;
  viewMode?:   'grid' | 'list';
  /** Who is looking at this card. `'officer'` swaps the right-side slot
   *  from the buyer's bid action to bid statistics, and hides
   *  `myOffer` (which is buyer-side only). Default `'buyer'`. */
  viewer?:    'buyer' | 'officer';
  /** Officer-only — bidder count + top price. Ignored when `viewer === 'buyer'`. */
  officerStats?: OfficerStats;
  /** Officer-only — click anywhere on the card body to drill in to the
   *  per-lot detail drawer. Ignored when `viewer === 'buyer'`. */
  onInspect?: (row: RubberRow) => void;
}

/**
 * One row on the live auction board — shows the lot's open price, animated
 * actual weight, optional "my offer" pill, and the offer / edit-offer button.
 *
 * Reused for both EUDR and Non-Green sections of the board.
 *
 * The offer button is locked when the round is not currently `open`, with the
 * label switching to `รอเปิดรอบ` / `รอบปิดแล้ว` so buyers can see why.
 */
export default function WeightCard({
  row, myOffer, onOffer, roundPhase, viewMode = 'grid',
  viewer = 'buyer', officerStats, onInspect,
}: WeightCardProps) {
  const actual = useLiveWeight(row.startActual, row.maxActual);
  const canBid = roundPhase === 'open';
  const isOfficer = viewer === 'officer';
  const inspectable = isOfficer && !!onInspect;
  // Hover-affordance + cursor cue when the card is drill-down enabled.
  const cardStyleBase = inspectable
    ? { cursor: 'pointer' as const, transition: 'box-shadow 0.15s ease, transform 0.15s ease' }
    : {};
  const handleCardClick = inspectable
    ? () => onInspect!(row)
    : undefined;

  // ── Officer right-side slot — replaces myOffer pill + buyer button ────────
  const officerStatsSlot = officerStats && (
    <div
      style={{
        padding: '6px 10px',
        borderRadius: 6,
        background: '#f6ffed',
        border: '1px solid #b7eb8f',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, color: '#8c8c8c' }}>
        <TeamOutlined style={{ marginRight: 4 }} />
        ผู้เสนอราคา {officerStats.bidderCount} ราย
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#1a7c3e', marginTop: 2 }}>
        {officerStats.masked
          ? <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 13 }}>
              ●●●●● <EyeInvisibleOutlined />
            </Text>
          : officerStats.topPrice !== undefined
            ? <>
                ราคาสูงสุด {officerStats.topPrice.toFixed(2)}
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 400, marginLeft: 2 }}>฿/กก.</Text>
              </>
            : <Text type="secondary">— ไม่มีผู้เสนอ —</Text>}
      </div>
    </div>
  );
  const lockReason =
    roundPhase === 'closed'   ? 'รอบนี้ปิดแล้ว — ไม่สามารถเสนอราคาได้' :
    roundPhase === 'upcoming' ? 'รอบยังไม่เปิด — รอให้ถึงเวลาเปิดรอบก่อน' :
                                '';
  const buttonLabel =
    roundPhase === 'closed'   ? 'รอบปิดแล้ว' :
    roundPhase === 'upcoming' ? 'รอเปิดรอบ' :
    myOffer                   ? 'แก้ไขราคาเสนอ' :
                                'เสนอราคา';
  const buttonIcon =
    roundPhase === 'closed'   ? <LockOutlined /> :
    roundPhase === 'upcoming' ? <ClockCircleOutlined /> :
                                <TrophyOutlined />;
  const tags = (
    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
      <Tag
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          color: row.color,
          background: `${row.color}1F`,
          borderColor: `${row.color}59`,
        }}
      >
        {row.grade}
      </Tag>
      <Tag style={{ margin: 0, fontSize: 11 }}>{row.gradeCode}</Tag>
      <Tag
        color={row.auctionType === 'network' ? 'geekblue' : 'gold'}
        style={{ margin: 0, fontSize: 11 }}
      >
        {row.auctionType === 'network' ? 'ประมูล ณ เครือข่าย' : 'ประมูล ณ ที่ตั้ง'}
      </Tag>
      {row.isEudr && <span className="badge-eudr">EUDR</span>}
    </div>
  );
  const offerButton = (
    <Tooltip title={!canBid ? lockReason : ''}>
      <Button
        type={canBid && myOffer ? 'default' : canBid ? 'primary' : 'default'}
        icon={buttonIcon}
        block
        size="small"
        disabled={!canBid}
        onClick={() => canBid && onOffer(row)}
        style={canBid && myOffer ? { borderColor: row.color, color: row.color } : undefined}
      >
        {buttonLabel}
      </Button>
    </Tooltip>
  );

  if (viewMode === 'list') {
    return (
      <Card
        size="small"
        style={{ borderLeft: `3px solid ${row.color}`, ...cardStyleBase }}
        styles={{ body: { padding: '12px 14px' } }}
        onClick={handleCardClick}
        hoverable={inspectable}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px', minWidth: 220 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', lineHeight: 1.3 }}>{row.typeName}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{row.market}</div>
            {tags}
            <div style={{ marginTop: 6 }}>
              <TappingInfo
                rubberType={row.typeName}
                tappingDate={row.tappingDate}
                receivedDate={row.receivedDate}
                drc={row.drc}
              />
            </div>
          </div>

          <div style={{ flex: '0 0 112px' }}>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาเปิด</div>
            <div style={{ fontWeight: 700, color: '#1a7c3e', fontSize: 14 }}>{row.openingPrice.toFixed(2)} ฿</div>
          </div>

          <div style={{ flex: '0 0 116px' }}>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>ประมาณ</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#595959' }}>
              {row.estimatedWeight.toLocaleString()} <span style={{ fontSize: 11 }}>กก.</span>
            </div>
          </div>

          <div style={{ flex: '0 0 116px' }}>
            <div style={{ fontSize: 11, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                className="animate-pulse"
                style={{ width: 6, height: 6, borderRadius: '50%', background: row.color, display: 'inline-block', flexShrink: 0 }}
              />
              จริง (live)
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: row.color }}>
              <AnimatedNumber value={actual} /> <span style={{ fontSize: 11, fontWeight: 400 }}>กก.</span>
            </div>
          </div>

          {isOfficer ? (
            <div style={{ flex: '0 0 220px' }}>
              {officerStatsSlot ?? (
                <Text type="secondary" style={{ fontSize: 11 }}>ไม่มีข้อมูลการเสนอราคา</Text>
              )}
            </div>
          ) : (
            <>
              <div style={{ flex: '0 0 128px' }}>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาที่เสนอ</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: myOffer ? '#1677ff' : '#8c8c8c' }}>
                  {myOffer ? `${myOffer.myPrice?.toFixed(2)} ฿/กก.` : '-'}
                </div>
              </div>

              <div style={{ flex: '0 0 154px' }}>
                {offerButton}
              </div>
            </>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      style={{ borderTop: `3px solid ${row.color}`, height: '100%', ...cardStyleBase }}
      styles={{ body: { padding: '14px 16px' } }}
      onClick={handleCardClick}
      hoverable={inspectable}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', lineHeight: 1.3 }}>{row.typeName}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{row.market}</div>
          {tags}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาเปิด</div>
          <div style={{ fontWeight: 700, color: '#1a7c3e', fontSize: 14 }}>{row.openingPrice.toFixed(2)} ฿</div>
        </div>
      </div>

      {/* Tapping / received / DRC */}
      <div style={{ marginBottom: 8 }}>
        <TappingInfo
          rubberType={row.typeName}
          tappingDate={row.tappingDate}
          receivedDate={row.receivedDate}
          drc={row.drc}
        />
      </div>

      {/* Live weights */}
      <Row gutter={8}>
        <Col span={12}>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>ประมาณ</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#595959' }}>
            {row.estimatedWeight.toLocaleString()} <span style={{ fontSize: 11 }}>กก.</span>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ fontSize: 11, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              className="animate-pulse"
              style={{ width: 6, height: 6, borderRadius: '50%', background: row.color, display: 'inline-block', flexShrink: 0 }}
            />
            จริง (live)
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: row.color }}>
            <AnimatedNumber value={actual} /> <span style={{ fontSize: 11, fontWeight: 400 }}>กก.</span>
          </div>
        </Col>
      </Row>

      {/* Buyer's pill — hidden in officer view */}
      {!isOfficer && myOffer && (
        <div
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            background: '#f0f5ff',
            border: '1px solid #adc6ff',
            textAlign: 'center',
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาที่เสนอ</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1677ff' }}>
            {myOffer.myPrice?.toFixed(2)} ฿/กก.
          </div>
        </div>
      )}

      {/* Officer stats — bid count + masked/revealed top price */}
      {isOfficer && officerStatsSlot && (
        <div style={{ marginTop: 10 }}>
          {officerStatsSlot}
        </div>
      )}

      {/* Bid action — buyer only */}
      {!isOfficer && offerButton}
    </Card>
  );
}
