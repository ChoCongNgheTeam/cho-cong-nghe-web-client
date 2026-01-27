import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
   const { pathname } = req.nextUrl;

   // Đọc refresh token từ cookie (HTTP-only cookie từ backend)
   const refreshToken = req.cookies.get("refreshToken")?.value;

   const isLoggedIn = Boolean(refreshToken);

   if (pathname.startsWith("/profile") && !isLoggedIn) {
      const loginUrl = new URL("/account", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
   }

   // Protect admin routes
   if (pathname.startsWith("/admin") && !isLoggedIn) {
      const loginUrl = new URL("/account", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
   }

   // Redirect logged-in users away from auth pages
   if (isLoggedIn && (pathname === "/account" || pathname === "/account")) {
      return NextResponse.redirect(new URL("/", req.url));
   }

   return NextResponse.next();
}

export const config = {
   matcher: ["/profile/:path*", "/admin/:path*", "/account", "/account"],
};
