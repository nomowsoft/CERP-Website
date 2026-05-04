import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { PackageType } from "@/generated/prisma";
import { PackageDTO } from "@/utils/types";

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
        const packages = await prisma.package.findMany({
            include: { 
                features: true,
                systems: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Convert Buffer images to Base64 strings
        const formattedPackages = packages.map(pkg => ({
            ...pkg,
            image: formatImage(pkg.image),
            systems: pkg.systems?.map(system => ({
                ...system,
                icon: formatImage(system.icon)
            })) || []
        }));

        return NextResponse.json(formattedPackages, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // try {
    const userFromToken = verifyToken(request);
    if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
    if (user?.role !== 'ADMIN') return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await request.json();
    // Basic validation
    if (!body.name || !body.type || !body.description || !body.image) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Handle image as Bytes if it's a base64 string
    let imageBuffer = null;
    if (body.image && body.image.startsWith('data:image')) {
        const base64Data = body.image.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
    }

    const newPackage = await prisma.package.create({
        data: {
            name: body.name,
            name_en: body.name_en,
            name_ar: body.name_ar,
            type: body.type as PackageType,
            description: body.description,
            description_en: body.description_en,
            description_ar: body.description_ar,
            image: imageBuffer as any,
            price: body.price,
            currency: body.currency,
            features: {
                create: body.features?.map((f: any) => ({
                    text: typeof f === 'string' ? f : f.text,
                    text_en: typeof f === 'object' ? f.text_en : '',
                    text_ar: typeof f === 'object' ? f.text_ar : ''
                })) || []
            },
            systems: body.systemIds ? {
                connect: body.systemIds.map((sid: number) => ({ id: sid }))
            } : undefined
        },
        include: { 
            features: true,
            systems: true
        }
    });

    // Convert back for response
    const responsePackage = {
        ...newPackage,
        image: formatImage(newPackage.image),
        systems: newPackage.systems?.map(system => ({
            ...system,
            icon: formatImage(system.icon)
        })) || []
    };

    return NextResponse.json(responsePackage, { status: 201 });
    // } catch (error) {
    //     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    // }
}
