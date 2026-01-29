import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoggedIn = false; // TODO: đọc cookie / token

  // Protect profile
  // if (pathname.startsWith("/profile") && !isLoggedIn) {
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }

  // Protect admin
  if (pathname.startsWith("/admin") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*"],
};
