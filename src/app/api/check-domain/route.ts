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
        const { domainName, domainType } = body;

        if (!domainName) {
            return NextResponse.json({ message: "Domain name is required" }, { status: 400 });
        }

        // 1. Check Internal Database
        const existingInternal = await prisma.subscription.findFirst({
            where: {
                domainName: domainName,
                status: {
                    in: ['DONE', 'PROGRES', 'DRAFT']
                }
            }
        });

        if (existingInternal) {
            return NextResponse.json(
                { available: false, message: "This domain is already registered in our system." },
                { status: 200 } // Return 200 with available: false to let frontend handle it gracefully
            );
        }

        // 2. Check External API (Only for Custom Domains)
        if (domainType === 'CUSTOM_DOMAIN') {
            try {
                // API Ninjas Configuration
                // NOTE: In production, store this key in process.env.API_NINJAS_KEY
                const apiKey = '1KFwkMpz7KayZNUdunTEgZcpyPcpf1p0W9ZUXinW';
                const apiRes = await axios.get(`https://api.api-ninjas.com/v1/domain?domain=${domainName}`, {
                    headers: { 'X-Api-Key': apiKey }
                });

                if (apiRes.data && apiRes.data.available === false) {
                    return NextResponse.json(
                        { available: false, message: "This domain is unavailable or reserved globally." },
                        { status: 200 }
                    );
                }
            } catch (error) {
                console.error("External domain check failed:", error);
                // Optionally: return error or allow to proceed with warning.
                // For now, we allow proceeding if external check fails to avoid blocking users.
            }
        }

        return NextResponse.json({ available: true, message: "Domain is available" }, { status: 200 });

    } catch (error: any) {
        console.error("Domain Check Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
