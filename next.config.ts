import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    {
                        key: "Content-Security-Policy",
                        value: `
                            default-src 'self';
                            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eu-test.oppwa.com https://test.oppwa.com;
                            style-src 'self' 'unsafe-inline' https://eu-test.oppwa.com https://test.oppwa.com;
                            img-src 'self' https: data: blob:;
                            font-src 'self' https: data:;
                            connect-src 'self' https: https://eu-test.oppwa.com https://test.oppwa.com;
                            frame-src 'self' https: data: blob: https://eu-test.oppwa.com https://test.oppwa.com;
                            frame-ancestors 'self';
                            object-src 'self' data:;
                            base-uri 'self';
                        `.replace(/\s{2,}/g, " ").trim()
                    }
                ]
            }
        ];
    }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);