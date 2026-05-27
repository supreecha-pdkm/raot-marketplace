// ─── Buyer payment status persistence ──────────────────────────────────────
// Three states stored in a single localStorage map, keyed by contractNo:
//   (absent)         → 'waiting'        — no payment submitted yet
//   'waiting_verify' → buyer submitted, awaiting admin approval
//   'verified'       → admin approved — payment confirmed

export type PaymentStatus = 'waiting' | 'waiting_verify' | 'verified';
type StoredStatus = Exclude<PaymentStatus, 'waiting'>;

const KEY = 'raot_payment_status';

function readMap(): Record<string, StoredStatus> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMap(m: Record<string, StoredStatus>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(m));
}

/** Read the current payment status for a contract (defaults to 'waiting'). */
export function getPaymentStatus(contractNo: string): PaymentStatus {
  return readMap()[contractNo] ?? 'waiting';
}

/** Returns the full status map — useful for the list page snapshot. */
export function getPaymentStatusMap(): Record<string, StoredStatus> {
  return readMap();
}

/** Mark a contract as "awaiting admin verification" after the buyer submits. */
export function markWaitingVerify(contractNo: string): void {
  const m = readMap();
  m[contractNo] = 'waiting_verify';
  writeMap(m);
}

/** Admin action — finalises a payment as verified/approved. */
export function markVerified(contractNo: string): void {
  const m = readMap();
  m[contractNo] = 'verified';
  writeMap(m);
}
