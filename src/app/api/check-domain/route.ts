import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';

/**
 * @method POST
 * @route ~/api/check-domain
 * @desc Check if a domain is available
 * @access private
 */
export async function POST(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { domainType, licenseFile } = body;

        // Match frontend field names
        let domainName = body.domainName;
        if (!domainName) {
            domainName = domainType === 'SUBDOMAIN' ? body.subdomain : body.customDomain;
        }

        if (!domainName) {
            return NextResponse.json({ message: "Domain name is required" }, { status: 400 });
        }

        // 1. Check Internal Database
        const existingInternal = await prisma.subscription.findFirst({
            where: {
                domainName: domainName,
                status: {
                    in: ['DONE', 'PROGRES', 'DRAFT']
                },
                userId: { not: userFromToken.id }
            }
        });

        if (existingInternal) {
            return NextResponse.json(
                { available: false, message: "This domain is already registered in our system." },
                { status: 200 } // Return 200 with available: false to let frontend handle it gracefully
            );
        }

        // 2. Custom Domains: Skip external check as requested
        if (domainType === 'CUSTOM_DOMAIN') {
            return NextResponse.json({ available: true, message: "Domain is valid" }, { status: 200 });
        }

        return NextResponse.json({ available: true, message: "Domain is available" }, { status: 200 });

    } catch (error: any) {
        console.error("Domain Check Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
