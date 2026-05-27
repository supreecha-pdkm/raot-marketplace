'use client';

import { use } from 'react';
import ContractDetailPanel from '@/features/contracts/components/contract-detail-panel';

export default function AuctionOfficerContractDetailPage({
  params,
}: {
  params: Promise<{ contractNo: string }>;
}) {
  const { contractNo } = use(params);
  return (
    <ContractDetailPanel
      contractNo={contractNo}
      basePath="/officer/contracts"
      viewerRole="officer"
    />
  );
}
