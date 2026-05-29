import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authConfig } from "./auth.config";

const LOCALES = ["th", "en"] as const;
const DEFAULT_LOCALE = "th";
const PROTECTED_PREFIXES = ["/buyer", "/seller"];

const { auth } = NextAuth(authConfig);

function resolveLocale(req: NextRequest): string {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;

  if (cookie && (LOCALES as readonly string[]).includes(cookie)) {
    return cookie;
  }

  const tag =
    req.headers
      .get("accept-language")
      ?.split(",")[0]
      ?.split(";")[0]
      ?.trim()
      .slice(0, 2) ?? "";

  return (LOCALES as readonly string[]).includes(tag) ? tag : DEFAULT_LOCALE;
}

export default auth(function middleware(req) {
  // IMPORTANT
  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth?.user;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  const locale = resolveLocale(req);

  const requestHeaders = new Headers(req.headers);

  requestHeaders.set("X-NEXT-INTL-LOCALE", locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
