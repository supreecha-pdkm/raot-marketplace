// Shared auction-round configuration.
//
// Both `/officer/auction-rounds` (CRUD) and `/buyer/auction` (board + countdown)
// read from this single store so admin edits show up immediately in the buyer
// view. POC persistence is localStorage; swap `readStore` / `writeStore` for
// a real API to wire production data.

import dayjs, { type Dayjs } from 'dayjs';
import {
  MARKET_SURAT, MARKET_NAKHON, MARKET_SONGKHLA,
  type AuctionType, type RoundPhase, type RubberTypeKey,
} from '../utils/auction-constants';

const STORE_KEY = 'raot_auction_rounds';

export interface ManualCloseMeta {
  closedAt: string;
  closedBy: string;
}

export interface AuctionRound {
  id:          string;
  name:        string;       // 'รอบเช้า'
  date:        string;       // 'YYYY-MM-DD'
  startTime:   string;       // 'HH:mm'
  endTime:     string;       // 'HH:mm'
  market:      string;
  auctionType: AuctionType;
  feePerKg:    number;
  active:      boolean;
  /** ISO timestamp — set when an auction officer ends the round early via
   *  the "ปิดรอบประมูล" action. Forces phase to `'closed'` even if the
   *  configured `endTime` hasn't been reached yet. */
  closedManuallyAt?: string;
  /** Display name of the officer who closed the round early. Shown in the
   *  countdown card and the round's audit trail. */
  closedManuallyBy?: string;
  /** Rubber-type-level manual close state. Lets an officer stop bidding for
   *  one rubber type while the rest of the round remains open. */
  closedRubberTypes?: Partial<Record<RubberTypeKey, ManualCloseMeta>>;
}

// ─── Seed (relative to today, so the demo always has past/today/future) ──────
function seedRounds(today: Dayjs): AuctionRound[] {
  const fmt = (d: Dayjs) => d.format('YYYY-MM-DD');
  return [
    { id: 'RND-0001', name: 'รอบเช้า',  date: fmt(today),                startTime: '09:00', endTime: '11:00', market: MARKET_SURAT,    auctionType: 'location', feePerKg: 0.25, active: true  },
    { id: 'RND-0002', name: 'รอบบ่าย',  date: fmt(today),                startTime: '13:00', endTime: '15:00', market: MARKET_SURAT,    auctionType: 'location', feePerKg: 0.25, active: true  },
    { id: 'RND-0003', name: 'รอบเย็น',  date: fmt(today),                startTime: '15:00', endTime: '17:00', market: MARKET_NAKHON,   auctionType: 'network',  feePerKg: 0.30, active: true  },
    { id: 'RND-0004', name: 'รอบเช้า',  date: fmt(today.add(1, 'day')),  startTime: '09:00', endTime: '11:00', market: MARKET_SURAT,    auctionType: 'location', feePerKg: 0.25, active: true  },
    { id: 'RND-0005', name: 'รอบสาย',   date: fmt(today.add(1, 'day')),  startTime: '11:00', endTime: '13:00', market: MARKET_SONGKHLA, auctionType: 'network',  feePerKg: 0.30, active: true  },
    { id: 'RND-0006', name: 'รอบบ่าย',  date: fmt(today.add(2, 'day')),  startTime: '13:00', endTime: '15:00', market: MARKET_NAKHON,   auctionType: 'location', feePerKg: 0.25, active: true  },
    { id: 'RND-0007', name: 'รอบพิเศษ', date: fmt(today.add(3, 'day')),  startTime: '16:00', endTime: '17:30', market: MARKET_SURAT,    auctionType: 'network',  feePerKg: 0.50, active: false },
    { id: 'RND-0008', name: 'รอบเช้า',  date: fmt(today.add(5, 'day')),  startTime: '09:00', endTime: '11:00', market: MARKET_SURAT,    auctionType: 'location', feePerKg: 0.25, active: true  },
    { id: 'RND-0009', name: 'รอบบ่าย',  date: fmt(today.add(7, 'day')),  startTime: '13:00', endTime: '15:00', market: MARKET_SONGKHLA, auctionType: 'network',  feePerKg: 0.30, active: true  },
    { id: 'RND-0010', name: 'รอบเช้า',  date: fmt(today.add(10, 'day')), startTime: '09:00', endTime: '11:00', market: MARKET_NAKHON,   auctionType: 'location', feePerKg: 0.25, active: true  },
  ];
}

// ─── Store I/O ───────────────────────────────────────────────────────────────
function readStore(): AuctionRound[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuctionRound[];
  } catch {
    return null;
  }
}

function writeStore(rows: AuctionRound[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(rows));
}

/** Returns the persisted rounds, seeding once if the store is empty.
 *  Safe to call on the server (returns empty array). */
export function getAuctionRounds(): AuctionRound[] {
  if (typeof window === 'undefined') return [];
  const existing = readStore();
  if (existing) return existing;
  const seeded = seedRounds(dayjs());
  writeStore(seeded);
  return seeded;
}

/** Persist the full list — used by admin CRUD. */
export function setAuctionRounds(rows: AuctionRound[]): void {
  writeStore(rows);
}

// ─── Filters / lookups ───────────────────────────────────────────────────────
/** Active rounds for a market on a specific date, sorted by start time. */
export function getRoundsForMarketOnDate(market: string, date: Dayjs): AuctionRound[] {
  const day = date.format('YYYY-MM-DD');
  return getAuctionRounds()
    .filter(r => r.active && r.market === market && r.date === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// ─── Phase / window helpers ──────────────────────────────────────────────────
function parseRoundBoundary(date: string, time: string): Dayjs {
  const [h, m] = time.split(':').map(Number);
  return dayjs(date).hour(h).minute(m).second(0).millisecond(0);
}

export function getRoundPhase(round: AuctionRound, now: Dayjs): RoundPhase {
  if (!round.active) return 'closed';
  if (round.closedManuallyAt) return 'closed';
  const start = parseRoundBoundary(round.date, round.startTime);
  const end   = parseRoundBoundary(round.date, round.endTime);
  if (now.isBefore(start)) return 'upcoming';
  if (now.isBefore(end))   return 'open';
  return 'closed';
}

export function isRubberTypeClosedManually(round: AuctionRound, typeKey: string): boolean {
  return !!round.closedRubberTypes?.[typeKey as RubberTypeKey]?.closedAt;
}

export function getRubberTypeCloseMeta(
  round: AuctionRound,
  typeKey: string,
): ManualCloseMeta | null {
  return round.closedRubberTypes?.[typeKey as RubberTypeKey] ?? null;
}

export function getRoundPhaseForRubberType(
  round: AuctionRound,
  now: Dayjs,
  typeKey: string,
): RoundPhase {
  if (isRubberTypeClosedManually(round, typeKey)) return 'closed';
  return getRoundPhase(round, now);
}

export interface RoundWindow {
  phase:       RoundPhase;
  target:      Dayjs;        // next significant boundary (start while upcoming, end while open)
  start:       Dayjs;
  end:         Dayjs;
  totalSec:    number;
  secondsLeft: number;
  elapsedSec:  number;
}

export function getRoundWindow(round: AuctionRound, now: Dayjs): RoundWindow {
  const start = parseRoundBoundary(round.date, round.startTime);
  const end   = parseRoundBoundary(round.date, round.endTime);
  const totalSec = Math.max(1, end.diff(start, 'second'));
  let phase: RoundPhase;
  let target: Dayjs;
  // Manual early close — treat as fully closed regardless of clock time.
  if (round.closedManuallyAt)   { phase = 'closed';   target = end;   }
  else if (!round.active)       { phase = 'closed';   target = end;   }
  else if (now.isBefore(start)) { phase = 'upcoming'; target = start; }
  else if (now.isBefore(end))   { phase = 'open';     target = end;   }
  else                          { phase = 'closed';   target = end;   }
  const secondsLeft = Math.max(0, target.diff(now, 'second'));
  const elapsedSec  = Math.max(0, Math.min(totalSec, now.diff(start, 'second')));
  return { phase, target, start, end, totalSec, secondsLeft, elapsedSec };
}

/** Mark a round as closed early. Subsequent `getRoundPhase` / `getRoundWindow`
 *  calls will return `'closed'` even if the configured end-time hasn't been
 *  reached yet. No-op if the round is already manually closed. */
export function closeRoundManually(roundId: string, closedBy: string): AuctionRound | null {
  const rows = getAuctionRounds();
  const idx  = rows.findIndex(r => r.id === roundId);
  if (idx < 0) return null;
  if (rows[idx].closedManuallyAt) return rows[idx];
  const next: AuctionRound = {
    ...rows[idx],
    closedManuallyAt: new Date().toISOString(),
    closedManuallyBy: closedBy,
  };
  const out = [...rows];
  out[idx] = next;
  setAuctionRounds(out);
  return next;
}

/** Mark a single rubber type inside a round as closed early. Other rubber
 *  types in the same round continue following the round clock. */
export function closeRoundRubberTypeManually(
  roundId: string,
  typeKey: RubberTypeKey,
  closedBy: string,
): AuctionRound | null {
  const rows = getAuctionRounds();
  const idx  = rows.findIndex(r => r.id === roundId);
  if (idx < 0) return null;
  if (rows[idx].closedRubberTypes?.[typeKey]) return rows[idx];
  const next: AuctionRound = {
    ...rows[idx],
    closedRubberTypes: {
      ...(rows[idx].closedRubberTypes ?? {}),
      [typeKey]: {
        closedAt: new Date().toISOString(),
        closedBy,
      },
    },
  };
  const out = [...rows];
  out[idx] = next;
  setAuctionRounds(out);
  return next;
}

/** Format seconds as `HH:MM:SS`. */
export function formatHMS(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Convenience — find by id (returns null if no longer in the store). */
export function getRoundById(id: string): AuctionRound | null {
  return getAuctionRounds().find(r => r.id === id) ?? null;
}
