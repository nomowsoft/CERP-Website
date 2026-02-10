// VERSION: 2.0.1
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

        if (!(prisma as any).systemSetting) {
            console.error("Prisma systemSetting property missing!");
            return NextResponse.json({ message: "Internal Server Error: Prisma Error" }, { status: 500 });
        }

        const settings = await prisma.systemSetting.findMany();

        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap, { status: 200 });
    } catch (error: any) {
        console.error("[Settings GET] Error:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
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
        console.log("[Settings POST] v2.0.1 Received request");
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
        console.log("[Settings POST] Data:", { key, value });

        if (!key || value === undefined) {
            return NextResponse.json({ message: "Key and value are required" }, { status: 400 });
        }

        const keys = Object.keys(prisma);
        console.log("[Settings POST] Prisma Keys:", keys.filter(k => !k.startsWith('$')));

        // Try to find the model name regardless of case/plural
        const modelName = keys.find(k => k.toLowerCase() === 'systemsetting' || k.toLowerCase() === 'systemsettings');
        console.log("[Settings POST] Matched model name:", modelName);

        if (!modelName || !(prisma as any)[modelName]) {
            throw new Error(`Model 'SystemSetting' not found on Prisma client. Available models: ${keys.filter(k => !k.startsWith('$')).join(', ')}`);
        }

        const setting = await (prisma as any)[modelName].upsert({
            where: { key: String(key) },
            update: { value: String(value) },
            create: { key: String(key), value: String(value) }
        });

        console.log("[Settings POST] Success:", setting);
        return NextResponse.json(setting, { status: 200 });
    } catch (error: any) {
        console.error("[Settings POST] Error:", error);
        return NextResponse.json({
            message: 'Internal Server Error',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
