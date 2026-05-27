import { User, UserRole } from '@/shared/types';

const AUTH_KEY = 'raot_auth';
const RESET_TOKENS_KEY = 'raot_reset_tokens';
const OFFICER_ACCOUNTS_KEY = 'raot_officer_accounts';
const OFFICER_PW_OVERRIDES_KEY = 'raot_officer_password_overrides';

// Session lifetimes — POC values; production values would come from a config.
const SESSION_TTL_MS = 60 * 60 * 1000;            // 1 hour (no Remember Me)
const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days (Remember Me)
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;        // 1 hour

export type LoginErrorCode = 'INVALID_CREDENTIALS' | 'ACCOUNT_PENDING' | 'ACCOUNT_SUSPENDED';

export class AuthError extends Error {
  constructor(
    public code: LoginErrorCode,
    message: string,
    public applicationId?: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

interface SessionEnvelope {
  user: User;
  token: string;
  expiresAt: number;
}

function writeSession(envelope: SessionEnvelope, remember: boolean) {
  if (typeof window === 'undefined') return;
  const json = JSON.stringify(envelope);
  if (remember) {
    localStorage.setItem(AUTH_KEY, json);
    sessionStorage.removeItem(AUTH_KEY);
  } else {
    sessionStorage.setItem(AUTH_KEY, json);
    localStorage.removeItem(AUTH_KEY);
  }
}

function readSessionEnvelope(): SessionEnvelope | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY) ?? sessionStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as SessionEnvelope; } catch { return null; }
}

function clearSessionStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
}

// ─── Built-in mock users ─────────────────────────────────────────────────────
// Three primary roles (buyer/seller/master) plus two demo officer accounts to
// showcase the Role+Permission system out of the box.

interface MockUserEntry {
  username: string;
  password: string;
  user: User;
}

const MOCK_USER_ENTRIES: MockUserEntry[] = [
  {
    username: 'buyer01',
    password: 'buyer1234',
    user: {
      id: 'U001',
      username: 'buyer01',
      fullName: 'นายสมชาย ใจดี',
      fullNameEn: 'Somchai Jaidee',
      email: 'buyer01@example.com',
      phone: '0812345678',
      role: 'buyer',
      market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
      markets: [
        'ตลาดกลางยางพาราสุราษฎร์ธานี',
        'ตลาดกลางยางพารานครศรีธรรมราช',
      ],
      address: '123 ถ.สุราษฎร์ อ.เมือง จ.สุราษฎร์ธานี 84000',
      status: 'active',
      createdAt: '2024-01-15',
    },
  },
  {
    username: 'seller01',
    password: 'seller1234',
    user: {
      id: 'U002',
      username: 'seller01',
      fullName: 'นายสมศักดิ์ เกษตรกร',
      fullNameEn: 'Somsak Kasettakorn',
      email: 'seller01@example.com',
      phone: '0823456789',
      role: 'seller',
      market: 'ตลาดกลางยางพาราสุราษฎร์ธานี',
      status: 'active',
      createdAt: '2024-01-20',
    },
  },
  {
    username: 'master',
    password: 'master1234',
    user: {
      id: 'U000',
      username: 'master',
      fullName: 'ผู้ดูแลระบบหลัก',
      fullNameEn: 'System Master',
      email: 'master@raot.local',
      role: 'master',
      status: 'active',
      createdAt: '2023-12-01',
    },
  },
  {
    username: 'officer01',
    password: 'officer1234',
    user: {
      id: 'U010',
      username: 'officer01',
      fullName: 'เจ้าหน้าที่ (Default Role)',
      fullNameEn: 'Officer Default',
      email: 'officer01@example.com',
      role: 'officer',
      // No roleId → falls back to Default role (no permissions beyond Dashboard)
      status: 'active',
      createdAt: '2024-02-01',
    },
  },
  {
    username: 'officer02',
    password: 'officer1234',
    user: {
      id: 'U011',
      username: 'officer02',
      fullName: 'เจ้าหน้าที่ประมูล (Auction Demo)',
      fullNameEn: 'Officer Auction',
      email: 'officer02@example.com',
      role: 'officer',
      roleId: 'role-auction-demo',
      status: 'active',
      createdAt: '2024-02-05',
    },
  },
];

function findMockEntry(username: string): MockUserEntry | undefined {
  return MOCK_USER_ENTRIES.find((e) => e.username === username);
}

/** Per-role primary credentials used by the login UI to render demo hints
 *  and to auto-fill the form on role change. */
export const MOCK_CREDENTIALS_FOR_DISPLAY: Record<UserRole, { username: string; password: string }> = {
  buyer:   { username: 'buyer01',   password: 'buyer1234' },
  seller:  { username: 'seller01',  password: 'seller1234' },
  officer: { username: 'officer01', password: 'officer1234' },
  master:  { username: 'master',    password: 'master1234' },
};

/** Reserved username for the system Master account. Service-layer mutations
 *  refuse to touch this username so non-Master callers with `officers`
 *  permission cannot lock out / reset / impersonate Master via the API. */
export const MASTER_USERNAME = 'master';

/** True if a username belongs to the singleton Master account. Centralised
 *  here so future multi-master schemas can update the predicate in one place. */
export function isMasterUsername(username: string): boolean {
  return username === MASTER_USERNAME;
}

// ─── Officer accounts (Master-created, persisted in localStorage) ────────────
// Each account references a Role by id. Undefined roleId → Default role.

export interface OfficerAccount {
  id: string;
  username: string;
  password: string;        // plaintext for POC — production uses bcrypt
  fullName: string;
  email: string;
  phone?: string;
  /** Reference to a Role.id. Undefined means use the Default role. */
  roleId?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

function readOfficerAccounts(): OfficerAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(OFFICER_ACCOUNTS_KEY) ?? '[]') as OfficerAccount[];
  } catch { return []; }
}

function writeOfficerAccounts(rows: OfficerAccount[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFICER_ACCOUNTS_KEY, JSON.stringify(rows));
}

export function listOfficerAccounts(): OfficerAccount[] {
  return readOfficerAccounts();
}

export function getOfficerAccount(username: string): OfficerAccount | null {
  return readOfficerAccounts().find((a) => a.username === username) ?? null;
}

/** Thrown when a service-layer mutation refuses to touch the Master account.
 *  Master is a built-in singleton — any non-Master caller (even one with the
 *  `officers` permission) must never be able to suspend, rename, delete, or
 *  reset the Master through these APIs. UI surfaces also disable the buttons
 *  but the service is the hard gate. */
const MASTER_MUTATION_ERROR = 'Master account ไม่สามารถจัดการจาก API นี้ได้';

export function addOfficerAccount(input: Omit<OfficerAccount, 'id' | 'createdAt'>): OfficerAccount {
  if (isMasterUsername(input.username)) {
    throw new Error(MASTER_MUTATION_ERROR);
  }
  const rows = readOfficerAccounts();
  if (rows.some((r) => r.username === input.username) ||
      MOCK_USER_ENTRIES.some((e) => e.username === input.username)) {
    throw new Error(`username "${input.username}" มีอยู่ในระบบแล้ว`);
  }
  const account: OfficerAccount = {
    ...input,
    id: `OFF-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  writeOfficerAccounts([...rows, account]);
  return account;
}

export function updateOfficerAccount(
  username: string,
  patch: Partial<Pick<OfficerAccount, 'roleId' | 'status' | 'fullName' | 'email' | 'phone'>>,
): void {
  if (isMasterUsername(username)) {
    throw new Error(MASTER_MUTATION_ERROR);
  }
  const rows = readOfficerAccounts();
  const idx = rows.findIndex((r) => r.username === username);
  if (idx === -1) return;
  rows[idx] = { ...rows[idx], ...patch };
  writeOfficerAccounts(rows);
}

export function removeOfficerAccount(username: string): void {
  if (isMasterUsername(username)) {
    throw new Error(MASTER_MUTATION_ERROR);
  }
  writeOfficerAccounts(readOfficerAccounts().filter((r) => r.username !== username));
}

// ─── Password reset overrides (built-in mock users + admin-created) ─────────

function readPwOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(OFFICER_PW_OVERRIDES_KEY) ?? '{}') as Record<string, string>;
  } catch { return {}; }
}

function writePwOverrides(map: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFICER_PW_OVERRIDES_KEY, JSON.stringify(map));
}

export function effectivePasswordFor(username: string): string | null {
  const o = readPwOverrides();
  if (o[username]) return o[username];
  const acc = readOfficerAccounts().find((a) => a.username === username);
  if (acc) return acc.password;
  const entry = findMockEntry(username);
  return entry?.password ?? null;
}

export function setOfficerPassword(username: string, newPassword: string): void {
  if (isMasterUsername(username)) {
    // Master password is a system credential — must be rotated out-of-band
    // (manually clearing the override key in dev tools). Refusing here means
    // that even if a non-Master with `officers` permission triggers this
    // function (e.g. via a manipulated UI), they cannot lock out Master.
    throw new Error(MASTER_MUTATION_ERROR);
  }
  const rows = readOfficerAccounts();
  const idx = rows.findIndex((r) => r.username === username);
  if (idx !== -1) {
    rows[idx] = { ...rows[idx], password: newPassword };
    writeOfficerAccounts(rows);
    const o = readPwOverrides();
    delete o[username];
    writePwOverrides(o);
    return;
  }
  if (findMockEntry(username)) {
    const o = readPwOverrides();
    o[username] = newPassword;
    writePwOverrides(o);
  }
}

// ─── Pending registration helpers (buyer/seller wizard) ─────────────────────

function readPendingCredFromStorage(username: string): { role: UserRole; applicationId: string; password: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const map = JSON.parse(localStorage.getItem('raot_pending_credentials') ?? '{}');
    return map[username] ?? null;
  } catch { return null; }
}

function readAppOverrideStatus(appId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const map = JSON.parse(localStorage.getItem('raot_application_overrides') ?? '{}');
    return map[appId]?.status ?? null;
  } catch { return null; }
}

// ─── Login ───────────────────────────────────────────────────────────────────
// Role is no longer a login parameter — it's derived from the matched user
// record. Officers and master share the same form; the auth service figures
// out which kind they are based on the username match.

export function loginWithCredentials(
  username: string,
  password: string,
  remember = false,
): User {
  const ttl = remember ? REMEMBER_TTL_MS : SESSION_TTL_MS;

  // 1) Built-in mock users (buyer/seller/master/officer demos)
  const entry = findMockEntry(username);
  if (entry) {
    const effective = effectivePasswordFor(username) ?? entry.password;
    if (password !== effective) {
      throw new AuthError('INVALID_CREDENTIALS', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
    const baseUser = entry.user;
    if (baseUser.status === 'pending') {
      throw new AuthError('ACCOUNT_PENDING', 'บัญชีของท่านอยู่ระหว่างการตรวจสอบ');
    }
    if (baseUser.status === 'suspended') {
      throw new AuthError('ACCOUNT_SUSPENDED', 'บัญชีของท่านถูกระงับ กรุณาติดต่อเจ้าหน้าที่');
    }
    writeSession({ user: baseUser, token: `mock-token-${baseUser.role}`, expiresAt: Date.now() + ttl }, remember);
    return baseUser;
  }

  // 2) Master-created officer accounts (localStorage)
  const account = getOfficerAccount(username);
  if (account) {
    if (account.password !== password) {
      throw new AuthError('INVALID_CREDENTIALS', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
    if (account.status === 'suspended') {
      throw new AuthError('ACCOUNT_SUSPENDED', 'บัญชีของท่านถูกระงับ กรุณาติดต่อเจ้าหน้าที่');
    }
    const user: User = {
      id: account.id,
      username: account.username,
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
      role: 'officer',
      roleId: account.roleId,
      status: 'active',
      createdAt: account.createdAt.split('T')[0],
    };
    writeSession({ user, token: `mock-token-${account.id}-${Date.now()}`, expiresAt: Date.now() + ttl }, remember);
    return user;
  }

  // 3) Pending buyer/seller registrations
  const pendingCred = readPendingCredFromStorage(username);
  if (pendingCred) {
    if (pendingCred.password !== password) {
      throw new AuthError('INVALID_CREDENTIALS', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
    const overrideStatus = readAppOverrideStatus(pendingCred.applicationId);
    if (overrideStatus === 'approved') {
      const user: User = {
        id: pendingCred.applicationId,
        username,
        fullName: username,
        email: '',
        role: pendingCred.role,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      writeSession({ user, token: `mock-token-${pendingCred.role}-${Date.now()}`, expiresAt: Date.now() + ttl }, remember);
      return user;
    }
    throw new AuthError(
      'ACCOUNT_PENDING',
      'บัญชีของท่านอยู่ระหว่างการตรวจสอบ กรุณารอการอนุมัติ',
      pendingCred.applicationId,
    );
  }

  throw new AuthError('INVALID_CREDENTIALS', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
}

export function logout() {
  clearSessionStorage();
}

export function getSession(): { user: User; token: string } | null {
  const env = readSessionEnvelope();
  if (!env) return null;
  if (env.expiresAt && env.expiresAt < Date.now()) {
    clearSessionStorage();
    return null;
  }
  return { user: env.user, token: env.token };
}

export type SessionStatus =
  | { status: 'valid'; session: { user: User; token: string } }
  | { status: 'expired' }
  | { status: 'none' };

export function consumeSession(): SessionStatus {
  const env = readSessionEnvelope();
  if (!env) return { status: 'none' };
  if (env.expiresAt && env.expiresAt < Date.now()) {
    clearSessionStorage();
    return { status: 'expired' };
  }
  return { status: 'valid', session: { user: env.user, token: env.token } };
}

// ─── Forgot / Reset password (POC mock — real flow emails the link) ─────────

export type ResetTokenError = 'INVALID_TOKEN' | 'EXPIRED_TOKEN';

interface ResetTokenRecord {
  email: string;
  expiresAt: number;
}

function readResetTokens(): Record<string, ResetTokenRecord> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) ?? '{}');
  } catch { return {}; }
}

function writeResetTokens(map: Record<string, ResetTokenRecord>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(map));
}

export function requestPasswordReset(email: string): { token: string; expiresAt: number } {
  const token = `rst_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;
  const map = readResetTokens();
  map[token] = { email, expiresAt };
  writeResetTokens(map);
  return { token, expiresAt };
}

export function verifyResetToken(token: string): { email: string } | { error: ResetTokenError } {
  const rec = readResetTokens()[token];
  if (!rec) return { error: 'INVALID_TOKEN' };
  if (rec.expiresAt < Date.now()) return { error: 'EXPIRED_TOKEN' };
  return { email: rec.email };
}

export function resetPassword(token: string): { ok: true } | { ok: false; error: ResetTokenError } {
  const verify = verifyResetToken(token);
  if ('error' in verify) return { ok: false, error: verify.error };
  const map = readResetTokens();
  delete map[token];
  writeResetTokens(map);
  return { ok: true };
}

// ─── Session refresh (cross-tab sync) ───────────────────────────────────────
// Compare the live session against the latest officer state. Reports what
// changed so RoleLayout can react: refresh permissions in-place, redirect on
// role change, or force logout on suspend / delete.

export type SessionRefresh =
  | { kind: 'unchanged' }
  | { kind: 'updated'; user: User }
  | { kind: 'role_changed'; oldRole: UserRole; newRole: UserRole }
  | { kind: 'suspended' }
  | { kind: 'gone' }
  | { kind: 'no-session' };

function writeSessionUser(user: User): void {
  const env = readSessionEnvelope();
  if (!env) return;
  const updated: SessionEnvelope = { ...env, user };
  const json = JSON.stringify(updated);
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(AUTH_KEY)) {
    localStorage.setItem(AUTH_KEY, json);
  } else if (sessionStorage.getItem(AUTH_KEY)) {
    sessionStorage.setItem(AUTH_KEY, json);
  }
}

function sameUser(a: User, b: User): boolean {
  return a.id === b.id
    && a.username === b.username
    && a.role === b.role
    && a.roleId === b.roleId
    && a.status === b.status
    && a.fullName === b.fullName;
}

export function refreshSession(): SessionRefresh {
  const env = readSessionEnvelope();
  if (!env) return { kind: 'no-session' };
  const u = env.user;

  // Built-in mock users — role + identity are immutable; only password can be
  // overridden at runtime, which doesn't require re-issuing the user object.
  const entry = findMockEntry(u.username);
  if (entry) {
    if (entry.user.status === 'suspended') return { kind: 'suspended' };
    return sameUser(u, entry.user) ? { kind: 'unchanged' } : { kind: 'updated', user: entry.user };
  }

  // Master-created officer accounts
  const acc = getOfficerAccount(u.username);
  if (!acc) {
    if (!readPendingCredFromStorage(u.username)) return { kind: 'gone' };
    return { kind: 'unchanged' };
  }
  if (acc.status === 'suspended') return { kind: 'suspended' };
  const newUser: User = {
    id: acc.id,
    username: acc.username,
    fullName: acc.fullName,
    email: acc.email,
    phone: acc.phone,
    role: 'officer',
    roleId: acc.roleId,
    status: 'active',
    createdAt: acc.createdAt.split('T')[0],
  };
  if (u.role !== 'officer') {
    return { kind: 'role_changed', oldRole: u.role, newRole: 'officer' };
  }
  if (sameUser(u, newUser)) return { kind: 'unchanged' };
  writeSessionUser(newUser);
  return { kind: 'updated', user: newUser };
}

export function getRedirectPath(role: UserRole): string {
  if (role === 'buyer') return '/buyer/dashboard';
  if (role === 'seller') return '/seller/dashboard';
  return '/officer/dashboard'; // officer + master share the officer-side root
}
