import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { SubscriptionDTO, UpdateUserDTO } from '@/utils/types';
import { verifyToken } from '@/utils/verifyToken';
import bcrypt from 'bcryptjs';
import { UserDashbord } from '@/utils/types';

type Props = {
    params: Promise<{ id: string }>;
};

/**
 * @method DELETE
 * @route ~/api/subscription/:id
 * @desc Delete Subscription by ID
 * @access private (to be implemented only user him self delete his subscriptions)
 */

export async function DELETE(request: NextRequest, { params }: Props) {
    try {
        const userFromToken = verifyToken(request);
        const { id } = await params;
    
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" },{ status: 401 });
        }
        const user = await prisma.user.findUnique({
            where:{ id: userFromToken.id },
            select: { 
                id: true,
                role: true,
            }
        }) as UserDashbord;
        
        const subscription = await prisma.subscription.findUnique({where: { id: parseInt(id) }});

        if (!subscription) {
            return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
        }
        if ((userFromToken !== null && userFromToken.id === user.id) || user.role === 'ADMIN') {
            await prisma.subscription.delete({where: { id: parseInt(id) }});
            return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
        }

        return NextResponse.json({ message: 'only user can delete his profile' }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @method GET
 * @route ~/api/subscription/:id
 * @desc Get Subscription by ID
 * @access private (to show subscription for user)
 */

export async function GET(request: NextRequest, { params }: Props) {
    try {
        const userFromToken = verifyToken(request);
        const { id } = await params;
    
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" },{ status: 401 });
        }
        const user = await prisma.user.findUnique({
            where:{ id: userFromToken.id },
            select: { 
                id: true,
                role: true,
            }
        }) as UserDashbord;
        
        const subscription = await prisma.subscription.findUnique({where: { id: parseInt(id) }});

        if (!subscription) {
            return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
        }
        if ((userFromToken !== null && userFromToken.id === user.id) || user.role === 'ADMIN') {
            const { cardCVV, cardNumber, ...other } = subscription;
            return NextResponse.json({ other }, { status: 200 });
        }

        return NextResponse.json({ message: 'only user can show subscription his profile or Adminstrator' }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @method PUT
 * @route ~/api/subscription/:id
 * @desc update subscription by ID
 * @access private (to Update  subscription for user)
 */

export async function PUT(request: NextRequest, { params }: Props) {
    try {
        const userFromToken = verifyToken(request);
        const { id } = await params;
    
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" },{ status: 401 });
        }
        const user = await prisma.user.findUnique({
            where:{ id: userFromToken.id },
            select: { 
                id: true,
                role: true,
            }
        }) as UserDashbord;
        
        const subscription = await prisma.subscription.findUnique({where: { id: parseInt(id) }});
        
        if (!subscription) {
            return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
        }
        const body = await request.json() as SubscriptionDTO;
        
        if ((userFromToken !== null && userFromToken.id === user.id) || user.role === 'ADMIN') {
            const UpdateSubscription = await prisma.subscription.update({
                where: { id: parseInt(id) },
                data: {
                    userId: userFromToken.id,
                    fullName: body.fullName,
                    email: body.email,
                    phone: body.phone,
                    charityRegisterNo: body.charityRegisterNo,
                    licenseFile: body.licenseFile,
                    domainType: body.domainType,
                    domainName: body.domainName,
                    paymentMethod: body.paymentMethod,
                    cardHolderName: body.cardHolderName,
                    cardExpiryDate: body.cardExpiryDate,
                    bankReceipt: body.bankReceipt,
                },
            });
            const { cardCVV, cardNumber, ...other } = UpdateSubscription;
            return NextResponse.json({ other }, { status: 200 });
        }

        return NextResponse.json({ message: 'only user can Update0 subscription his profile or Adminstrator' }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}