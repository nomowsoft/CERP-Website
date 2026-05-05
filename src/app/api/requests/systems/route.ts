import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';

/**
 * @method GET
 * @route ~/api/requests/systems
 * @desc Get all ADD_SYSTEM requests
 * @access private for ADMIN
 */
export async function GET(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch ADD_SYSTEM requests
        const requests = await prisma.subscriptionRequest.findMany({
            where: { type: 'ADD_SYSTEM', status: 'PENDING' },
            include: {
                subscription: {
                    include: {
                        user: { select: { name: true, charityName: true, email: true } }
                    }
                },
                systems: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Fetch DRAFT subscriptions with systems (New Subscriptions)
        const draftSubscriptions = await prisma.subscription.findMany({
            where: { status: 'DRAFT', systems: { some: {} } },
            include: {
                user: { select: { name: true, charityName: true, email: true } },
                systems: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Unified format
        const unifiedRequests = [
            ...requests.map(r => ({
                id: r.id,
                subscriptionId: r.subscriptionId,
                type: 'ADD_SYSTEM',
                customer: r.subscription.user,
                systems: r.systems.map(sys => ({ ...sys, price: Number(sys.price) })),
                createdAt: r.createdAt,
                status: r.status,
                licenseFile: r.licenseFile || r.subscription.licenseFile,
                charityRegisterNo: r.subscription.charityRegisterNo,
                bankReceipt: r.bankReceipt || r.subscription.bankReceipt
            })),
            ...draftSubscriptions.map(s => ({
                id: s.id,
                subscriptionId: s.id,
                type: 'NEW_SUBSCRIPTION',
                isNewSub: true,
                customer: s.user,
                systems: s.systems.map(sys => ({ ...sys, price: Number(sys.price) })),
                createdAt: s.createdAt,
                status: 'PENDING', // Map DRAFT to PENDING for UI
                licenseFile: s.licenseFile,
                charityRegisterNo: s.charityRegisterNo,
                bankReceipt: s.bankReceipt
            }))
        ];

        return NextResponse.json(unifiedRequests, { status: 200 });
    } catch (error) {
        console.error("Error fetching system requests:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
