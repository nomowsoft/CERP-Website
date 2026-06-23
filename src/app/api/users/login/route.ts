import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/utils/validiton';
import prisma from '@/utils/db';
import { LoginUserDTO } from '@/utils/types';
import bcrypt from "bcryptjs";
import { setCookie } from '@/utils/generateToken';


/**
 * @method POST
 * @route ~/api/users/login
 * @desc Login a user or account (sign in)
 * @access Public
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as LoginUserDTO;
        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.issues[0].message },
                { status: 400 }
            );
        }
        const user = await prisma.user.findUnique({
            where: { email: body.email },
        });
        if (!user) {
            return NextResponse.json(
                { message: 'invalid email or password' },
                { status: 401 }
            )
        }
        const isPasswordMatch = await bcrypt.compare(body.password, user.password);
        if (!isPasswordMatch) {
            return NextResponse.json(
                { message: 'invalid email or password' },
                { status: 401 }
            )
        }
        const cookie = setCookie({ 
            id: user.id,
            email: user.email
        });
        return NextResponse.json(
            { message: "Login successful"},
            { 
                status: 200, 
                headers: { 'Set-Cookie': cookie }
            });
    }
    catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: 'Internal Server Error', ...(process.env.NODE_ENV !== 'production' && { error: error.message }) },
            { status: 500 }
        );
    }
}
