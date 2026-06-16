import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const faqs = await prisma.faq.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(faqs, { status: 200 });
    } catch (error) {
        console.error("Error fetching FAQs:", error);
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
        const { question_ar, question_en, answer_ar, answer_en, order } = body;

        if (!question_ar || !question_en || !answer_ar || !answer_en) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const newFaq = await prisma.faq.create({
            data: {
                question_ar,
                question_en,
                answer_ar,
                answer_en,
                order: order || 0
            }
        });

        return NextResponse.json(newFaq, { status: 201 });
    } catch (error) {
        console.error("Error creating FAQ:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
