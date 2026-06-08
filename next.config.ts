import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

// Use production HyperPay domains in prod, test domains in dev
const hyperPayDomain = isProduction
    ? 'https://eu-prod.oppwa.com'
    : 'https://eu-test.oppwa.com https://test.oppwa.com';

const nextConfig: NextConfig = {
    turbopack: {
        root: path.resolve(__dirname),
    },
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
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    {
                        key: "Content-Security-Policy",
                        value: `
                            default-src 'self';
                            script-src 'self' 'unsafe-inline' 'unsafe-eval' ${hyperPayDomain};
                            style-src 'self' 'unsafe-inline' ${hyperPayDomain};
                            img-src 'self' https: data: blob:;
                            font-src 'self' https: data:;
                            connect-src 'self' https: ${hyperPayDomain};
                            frame-src 'self' https: data: blob: ${hyperPayDomain};
                            frame-ancestors 'none';
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