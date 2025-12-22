import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const res = intlMiddleware(req);

  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");

  return res;
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*"],
};
