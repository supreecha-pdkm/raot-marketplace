'use client';

/**
 * Officer-side lot detail drawer.
 *
 * Opens when an officer clicks a WeightCard in the auction-control list or
 * a row in the announcement screen. Shows everything the officer is
 * allowed to see at the current phase:
 *
 *   • Photo gallery + lot meta (same data the buyer sees on the modal)
 *   • Bidder table — masked with ●●●●● while the round is OPEN
 *     (anti-collusion), revealed when the round is closed
 *   • Winner panel — only when an announcement record exists
 *
 * Read-only — there's no bid action here. Buyer's `OfferModal` handles the
 * write side; this drawer is the officer's inspector.
 */

import { useState } from 'react';
import {
  Drawer, Row, Col, Tag, Space, Typography, Table, Empty, Alert,
  Button, App as AntApp,
} from 'antd';
import {
  TrophyOutlined, TeamOutlined, EyeInvisibleOutlined,
  LockOutlined, CheckCircleOutlined, ClockCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import TappingInfo from './tapping-info';
import {
  IMAGES_BY_TYPE, type RubberRow,
} from '../services/auction-mock';
import {
  type AuctionRound, getRoundPhaseForRubberType, getRubberTypeCloseMeta,
  closeRoundRubberTypeManually,
} from '../services/auction-rounds';
import { type RubberTypeKey } from '../utils/auction-constants';
import { getSession } from '@/features/auth/services/auth';
import {
  getAnnouncementForRound, getBidsForRound,
  type BidCandidate, type RowWinner,
} from '../services/auction-results';

const { Title, Text } = Typography;

const LOT_DETAIL_DRAWER_WIDTH = 560;

export interface LotDetailTarget {
  row:   RubberRow;
  round: AuctionRound;
}

interface LotDetailDrawerProps {
  target:              LotDetailTarget | null;
  onClose:             () => void;
  onCloseRubberType?:  () => void;
}

export default function LotDetailDrawer({ target, onClose, onCloseRubberType }: LotDetailDrawerProps) {
  const { modal, message } = AntApp.useApp();
  // Tab through gallery images. Reset to 0 each time the drawer opens.
  const [previewIdx, setPreviewIdx] = useState(0);

  // Drawer is "open" iff target is non-null. We compute fresh data on every
  // open so the panel always reflects the latest store state.
  if (!target) {
    return <Drawer open={false} onClose={onClose} title={null} size={LOT_DETAIL_DRAWER_WIDTH} />;
  }

  const { row, round } = target;
  const images = IMAGES_BY_TYPE[row.typeKey] ?? [];
  const safeIdx = Math.min(previewIdx, Math.max(images.length - 1, 0));

  const phase   = getRoundPhaseForRubberType(round, dayjs(), row.typeKey);
  const rubberTypeCloseMeta = getRubberTypeCloseMeta(round, row.typeKey);
  const announcement = getAnnouncementForRound(round.id);
  const winner: RowWinner | null = announcement?.winners.find(w => w.rowKey === row.key) ?? null;

  // Bids for this row only. We always recompute the deterministic seed (same
  // bid pool the announcement saw) so the table renders identical content
  // whether the round is pending, closed, or announced — only the masking
  // changes.
  const allBids: BidCandidate[] = getBidsForRound(round, [row]);
  const ranked   = [...allBids].sort((a, b) => b.price - a.price);

  // Bidder-details policy — show the list always, mask the sensitive
  // columns until the announcement lands:
  //   • Round still OPEN → both name + price masked (anti-collusion)
  //   • Closed but NOT announced → prices revealed, names still masked so
  //     officers can audit pricing without leaking bidder identities
  //   • Announced → full reveal; winner row highlighted
  const isOpenRound  = phase === 'open' && !round.closedManuallyAt && !rubberTypeCloseMeta;
  const revealPrices = !isOpenRound;
  const revealNames  = !!announcement;

  /** Classify a bidder display name into person vs company so the masking
   *  length communicates type without leaking identity:
   *    • บริษัท / หจก. / ห้าง / Co. → company  → 14 asterisks
   *    • นาย / นาง / นางสาว / ดร. / "คุณ"   → person  → 6 asterisks
   *    • anything else                       → person fallback (shorter) */
  const bidderTypeOf = (name: string): 'company' | 'person' => {
    const trimmed = name.trim();
    if (
      /^(บริษัท|หจก\.?|ห้างหุ้นส่วน|ห้าง|Co\.|Ltd\.?|Inc\.?|Holdings?)\b/i.test(trimmed)
      || /(จำกัด|Industries?|Holdings?|Trading|Group)\b/i.test(trimmed)
    ) {
      return 'company';
    }
    return 'person';
  };
  const MASK_PERSON  = '******';            // 6 asterisks
  const MASK_COMPANY = '**************';     // 14 asterisks

  const handleCloseThisType = () => {
    modal.confirm({
      title: `ปิดรอบเฉพาะ ${row.typeName}?`,
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            รอบนี้กำหนดปิดเวลา <strong>{round.endTime} น.</strong> — หากกดยืนยัน
            ระบบจะปิดเฉพาะชนิดยาง <strong>{row.typeName}</strong> ทันที
            และผู้ซื้อจะไม่สามารถเสนอราคาชนิดนี้ได้อีก
          </p>
          <p style={{ marginBottom: 0, color: '#fa8c16' }}>
            <strong>เมื่อปิดแล้ว</strong> สามารถดำเนินขั้นตอน &ldquo;ประกาศผู้ชนะ&rdquo; สำหรับชนิดยางนี้ได้ในหน้าเมนูประกาศ
          </p>
        </div>
      ),
      okText: 'ปิดชนิดยางนี้ทันที',
      okButtonProps: { danger: true, icon: <StopOutlined /> },
      cancelText: 'ยกเลิก',
      onOk: () => {
        const officerName = getSession()?.user.fullName ?? 'เจ้าหน้าที่ประมูล';
        closeRoundRubberTypeManually(round.id, row.typeKey as RubberTypeKey, officerName);
        message.success(`ปิดรอบเฉพาะ ${row.typeName} เรียบร้อย — ชนิดยางอื่นยังประมูลต่อได้`);
        onCloseRubberType?.();
      },
    });
  };

  return (
    <Drawer
      open={!!target}
      onClose={onClose}
      size={LOT_DETAIL_DRAWER_WIDTH}
      footer={
        isOpenRound ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>ปิด</Button>
            <Button
              danger
              icon={<StopOutlined />}
              onClick={handleCloseThisType}
            >
              ปิดรอบ{row.typeName}
            </Button>
          </div>
        ) : null
      }
      title={
        <Space size={6} wrap>
          <TrophyOutlined style={{ color: row.color }} />
          <span style={{ fontWeight: 600 }}>{row.typeName}</span>
          <Tag style={{ margin: 0, color: row.color, background: `${row.color}1F`, borderColor: `${row.color}59` }}>
            {row.grade}
          </Tag>
          <Tag style={{ margin: 0, fontSize: 11 }}>{row.gradeCode}</Tag>
          {row.isEudr && <span className="badge-eudr">EUDR</span>}
        </Space>
      }
      extra={
        winner ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>ประกาศแล้ว</Tag>
        ) : isOpenRound ? (
          <Tag color="processing" icon={<ClockCircleOutlined />}>รอบเปิดอยู่</Tag>
        ) : (
          <Tag color="warning" icon={<LockOutlined />}>ปิดรอบ · รอประกาศ</Tag>
        )
      }
    >
      {/* ── Photo gallery ───────────────────────────────────────────────── */}
      {images.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              aspectRatio: '16 / 9',
              borderRadius: 10,
              overflow: 'hidden',
              background: '#f5f5f5',
              border: `1px solid ${row.color}40`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={images[safeIdx]}
              src={images[safeIdx]}
              alt={`${row.typeName} — ภาพที่ ${safeIdx + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute', right: 10, bottom: 10,
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                fontSize: 11, fontWeight: 500,
                padding: '3px 10px', borderRadius: 999,
              }}
            >
              {safeIdx + 1} / {images.length}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {images.map((src, i) => {
              const active = i === safeIdx;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setPreviewIdx(i)}
                  aria-label={`ดูภาพที่ ${i + 1}`}
                  aria-current={active}
                  style={{
                    flex: '0 0 auto', width: 68, height: 48,
                    borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                    padding: 0, background: '#fff',
                    border: active ? `2px solid ${row.color}` : '2px solid transparent',
                    opacity: active ? 1 : 0.7,
                    transition: 'opacity 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`ภาพย่อ ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Round + market header ──────────────────────────────────────── */}
      <div
        style={{
          padding: 12,
          borderRadius: 8,
          background: '#fafafa',
          border: '1px solid #f0f0f0',
          marginBottom: 12,
        }}
      >
        <Space size={6} wrap>
          <Text strong style={{ fontSize: 13 }}>
            {round.name} ({round.startTime}–{round.endTime})
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>· {round.date}</Text>
        </Space>
        <div style={{ marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {round.market} · {round.auctionType === 'network' ? 'ประมูล ณ เครือข่าย' : 'ประมูล ณ ที่ตั้ง'}
          </Text>
        </div>
        {round.closedManuallyAt && (
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
            <LockOutlined style={{ marginRight: 4 }} />
            ปิดเองโดย <strong>{round.closedManuallyBy ?? 'เจ้าหน้าที่'}</strong> เมื่อ{' '}
            {dayjs(round.closedManuallyAt).format('DD/MM/YYYY HH:mm')}
          </Text>
        )}
        {rubberTypeCloseMeta && !round.closedManuallyAt && (
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
            <LockOutlined style={{ marginRight: 4 }} />
            ปิดเฉพาะชนิดยางนี้โดย <strong>{rubberTypeCloseMeta.closedBy}</strong> เมื่อ{' '}
            {dayjs(rubberTypeCloseMeta.closedAt).format('DD/MM/YYYY HH:mm')}
          </Text>
        )}
      </div>

      {/* ── Lot meta ────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: 12,
          borderRadius: 8,
          background: `${row.color}10`,
          border: `1px solid ${row.color}30`,
          marginBottom: 12,
        }}
      >
        <Row gutter={12}>
          <Col span={12}>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>ราคาเปิด</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {row.openingPrice.toFixed(2)}
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>฿/กก.</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>น้ำหนักประมาณ</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {row.estimatedWeight.toLocaleString()}
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>กก.</Text>
            </div>
          </Col>
        </Row>
        {(row.tappingDate || row.receivedDate || row.drc !== undefined) && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${row.color}30` }}>
            <TappingInfo
              rubberType={row.typeName}
              tappingDate={row.tappingDate}
              receivedDate={row.receivedDate}
              drc={row.drc}
            />
          </div>
        )}
      </div>

      {/* ── Winner panel — only when announced ─────────────────────────── */}
      {winner && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 10,
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            marginBottom: 12,
          }}
        >
          <Title level={5} style={{ margin: 0, color: '#1a7c3e' }}>
            <TrophyOutlined style={{ marginRight: 6 }} />
            ผู้ชนะการประมูล
          </Title>
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <Space size={4}>
              <Text strong style={{ fontSize: 14 }}>{winner.buyerLabel}</Text>
              {winner.isMine && <Tag color="processing" style={{ margin: 0, fontSize: 11 }}>คุณ</Tag>}
            </Space>
            <Text strong style={{ color: '#1a7c3e', fontSize: 18 }}>
              {winner.winningPrice.toFixed(2)}
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 400, marginLeft: 2 }}>฿/กก.</Text>
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
            ประกาศโดย {announcement?.announcedBy} · {announcement && dayjs(announcement.announcedAt).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
      )}

      {/* ── Bidder list — hidden until officer presses ประกาศผู้ชนะ ───── */}
      <div style={{ marginTop: 4 }}>
        <Space size={6} style={{ marginBottom: 8 }}>
          <TeamOutlined style={{ color: '#8c8c8c' }} />
          <Text strong style={{ fontSize: 13 }}>ผู้เสนอราคา ({ranked.length} ราย)</Text>
        </Space>

        {/* Privacy notice — what's masked depends on phase + announcement */}
        {isOpenRound && (
          <Alert
            type="warning"
            showIcon
            icon={<EyeInvisibleOutlined />}
            style={{ marginBottom: 8 }}
            title="ราคา + รายชื่อถูกปิดไว้ระหว่างรอบเปิด"
            description="ราคาจะเปิดเผยเมื่อรอบปิด · รายชื่อจะเปิดเผยหลังเจ้าหน้าที่กด ประกาศผู้ชนะ"
          />
        )}
        {!isOpenRound && !announcement && (
          <Alert
            type="info"
            showIcon
            icon={<EyeInvisibleOutlined />}
            style={{ marginBottom: 8 }}
            title="ราคาเปิดเผยแล้ว — รายชื่อจะเปิดเผยหลังประกาศผู้ชนะ"
            description="ไปที่เมนู ประกาศผู้ชนะ เพื่อตรวจสอบและกดประกาศ"
          />
        )}

        {ranked.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="ไม่มีผู้เสนอราคาในรอบนี้" />
        ) : (
          <Table<BidCandidate & { rank: number }>
            size="small"
            pagination={false}
            rowKey={(b) => `${b.buyerId}:${b.price}:${b.rank}`}
            dataSource={ranked.map((b, i) => ({ ...b, rank: i + 1 }))}
            rowClassName={(b) =>
              winner && b.buyerId === winner.buyerId && b.price === winner.winningPrice
                ? 'lot-detail-winner-row'
                : ''
            }
            columns={[
              {
                title: '#', dataIndex: 'rank', width: 40,
                render: (r: number) => (
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22, borderRadius: '50%',
                      background: r === 1 ? '#1a7c3e' : '#bfbfbf',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                    }}
                  >
                    {r}
                  </span>
                ),
              },
              {
                title: 'ผู้เสนอ',
                render: (b: BidCandidate) => {
                  if (revealNames) {
                    return (
                      <Space size={4}>
                        <Text style={{ fontSize: 12 }}>{b.buyerName}</Text>
                        {b.isMine && <Tag color="processing" style={{ margin: 0, fontSize: 10 }}>คุณ</Tag>}
                      </Space>
                    );
                  }
                  // Mask length alone conveys person vs company — officers
                  // can read it at a glance without an explicit tag.
                  const type = bidderTypeOf(b.buyerName);
                  const mask = type === 'company' ? MASK_COMPANY : MASK_PERSON;
                  return (
                    <Space size={4}>
                      <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: 2 }}>
                        {mask} <EyeInvisibleOutlined />
                      </Text>
                      {b.isMine && <Tag color="processing" style={{ margin: 0, fontSize: 10 }}>คุณ</Tag>}
                    </Space>
                  );
                },
              },
              {
                title: 'ราคาเสนอ',
                align: 'right' as const,
                render: (b: BidCandidate) => (
                  revealPrices
                    ? <Text strong style={{ color: '#1a7c3e' }}>
                        {b.price.toFixed(2)}
                        <Text type="secondary" style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>฿/กก.</Text>
                      </Text>
                    : <Text type="secondary" style={{ fontFamily: 'monospace', letterSpacing: 2 }}>****</Text>
                ),
              },
              {
                title: 'สถานะ',
                width: 90,
                render: (b: BidCandidate) => {
                  if (!winner) {
                    // Pre-announcement: still hint who's leading after the round closes.
                    return b === ranked[0] && revealPrices
                      ? <Tag color="success">นำอยู่</Tag>
                      : null;
                  }
                  return b.buyerId === winner.buyerId && b.price === winner.winningPrice
                    ? <Tag color="success" icon={<TrophyOutlined />}>ชนะการประมูล</Tag>
                    : <Tag>ไม่ได้รับคัดเลือก</Tag>;
                },
              },
            ]}
          />
        )}
      </div>

      <style jsx global>{`
        .lot-detail-winner-row > td {
          background: #f6ffed !important;
        }
      `}</style>
    </Drawer>
  );
}
