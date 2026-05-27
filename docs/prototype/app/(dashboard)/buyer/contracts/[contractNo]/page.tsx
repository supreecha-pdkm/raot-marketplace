'use client';

import { use } from 'react';
import ContractDetailPanel from '@/features/contracts/components/contract-detail-panel';

export default function BuyerContractDetailPage({
  params,
}: {
  params: Promise<{ contractNo: string }>;
}) {
  const { contractNo } = use(params);
  return (
    <ContractDetailPanel
      contractNo={contractNo}
      basePath="/buyer/contracts"
      viewerRole="buyer"
    />
  );
}
