import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { formatImage } from "@/utils/imageUtils";
import { saveBase64Image } from "@/utils/imageSave";

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: any) {
    try {
        const { id } = await params;
        const system = await prisma.system.findUnique({
            where: { id: parseInt(id) }
        });
        
        if (!system) {
            return NextResponse.json({ message: "System not found" }, { status: 404 });
        }
        
        // Convert Buffer icon to Base64 string
        const formattedSystem = {
            ...system,
            price: Number(system.price),
            renewalPrice: Number(system.renewalPrice),
            icon: formatImage(system.icon)
        };
        
        return NextResponse.json(formattedSystem, { status: 200 });
    } catch (error) {
        console.error("Error fetching system:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: any) {
    try {
        const { id } = await params;
        const userFromToken = verifyToken(request);
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        if (user?.role !== 'ADMIN') return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const body = await request.json();
        
        let iconValue = undefined;
        if (body.icon !== undefined) {
            if (body.icon === null || body.icon === "") {
                iconValue = null;
            } else {
                iconValue = saveBase64Image(body.icon, `system-${id}`);
            }
        }

        const updatedSystem = await prisma.system.update({
            where: { id: parseInt(id) },
            data: {
                name: body.name,
                name_en: body.name_en,
                name_ar: body.name_ar,
                description: body.description,
                description_en: body.description_en,
                description_ar: body.description_ar,
                icon: iconValue,
                price: body.price === "" || body.price === null || body.price === undefined ? 0 : Number(body.price),
                renewalPrice: body.renewalPrice === "" || body.renewalPrice === null || body.renewalPrice === undefined ? 0 : Number(body.renewalPrice),
                modules: body.modules,
            }
        });

        // Convert back for response
        const responseSystem = {
            ...updatedSystem,
            price: Number(updatedSystem.price),
            renewalPrice: Number(updatedSystem.renewalPrice),
            icon: formatImage(updatedSystem.icon)
        };

        return NextResponse.json(responseSystem, { status: 200 });
    } catch (error) {
        console.error("Error updating system:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: any) {
    try {
        const { id } = await params;
        const userFromToken = verifyToken(request);
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        if (user?.role !== 'ADMIN') return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        await prisma.system.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: "System deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting system:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
