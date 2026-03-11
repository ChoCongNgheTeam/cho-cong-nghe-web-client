import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
   const hasSession = request.cookies.has("refreshToken");

   if (hasSession) {
      return NextResponse.redirect(new URL("/", request.url));
   }

   return NextResponse.next();
}

export const config = {
   matcher: ["/account"],
};
