import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";

type Props = {
    params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const userFromToken = verifyToken(request);
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        if (user?.role !== 'ADMIN') return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const body = await request.json();
        const { question_ar, question_en, answer_ar, answer_en, order } = body;

        const updatedFaq = await prisma.faq.update({
            where: { id: parseInt(id) },
            data: {
                question_ar,
                question_en,
                answer_ar,
                answer_en,
                order
            }
        });

        return NextResponse.json(updatedFaq, { status: 200 });
    } catch (error: any) {
        console.error("Error updating FAQ:", error);
        if (error.code === 'P2025') {
            return NextResponse.json({ message: "FAQ not found" }, { status: 404 });
        }
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

        await prisma.faq.delete({ where: { id: parseInt(id) } });
        
        return NextResponse.json({ message: "FAQ deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting FAQ:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
