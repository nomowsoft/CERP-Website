import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { PackageType } from "@/generated/prisma";
import { PackageDTO } from "@/utils/types";

export async function GET(request: NextRequest) {
    try {
        const packages = await prisma.package.findMany({
            include: { features: true },
            // orderBy: { createdAt: 'desc' } TODO
        });
        return NextResponse.json(packages, { status: 200 });
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
        // Basic validation
        if (!body.name || !body.type || !body.description || !body.image) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const newPackage = await prisma.package.create({
            data: {
                name: body.name,
                type: body.type as PackageType,
                description: body.description,
                image: body.image,
                features: {
                    create: body.features?.map((f: string) => ({ text: f })) || []
                }
            },
            include: { features: true }
        });

        return NextResponse.json(newPackage, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
