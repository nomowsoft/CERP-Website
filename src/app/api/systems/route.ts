import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { formatImage } from "@/utils/imageUtils";
import { saveBase64Image } from "@/utils/imageSave";

export async function GET(request: NextRequest) {
    try {
        const systems = await prisma.system.findMany({
            select: {
                id: true,
                name: true,
                name_en: true,
                name_ar: true,
                description: true,
                description_en: true,
                description_ar: true,
                icon: true,
                price: true,
                renewalPrice: true,
                modules: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        // Convert Buffer icons to Base64 strings and Decimal to Number for the frontend
        const formattedSystems = systems.map(system => ({
            ...system,
            price: Number(system.price),
            renewalPrice: Number(system.renewalPrice),
            icon: formatImage(system.icon)
        }));

        return NextResponse.json(formattedSystems, { status: 200 });
    } catch (error) {
        console.error("Error fetching systems:", error);
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
        
        if (!body.name) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        let iconValue = null;
        if (body.icon) {
            iconValue = saveBase64Image(body.icon, "system");
        }

        const newSystem = await prisma.system.create({
            data: {
                name: body.name,
                name_en: body.name_en || "",
                name_ar: body.name_ar || "",
                description: body.description || "",
                description_en: body.description_en || "",
                description_ar: body.description_ar || "",
                icon: iconValue,
                price: body.price === "" || body.price === null || body.price === undefined ? 0 : Number(body.price),
                renewalPrice: body.renewalPrice === "" || body.renewalPrice === null || body.renewalPrice === undefined ? 0 : Number(body.renewalPrice),
                modules: body.modules || [],
            }
        });

        // Convert back for response
        const responseSystem = {
            ...newSystem,
            price: Number(newSystem.price),
            renewalPrice: Number(newSystem.renewalPrice),
            icon: formatImage(newSystem.icon)
        };

        return NextResponse.json(responseSystem, { status: 201 });
    } catch (error) {
        console.error("Error creating system:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
