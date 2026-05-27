import { auth } from "@/auth";

export async function getServerAccessToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken;
}

export async function getServerRefreshToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.refreshToken;
}
