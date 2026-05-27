import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

import type { Role } from "@/lib/casl";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: Role;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: "RefreshAccessTokenError";
    user: DefaultSession["user"] & { id: string; role: Role };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    // email is non-null so the spread into Session.user (which intersects
    // AdapterUser and requires a non-null email) type-checks.
    user?: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
    };
    error?: "RefreshAccessTokenError";
  }
}
