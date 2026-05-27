import { authBackendClient } from "./client";
import type { LoginResponse, LoginRequest } from "../types";

export async function login(input: LoginRequest): Promise<LoginResponse> {
  const { data } = await authBackendClient.post<LoginResponse>(
    "/auth/login",
    input,
  );
  return data;
}
