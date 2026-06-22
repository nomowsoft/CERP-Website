import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { saveBase64Image } from "@/utils/imageSave";

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, image } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        let imageValue = null;
        if (image) {
            imageValue = saveBase64Image(image, "client");
        }

        const client = await prisma.client.create({
            data: {
                name,
                image: imageValue
            }
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}
