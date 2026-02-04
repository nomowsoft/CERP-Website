import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionSchema } from '@/utils/validiton';
import prisma from '@/utils/db';
import { SubscriptionDTO } from '@/utils/types';
import bcrypt from "bcryptjs";
import { setCookie } from '@/utils/generateToken';
import { verifyToken } from '@/utils/verifyToken';
import { UserDashbord } from '@/utils/types';

/**
 * @method POST
 * @route ~/api/subscription
 * @desc Create new  Subscription
 * @access private for user to add Subscription
 */

export async function POST(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);

        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json() as any; // Cast to any to handle incoming payload structure
        const validation = SubscriptionSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: validation.error.message }, { status: 400 });
        }
        // Map frontend fields to DB fields
        const cardCVV = body.cvv || body.cardCVV;
        const cardNumber = body.cardNumber;

        if (!cardCVV && body.paymentMethod === 'ONLINE') {
            return NextResponse.json({ message: "CVV is required" }, { status: 400 });
        }
        const salt = await bcrypt.genSalt(10);
        let hashedCardNumber: string | null = null;
        let hashedCVV: string | null = null;
        if (body.paymentMethod === "ONLINE") {
            if (!cardNumber || !cardCVV) {
                return NextResponse.json(
                    { message: "Card details are required for online payment" },
                    { status: 400 }
                );
            }

            hashedCardNumber = await bcrypt.hash(cardNumber, salt);
            hashedCVV = await bcrypt.hash(cardCVV, salt);
        }

        // Determine domain name based on type
        let domainName = body.domainName;
        if (!domainName) {
            domainName = body.domainType === 'SUBDOMAIN' ? body.subdomain : body.customDomain;
        }

        const startTime = Date.now();
        try {
            const newSubscription = await prisma.subscription.create({
                data: {
                    userId: userFromToken.id,
                    fullName: body.fullName,
                    email: body.email,
                    phone: body.phone,
                    charityRegisterNo: body.charityRegisterNo,
                    licenseFile: body.licenseFile,
                    domainType: body.domainType,
                    domainName: domainName,
                    paymentMethod: body.paymentMethod,
                    cardNumber: hashedCardNumber,
                    cardHolderName: body.cardHolder || body.cardHolderName,     // Map cardHolder
                    cardExpiryDate: body.expiryDate || body.cardExpiryDate,     // Map expiryDate
                    cardCVV: hashedCVV,
                    bankReceipt: body.bankReceiptFile || body.bankReceipt,      // Map bankReceiptFile
                    packageId: body.packageId,
                    status: "DRAFT"
                },
                select: {
                    fullName: true,
                    email: true,
                    phone: true,
                    charityRegisterNo: true,
                    licenseFile: true,
                    domainType: true,
                    domainName: true,
                    paymentMethod: true,
                    cardHolderName: true,
                    cardExpiryDate: true,
                    bankReceipt: true,
                }
            });
            console.log(`DB creation successful in ${Date.now() - startTime}ms`);
            return NextResponse.json({ ...newSubscription, message: "Subscription Successfully" }, { status: 201, });
        } catch (error: any) {
            console.error("Error creating subscription:");
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            console.error("Full error:", error);
            return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
        }
    } catch (error) {
        console.error("Error in POST logic:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


/**
 * @method GET
 * @route ~/api/subscription
 * @desc Get All Subscription
 * @access private (to show subscription for user)
 */

export async function GET(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);
        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const user = await prisma.user.findUnique({
            where: { id: userFromToken.id },
            select: {
                id: true,
                role: true,
            }
        }) as UserDashbord;

        let subscription;
        if (user.role === 'ADMIN') {
            subscription = await prisma.subscription.findMany({
                include: {
                    user: { select: { name: true, email: true } },
                    package: { include: { features: true } }
                }
            });
        } else {
            subscription = await prisma.subscription.findMany({
                where: {
                    userId: user.id,
                },
                include: {
                    package: { include: { features: true } }
                }
            });
        }
        if (!subscription) {
            return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
        }
        if ((userFromToken !== null && userFromToken.id === user.id) || user.role === 'ADMIN') {
            const cleanSubscriptions = subscription.map(
                ({ cardNumber, cardCVV, ...rest }) => rest
            );
            return NextResponse.json(cleanSubscriptions, { status: 200 });
        }

        return NextResponse.json({ message: 'only user can show subscription his profile or Adminstrator' }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
