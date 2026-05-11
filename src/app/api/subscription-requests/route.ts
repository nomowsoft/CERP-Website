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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const type = searchParams.get('type') || '';
        const skip = (page - 1) * limit;

        const where: any = {};
        if (type && type !== 'ALL') {
            where.type = type;
        }

        const [requests, total] = await Promise.all([
            prisma.subscriptionRequest.findMany({
                where,
                include: {
                    subscription: {
                        include: { user: { select: { name: true, charityName: true } } }
                    },
                    package: true,
                    systems: true,
                    services: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.subscriptionRequest.count({ where })
        ]);

        return NextResponse.json({
            data: requests,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
