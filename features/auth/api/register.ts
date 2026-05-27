import { authBackendClient } from "./client";
import type { RegisterRequest, User } from "../types";

export async function register(input: RegisterRequest): Promise<User> {
  const { data } = await authBackendClient.post<User>("/auth/register", input);
  return data;
}
