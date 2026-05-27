import { authBackendClient } from "./client";
import type { RefreshTokenResponse } from "../types";

export async function refreshToken(
  refreshToken: string,
): Promise<RefreshTokenResponse> {
  const { data } = await authBackendClient.post<RefreshTokenResponse>(
    "/auth/refresh",
    { refreshToken },
  );
  return data;
}
