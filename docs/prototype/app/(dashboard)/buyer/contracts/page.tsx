'use client';

import ContractsListPanel from '@/features/contracts/components/contracts-list-panel';

export default function BuyerContractsPage() {
  return <ContractsListPanel basePath="/buyer/contracts" viewerRole="buyer" />;
}
