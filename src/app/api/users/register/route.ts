import { NextRequest, NextResponse } from 'next/server';
import { RegisterSchema } from '@/utils/validiton';
import prisma from '@/utils/db';
import { RegisterUserDTO } from '@/utils/types';
import bcrypt from "bcryptjs";
import { setCookie } from '@/utils/generateToken';

/**
 * @method POST
 * @route ~/api/users/register
 * @desc Create new  user or acoount (signe up)
 * @access Public
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as RegisterUserDTO;
        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: validation.error.message }, { status: 400 });
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: body.email },
                    { phone: body.phone },
                ],
            },
        });
        if (user) {
            return NextResponse.json(
                { message: 'this user already registered' },
                { status: 400 }
            )
        }
        if (!body.password) {
            return NextResponse.json({ message: "Password is required" }, { status: 400 });
        }
        if (body.password != body.confirmPassword) {
            return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);
        const newUser = await prisma.user.create({
            data: {
                email: body.email,
                password: hashedPassword,
                name: body.name,
                phone: body.phone,
                charityName: body.charityName,
                role: 'VIEWER',
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                charityName: true,
            }
        });
        const cookie = setCookie({
            id: newUser.id,
            email: newUser.email
        });

        return NextResponse.json(
            { ...newUser, message: "User registered successfully" },
            {
                status: 201,
                headers: { 'Set-Cookie': cookie }
            });
    }
    catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
