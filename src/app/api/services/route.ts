import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";

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

export async function GET(request: NextRequest) {
    try {
        const services = await prisma.service.findMany({
            include: { contents: true },
            orderBy: { createdAt: 'desc' }
        });

        // Convert Buffer images to Base64 strings
        const formattedServices = services.map(service => ({
            ...service,
            image: formatImage(service.image)
        }));

        return NextResponse.json(formattedServices, { status: 200 });
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

        // Handle image as Bytes if it's a base64 string
        let imageBuffer = null;
        if (body.image && body.image.startsWith('data:image')) {
            const base64Data = body.image.split(',')[1];
            imageBuffer = Buffer.from(base64Data, 'base64');
        }

        const newService = await prisma.service.create({
            data: {
                name: body.name,
                name_en: body.name_en,
                name_ar: body.name_ar,
                price: body.price || 0,
                currency: body.currency || 'SAR',
                description: body.description,
                description_en: body.description_en,
                description_ar: body.description_ar,
                image: imageBuffer as any,
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

        // Convert back for response
        const responseService = {
            ...newService,
            image: formatImage(newService.image)
        };

        return NextResponse.json(responseService, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
