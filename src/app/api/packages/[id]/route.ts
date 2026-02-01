import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { PackageType } from "@/generated/prisma";

type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const pkg = await prisma.package.findUnique({
            where: { id: parseInt(id) },
            include: { features: true }
        });
        if (!pkg) return NextResponse.json({ message: "Package not found" }, { status: 404 });
        return NextResponse.json(pkg, { status: 200 });
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

        // Transaction to update package and replace features
        const updatedPackage = await prisma.$transaction(async (tx) => {
            // 1. Update basic fields
            await tx.package.update({
                where: { id: parseInt(id) },
                data: {
                    name: body.name,
                    name_en: body.name_en,
                    name_ar: body.name_ar,
                    type: body.type as PackageType,
                    description: body.description,
                    description_en: body.description_en,
                    description_ar: body.description_ar,
                    image: body.image,
                }
            });

            // 2. Handle features (delete old, create new is simplest for now, or update smartly)
            // Simpler approach: Delete all existing features for this package and recreate
            if (body.features) {
                await tx.packageFeature.deleteMany({ where: { packageId: parseInt(id) } });
                if (body.features.length > 0) {
                    await tx.packageFeature.createMany({
                        data: body.features.map((f: any) => ({
                            text: typeof f === 'string' ? f : f.text,
                            text_en: typeof f === 'object' ? f.text_en : '',
                            text_ar: typeof f === 'object' ? f.text_ar : '',
                            packageId: parseInt(id)
                        }))
                    });
                }
            }

            return tx.package.findUnique({
                where: { id: parseInt(id) },
                include: { features: true }
            });
        });

        return NextResponse.json(updatedPackage, { status: 200 });
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

        await prisma.package.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ message: "Package deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
