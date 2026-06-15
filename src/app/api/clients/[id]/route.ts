import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
        }

        const clientId = parseInt(id, 10);
        if (isNaN(clientId)) {
            return NextResponse.json({ error: "Invalid Client ID" }, { status: 400 });
        }

        await prisma.client.delete({
            where: {
                id: clientId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting client:", error);
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }
}
