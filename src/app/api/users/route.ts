import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { Role } from "@/generated/prisma";

/**
 * @method GET
 * @route ~/api/users
 * @desc Get all users (Admin only)
 * @access Private
 */
export async function GET(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: userFromToken.id }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                charityName: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
