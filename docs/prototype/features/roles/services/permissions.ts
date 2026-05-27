import { User } from '@/shared/types';
import { ALL_MENU_KEYS, ASSIGNABLE_MENU_KEYS, DASHBOARD_KEY } from '../constants/menu-catalog';
import { getDefaultRole, getRole } from './roles';

// Manual verification cases for `resolvePermissionsForUser` (no test framework
// wired up yet — port to unit tests when one is added):
//   1. master                       → ALL_MENU_KEYS
//   2. officer + valid roleId       → that Role's permissions
//   3. officer + missing roleId     → Default permissions (empty)
//   4. officer + deleted roleId     → Default fallback
//   5. buyer / seller               → []

/** Master accounts are granted every menu in the catalog (including
 *  master-only ones like `roles`). */
export const MASTER_PERMISSIONS: string[] = ALL_MENU_KEYS;

/** Returns the effective menu permission set for a user.
 *  - Master:    every menu in the catalog
 *  - Officer:   permissions from their assigned Role; falls back to Default
 *               (empty) when `roleId` is missing or points to a deleted Role
 *  - Buyer/Seller: empty — they use their own sidebar maps, not the catalog
 *
 *  The result NEVER includes `dashboard`; dashboard is always implicitly
 *  granted by the sidebar / route guard. */
export function resolvePermissionsForUser(user: User): string[] {
  if (user.role === 'master') return MASTER_PERMISSIONS;
  if (user.role !== 'officer') return [];
  if (!user.roleId) return getDefaultRole().permissions;
  const role = getRole(user.roleId);
  return role?.permissions ?? getDefaultRole().permissions;
}

/** True when the user is allowed to navigate to /officer/<menuKey>.
 *  Dashboard is always accessible to logged-in officers/masters. */
export function canAccessMenu(user: User, menuKey: string): boolean {
  if (menuKey === DASHBOARD_KEY) return true;
  if (user.role === 'master') return true;
  return resolvePermissionsForUser(user).includes(menuKey);
}

/** Re-export for callers that want to render the assignable list. */
export { ASSIGNABLE_MENU_KEYS };
