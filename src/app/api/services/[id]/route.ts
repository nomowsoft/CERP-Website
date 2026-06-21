import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { formatImage } from "@/utils/imageUtils";

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

        // Convert Buffer image to Base64 string
        const formattedService = {
            ...service,
            price: Number(service.price),
            renewalPrice: Number(service.renewalPrice),
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

        let imageValue = undefined;
        if (body.image !== undefined) {
            if (body.image === null || body.image === "") {
                imageValue = null;
            } else {
                imageValue = body.image;
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
                    renewalPrice: body.renewalPrice === "" || body.renewalPrice === null || body.renewalPrice === undefined ? 0 : Number(body.renewalPrice),
                    currency: body.currency || 'SAR',
                    description: body.description,
                    description_en: body.description_en,
                    description_ar: body.description_ar,
                    ...(imageValue !== undefined && { image: imageValue }),
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
            price: Number(updatedService?.price),
            renewalPrice: Number(updatedService?.renewalPrice),
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
