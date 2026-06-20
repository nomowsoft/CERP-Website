import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const images = await prisma.heroImage.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(images);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch hero images" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { image } = body;

        if (!image) {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        const heroImg = await prisma.heroImage.create({
            data: {
                image
            }
        });

        return NextResponse.json(heroImg, { status: 201 });
    } catch (error) {
        console.error("Error creating hero image:", error);
        return NextResponse.json({ error: "Failed to create hero image" }, { status: 500 });
    }
}
