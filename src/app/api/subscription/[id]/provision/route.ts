import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { ServerManager } from '@/utils/serverManager';

export const maxDuration = 300; // Allow up to 5 minutes execution time on Vercel


type Props = {
    params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Props) {
    try {
        const userFromToken = verifyToken(request);
        const { id } = await params;
        const subId = parseInt(id);

        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 });
        }

        const subscription = await prisma.subscription.findUnique({ 
            where: { id: subId },
            include: { package: true }
        });
        
        if (!subscription) {
            return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
        }

        // console.log(`[ManualProvision] Manually triggering provisioning for subscription ${subId}`);
        const provisioningResult = await ServerManager.provisionServer(subId);

        if (provisioningResult.success) {
            return NextResponse.json({
                message: "Provisioning started successfully",
                message_ar: "بدأ تجهيز النظام بنجاح",
                success: true,
                result: provisioningResult
            });
        } else {
            return NextResponse.json({
                message: provisioningResult.message || "Provisioning failed",
                message_ar: provisioningResult.message || "فشل تجهيز النظام",
                success: false,
                result: provisioningResult
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error("[ManualProvision] Error:", error);
        return NextResponse.json({ 
            message: 'Internal Server Error', 
            error: error.message 
        }, { status: 500 });
    }
}
