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
        if (!userFromToken || userFromToken.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const requests = await prisma.subscriptionRequest.findMany({
            where: {
                type: 'ADD_SYSTEM'
            },
            include: {
                subscription: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                charityName: true,
                                email: true
                            }
                        }
                    }
                },
                systems: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(requests, { status: 200 });
    } catch (error) {
        console.error("Error fetching system requests:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
