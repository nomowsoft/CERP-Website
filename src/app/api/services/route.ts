import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";

export async function GET(request: NextRequest) {
    try {
        const services = await prisma.service.findMany({
            include: { contents: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(services, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        if (user?.role !== 'ADMIN') return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const body = await request.json();
        if (!body.name || !body.description || !body.image) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const newService = await prisma.service.create({
            data: {
                name: body.name,
                name_en: body.name_en,
                name_ar: body.name_ar,
                description: body.description,
                description_en: body.description_en,
                description_ar: body.description_ar,
                image: body.image,
                contents: {
                    create: body.contents?.map((c: any) => ({
                        name: typeof c === 'string' ? c : c.name,
                        name_en: typeof c === 'object' ? c.name_en : '',
                        name_ar: typeof c === 'object' ? c.name_ar : ''
                    })) || []
                }
            },
            include: { contents: true }
        });

        return NextResponse.json(newService, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
