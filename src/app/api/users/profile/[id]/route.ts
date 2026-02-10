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
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        const targetUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });

        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Allow if it's the user themselves OR if they are an ADMIN
        if (userFromToken.id === targetUser.id || adminUser?.role === 'ADMIN') {
            await prisma.user.delete({ where: { id: parseInt(id) } });
            return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
        }

        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        const targetUser = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                role: true,
                phone: true,
                charityName: true,
            }
        });

        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (userFromToken.id === targetUser.id || adminUser?.role === 'ADMIN') {
            return NextResponse.json(targetUser, { status: 200 });
        }

        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        const targetUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });

        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (userFromToken.id === targetUser.id || adminUser?.role === 'ADMIN') {
            const body = await request.json() as UpdateUserDTO & { role?: string };
            const dataToUpdate: any = {
                name: body.name,
                email: body.email,
                phone: body.phone,
                charityName: body.charityName,
            };

            if (body.password) {
                const salt = await bcrypt.genSalt(10);
                dataToUpdate.password = await bcrypt.hash(body.password, salt);
            }

            // Only ADMIN can change roles
            if (body.role && adminUser?.role === 'ADMIN') {
                dataToUpdate.role = body.role;
            }

            const updatedUser = await prisma.user.update({
                where: { id: parseInt(id) },
                data: dataToUpdate,
            });

            const { password, ...other } = updatedUser;
            return NextResponse.json(other, { status: 200 });
        }

        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}