import { api } from "./client";

// Isomorphic session-token reader. Lazy imports keep server-only and
// client-only Auth.js entries out of the opposite bundle.
async function getSessionAccessToken(): Promise<string | undefined> {
  if (typeof window === "undefined") {
    const { auth } = await import("@/auth");
    const session = await auth();
    return session?.accessToken;
  }
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  return session?.accessToken;
}

api.interceptors.request.use(async (config) => {
  const token = await getSessionAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Refresh is owned by the Auth.js jwt callback. A 401 here means the
    // refresh already failed (session.error === "RefreshAccessTokenError")
    // or the backend rejected a fresh token. On the client, sign out so the
    // next protected route redirects to /login. On the server, just reject.
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      const { signOut } = await import("next-auth/react");
      await signOut({ redirect: false });
    }
    return Promise.reject(error);
  },
);
