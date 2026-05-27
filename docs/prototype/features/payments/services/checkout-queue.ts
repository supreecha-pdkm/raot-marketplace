// Check-out queue for the "ลงทะเบียนยาง · ออก" flow.
//
// When a seller's truck enters the market we capture the gross weight
// (truck + rubber). To leave, the truck is weighed empty and the rubber
// weight is derived (gross_in − tare_out). The officer reviews the values
// against the QR-declared weight and the registered tare from the DB,
// then confirms the check-out.
//
// Persistence: localStorage so list + detail pages share state across tabs.

export type CheckoutStatus = 'pending' | 'checked-out';

export interface CheckoutLot {
  id:             string;       // matches LOT id (e.g. SLOT-…)
  sellerName:     string;
  sellerId:       string;
  truckPlate:     string;
  rubberType:     string;
  qrWeight:       number;       // declared in QR (kg)
  truckTareDb:    number;       // registered truck tare (kg)
  grossWeightIn:  number;       // gross weighed at entry (kg)
  panelWeight?:   number;       // weighed at the rubber panel (kg) — from weighing flow
  checkedInAt:    string;       // HH:mm
  status:         CheckoutStatus;
  // After officer weighs out + confirms
  truckTareOut?:    number;     // empty truck weight at checkout (kg)
  realRubberWeight?: number;    // grossWeightIn − truckTareOut
  checkedOutAt?:    string;     // HH:mm
  checkedOutBy?:    string;     // officer fullName
  note?:            string;
}

const STORAGE_KEY = 'raot_checkout_queue';

const SEED: CheckoutLot[] = [
  {
    id:            'SLOT-A001',
    sellerName:    'นายสมชาย ใจดี',
    sellerId:      '1840112345678',
    truckPlate:    'นข 1234 สุราษฎร์',
    rubberType:    'ยางแผ่นดิบ',
    qrWeight:      320,
    truckTareDb:   3500,
    grossWeightIn: 3815,
    panelWeight:   312,
    checkedInAt:   '08:45',
    status:        'pending',
  },
  {
    id:            'SLOT-A002',
    sellerName:    'นางวิภา ทองคำ',
    sellerId:      '1860304567890',
    truckPlate:    'บค 5678 นครศรี',
    rubberType:    'ยางก้อนถ้วย',
    qrWeight:      1200,
    truckTareDb:   4200,
    grossWeightIn: 5380,
    panelWeight:   1185,
    checkedInAt:   '09:12',
    status:        'pending',
  },
  {
    id:            'SLOT-A003',
    sellerName:    'นายชาญชัย ไร่ยาง',
    sellerId:      '1890607890123',
    truckPlate:    'กข 9876 ตรัง',
    rubberType:    'ยางแผ่นรมควัน RSS3',
    qrWeight:      850,
    truckTareDb:   3800,
    grossWeightIn: 4632,
    panelWeight:   820,
    checkedInAt:   '07:30',
    status:           'checked-out',
    truckTareOut:     3815,
    realRubberWeight: 817,
    checkedOutAt:     '10:15',
    checkedOutBy:     'เจ้าหน้าที่ A',
  },
];

function readState(): CheckoutLot[] {
  if (typeof window === 'undefined') return SEED;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return SEED;
  try {
    const parsed = JSON.parse(raw) as CheckoutLot[];
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
}

function writeState(state: CheckoutLot[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getCheckoutQueue(): CheckoutLot[] {
  return readState();
}

export function getCheckoutLot(id: string): CheckoutLot | undefined {
  return readState().find((l) => l.id === id);
}

/**
 * Record a weigh-in. Called from the IN registration flow once the officer
 * has scanned the seller, weighed the truck (gross_in), and confirmed the
 * LOT. The truck's registered tare is captured now so the OUT flow can
 * derive `realRubberWeight = gross_in − tare_out` when the truck leaves.
 */
export function addCheckoutLot(lot: CheckoutLot): void {
  const s = readState();
  // If the same LOT id is re-added, replace the existing entry.
  writeState([lot, ...s.filter((l) => l.id !== lot.id)]);
}

/**
 * Update the panel-weighing total for a lot (sum of splits) — called by the
 * weighing flow once the officer confirms. Lets the OUT page show the actual
 * panel weight when comparing rubber weights.
 */
export function setCheckoutPanelWeight(id: string, panelWeight: number): void {
  const s = readState();
  // If the lot isn't yet in the checkout queue (manual flow LOTs without
  // truck data), skip — there's nothing to update.
  if (!s.some((l) => l.id === id)) return;
  writeState(s.map((l) => l.id === id ? { ...l, panelWeight } : l));
}

/**
 * Stamp a check-out: records the empty-truck weight, computes the rubber
 * weight, and flips status → 'checked-out'.
 */
export function confirmCheckout(
  id: string,
  truckTareOut: number,
  checkedOutBy: string,
  note?: string,
): void {
  const s = readState();
  const next = s.map((l) =>
    l.id === id
      ? {
          ...l,
          truckTareOut,
          realRubberWeight: Math.max(0, l.grossWeightIn - truckTareOut),
          checkedOutAt:     new Date().toTimeString().slice(0, 5),
          checkedOutBy,
          note,
          status:           'checked-out' as const,
        }
      : l,
  );
  writeState(next);
}

export function resetCheckoutQueue(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
