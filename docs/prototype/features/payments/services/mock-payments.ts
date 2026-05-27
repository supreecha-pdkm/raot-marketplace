import { PaymentRecord } from '@/shared/types';

export const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 'P001', contractNo: 'CNT-2024-0042', amount: 369200,
    method: 'transfer', status: 'pending',
    submittedAt: '2024-04-17T09:30:00',
  },
  {
    id: 'P002', contractNo: 'CNT-2024-0038', amount: 342400,
    method: 'qr', status: 'approved',
    submittedAt: '2024-04-15T14:00:00', approvedAt: '2024-04-15T16:30:00',
  },
];
