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
                description: body.description,
                image: body.image,
                contents: {
                    create: body.contents?.map((c: string) => ({ name: c })) || []
                }
            },
            include: { contents: true }
        });

        return NextResponse.json(newService, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
