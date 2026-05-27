import axios from "axios";

// Internal axios instance for auth-flow endpoints (login, register, refresh).
// Must NOT use @/lib/axios — that interceptor reads the Auth.js session,
// which does not yet exist during login and is the thing being refreshed
// during refresh, so reusing it would recurse or attach stale tokens.
export const authBackendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});
