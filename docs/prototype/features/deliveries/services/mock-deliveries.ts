import { DeliveryRequest } from '@/shared/types';

export const MOCK_DELIVERIES: DeliveryRequest[] = [
  {
    id: 'D001', contractNo: 'CNT-2024-0031', appointmentDate: '2024-04-13',
    receiverName: 'นายสมชาย ใจดี', vehiclePlate: 'กข-1234', province: 'สุราษฎร์ธานี',
    weight: 10000, status: 'completed',
  },
  {
    id: 'D002', contractNo: 'CNT-2024-0042', appointmentDate: '2024-04-20',
    receiverName: 'นายสมชาย ใจดี', vehiclePlate: 'งด-5678', province: 'สุราษฎร์ธานี',
    weight: 5200, status: 'pending',
  },
];
