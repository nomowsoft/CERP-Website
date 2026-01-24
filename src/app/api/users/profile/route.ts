import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";

/**
 * @method GET
 * @route ~/api/users/me
 * @desc Get current logged-in user profile
 * @access Private
 */

export async function GET(request: NextRequest) {
  try {
    const userFromToken = verifyToken(request);

    if (!userFromToken) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userFromToken.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
        charityName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
