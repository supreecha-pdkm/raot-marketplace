'use client';

import {
  Modal, Form, Row, Col, Tag, Button, Alert, Progress, Typography,
  type FormInstance,
} from 'antd';
import {
  TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import InputNumberSuffix from '@/shared/components/input-number-suffix';
import TappingInfo from '@/features/auctions/components/tapping-info';
import { IMAGES_BY_TYPE } from '@/features/auctions/services/auction-mock';
import {
  HIGH_PRICE_MULTIPLIER, MARKET_FEE_PER_KG, MIN_BID_INCREMENT,
} from '@/features/auctions/utils/auction-constants';
import type {
  ConfirmSubmitState, OfferModalTarget,
} from '@/features/auctions/hooks/use-offer-flow';

const { Title, Text } = Typography;

interface OfferModalProps {
  /** Currently-targeted lot. Modal is open iff this is non-null. */
  target:        OfferModalTarget | null;
  /** Antd Form instance from `useOfferFlow`. */
  form:          FormInstance<{ price: number }>;
  /** True after a successful submit — switches the body to a success splash. */
  showSuccess:   boolean;
  /** Round label to display in the title chip. */
  roundLabel:    string;
  /** Active image index in the gallery. */
  previewIdx:    number;
  /** Setter for the active image index — also wired to thumbnail clicks. */
  onPreviewIdx:  (idx: number) => void;
  /** Form submit handler — arms the inline countdown lock. */
  onFormSubmit:  (values: { price: number }) => void;
  /** Close the modal (cancel / X). */
  onCancel:      () => void;

  // ─── Armed countdown state ────────────────────────────────────────────────
  /** Non-null while the inline review countdown is running. */
  confirmState:  ConfirmSubmitState | null;
  /** Seconds remaining on the review lock; 0 → ready to commit. */
  countdownSec:  number;
  /** True while the submit promise is in flight. */
  submitting:    boolean;
  /** Disarm — returns to editable form state. */
  onCancelReview:() => void;
  /** Commit the bid (no-op until countdown elapses). */
  onConfirm:     () => void;
}

/**
 * Offer dialog — single continuous layout with no step transition.
 *
 *   1. Buyer sees photos, lot summary, price input, and a **live** cost
 *      breakdown that updates as they type.
 *   2. Submitting the form arms the inline countdown lock on the submit
 *      button (no second screen). High prices get a longer lock window.
 *   3. Once unlocked, the same button commits the bid → success splash.
 *
 * Compared to the older two-step flow this eliminates the duplicate lot
 * summary and the perceived modal-on-modal feel.
 */
export default function OfferModal({
  target, form, showSuccess, roundLabel,
  previewIdx, onPreviewIdx, onFormSubmit, onCancel,
  confirmState, countdownSec, submitting, onCancelReview, onConfirm,
}: OfferModalProps) {
  // Block close while a submit is in flight.
  const closable = !submitting;

  return (
    <Modal
      open={!!target}
      onCancel={onCancel}
      footer={null}
      mask={{ closable }}
      closable={closable}
      destroyOnHidden
      title={target && (
        <span>
          <TrophyOutlined style={{ color: '#1a7c3e', marginRight: 8 }} />
          {target.existingPrice !== null ? 'แก้ไขราคาเสนอ' : 'เสนอราคา'} — {target.row.typeName}
          <Tag style={{ marginLeft: 8 }}>{target.row.grade}</Tag>
          <Tag style={{ marginLeft: 4 }}>{roundLabel}</Tag>
        </span>
      )}
      width={920}
    >
      {!target ? null : showSuccess
        ? <SuccessSplash />
        : <OfferBody
            target={target}
            form={form}
            previewIdx={previewIdx}
            onPreviewIdx={onPreviewIdx}
            onFormSubmit={onFormSubmit}
            onCancel={onCancel}
            confirmState={confirmState}
            countdownSec={countdownSec}
            submitting={submitting}
            onCancelReview={onCancelReview}
            onConfirm={onConfirm}
          />}
    </Modal>
  );
}

// ─── Sub: success splash ─────────────────────────────────────────────────────
function SuccessSplash() {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a' }} />
      <Title level={4} style={{ marginTop: 16, color: '#1a7c3e' }}>ส่งราคาสำเร็จ!</Title>
      <Text type="secondary">ระบบจะจับคู่ LOT ให้อัตโนมัติ</Text>
    </div>
  );
}

// ─── Sub: single-step body ───────────────────────────────────────────────────
function OfferBody({
  target, form, previewIdx, onPreviewIdx, onFormSubmit, onCancel,
  confirmState, countdownSec, submitting, onCancelReview, onConfirm,
}: {
  target:        OfferModalTarget;
  form:          FormInstance<{ price: number }>;
  previewIdx:    number;
  onPreviewIdx:  (idx: number) => void;
  onFormSubmit:  (values: { price: number }) => void;
  onCancel:      () => void;
  confirmState:  ConfirmSubmitState | null;
  countdownSec:  number;
  submitting:    boolean;
  onCancelReview:() => void;
  onConfirm:     () => void;
}) {
  const { row, existingPrice } = target;
  const images  = IMAGES_BY_TYPE[row.typeKey] ?? [];
  const safeIdx = Math.min(previewIdx, Math.max(images.length - 1, 0));
  const armed   = !!confirmState;

  // Min-bid rules:
  //   • First-time bid in this round → must clear opening + MIN_BID_INCREMENT.
  //   • Editing an existing bid → must strictly exceed the previous price.
  const isEditing = existingPrice !== null;
  const minBid    = isEditing
    ? existingPrice + 0.01            // strictly greater than the previous price
    : row.openingPrice + MIN_BID_INCREMENT;
  const minBidLabel = isEditing
    ? `${existingPrice.toFixed(2)} ฿/กก. (ราคาเดิม)`
    : `${(row.openingPrice + MIN_BID_INCREMENT).toFixed(2)} ฿/กก. (ราคาเปิด +${MIN_BID_INCREMENT})`;
  const minBidError = isEditing
    ? `ราคาต้องสูงกว่าราคาที่เคยเสนอ (${existingPrice.toFixed(2)} ฿/กก.)`
    : `ราคาต้องสูงกว่าราคาเปิดอย่างน้อย ${MIN_BID_INCREMENT} ฿/กก. (เริ่มที่ ${(row.openingPrice + MIN_BID_INCREMENT).toFixed(2)})`;

  // Live cost breakdown — once armed we lock to the confirmed price; before
  // that, we re-compute from the form's current value so the buyer sees their
  // total update as they type.
  const livePrice = Form.useWatch('price', form) ?? row.openingPrice;
  const price     = confirmState?.price ?? Number(livePrice);
  const isHigh    = price > row.openingPrice * HIGH_PRICE_MULTIPLIER;
  const delta     = price - row.openingPrice;
  const deltaPct  = (delta / row.openingPrice) * 100;
  const rubberValue = price * row.estimatedWeight;
  const feeTotal    = MARKET_FEE_PER_KG * row.estimatedWeight;
  const grandTotal  = rubberValue + feeTotal;
  const ready       = armed && countdownSec <= 0;
  const initialCountdown = confirmState?.initialCountdown ?? 0;
  const progressPct = initialCountdown > 0
    ? Math.round(((initialCountdown - countdownSec) / initialCountdown) * 100)
    : 0;
  const accent = isHigh ? '#fa8c16' : '#1677ff';

  return (
    <Row gutter={[20, 16]}>
      {/* ─── Left column: photo gallery ───────────────────────────────────── */}
      {images.length > 0 && (
        <Col xs={24} md={11}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 3',
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
                  backdropFilter: 'blur(4px)',
                }}
              >
                {safeIdx + 1} / {images.length}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              {images.map((src, i) => {
                const active = i === safeIdx;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => onPreviewIdx(i)}
                    aria-label={`ดูภาพที่ ${i + 1}`}
                    aria-current={active}
                    style={{
                      flex: '0 0 auto', width: 64, height: 48,
                      borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                      padding: 0, background: '#fff',
                      border: active ? `2px solid ${row.color}` : '2px solid transparent',
                      opacity: active ? 1 : 0.7,
                      transition: 'opacity 0.15s ease, border-color 0.15s ease',
                      boxShadow: active ? `0 0 0 2px ${row.color}30` : 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.opacity = '0.7'; }}
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
        </Col>
      )}

      {/* ─── Right column: lot summary + form + actions ───────────────────── */}
      <Col xs={24} md={images.length > 0 ? 13 : 24}>

      {/* Opening price + estimated weight + EUDR tag + tapping info — single
          consolidated lot panel (was previously duplicated across two steps). */}
      <div style={{ padding: 12, borderRadius: 8, background: `${row.color}10`, border: `1px solid ${row.color}30`, marginBottom: 12 }}>
        <Row gutter={12} align="middle" style={{ marginBottom: 8 }}>
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
          <div style={{ paddingTop: 8, borderTop: `1px dashed ${row.color}30` }}>
            <TappingInfo
              rubberType={row.typeName}
              tappingDate={row.tappingDate}
              receivedDate={row.receivedDate}
              drc={row.drc}
            />
          </div>
        )}
      </div>

      {/* Bid form */}
      <Form form={form} onFinish={onFormSubmit} layout="vertical" disabled={armed}>
        <Form.Item
          name="price"
          label={
            <span>
              ราคาที่ต้องการเสนอ (฿/กก.)
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 6, fontWeight: 400 }}>
                · ต่ำสุด {minBidLabel}
              </Text>
            </span>
          }
          rules={[
            { required: true, message: 'กรุณากรอกราคา' },
            {
              validator: (_, v) => (typeof v === 'number' && v >= minBid)
                ? Promise.resolve()
                : Promise.reject(minBidError),
            },
          ]}
        >
          <InputNumberSuffix
            min={minBid} step={0.25} precision={2}
            size="large" style={{ width: '100%' }} suffix="฿/กก."
          />
        </Form.Item>
      </Form>

      {/* Live cost breakdown — updates as user types (or freezes once armed) */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          background: armed ? `${accent}0F` : '#fafafa',
          border: `1px solid ${armed ? `${accent}55` : '#f0f0f0'}`,
          marginBottom: 12,
          transition: 'background 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: '#595959', fontWeight: 500 }}>
            สรุปยอด <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>(อิงน้ำหนักประมาณ)</Text>
          </span>
          {Number.isFinite(price) && price > row.openingPrice && (
            <Tag
              color={isHigh ? 'warning' : 'blue'}
              style={{ margin: 0, fontSize: 11 }}
            >
              {delta >= 0 ? '+' : ''}{delta.toFixed(2)} ฿ ({deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%)
            </Tag>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: '#595959' }}>
            มูลค่ายาง
            <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
              ({Number.isFinite(price) ? price.toFixed(2) : '—'} × {row.estimatedWeight.toLocaleString()})
            </Text>
          </span>
          <span style={{ fontWeight: 500 }}>
            {Number.isFinite(rubberValue) ? Math.round(rubberValue).toLocaleString() : '—'} ฿
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: '#595959' }}>
            ค่าธรรมเนียมตลาด
            <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
              ({MARKET_FEE_PER_KG.toFixed(2)} × {row.estimatedWeight.toLocaleString()})
            </Text>
          </span>
          <span style={{ fontWeight: 500 }}>
            {Math.round(feeTotal).toLocaleString()} ฿
          </span>
        </div>

        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingTop: 8, borderTop: '1px dashed #d9d9d9',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>ยอดรวมประมาณ</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: accent }}>
            {Number.isFinite(grandTotal) ? Math.round(grandTotal).toLocaleString() : '—'}
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400, marginLeft: 4 }}>฿</Text>
          </span>
        </div>
      </div>

      {/* Inline high-price warning — shown live as buyer types; replaces the
          old review-step alert. */}
      {isHigh && Number.isFinite(price) && price > row.openingPrice && (
        <Alert
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 12 }}
          title={`ราคาเสนอสูงกว่าราคาเปิด +${deltaPct.toFixed(1)}%`}
          description="ระบบจะหน่วงเวลายืนยันนานขึ้นเพื่อให้คุณตรวจสอบราคาอีกครั้ง"
        />
      )}

      {/* Blind-auction reminder — kept short, single line */}
      {!armed && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          title="การประมูลนี้เป็นแบบปิด — ราคาของผู้เสนอรายอื่นจะไม่ถูกเปิดเผย"
        />
      )}

      {/* Armed countdown — only renders while the lock is active */}
      {armed && (
        <div style={{ marginBottom: 12 }}>
          <Progress percent={progressPct} showInfo={false} strokeColor={accent} size="small" />
          <div style={{ marginTop: 4, fontSize: 11, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockCircleOutlined />
            {ready
              ? <strong style={{ color: '#1a7c3e' }}>พร้อมส่ง — กดยืนยันอีกครั้ง</strong>
              : `กำลังตรวจสอบ… ${countdownSec} วินาที`}
          </div>
        </div>
      )}

      {/* Single action bar — same row whether idle or armed */}
      <Row gutter={8}>
        <Col span={12}>
          <Button
            block
            onClick={armed ? onCancelReview : onCancel}
            disabled={submitting}
          >
            {armed ? 'แก้ไขราคา' : 'ยกเลิก'}
          </Button>
        </Col>
        <Col span={12}>
          <Button
            type="primary"
            block
            icon={<TrophyOutlined />}
            onClick={armed ? onConfirm : () => form.submit()}
            loading={submitting}
            disabled={armed && !ready}
            style={(armed && ready) ? { background: '#1a7c3e', borderColor: '#1a7c3e' } : undefined}
          >
            {submitting
              ? 'กำลังส่ง...'
              : !armed
                ? 'ยืนยันส่งราคา'
                : ready
                  ? 'ยืนยันส่งราคา'
                  : `รอ ${countdownSec} วินาที`}
          </Button>
        </Col>
      </Row>
      </Col>
    </Row>
  );
}
