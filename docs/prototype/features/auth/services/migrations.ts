/** One-shot storage migration: wipes legacy officer/auth state so the app
 *  boots cleanly under the new Role+Permission schema. Idempotent — once
 *  `raot_storage_version` matches CURRENT_VERSION this becomes a no-op. */

const STORAGE_VERSION_KEY = 'raot_storage_version';
const CURRENT_VERSION = '2';

/** Keys whose pre-v2 shape is incompatible with the Role-driven schema.
 *  Anything not listed here (e.g. `raot_pending_credentials`) is left alone. */
const LEGACY_KEYS = [
  'raot_auth',
  'raot_officer_accounts',
  'raot_officer_password_overrides',
  'raot_officer_permission_overrides',
  'raot_roles',
];

export function runStorageMigrations(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(STORAGE_VERSION_KEY) === CURRENT_VERSION) return;
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
}
