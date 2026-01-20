import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const res = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api")) {
    const JwtToken = request.cookies.get("jwtToken")?.value as string;
    if (!JwtToken) {
      return NextResponse.json({ message: 'not token provider, message from middleware' }, { status: 401 });
    }
  }
  
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*"],
};
