import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { UserDashbord } from '@/utils/types';
import { SubscriptionService } from '@/utils/payment';

type Props = {
    params: Promise<{ id: string }>;
};

/**
 * @method PUT
 * @route ~/api/subscription-requests/:id/approve
 * @desc Approve a subscription request (Renew/Upgrade)
 * @access private (Admin only)
 */
export async function PUT(request: NextRequest, { params }: Props) {
    try {
        const userFromToken = verifyToken(request);
        const { id } = await params;

        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userFromToken.id },
            select: { role: true }
        }) as UserDashbord;

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
        }

        const subscriptionRequest = await prisma.subscriptionRequest.findUnique({
            where: { id: parseInt(id) }
        });

        if (!subscriptionRequest) {
            return NextResponse.json({ message: "Request not found" }, { status: 404 });
        }

        if (subscriptionRequest.status !== 'PENDING') {
            return NextResponse.json({ message: "Request already processed" }, { status: 400 });
        }

        // Update request status
        await prisma.subscriptionRequest.update({
            where: { id: parseInt(id) },
            data: { status: 'APPROVED' }
        });

        // Apply changes to the subscription
        const updatedSubscription = await SubscriptionService.applyRequest(parseInt(id));

        return NextResponse.json({
            message: "Request approved and subscription updated",
            subscription: updatedSubscription
        }, { status: 200 });

    } catch (error) {
        console.error("Approval error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
