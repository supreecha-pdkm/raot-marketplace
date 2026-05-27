'use client';

import ContractsListPanel from '@/features/contracts/components/contracts-list-panel';

export default function SellerContractsPage() {
  return <ContractsListPanel basePath="/seller/contracts" viewerRole="seller" />;
}
