// Shared LOT queue between auction-officer/lot-registration and
// auction-officer/weighing. LOTs created by either flow on the registration
// page get pushed here; the weighing page consumes them and stamps actual
// weight + (optionally) a panel assignment.
//
// Persistence: localStorage so changes survive across pages and tabs.
// Cross-tab sync: the consuming page should listen on `window.focus` and
// re-read via `getQueue()`.

export type LotEudrType = 'eudr' | 'non-eudr';
export type LotSource   = 'scan' | 'manual';

export interface WaitingLot {
  id:              string;
  sellerName:      string;
  sellerId?:       string;
  rubberType:      string;
  grade?:          string;
  estimatedWeight: number;        // declared weight (kg)
  eudrType:        LotEudrType;
  source:          LotSource;
  createdAt:       string;        // HH:mm
  /** Data-URL thumbnails captured at registration — surfaced on the auction page. */
  photos?:         string[];
}

/** One weighing into a single panel — a lot can have multiple of these. */
export interface WeighSplit {
  panelId:   string;
  weight:    number;              // kg of rubber on this panel
  moisture:  number;              // %
  weighedAt: string;              // HH:mm
}

export interface WeighedLot extends WaitingLot {
  /** Per-panel splits — the rubber may be distributed across several panels. */
  splits:       WeighSplit[];
  /** Aggregate of all splits[].weight (kg). */
  actualWeight: number;
  /** Average moisture across splits (%). */
  moisture:     number;
  /** Convenience: first split's panelId — kept for any legacy single-panel views. */
  panelId?:     string;
  weighedAt:    string;           // HH:mm of the LAST split / confirmation
  note?:        string;
}

interface QueueState {
  waiting:  WaitingLot[];
  weighed:  WeighedLot[];
}

const STORAGE_KEY = 'raot_lot_queue';

// Demo seed — used the first time the page loads (no localStorage entry yet).
const SEED: QueueState = {
  waiting: [
    { id: 'L001', sellerName: 'นายมาลี สวนยาง',   rubberType: 'ยางแผ่นรมควัน RSS3', estimatedWeight: 5000, eudrType: 'eudr',     source: 'manual', createdAt: '08:00' },
    { id: 'L003', sellerName: 'นายสม สวนใหญ่',    rubberType: 'ยางแผ่นรมควัน RSS3', estimatedWeight: 8100, eudrType: 'eudr',     source: 'manual', createdAt: '08:30' },
    { id: 'L005', sellerName: 'นางวิไล ชาวสวน',  rubberType: 'ยางก้อนถ้วย',         estimatedWeight: 2800, eudrType: 'non-eudr', source: 'manual', createdAt: '09:00' },
  ],
  weighed: [
    {
      id: 'L002', sellerName: 'นางสาวดาว ยางดี', rubberType: 'ยางก้อนถ้วย',
      estimatedWeight: 3200, eudrType: 'non-eudr', source: 'manual', createdAt: '08:00',
      actualWeight: 3185, moisture: 4.2, weighedAt: '09:05', panelId: 'PNL-03',
      splits: [{ panelId: 'PNL-03', weight: 3185, moisture: 4.2, weighedAt: '09:05' }],
    },
    {
      // Demo: 6,000 kg lot split across two panels (PNL-01 + PNL-07).
      id: 'L004', sellerName: 'นายธนาคาร ซื้อดี', rubberType: 'ยางแผ่นรมควัน RSS3',
      estimatedWeight: 6000, eudrType: 'eudr', source: 'manual', createdAt: '08:20',
      actualWeight: 5920, moisture: 3.8, weighedAt: '09:45', panelId: 'PNL-01',
      splits: [
        { panelId: 'PNL-01', weight: 3500, moisture: 3.8, weighedAt: '09:30' },
        { panelId: 'PNL-07', weight: 2420, moisture: 3.8, weighedAt: '09:45' },
      ],
    },
  ],
};

function readState(): QueueState {
  if (typeof window === 'undefined') return SEED;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return SEED;
  try {
    const parsed = JSON.parse(raw) as Partial<QueueState>;
    return {
      waiting: Array.isArray(parsed.waiting) ? parsed.waiting : [],
      // Backfill `splits` on legacy entries written before the multi-panel
      // model existed, so flatMap / iteration never trips on undefined.
      weighed: Array.isArray(parsed.weighed)
        ? parsed.weighed.map((w) => ({
            ...w,
            splits: Array.isArray(w.splits) && w.splits.length > 0
              ? w.splits
              : (w.panelId
                  ? [{
                      panelId:   w.panelId,
                      weight:    w.actualWeight ?? 0,
                      moisture:  w.moisture ?? 0,
                      weighedAt: w.weighedAt ?? '',
                    }]
                  : []),
          }))
        : [],
    };
  } catch {
    return SEED;
  }
}

function writeState(state: QueueState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getQueue(): QueueState {
  return readState();
}

export function getWaitingLot(id: string): WaitingLot | undefined {
  return readState().waiting.find((l) => l.id === id);
}

export function getWeighedLot(id: string): WeighedLot | undefined {
  return readState().weighed.find((l) => l.id === id);
}

export function addWaitingLot(lot: WaitingLot): void {
  const s = readState();
  s.waiting = [lot, ...s.waiting];
  writeState(s);
}

/**
 * Move a lot from `waiting` to `weighed` with the recorded actual weight,
 * moisture, and optional panel assignment.
 */
export function markWeighed(lot: WeighedLot): void {
  const s = readState();
  s.waiting = s.waiting.filter((l) => l.id !== lot.id);
  s.weighed = [lot, ...s.weighed];
  writeState(s);
}

/**
 * Clear localStorage and re-seed with the demo data — useful during a demo to
 * reset the workspace.
 */
export function resetQueue(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
