import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { UpdateUserDTO } from '@/utils/types';
import { verifyToken } from '@/utils/verifyToken';
import bcrypt from 'bcryptjs';

type Props = {
    params: Promise<{ id: string }>;
};

/**
 * @method DELETE
 * @route ~/api/users/profile/:id
 * @desc Delete user profile by ID
 * @access private (to be implemented only user him self delete his profile)
 */

export async function DELETE(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({where: { id: parseInt(id) }});

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const JwtToken = request.cookies.get("jwtToken")?.value as string;
        if(!JwtToken) {
            return NextResponse.json({ message: 'not token provider, message from delete profile' }, { status: 401 });
        }
        const userFromToken = verifyToken(request);

        if (userFromToken !== null && userFromToken.id === user.id) {
            await prisma.user.delete({where: { id: parseInt(id) }});
            return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
        }

        return NextResponse.json({ message: 'only user can delete his profile' }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @method GET
 * @route ~/api/users/profile/:id
 * @desc Get user profile by ID
 * @access private (to be implemented only user him self delete his profile)
 */

export async function GET(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where:{ id: parseInt(id) },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                role: true,
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const authToken = request.headers.get('authtoken') as string;

        const userFromToken = verifyToken(request);

        if (userFromToken === null || userFromToken.id !== user.id) {
            return NextResponse.json({ message: 'you are not allowed, access denied' }, { status: 403 });
        }

        return NextResponse.json(user, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @method PUT
 * @route ~/api/users/profile/:id
 * @desc update user profile by ID
 * @access private (to be implemented only user him self delete his profile)
 */

export async function PUT(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({where: { id: parseInt(id) }});

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const userFromToken = verifyToken(request);

        if (userFromToken === null || userFromToken.id !== user.id) {
            return NextResponse.json({ message: 'you are not allowed, access denied' }, { status: 403 });
        }
        const body = await request.json() as UpdateUserDTO;
        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            body.password = await bcrypt.hash(body.password, salt);
        }
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                password: body.password
            },
        });
        const { password, ...other } = updatedUser;

        return NextResponse.json(other, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}