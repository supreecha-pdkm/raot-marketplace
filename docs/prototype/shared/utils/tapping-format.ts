import dayjs from 'dayjs';
import type { TappingRange } from '@/shared/types';

/** Format a tapping range as Thai-locale text.
 *  - Single day → "18 พ.ค. 2569"
 *  - Same month → "16–18 พ.ค. 2569"
 *  - Different months → "30 เม.ย. – 2 พ.ค. 2569"
 *  - Different years → "30 ธ.ค. 2568 – 2 ม.ค. 2569"
 */
export function formatTappingRange(range: TappingRange | undefined): string {
  if (!range) return '—';
  const from = dayjs(range.from);
  const to   = dayjs(range.to);

  if (from.isSame(to, 'day')) return from.format('D MMM YYYY');
  if (from.isSame(to, 'month')) return `${from.format('D')}–${to.format('D MMM YYYY')}`;
  if (from.isSame(to, 'year'))  return `${from.format('D MMM')} – ${to.format('D MMM YYYY')}`;
  return `${from.format('D MMM YYYY')} – ${to.format('D MMM YYYY')}`;
}

/** Day count in a tapping range — useful for "3 วัน" badges.
 *  Inclusive (16 → 18 = 3 days). */
export function tappingDayCount(range: TappingRange | undefined): number {
  if (!range) return 0;
  return dayjs(range.to).diff(dayjs(range.from), 'day') + 1;
}

/** Days since the lot was tapped, measured from the latest tapping day.
 *  Negative if the tapping date is in the future (shouldn't happen normally). */
export function daysSinceTapping(range: TappingRange | undefined, asOf = dayjs()): number {
  if (!range) return -1;
  return asOf.diff(dayjs(range.to), 'day');
}

/** Format a received date (Thai locale, with "วันนี้"/"เมื่อวาน" hints). */
export function formatReceivedDate(date: string | undefined): string {
  if (!date) return '—';
  const d = dayjs(date);
  const diffDays = dayjs().diff(d, 'day');
  if (diffDays === 0) return `วันนี้ (${d.format('D MMM YYYY')})`;
  if (diffDays === 1) return `เมื่อวาน (${d.format('D MMM YYYY')})`;
  return d.format('D MMM YYYY');
}

/** True for rubber types where freshness is critical and lots should be
 *  auctioned/delivered same-day. Drives "ต้องประมูลภายในวันนี้" warning. */
export function isFreshRubber(rubberType: string): boolean {
  return rubberType.includes('น้ำยาง');
}
