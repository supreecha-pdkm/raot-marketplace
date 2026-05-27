'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listOfficerAccounts, addOfficerAccount, updateOfficerAccount,
  removeOfficerAccount, setOfficerPassword, OfficerAccount,
} from '@/features/auth/services/auth';

/** Query-key namespace for the officers feature — see roles/hooks/use-roles.ts
 *  for the rationale. Top-level tag stays stable; scope segment differentiates
 *  query shape (list, detail, etc.). */
const QK = {
  all: () => ['officers'] as const,
  list: () => ['officers', 'list'] as const,
};

export function useOfficersList() {
  return useQuery<OfficerAccount[]>({
    queryKey: QK.list(),
    queryFn: () => Promise.resolve(listOfficerAccounts()),
    staleTime: 0,
  });
}

export function useCreateOfficer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<OfficerAccount, 'id' | 'createdAt'>) =>
      Promise.resolve(addOfficerAccount(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.list() }),
  });
}

export function useUpdateOfficer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      username, patch,
    }: {
      username: string;
      patch: Partial<Pick<OfficerAccount, 'roleId' | 'status' | 'fullName' | 'email' | 'phone'>>;
    }) => {
      updateOfficerAccount(username, patch);
      return Promise.resolve();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.list() }),
  });
}

export function useDeleteOfficer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => {
      removeOfficerAccount(username);
      return Promise.resolve();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.list() }),
  });
}

export function useResetOfficerPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => {
      setOfficerPassword(username, password);
      return Promise.resolve();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.list() }),
  });
}
