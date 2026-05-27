// Mock lot rows + image galleries for the buyer auction board.
// Swap for real API data later — the shapes here are the contract the UI uses.

import dayjs from 'dayjs';
import type { AuctionType } from '../utils/auction-constants';
import {
  MARKET_SURAT, MARKET_NAKHON, MARKET_SONGKHLA,
} from '../utils/auction-constants';
import type { TappingRange } from '@/shared/types';

export interface RubberRow {
  key:              string;        // unique id: typeKey-gradeN
  typeKey:          string;        // e.g. 'rss'
  typeName:         string;        // e.g. 'ยางแผ่นรมควัน'
  grade:            string;        // 'Grade 1' | 'Grade 2' | 'Grade 3'
  gradeCode:        string;        // e.g. 'RSS1', 'CL2'
  estimatedWeight:  number;
  startActual:      number;
  maxActual:        number;
  openingPrice:     number;
  isEudr:           boolean;
  color:            string;
  market:           string;        // ตลาดกลางที่ยางก้อนนี้อยู่
  auctionType:      AuctionType;   // ประมูล ณ เครือข่าย | ประมูล ณ ที่ตั้ง
  /** When the rubber was tapped. Single day or a range when bundled. */
  tappingDate?:     TappingRange;
  /** When the market physically received the lot. */
  receivedDate?:    string;
  /** Dry Rubber Content % — mostly for latex; optional for other types. */
  drc?:             number;
}

// Helpers for relative dates so the data stays "fresh-looking" without
// manual maintenance.
const today   = () => dayjs().format('YYYY-MM-DD');
const daysAgo = (n: number) => dayjs().subtract(n, 'day').format('YYYY-MM-DD');

// ─── Live auction board rows ──────────────────────────────────────────────────
// Tapping/received dates by type:
//   rss (rmควัน)      → tapped 5–10 days ago, received 1–3 days ago
//   cl (cup lump)     → tapped 5–14 days ago, received 1–3 days ago
//   lat (น้ำยางสด)    → tapped today, received today (must auction same-day)
//   uss (ยางแผ่นดิบ)  → tapped 3–7 days ago, received 1–2 days ago
export const RUBBER_ROWS: RubberRow[] = [
  // ยางแผ่นรมควัน — ประมูล ณ ที่ตั้ง (ของเดิม)
  { key: 'rss-1', typeKey: 'rss', typeName: 'ยางแผ่นรมควัน', grade: 'Grade 1', gradeCode: 'RSS1', estimatedWeight: 12000, startActual: 9200,  maxActual: 12000, openingPrice: 72.00, isEudr: true,  color: '#1a7c3e', market: MARKET_SURAT,    auctionType: 'location', tappingDate: { from: daysAgo(8), to: daysAgo(5) }, receivedDate: daysAgo(2) },
  { key: 'rss-2', typeKey: 'rss', typeName: 'ยางแผ่นรมควัน', grade: 'Grade 2', gradeCode: 'RSS2', estimatedWeight: 8000,  startActual: 6100,  maxActual: 8000,  openingPrice: 68.50, isEudr: true,  color: '#1a7c3e', market: MARKET_SURAT,    auctionType: 'location', tappingDate: { from: daysAgo(7), to: daysAgo(6) }, receivedDate: daysAgo(2) },
  { key: 'rss-3', typeKey: 'rss', typeName: 'ยางแผ่นรมควัน', grade: 'Grade 3', gradeCode: 'RSS3', estimatedWeight: 5000,  startActual: 4100,  maxActual: 5000,  openingPrice: 64.00, isEudr: true,  color: '#1a7c3e', market: MARKET_NAKHON,   auctionType: 'location', tappingDate: { from: daysAgo(10), to: daysAgo(6) }, receivedDate: daysAgo(3) },
  // ยางก้อนถ้วย — ประมูล ณ ที่ตั้ง (ของเดิม)
  { key: 'cl-1',  typeKey: 'cl',  typeName: 'ยางก้อนถ้วย (Cup Lump)', grade: 'Grade 1', gradeCode: 'CL1', estimatedWeight: 7000,  startActual: 5400,  maxActual: 7000,  openingPrice: 47.00, isEudr: false, color: '#fa8c16', market: MARKET_SURAT,    auctionType: 'location', tappingDate: { from: daysAgo(12), to: daysAgo(5) }, receivedDate: daysAgo(2) },
  { key: 'cl-2',  typeKey: 'cl',  typeName: 'ยางก้อนถ้วย (Cup Lump)', grade: 'Grade 2', gradeCode: 'CL2', estimatedWeight: 5000,  startActual: 3800,  maxActual: 5000,  openingPrice: 44.00, isEudr: false, color: '#fa8c16', market: MARKET_NAKHON,   auctionType: 'location', tappingDate: { from: daysAgo(14), to: daysAgo(7) }, receivedDate: daysAgo(3) },
  { key: 'cl-3',  typeKey: 'cl',  typeName: 'ยางก้อนถ้วย (Cup Lump)', grade: 'Grade 3', gradeCode: 'CL3', estimatedWeight: 3000,  startActual: 2400,  maxActual: 3000,  openingPrice: 40.50, isEudr: false, color: '#fa8c16', market: MARKET_SONGKHLA, auctionType: 'location', tappingDate: { from: daysAgo(11), to: daysAgo(6) }, receivedDate: daysAgo(2) },
  // น้ำยางสด — ประมูล ณ ที่ตั้ง (ของเดิม) — must be auctioned & delivered same day
  { key: 'lat-1', typeKey: 'lat', typeName: 'น้ำยางสด', grade: 'Grade 1', gradeCode: 'LA', estimatedWeight: 9000,  startActual: 7800,  maxActual: 9000,  openingPrice: 55.00, isEudr: false, color: '#1677ff', market: MARKET_SURAT,    auctionType: 'location', tappingDate: { from: today(), to: today() }, receivedDate: today(), drc: 36 },
  { key: 'lat-2', typeKey: 'lat', typeName: 'น้ำยางสด', grade: 'Grade 2', gradeCode: 'LB', estimatedWeight: 7000,  startActual: 5900,  maxActual: 7000,  openingPrice: 52.00, isEudr: false, color: '#1677ff', market: MARKET_SONGKHLA, auctionType: 'location', tappingDate: { from: today(), to: today() }, receivedDate: today(), drc: 33 },
  { key: 'lat-3', typeKey: 'lat', typeName: 'น้ำยางสด', grade: 'Grade 3', gradeCode: 'LC', estimatedWeight: 4000,  startActual: 3500,  maxActual: 4000,  openingPrice: 48.50, isEudr: false, color: '#1677ff', market: MARKET_SONGKHLA, auctionType: 'location', tappingDate: { from: today(), to: today() }, receivedDate: today(), drc: 30 },
  // ยางแผ่นดิบ — ประมูล ณ ที่ตั้ง (ของเดิม)
  { key: 'uss-1', typeKey: 'uss', typeName: 'ยางแผ่นดิบ', grade: 'Grade 1', gradeCode: 'USS1', estimatedWeight: 4000,  startActual: 2900,  maxActual: 4000,  openingPrice: 65.00, isEudr: true,  color: '#722ed1', market: MARKET_NAKHON,   auctionType: 'location', tappingDate: { from: daysAgo(5), to: daysAgo(3) }, receivedDate: daysAgo(1) },
  { key: 'uss-2', typeKey: 'uss', typeName: 'ยางแผ่นดิบ', grade: 'Grade 2', gradeCode: 'USS2', estimatedWeight: 2500,  startActual: 1800,  maxActual: 2500,  openingPrice: 62.00, isEudr: true,  color: '#722ed1', market: MARKET_NAKHON,   auctionType: 'location', tappingDate: { from: daysAgo(6), to: daysAgo(4) }, receivedDate: daysAgo(2) },
  { key: 'uss-3', typeKey: 'uss', typeName: 'ยางแผ่นดิบ', grade: 'Grade 3', gradeCode: 'USS3', estimatedWeight: 1500,  startActual: 900,   maxActual: 1500,  openingPrice: 58.50, isEudr: true,  color: '#722ed1', market: MARKET_SONGKHLA, auctionType: 'location', tappingDate: { from: daysAgo(7), to: daysAgo(5) }, receivedDate: daysAgo(2) },
  // ─── ประมูล ณ เครือข่าย (Network auction) ──────────────────────────────────
  { key: 'rss-net-1', typeKey: 'rss', typeName: 'ยางแผ่นรมควัน', grade: 'Grade 1', gradeCode: 'RSS1', estimatedWeight: 15000, startActual: 11200, maxActual: 15000, openingPrice: 73.50, isEudr: true,  color: '#1a7c3e', market: MARKET_SURAT,    auctionType: 'network', tappingDate: { from: daysAgo(9), to: daysAgo(6) }, receivedDate: daysAgo(3) },
  { key: 'rss-net-2', typeKey: 'rss', typeName: 'ยางแผ่นรมควัน', grade: 'Grade 2', gradeCode: 'RSS2', estimatedWeight: 10000, startActual: 7800,  maxActual: 10000, openingPrice: 69.00, isEudr: true,  color: '#1a7c3e', market: MARKET_NAKHON,   auctionType: 'network', tappingDate: { from: daysAgo(8), to: daysAgo(7) }, receivedDate: daysAgo(2) },
  { key: 'cl-net-1',  typeKey: 'cl',  typeName: 'ยางก้อนถ้วย (Cup Lump)', grade: 'Grade 1', gradeCode: 'CL1', estimatedWeight: 9000,  startActual: 6800,  maxActual: 9000,  openingPrice: 48.00, isEudr: false, color: '#fa8c16', market: MARKET_SONGKHLA, auctionType: 'network', tappingDate: { from: daysAgo(12), to: daysAgo(6) }, receivedDate: daysAgo(2) },
  { key: 'lat-net-1', typeKey: 'lat', typeName: 'น้ำยางสด', grade: 'Grade 1', gradeCode: 'LA', estimatedWeight: 11000, startActual: 9200,  maxActual: 11000, openingPrice: 56.00, isEudr: false, color: '#1677ff', market: MARKET_NAKHON,   auctionType: 'network', tappingDate: { from: today(), to: today() }, receivedDate: today(), drc: 35 },
  { key: 'uss-net-1', typeKey: 'uss', typeName: 'ยางแผ่นดิบ', grade: 'Grade 1', gradeCode: 'USS1', estimatedWeight: 5000,  startActual: 3600,  maxActual: 5000,  openingPrice: 66.00, isEudr: true,  color: '#722ed1', market: MARKET_SURAT,    auctionType: 'network', tappingDate: { from: daysAgo(6), to: daysAgo(4) }, receivedDate: daysAgo(1) },
];

// ─── Photo galleries per rubber type ──────────────────────────────────────────
// 5 images per type. Shown in the Offer modal so the buyer can preview the lot
// before bidding.
//
// Production: replace these URLs with real lot photos (the registration flow
// already captures them — see /officer/lot-registration and the
// `photos` field on `WaitingLot`).
export const IMAGES_BY_TYPE: Record<string, string[]> = {
  rss: [
    'https://picsum.photos/seed/raot-rss-1/720/480',
    'https://picsum.photos/seed/raot-rss-2/720/480',
    'https://picsum.photos/seed/raot-rss-3/720/480',
    'https://picsum.photos/seed/raot-rss-4/720/480',
    'https://picsum.photos/seed/raot-rss-5/720/480',
  ],
  cl: [
    'https://picsum.photos/seed/raot-cl-1/720/480',
    'https://picsum.photos/seed/raot-cl-2/720/480',
    'https://picsum.photos/seed/raot-cl-3/720/480',
    'https://picsum.photos/seed/raot-cl-4/720/480',
    'https://picsum.photos/seed/raot-cl-5/720/480',
  ],
  lat: [
    'https://picsum.photos/seed/raot-lat-1/720/480',
    'https://picsum.photos/seed/raot-lat-2/720/480',
    'https://picsum.photos/seed/raot-lat-3/720/480',
    'https://picsum.photos/seed/raot-lat-4/720/480',
    'https://picsum.photos/seed/raot-lat-5/720/480',
  ],
  uss: [
    'https://picsum.photos/seed/raot-uss-1/720/480',
    'https://picsum.photos/seed/raot-uss-2/720/480',
    'https://picsum.photos/seed/raot-uss-3/720/480',
    'https://picsum.photos/seed/raot-uss-4/720/480',
    'https://picsum.photos/seed/raot-uss-5/720/480',
  ],
};
