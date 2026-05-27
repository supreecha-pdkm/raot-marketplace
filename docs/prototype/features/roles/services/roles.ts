import { DEFAULT_ROLE_ID, Role, RoleInput, RolePatch } from '../types/role';

const STORAGE_KEY = 'raot_roles';

const DEFAULT_ROLE: Role = {
  id: DEFAULT_ROLE_ID,
  name: 'Default',
  description: 'บทบาทเริ่มต้น — เจ้าหน้าที่ใหม่ที่ยังไม่ได้รับ Role จะอยู่ที่นี่ (เห็นเฉพาะหน้าแรก)',
  permissions: [],
  isDefault: true,
  isSystem: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const SEED_AUCTION_DEMO: Role = {
  id: 'role-auction-demo',
  name: 'Auction Demo',
  description: 'ตัวอย่าง Role สำหรับเจ้าหน้าที่ประมูล (seed)',
  permissions: [
    'master-panels',
    'lot-registration',
    'lot-registration-out',
    'weighing',
    'panels',
    'auction-control',
    'announcements',
    'network-auctions',
    'contracts',
    'approvals',
    'delivery',
    'reports',
  ],
  isDefault: false,
  isSystem: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function readRolesRaw(): Role[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Role[];
  } catch {
    return null;
  }
}

function writeRolesRaw(rows: Role[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

/** Returns the live roles list, seeding the Default + Auction Demo roles on
 *  first read. Safe to call on the server — returns the seed snapshot. */
export function listRoles(): Role[] {
  const stored = readRolesRaw();
  if (!stored || stored.length === 0) {
    const seed = [DEFAULT_ROLE, SEED_AUCTION_DEMO];
    writeRolesRaw(seed);
    return seed;
  }
  // Always ensure the Default role exists, even if storage was tampered with
  if (!stored.some((r) => r.id === DEFAULT_ROLE_ID)) {
    const repaired = [DEFAULT_ROLE, ...stored];
    writeRolesRaw(repaired);
    return repaired;
  }
  return stored;
}

export function getRole(id: string): Role | null {
  return listRoles().find((r) => r.id === id) ?? null;
}

export function getDefaultRole(): Role {
  return getRole(DEFAULT_ROLE_ID) ?? DEFAULT_ROLE;
}

function uniqueId(): string {
  return `role-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createRole(input: RoleInput): Role {
  const rows = listRoles();
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error('กรุณาระบุชื่อ Role');
  }
  if (rows.some((r) => r.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error(`Role ชื่อ "${trimmedName}" มีอยู่แล้ว`);
  }
  const now = new Date().toISOString();
  const role: Role = {
    id: uniqueId(),
    name: trimmedName,
    description: input.description?.trim() || undefined,
    permissions: [...new Set(input.permissions)],
    isDefault: false,
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  };
  writeRolesRaw([...rows, role]);
  return role;
}

export function updateRole(id: string, patch: RolePatch): Role {
  const rows = listRoles();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('ไม่พบ Role ที่ต้องการแก้ไข');
  const current = rows[idx];
  // Default Role เป็น singleton ที่ทุก officer fallback มา — ห้ามแก้
  // ทุกฟิลด์ (ชื่อ/คำอธิบาย/permission) ผ่าน service layer เลย ไม่ใช่แค่ UI
  if (current.isDefault) {
    throw new Error('ไม่สามารถแก้ไข Default Role ได้');
  }
  if (current.isSystem && patch.name !== undefined && patch.name !== current.name) {
    throw new Error('ไม่สามารถเปลี่ยนชื่อ Role ระบบได้');
  }
  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    if (!trimmed) throw new Error('กรุณาระบุชื่อ Role');
    if (rows.some((r) => r.id !== id && r.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Role ชื่อ "${trimmed}" มีอยู่แล้ว`);
    }
  }
  const updated: Role = {
    ...current,
    ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
    ...(patch.description !== undefined ? { description: patch.description.trim() || undefined } : {}),
    ...(patch.permissions !== undefined ? { permissions: [...new Set(patch.permissions)] } : {}),
    updatedAt: new Date().toISOString(),
  };
  const next = [...rows];
  next[idx] = updated;
  writeRolesRaw(next);
  return updated;
}

export function deleteRole(id: string): void {
  const rows = listRoles();
  const role = rows.find((r) => r.id === id);
  if (!role) return;
  if (role.isSystem) {
    throw new Error('ไม่สามารถลบ Role ระบบได้');
  }
  writeRolesRaw(rows.filter((r) => r.id !== id));
}
