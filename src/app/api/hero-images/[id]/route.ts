import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
        }

        const imageId = parseInt(id, 10);
        if (isNaN(imageId)) {
            return NextResponse.json({ error: "Invalid Image ID" }, { status: 400 });
        }

        await prisma.heroImage.delete({
            where: {
                id: imageId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting hero image:", error);
        return NextResponse.json({ error: "Failed to delete hero image" }, { status: 500 });
    }
}
