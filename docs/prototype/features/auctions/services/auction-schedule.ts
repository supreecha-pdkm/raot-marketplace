// Auction round time helpers + mock schedule generator.
//
// Two responsibilities:
//   1. Compute the "phase" (upcoming/open/closed) of a scheduled round given
//      a reference time — used by the countdown card and the schedule cards.
//   2. Generate a stable mock schedule for the buyer's Schedule tab. Replace
//      `generateSchedule` with a real API call to keep the UI working.

import dayjs, { type Dayjs } from 'dayjs';
import {
  ALL_MARKETS, RUBBER_TYPE_KEYS,
  ROUND_OPTIONS, roundOptionFor,
  type AuctionType, type RoundPhase,
} from '../utils/auction-constants';

// ─── Round-window helper (used by RoundCountdownCard) ─────────────────────────
export interface RoundWindow {
  phase:       RoundPhase;
  target:      Dayjs;
  start:       Dayjs;
  end:         Dayjs;
  totalSec:    number;
  secondsLeft: number;
  elapsedSec:  number;
}

/** Compute the time-window status for `round` at moment `now`. Returns null
 *  when the round number doesn't match a known slot. */
export function getRoundWindow(round: number, now: Dayjs): RoundWindow | null {
  const opt = roundOptionFor(round);
  if (!opt) return null;
  const start = now.startOf('day').hour(opt.startH).minute(0).second(0).millisecond(0);
  const end   = now.startOf('day').hour(opt.endH).minute(0).second(0).millisecond(0);
  const totalSec = Math.max(1, end.diff(start, 'second'));
  let phase: RoundPhase;
  let target: Dayjs;
  if (now.isBefore(start))     { phase = 'upcoming'; target = start; }
  else if (now.isBefore(end))  { phase = 'open';     target = end;   }
  else                         { phase = 'closed';   target = end;   }
  const secondsLeft = Math.max(0, target.diff(now, 'second'));
  const elapsedSec  = Math.max(0, Math.min(totalSec, now.diff(start, 'second')));
  return { phase, target, start, end, totalSec, secondsLeft, elapsedSec };
}

/** Format seconds as `HH:MM:SS`. */
export function formatHMS(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Schedule data ────────────────────────────────────────────────────────────
export interface ScheduledRound {
  id:                string;
  date:              string;     // 'YYYY-MM-DD'
  round:             number;     // 1..4
  market:            string;
  auctionType:       AuctionType;
  rubberTypeKeys:    string[];   // e.g. ['rss', 'cl']
  totalLots:         number;
  estimatedWeightKg: number;
  isEudr:            boolean;
}

/** Compute the phase of a scheduled round at time `now`. */
export function scheduledRoundPhase(item: ScheduledRound, now: Dayjs): RoundPhase {
  const opt = roundOptionFor(item.round);
  if (!opt) return 'closed';
  const start = dayjs(item.date).hour(opt.startH).minute(0).second(0);
  const end   = dayjs(item.date).hour(opt.endH).minute(0).second(0);
  if (now.isBefore(start)) return 'upcoming';
  if (now.isBefore(end))   return 'open';
  return 'closed';
}

// ─── Mock schedule generator ──────────────────────────────────────────────────
// Deterministic small-PRNG so the mock stays stable across renders. Each
// date's seed is its epoch ms — so the same date always produces the same
// rounds for the same `today` baseline.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a mock schedule for the buyer's Schedule tab.
 *
 * Production: replace with a real fetch — the return shape (`ScheduledRound[]`)
 * is what the schedule UI consumes.
 */
export function generateSchedule(today: Dayjs): ScheduledRound[] {
  const rows: ScheduledRound[] = [];
  // Span -2 .. +21 days so the calendar always has both past and future entries.
  for (let dOffset = -2; dOffset <= 21; dOffset++) {
    const date    = today.add(dOffset, 'day');
    const dateStr = date.format('YYYY-MM-DD');
    const rand    = mulberry32(date.valueOf());

    // Number of rounds per day: 2..4
    const dayRoundCount = 2 + Math.floor(rand() * 3);
    const roundNums = [...ROUND_OPTIONS.map(o => o.value)]
      .sort(() => rand() - 0.5)
      .slice(0, dayRoundCount)
      .sort((a, b) => a - b);

    for (const roundNum of roundNums) {
      const market         = ALL_MARKETS[Math.floor(rand() * ALL_MARKETS.length)];
      const auctionType: AuctionType = rand() > 0.55 ? 'location' : 'network';
      const typeCount      = 1 + Math.floor(rand() * 3);
      const rubberTypeKeys = [...RUBBER_TYPE_KEYS]
        .sort(() => rand() - 0.5)
        .slice(0, typeCount);
      const totalLots      = 3 + Math.floor(rand() * 18);
      const weightPerLot   = 1500 + Math.floor(rand() * 8000);

      rows.push({
        id:                `SCH-${dateStr}-${roundNum}-${Math.floor(rand() * 1000)}`,
        date:              dateStr,
        round:             roundNum,
        market,
        auctionType,
        rubberTypeKeys:    rubberTypeKeys as string[],
        totalLots,
        estimatedWeightKg: totalLots * weightPerLot,
        isEudr:            rand() > 0.5,
      });
    }
  }
  return rows.sort((a, b) =>
    a.date === b.date ? a.round - b.round : a.date < b.date ? -1 : 1,
  );
}
