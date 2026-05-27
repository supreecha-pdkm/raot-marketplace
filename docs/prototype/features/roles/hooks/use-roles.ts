'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listRoles, createRole, updateRole, deleteRole,
} from '../services/roles';
import type { Role, RoleInput, RolePatch } from '../types/role';

/** Query-key namespace for the roles feature. Keep the top-level tag stable
 *  (`'roles'`) so `invalidateQueries({ queryKey: ['roles'] })` invalidates the
 *  whole feature in one call; the second segment scopes by query shape so a
 *  future `detail(id)` key won't collide with `list()`. */
const QK = {
  all: () => ['roles'] as const,
  list: () => ['roles', 'list'] as const,
};

/** Local-storage backed — Promise wrapper keeps the call shape compatible
 *  with TanStack Query so call sites match other data hooks in the project. */
export function useRolesList() {
  return useQuery<Role[]>({
    queryKey: QK.list(),
    queryFn: () => Promise.resolve(listRoles()),
    staleTime: 0,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RoleInput) => Promise.resolve(createRole(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.list() }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: RolePatch }) =>
      Promise.resolve(updateRole(id, patch)),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.list() }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => Promise.resolve(deleteRole(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.list() }),
  });
}
