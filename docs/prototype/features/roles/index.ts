export type { Role, RoleInput, RolePatch } from './types/role';
export { DEFAULT_ROLE_ID } from './types/role';
export {
  listRoles, getRole, getDefaultRole,
  createRole, updateRole, deleteRole,
} from './services/roles';
export {
  resolvePermissionsForUser, canAccessMenu, MASTER_PERMISSIONS,
} from './services/permissions';
export {
  OFFICER_MENU_CATALOG, ASSIGNABLE_MENU_CATALOG,
  ALL_MENU_KEYS, ASSIGNABLE_MENU_KEYS,
  MASTER_ONLY_KEYS, MENU_LABEL_BY_KEY, DASHBOARD_KEY,
} from './constants/menu-catalog';
export type { MenuItem, MenuGroup } from './constants/menu-catalog';
export { MENU_ICON_BY_KEY, getMenuIcon } from './constants/menu-icons';
export {
  useRolesList, useCreateRole, useUpdateRole, useDeleteRole,
} from './hooks/use-roles';
export { default as RoleListCard } from './components/role-list-card';
export { default as RoleFormModal } from './components/role-form-modal';
