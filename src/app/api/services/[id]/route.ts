import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";

type Props = {
    params: Promise<{ id: string }>;
};

// Helper to format image for frontend
const formatImage = (image: any) => {
    if (!image) return null;
    const buf = Buffer.from(image);
    const imageStr = buf.toString('utf8');
    if (imageStr.startsWith('http') || imageStr.startsWith('data:image')) {
        return imageStr;
    }
    return `data:image/png;base64,${buf.toString('base64')}`;
};

export async function GET(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const service = await prisma.service.findUnique({
            where: { id: parseInt(id) },
            include: { contents: true }
        });
        if (!service) return NextResponse.json({ message: "Service not found" }, { status: 404 });

        // Convert Buffer image to Base64 string
        const formattedService = {
            ...service,
            image: formatImage(service.image)
        };

        return NextResponse.json(formattedService, { status: 200 });
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

        // Handle image as Bytes if it's a base64 string
        let imageUpdateData: any = undefined;
        if (body.image !== undefined) {
            if (body.image && body.image.startsWith('data:image')) {
                const base64Data = body.image.split(',')[1];
                imageUpdateData = Buffer.from(base64Data, 'base64');
            } else if (body.image === null) {
                imageUpdateData = null;
            }
        }

        const updatedService = await prisma.$transaction(async (tx) => {
            // 1. Update basic fields
            await tx.service.update({
                where: { id: parseInt(id) },
                data: {
                    name: body.name,
                    name_en: body.name_en,
                    name_ar: body.name_ar,
                    price: body.price === "" || body.price === null || body.price === undefined ? 0 : Number(body.price),
                    currency: body.currency || 'SAR',
                    description: body.description,
                    description_en: body.description_en,
                    description_ar: body.description_ar,
                    ...(imageUpdateData !== undefined && { image: imageUpdateData }),
                }
            });

            // 2. Handle contents (ServiceType)
            if (body.contents) {
                await tx.serviceType.deleteMany({ where: { serviceId: parseInt(id) } });
                if (body.contents.length > 0) {
                    await tx.serviceType.createMany({
                        data: body.contents.map((c: any) => ({
                            name: typeof c === 'string' ? c : c.name,
                            name_en: typeof c === 'object' ? c.name_en : '',
                            name_ar: typeof c === 'object' ? c.name_ar : '',
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

        // Convert back for response
        const responseService = {
            ...updatedService,
            image: updatedService ? formatImage(updatedService.image) : null
        };

        return NextResponse.json(responseService, { status: 200 });
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
