// Winner-announcement store.
//
// A round that has hit `end-time` is *closed* — buyers can no longer bid.
// It is **not yet announced**: the buyer doesn't know whether they won
// until an officer presses "ประกาศผู้ชนะ" on the auction-officer side.
//
// This module persists that announcement state in localStorage (POC) and
// exposes a couple of accessors used by both the officer announcement
// screen and the buyer history tab.

import { type AuctionRound } from './auction-rounds';
import { type RubberRow } from './auction-mock';
import type { RoundOffer } from '../hooks/use-offer-flow';

const STORE_KEY  = 'raot_round_announcements';
const OFFERS_KEY = 'raot_my_offers';

/** Winner of a single lot (row) within a round. */
export interface RowWinner {
  rowKey:       string;        // RubberRow.key
  buyerLabel:   string;        // display name (masked username, etc.)
  buyerId:      string;        // session user id or mock id
  winningPrice: number;
  /** True iff the winning bid was placed by the currently-signed-in buyer.
   *  POC convenience — production would compare buyer id to session. */
  isMine?:      boolean;
}

export interface RoundAnnouncement {
  roundId:     string;
  announcedAt: string;         // ISO timestamp
  announcedBy: string;         // officer display name
  winners:     RowWinner[];
}

// ─── Store I/O ───────────────────────────────────────────────────────────────
function readStore(): RoundAnnouncement[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') as RoundAnnouncement[];
  } catch {
    return [];
  }
}

function writeStore(rows: RoundAnnouncement[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(rows));
}

// ─── Lookups ─────────────────────────────────────────────────────────────────
export function getAnnouncements(): RoundAnnouncement[] {
  return readStore();
}

export function getAnnouncementForRound(roundId: string): RoundAnnouncement | null {
  return readStore().find(a => a.roundId === roundId) ?? null;
}

export function isRoundAnnounced(roundId: string): boolean {
  return !!getAnnouncementForRound(roundId);
}

/** Returns the winning info for a specific (round, row) pair if announced. */
export function getWinnerForRow(roundId: string, rowKey: string): RowWinner | null {
  return getAnnouncementForRound(roundId)?.winners.find(w => w.rowKey === rowKey) ?? null;
}


// ─── Bid pool — buyer offers + deterministic mock competitors ────────────────
function readMyOffers(): RoundOffer[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(OFFERS_KEY) ?? '[]') as RoundOffer[];
  } catch {
    return [];
  }
}

/** Mulberry32 — same deterministic PRNG used elsewhere in the codebase. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Common mock buyer names — picked deterministically per row so a re-render
// shows the same "competitor" every time.
const MOCK_BUYER_POOL = [
  { id: 'B-1041', name: 'บริษัท เอเชียรับเบอร์ จำกัด' },
  { id: 'B-1058', name: 'บริษัท สยาม-อินโดไทย จำกัด' },
  { id: 'B-1072', name: 'หจก. ใต้ยางทรัพย์รุ่งเรือง' },
  { id: 'B-1099', name: 'บริษัท Green Latex Holdings' },
  { id: 'B-1102', name: 'นายปรีชา ค้าสวนยาง' },
  { id: 'B-1117', name: 'บริษัท Andaman Rubber Industries' },
];

/** All known bids on a row in a round (current buyer's persisted offer +
 *  3–5 deterministic mock competitors). The officer announcement screen
 *  uses this list to pick the winner. */
export interface BidCandidate {
  rowKey:    string;
  buyerId:   string;
  buyerName: string;
  price:     number;
  isMine:    boolean;
}

export function getBidsForRound(round: AuctionRound, rows: RubberRow[]): BidCandidate[] {
  const myOffers = readMyOffers().filter(o => o.roundId === round.id);
  const rand     = mulberry32(round.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0));
  const out: BidCandidate[] = [];

  for (const row of rows) {
    // 3–5 competitors per row.
    const n = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const buyer = MOCK_BUYER_POOL[Math.floor(rand() * MOCK_BUYER_POOL.length)];
      // Bid range: opening × (1.00 .. 1.20). Round to 2-decimal multiples
      // of 0.25 to mimic the buyer flow's step={0.25}.
      const factor = 1 + rand() * 0.20;
      const raw    = row.openingPrice * factor;
      const price  = Math.round(raw * 4) / 4;
      out.push({
        rowKey:    row.key,
        buyerId:   buyer.id,
        buyerName: buyer.name,
        price,
        isMine:    false,
      });
    }
    // Append the buyer's own bid if they placed one.
    const myBid = myOffers.find(o => o.rowKey === row.key);
    if (myBid && myBid.myPrice !== null) {
      out.push({
        rowKey:    row.key,
        buyerId:   'me',
        buyerName: 'คุณ (ผู้ใช้นี้)',
        price:     myBid.myPrice,
        isMine:    true,
      });
    }
  }
  return out;
}

/** Compute the top bid per row from a flat bid list. */
export function topBidPerRow(bids: BidCandidate[]): Record<string, BidCandidate> {
  const top: Record<string, BidCandidate> = {};
  for (const b of bids) {
    if (!top[b.rowKey] || b.price > top[b.rowKey].price) {
      top[b.rowKey] = b;
    }
  }
  return top;
}

// ─── Mutations ───────────────────────────────────────────────────────────────
export interface AnnounceWinnersInput {
  roundId:     string;
  winners:     RowWinner[];
  announcedBy: string;
}

export function announceWinners(input: AnnounceWinnersInput): RoundAnnouncement {
  const existing = readStore();
  // Idempotent: announcing the same round twice replaces the prior entry.
  const filtered = existing.filter(a => a.roundId !== input.roundId);
  const record: RoundAnnouncement = {
    roundId:     input.roundId,
    announcedAt: new Date().toISOString(),
    announcedBy: input.announcedBy,
    winners:     input.winners,
  };
  writeStore([...filtered, record]);
  return record;
}


