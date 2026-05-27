"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status, update } = useSession();
  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user,
    accessToken: session?.accessToken,
    error: session?.error,
    update,
  };
}
