import type { Role } from "@/lib/casl";

export type User = {
  id: number | string;
  email: string;
  name?: string;
  role: Role;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
  accessTokenExpiresIn?: number;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresIn?: number;
};
