import dayjs from 'dayjs';
import { AuctionLot } from '@/shared/types';

// Dates are computed at module load relative to "today" so the control page
// (which filters to today's rounds) always has fresh data without manual
// maintenance. Historical entries cover several past days so the history
// table looks lived-in.
const today      = dayjs().format('YYYY-MM-DD');
const daysAgo    = (n: number) => dayjs().subtract(n, 'day').format('YYYY-MM-DD');

export const MOCK_LOTS: AuctionLot[] = [
  // ── Today's active rounds (control page) ──────────────────────────────────
  {
    id: 'L001', lotNo: 'LOT-2024-001', rubberType: 'ยางแผ่นรมควัน (RSS3)',
    grade: 'RSS3', weight: 5200, openingPrice: 68.50, currentPrice: 71.00,
    status: 'open', isEudr: true, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: today, endTime: '10:30',
    tappingDate: { from: daysAgo(7), to: daysAgo(5) },
    receivedDate: daysAgo(2),
  },
  {
    id: 'L002', lotNo: 'LOT-2024-002', rubberType: 'ยางก้อนถ้วย (Cup Lump)',
    grade: 'CL', weight: 8400, openingPrice: 45.00, currentPrice: 47.50,
    status: 'open', isEudr: true, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: today, endTime: '11:00',
    tappingDate: { from: daysAgo(10), to: daysAgo(3) },
    receivedDate: daysAgo(1),
  },
  {
    id: 'L003', lotNo: 'LOT-2024-003', rubberType: 'น้ำยางสด',
    grade: 'Latex', weight: 12000, openingPrice: 52.00, currentPrice: 53.50,
    status: 'open', isEudr: false, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: today, endTime: '11:30',
    tappingDate: { from: today, to: today },
    receivedDate: today,
    drc: 36,
  },
  {
    id: 'L004', lotNo: 'LOT-2024-004', rubberType: 'ยางแผ่นดิบ',
    grade: 'USS3', weight: 3600, openingPrice: 62.00,
    status: 'pending', isEudr: true, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: today, endTime: '14:00',
    tappingDate: { from: daysAgo(5), to: daysAgo(4) },
    receivedDate: today,
  },

  // ── History — closed/cancelled rounds across the past 2 weeks ────────────
  {
    id: 'L005', lotNo: 'LOT-2024-005', rubberType: 'ยางแผ่นรมควัน (RSS1)',
    grade: 'RSS1', weight: 4800, openingPrice: 72.00, currentPrice: 74.00,
    status: 'closed', isEudr: true, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: daysAgo(1), endTime: '10:30',
    tappingDate: { from: daysAgo(8), to: daysAgo(6) },
    receivedDate: daysAgo(3),
  },
  {
    id: 'L006', lotNo: 'LOT-2024-006', rubberType: 'ยางแผ่นรมควัน (RSS3)',
    grade: 'RSS3', weight: 6300, openingPrice: 69.00, currentPrice: 72.25,
    status: 'closed', isEudr: true, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: daysAgo(1), endTime: '11:00',
    tappingDate: { from: daysAgo(7), to: daysAgo(5) },
    receivedDate: daysAgo(2),
  },
  {
    id: 'L007', lotNo: 'LOT-2024-007', rubberType: 'ยางก้อนถ้วย (Cup Lump)',
    grade: 'CL', weight: 9100, openingPrice: 44.50, currentPrice: 46.75,
    status: 'closed', isEudr: false, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: daysAgo(2), endTime: '13:30',
    tappingDate: { from: daysAgo(12), to: daysAgo(5) },
    receivedDate: daysAgo(3),
  },
  {
    id: 'L008', lotNo: 'LOT-2024-008', rubberType: 'น้ำยางสด',
    grade: 'Latex', weight: 11400, openingPrice: 51.00,
    status: 'cancelled', isEudr: true, market: 'ตลาดกลางยางพาราสงขลา',
    auctionDate: daysAgo(2), endTime: '14:30',
    tappingDate: { from: daysAgo(2), to: daysAgo(2) },
    receivedDate: daysAgo(2),
    drc: 34,
  },
  {
    id: 'L009', lotNo: 'LOT-2024-009', rubberType: 'ยางแผ่นดิบ',
    grade: 'USS3', weight: 4100, openingPrice: 63.50, currentPrice: 65.00,
    status: 'closed', isEudr: false, market: 'ตลาดกลางยางพานครศรีธรรมราช',
    auctionDate: daysAgo(3), endTime: '10:00',
    tappingDate: { from: daysAgo(9), to: daysAgo(7) },
    receivedDate: daysAgo(4),
  },
  {
    id: 'L010', lotNo: 'LOT-2024-010', rubberType: 'ยางแผ่นรมควัน (RSS3)',
    grade: 'RSS3', weight: 5500, openingPrice: 70.00, currentPrice: 73.50,
    status: 'closed', isEudr: true, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: daysAgo(4), endTime: '11:30',
    tappingDate: { from: daysAgo(11), to: daysAgo(9) },
    receivedDate: daysAgo(5),
  },
  {
    id: 'L011', lotNo: 'LOT-2024-011', rubberType: 'ยางก้อนถ้วย (Cup Lump)',
    grade: 'CL', weight: 7800, openingPrice: 45.50, currentPrice: 48.00,
    status: 'closed', isEudr: true, market: 'ตลาดกลางยางพาราสงขลา',
    auctionDate: daysAgo(5), endTime: '13:00',
    tappingDate: { from: daysAgo(15), to: daysAgo(8) },
    receivedDate: daysAgo(6),
  },
  {
    id: 'L012', lotNo: 'LOT-2024-012', rubberType: 'ยางแผ่นรมควัน (RSS1)',
    grade: 'RSS1', weight: 5200, openingPrice: 73.00,
    status: 'cancelled', isEudr: false, market: 'ตลาดกลางยางพานครศรีธรรมราช',
    auctionDate: daysAgo(7), endTime: '10:30',
    tappingDate: { from: daysAgo(13), to: daysAgo(10) },
    receivedDate: daysAgo(8),
  },
  {
    id: 'L013', lotNo: 'LOT-2024-013', rubberType: 'น้ำยางสด',
    grade: 'Latex', weight: 13200, openingPrice: 50.00, currentPrice: 52.75,
    status: 'closed', isEudr: true, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: daysAgo(8), endTime: '11:00',
    tappingDate: { from: daysAgo(8), to: daysAgo(8) },
    receivedDate: daysAgo(8),
    drc: 35,
  },
  {
    id: 'L014', lotNo: 'LOT-2024-014', rubberType: 'ยางแผ่นรมควัน (RSS3)',
    grade: 'RSS3', weight: 4900, openingPrice: 68.00, currentPrice: 70.50,
    status: 'closed', isEudr: true, market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
    auctionDate: daysAgo(10), endTime: '10:30',
    tappingDate: { from: daysAgo(17), to: daysAgo(14) },
    receivedDate: daysAgo(11),
  },
  {
    id: 'L015', lotNo: 'LOT-2024-015', rubberType: 'ยางแผ่นดิบ',
    grade: 'USS3', weight: 3800, openingPrice: 61.50, currentPrice: 63.25,
    status: 'closed', isEudr: false, market: 'ตลาดกลางยางพาราสงขลา',
    auctionDate: daysAgo(12), endTime: '14:00',
    tappingDate: { from: daysAgo(18), to: daysAgo(15) },
    receivedDate: daysAgo(13),
  },
];
