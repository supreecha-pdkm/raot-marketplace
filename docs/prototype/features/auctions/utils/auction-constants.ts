// Shared auction domain constants.
// Imported by:
//   - src/app/buyer/auction/**           (board, schedule, history, offer flow)
//   - src/app/officer/auction-rounds/**    (round CRUD)
//
// If you add a market, a round time slot, or a rubber type — do it here so
// every page stays in sync.

// ─── Types ────────────────────────────────────────────────────────────────────
export type AuctionType = 'network' | 'location';
export type RoundPhase  = 'upcoming' | 'open' | 'closed';

// ─── Markets ──────────────────────────────────────────────────────────────────
export const MARKET_SURAT    = 'ตลาดกลางยางพาราสุราษฎร์ธานี';
export const MARKET_NAKHON   = 'ตลาดกลางยางพารานครศรีธรรมราช';
export const MARKET_SONGKHLA = 'ตลาดกลางยางพาราสงขลา';

export const ALL_MARKETS = [MARKET_SURAT, MARKET_NAKHON, MARKET_SONGKHLA] as const;

/** Used by filter Selects (includes a "ทุกตลาด" all-option). */
export const MARKET_OPTIONS = [
  { label: 'ทุกตลาด',         value: 'all' },
  { label: 'สุราษฎร์ธานี',     value: MARKET_SURAT },
  { label: 'นครศรีธรรมราช',    value: MARKET_NAKHON },
  { label: 'สงขลา',            value: MARKET_SONGKHLA },
];

/** Used by create/edit forms (no all-option). */
export const MARKET_PICK_OPTIONS = MARKET_OPTIONS.slice(1);

// ─── Auction type ─────────────────────────────────────────────────────────────
export const AUCTION_TYPE_OPTIONS: { label: string; value: 'all' | AuctionType }[] = [
  { label: 'ทุกประเภทประมูล',  value: 'all' },
  { label: 'ประมูล ณ เครือข่าย', value: 'network' },
  { label: 'ประมูล ณ ที่ตั้ง',   value: 'location' },
];

export const AUCTION_TYPE_PICK: { label: string; value: AuctionType }[] = [
  { label: 'ประมูล ณ ที่ตั้ง',   value: 'location' },
  { label: 'ประมูล ณ เครือข่าย', value: 'network' },
];

// ─── Round time slots ─────────────────────────────────────────────────────────
// Each day can have up to 4 rounds at fixed 2-hour windows.
export interface RoundOption {
  label:  string;   // 'รอบ 1 (09:00–11:00)'
  value:  number;   // 1..4 — stable across reorderings
  startH: number;
  endH:   number;
}

export const ROUND_OPTIONS: RoundOption[] = [
  { label: 'รอบ 1 (09:00–11:00)', value: 1, startH: 9,  endH: 11 },
  { label: 'รอบ 2 (11:00–13:00)', value: 2, startH: 11, endH: 13 },
  { label: 'รอบ 3 (13:00–15:00)', value: 3, startH: 13, endH: 15 },
  { label: 'รอบ 4 (15:00–17:00)', value: 4, startH: 15, endH: 17 },
];

export function roundOptionFor(round: number): RoundOption | undefined {
  return ROUND_OPTIONS.find(o => o.value === round);
}

// ─── Rubber types ─────────────────────────────────────────────────────────────
export const RUBBER_TYPE_KEYS = ['rss', 'cl', 'lat', 'uss'] as const;
export type RubberTypeKey = typeof RUBBER_TYPE_KEYS[number];

/** Used by filter Selects (includes "ทุกชนิด"). */
export const TYPE_OPTIONS = [
  { label: 'ทุกชนิด',               value: 'all'  },
  { label: 'ยางแผ่นรมควัน',         value: 'rss'  },
  { label: 'ยางก้อนถ้วย (Cup Lump)', value: 'cl'   },
  { label: 'น้ำยางสด',              value: 'lat'  },
  { label: 'ยางแผ่นดิบ',            value: 'uss'  },
];

export const GRADE_OPTIONS = ['ทุกเกรด', 'Grade 1', 'Grade 2', 'Grade 3'];

export const TYPE_KEY_TO_LABEL: Record<RubberTypeKey, string> = {
  rss: 'ยางแผ่นรมควัน',
  cl:  'ยางก้อนถ้วย',
  lat: 'น้ำยางสด',
  uss: 'ยางแผ่นดิบ',
};

/** Brand-style accent color per rubber type — used on weight cards and chips. */
export const TYPE_KEY_TO_COLOR: Record<RubberTypeKey, string> = {
  rss: '#1a7c3e',
  cl:  '#fa8c16',
  lat: '#1677ff',
  uss: '#722ed1',
};

// ─── Board UI shared ─────────────────────────────────────────────────────────
export type BoardViewMode = 'grid' | 'list';
export const ALL_GRADES   = 'ทุกเกรด';

// ─── Bid review (offer flow) ──────────────────────────────────────────────────
/** Bids above HIGH_PRICE_MULTIPLIER × openingPrice are treated as "ราคาสูง"
 *  and a longer review countdown is enforced. */
export const HIGH_PRICE_MULTIPLIER     = 1.25;
export const REVIEW_COUNTDOWN_SEC      = 3;
export const HIGH_PRICE_COUNTDOWN_SEC  = 8;

/** Market fee charged on top of the bid, in ฿ per kg.
 *  Matches admin → ตั้งค่ารอบประมูล (auction-rounds → feePerKg). */
export const MARKET_FEE_PER_KG         = 0.25;

/** Minimum increment over the opening price (in ฿/กก.) for a **new** offer. */
export const MIN_BID_INCREMENT         = 2;
