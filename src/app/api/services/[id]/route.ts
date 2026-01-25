import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";

type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const service = await prisma.service.findUnique({
            where: { id: parseInt(id) },
            include: { contents: true }
        });
        if (!service) return NextResponse.json({ message: "Service not found" }, { status: 404 });
        return NextResponse.json(service, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const userFromToken = verifyToken(request);
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        if (user?.role !== 'ADMIN') return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const body = await request.json();

        const updatedService = await prisma.$transaction(async (tx) => {
            // 1. Update basic fields
            await tx.service.update({
                where: { id: parseInt(id) },
                data: {
                    name: body.name,
                    description: body.description,
                    image: body.image,
                }
            });

            // 2. Handle contents (ServiceType)
            if (body.contents) {
                await tx.serviceType.deleteMany({ where: { serviceId: parseInt(id) } });
                if (body.contents.length > 0) {
                    await tx.serviceType.createMany({
                        data: body.contents.map((c: any) => ({
                            name: typeof c === 'string' ? c : c.name,
                            serviceId: parseInt(id)
                        }))
                    });
                }
            }

            return tx.service.findUnique({
                where: { id: parseInt(id) },
                include: { contents: true }
            });
        });

        return NextResponse.json(updatedService, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const userFromToken = verifyToken(request);
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        if (user?.role !== 'ADMIN') return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        await prisma.service.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
