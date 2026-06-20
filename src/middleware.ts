import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
    '/api/users/login',
    '/api/users/register',
    '/api/users/logout',
];

export default function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Handle API routes separately — they don't need i18n middleware
    if (pathname.startsWith("/api")) {
        // Skip auth check for public routes
        const isPublicRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
        
        // Skip auth check for public GET endpoints (packages, systems, services)
        const isPublicGetApi = request.method === 'GET' && (
            pathname.startsWith('/api/packages') ||
            pathname.startsWith('/api/systems') ||
            pathname.startsWith('/api/services') ||
            pathname.startsWith('/api/clients') ||
            pathname.startsWith('/api/faqs') ||
            pathname.startsWith('/api/hero-images')
        );

        if (!isPublicRoute && !isPublicGetApi) {
            const jwtToken = request.cookies.get("jwtToken")?.value;
            if (!jwtToken) {
                return NextResponse.json(
                    { message: 'Authentication required' },
                    { status: 401 }
                );
            }
        }
        // Let API routes proceed without i18n processing
        const response = NextResponse.next();
        response.headers.set("X-Content-Type-Options", "nosniff");
        return response;
    }

    // Handle i18n routes
    const res = intlMiddleware(request);
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    return res;
}

export const config = {
    matcher: [
        "/",
        "/(ar|en)/:path*",
        "/api/:path*"
    ],
};
