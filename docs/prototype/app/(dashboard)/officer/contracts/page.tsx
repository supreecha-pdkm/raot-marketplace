'use client';

import ContractsListPanel from '@/features/contracts/components/contracts-list-panel';

export default function AuctionOfficerContractsPage() {
  return <ContractsListPanel basePath="/officer/contracts" viewerRole="officer" />;
}
