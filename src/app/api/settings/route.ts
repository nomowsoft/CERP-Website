import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';

export const dynamic = 'force-dynamic';

/**
 * @method GET
 * @route ~/api/settings
 * @desc Get all system settings
 * @access Private
 */
export async function GET(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const settings = await prisma.systemSetting.findMany();

        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap, { status: 200 });
    } catch (error: any) {
        console.error("[Settings GET] Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @method POST
 * @route ~/api/settings
 * @desc Update or create a system setting
 * @access Private (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userFromToken.id },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden: Admin only" }, { status: 403 });
        }

        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ message: "Key and value are required" }, { status: 400 });
        }

        const setting = await prisma.systemSetting.upsert({
            where: { key: String(key) },
            update: { value: String(value) },
            create: { key: String(key), value: String(value) }
        });

        return NextResponse.json(setting, { status: 200 });
    } catch (error: any) {
        console.error("[Settings POST] Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
