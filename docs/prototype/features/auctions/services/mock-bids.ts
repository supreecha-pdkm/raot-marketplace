// Mock bid leaderboard shared between auction-control list page,
// detail page, and close-round wizard.
// Lives in features/ (not under app/.../page.tsx) so child route segments
// can import it without violating App Router's "page modules are not
// import targets" rule.

export interface MockBid {
  rank:   number;
  buyer:  string;
  bidId:  string;
  price:  number;
  weight: number;
  time:   string;
  status: 'leading' | 'outbid';
}

export const MOCK_BIDS: MockBid[] = [
  { rank: 1, buyer: 'นายสมชาย ใจดี',    bidId: 'U001', price: 71.50, weight: 5200, time: '10:28:32', status: 'leading' },
  { rank: 2, buyer: 'บจก.ยางดี จำกัด',  bidId: 'U008', price: 71.00, weight: 4800, time: '10:27:45', status: 'outbid'  },
  { rank: 3, buyer: 'บจก.ยางเยี่ยม',    bidId: 'U015', price: 70.50, weight: 5200, time: '10:26:11', status: 'outbid'  },
];
