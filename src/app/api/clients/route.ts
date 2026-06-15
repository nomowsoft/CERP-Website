import { NextResponse } from "next/server";
import prisma from "@/utils/db";

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

        const client = await prisma.client.create({
            data: {
                name,
                image
            }
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}
