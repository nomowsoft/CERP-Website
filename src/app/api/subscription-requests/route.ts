import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { UserDashbord } from '@/utils/types';

/**
 * @method GET
 * @route ~/api/subscription-requests
 * @desc List all subscription requests
 * @access private (Admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userFromToken.id },
            select: { role: true }
        }) as UserDashbord;

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const requests = await prisma.subscriptionRequest.findMany({
            include: {
                subscription: {
                    include: { user: { select: { name: true, charityName: true } } }
                },
                package: true,
                systems: true,
                services: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
