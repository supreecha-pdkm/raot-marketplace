import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";
import { login } from "@/features/auth/api/login";
import { refreshToken } from "@/features/auth/api/refresh-token";
import { loginSchema } from "@/features/auth/utils/validations/login";
import type { Role } from "@/lib/casl";

// Backend does not yet expose token lifetime; assume 15 min. Tighten once
// /auth/login response shape includes accessTokenExpiresIn (or absolute expiry).
const FALLBACK_LIFETIME_MS = 15 * 60 * 1000;
const REFRESH_BUFFER_MS = 60_000;

const MOCK_USERS: Record<
  string,
  { password: string; id: string; name: string; role: Role }
> = {
  "buyer@mail.com": {
    password: "Test@1234",
    id: "mock-buyer-1",
    name: "Buyer Demo",
    role: "buyer",
  },
  "seller@mail.com": {
    password: "Test@1234",
    id: "mock-seller-1",
    name: "Seller Demo",
    role: "seller",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const mock = MOCK_USERS[parsed.data.email];
        if (mock && mock.password === parsed.data.password) {
          return {
            id: mock.id,
            email: parsed.data.email,
            name: mock.name,
            role: mock.role,
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            accessTokenExpires: Date.now() + 365 * 24 * 60 * 60 * 1000,
          };
        }

        try {
          const res = await login(parsed.data);
          return {
            id: String(res.user.id),
            email: res.user.email,
            name: res.user.name,
            role: res.user.role,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            accessTokenExpires:
              Date.now() +
              (res.accessTokenExpiresIn
                ? res.accessTokenExpiresIn * 1000
                : FALLBACK_LIFETIME_MS),
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        // authorize() always returns a non-empty id/email; guard so TS
        // narrows from the upstream User type (which has both optional).
        if (user.id && user.email) {
          token.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
        return token;
      }

      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - REFRESH_BUFFER_MS
      ) {
        return token;
      }

      if (!token.refreshToken) {
        return { ...token, error: "RefreshAccessTokenError" as const };
      }

      try {
        const refreshed = await refreshToken(token.refreshToken);
        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken ?? token.refreshToken,
          accessTokenExpires:
            Date.now() +
            (refreshed.accessTokenExpiresIn
              ? refreshed.accessTokenExpiresIn * 1000
              : FALLBACK_LIFETIME_MS),
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" as const };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      if (token.user) {
        session.user = { ...session.user, ...token.user };
      }
      return session;
    },
  },
});
