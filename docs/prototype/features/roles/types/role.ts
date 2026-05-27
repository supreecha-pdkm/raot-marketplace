/** A named permission set assignable to officer accounts.
 *  `permissions` is the list of menu keys (see menu-catalog.ts) the role grants.
 *  Master accounts bypass roles entirely and see every menu. */
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  /** True for the singleton "Default" role new officers fall into. */
  isDefault: boolean;
  /** True for system-seeded roles that cannot be renamed or deleted. */
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoleInput = Pick<Role, 'name' | 'description' | 'permissions'>;

export type RolePatch = Partial<Pick<Role, 'name' | 'description' | 'permissions'>>;

export const DEFAULT_ROLE_ID = 'role-default';
