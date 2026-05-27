import type { NextAuthConfig } from "next-auth";

// Edge-safe slice of the Auth.js config. middleware.ts imports ONLY this
// module so the edge runtime never pulls in the Credentials provider (which
// transitively imports axios + the backend auth API).
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/buyer") ||
        nextUrl.pathname.startsWith("/seller");
      if (isProtected) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
