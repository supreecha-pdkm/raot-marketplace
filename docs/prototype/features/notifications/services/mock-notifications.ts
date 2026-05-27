import { Notification } from '@/shared/types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'N001', title: 'ผลการประมูล', message: 'คุณชนะการประมูล LOT-2024-001 ราคา 71.00 บาท/กก.',
    type: 'auction', read: false, createdAt: '2024-04-17T10:35:00',
  },
  {
    id: 'N002', title: 'แจ้งชำระเงิน', message: 'กรุณาชำระเงินสัญญา CNT-2024-0042 ภายใน 20 เม.ย. 2567',
    type: 'payment', read: false, createdAt: '2024-04-17T10:36:00',
  },
  {
    id: 'N003', title: 'อนุมัติการชำระเงิน', message: 'การชำระเงินสัญญา CNT-2024-0038 ได้รับการอนุมัติแล้ว',
    type: 'payment', read: true, createdAt: '2024-04-15T16:30:00',
  },
  {
    id: 'N004', title: 'นัดส่งมอบยาง', message: 'การนัดรับมอบยางสัญญา CNT-2024-0042 วันที่ 20 เม.ย. 2567',
    type: 'delivery', read: true, createdAt: '2024-04-17T11:00:00',
  },
];
