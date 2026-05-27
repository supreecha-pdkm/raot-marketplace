'use client';

/**
 * Top-level orchestrator for the buyer auction page.
 *
 * Owns the tab selection, the buyer's signed-up markets, the active market
 * + round selection, and the merged offer/review modal flow (`useOfferFlow`).
 *
 * Each tab body lives in its own component; the modal sits at the shell
 * level so an in-progress submit survives tab switches.
 */

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Card, Menu, Badge } from 'antd';
import {
  AppstoreOutlined, HistoryOutlined, CalendarOutlined,
} from '@ant-design/icons';

import BoardTab        from './board-tab';
import SchedulePanel   from './schedule-panel';
import HistoryTab      from './history-tab';
import OfferModal      from './offer-modal';
import { useOfferFlow } from '../hooks/use-offer-flow';
import {
  type AuctionRound,
  getRoundsForMarketOnDate, getRoundById,
} from '../services/auction-rounds';
import { getSession } from '@/features/auth/services/auth';

type TabKey = 'board' | 'schedule' | 'history';

export default function BuyerAuctionShell() {
  const [menuKey, setMenuKey] = useState<TabKey>('board');

  // ── Buyer's signed-up markets ─────────────────────────────────────────────
  // Loaded once from the session — `user.markets` is populated at
  // registration. Fall back to the legacy singular `user.market` for
  // accounts that pre-date the multi-market field.
  const [buyerMarkets] = useState<string[]>(() => {
    const user = getSession()?.user;
    if (user?.markets && user.markets.length > 0) return user.markets;
    if (user?.market) return [user.market];
    return [];
  });

  // ── Market selection — defaults to the buyer's first signed-up market ────
  const [selectedMarket, setSelectedMarket] = useState<string | null>(
    () => buyerMarkets[0] ?? null,
  );

  // ── Round selection — driven by the admin's auction-round config ─────────
  const today = useMemo(() => dayjs(), []);
  const marketRounds: AuctionRound[] = useMemo(
    () => selectedMarket ? getRoundsForMarketOnDate(selectedMarket, today) : [],
    [selectedMarket, today],
  );
  // User's explicit pick — null means "auto-pick the first available". We
  // derive the effective id below rather than setting state in an effect.
  const [pickedRoundId, setPickedRoundId] = useState<string | null>(null);
  const effectiveRoundId = pickedRoundId && marketRounds.some(r => r.id === pickedRoundId)
    ? pickedRoundId
    : (marketRounds[0]?.id ?? null);

  const selectedRound = effectiveRoundId ? getRoundById(effectiveRoundId) : null;
  const roundLabel    = selectedRound
    ? `${selectedRound.name} · ${selectedRound.startTime}–${selectedRound.endTime}`
    : 'ยังไม่เลือกรอบ';

  // Offer flow — keyed to the effective round id so switching rounds shows
  // different "my offer" pills on the weight cards.
  const offer = useOfferFlow(effectiveRoundId);

  const handleSelectMarket = (market: string) => {
    setSelectedMarket(market);
    setPickedRoundId(null); // fall back to the new market's first round
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* ── Top navigation menu ───────────────────────────────────────────── */}
      <Card
        styles={{ body: { padding: 0 } }}
        style={{ borderRadius: '12px 12px 0 0', borderBottom: 'none', marginBottom: 0 }}
      >
        <Menu
          mode="horizontal"
          selectedKeys={[menuKey]}
          onClick={({ key }) => setMenuKey(key as TabKey)}
          style={{ borderBottom: 'none', padding: '0 16px' }}
          items={[
            {
              key: 'board',
              icon: <AppstoreOutlined />,
              label: (
                <span>
                  กระดานประมูล
                  <Badge
                    count={offer.currentRoundOffers.length}
                    size="small"
                    style={{ marginLeft: 6, background: '#1a7c3e' }}
                  />
                </span>
              ),
            },
            { key: 'schedule', icon: <CalendarOutlined />, label: 'Schedule รอบประมูล' },
            { key: 'history',  icon: <HistoryOutlined />,  label: 'ประวัติการประมูล' },
          ]}
        />
      </Card>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      {menuKey === 'board' && (
        <BoardTab
          buyerMarkets={buyerMarkets}
          selectedMarket={selectedMarket}
          onSelectMarket={handleSelectMarket}
          marketRounds={marketRounds}
          selectedRound={selectedRound}
          onSelectRoundId={setPickedRoundId}
          currentRoundOffers={offer.currentRoundOffers}
          onOpenOffer={offer.openOffer}
          onDeleteOffer={offer.deleteOffer}
        />
      )}
      {menuKey === 'schedule' && (
        <div style={{ paddingTop: 16 }}>
          <SchedulePanel />
        </div>
      )}
      {menuKey === 'history' && <HistoryTab />}

      {/* ── Merged offer + review modal — page-level so it survives tab switches ── */}
      <OfferModal
        target={offer.offerModal}
        form={offer.offerForm}
        showSuccess={offer.offerSuccess}
        roundLabel={roundLabel}
        previewIdx={offer.previewIdx}
        onPreviewIdx={offer.setPreviewIdx}
        onFormSubmit={offer.handleOfferFormSubmit}
        onCancel={offer.closeOffer}
        confirmState={offer.confirmSubmit}
        countdownSec={offer.countdownSec}
        submitting={offer.submitting}
        onCancelReview={offer.cancelConfirm}
        onConfirm={offer.confirmAndSubmit}
      />
    </div>
  );
}
