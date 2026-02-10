import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { SubscriptionSchema } from '@/utils/validiton';
import prisma from '@/utils/db';
import { SubscriptionDTO } from '@/utils/types';
import bcrypt from "bcryptjs";
import { setCookie } from '@/utils/generateToken';
import { verifyToken } from '@/utils/verifyToken';
import { UserDashbord } from '@/utils/types';
import { SubscriptionService } from '@/utils/payment';
import { PaymentGateway } from '@/utils/paymentGateway';

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

        // Check if user already has a subscription (not including cancelled ones)
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId: userFromToken.id,
                status: {
                    in: ['DONE', 'PROGRES', 'DRAFT']
                }
            }
        });

        if (existingSubscription) {
            return NextResponse.json(
                { message: "User already has an active or pending subscription. Please use Renewal or Upgrade." },
                { status: 400 }
            );
        }

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
        // Fetch package details early
        const pkg = await prisma.package.findUnique({ where: { id: body.packageId } });
        if (!pkg) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        const salt = await bcrypt.genSalt(10);
        let hashedCardNumber: string | null = null;
        let hashedCVV: string | null = null;
        let transactionId: string | null = null;

        if (body.paymentMethod === "ONLINE") {
            if (!cardNumber || !cardCVV) {
                return NextResponse.json(
                    { message: "Card details are required for online payment" },
                    { status: 400 }
                );
            }

            // Process Payment via Gateway
            const paymentResult = await PaymentGateway.processPayment({
                cardNumber,
                cvv: cardCVV,
                amount: Number(pkg.price),
                currency: pkg.currency || 'SAR',
                cardHolderName: body.cardHolder || body.cardHolderName || body.fullName,
                expiryDate: body.expiryDate || body.cardExpiryDate || ''
            });

            if (!paymentResult.success) {
                return NextResponse.json(
                    { message: paymentResult.message || "Payment attempt failed" },
                    { status: 400 }
                );
            }
            transactionId = paymentResult.transactionId || null;

            // Hash for storage (Optional/Risky - User requested custom fields so we persist securely)
            hashedCardNumber = await bcrypt.hash(cardNumber, salt);
            hashedCVV = await bcrypt.hash(cardCVV, salt);
        }

        // Determine domain name based on type
        let domainName = body.domainName;
        if (!domainName) {
            domainName = body.domainType === 'SUBDOMAIN' ? body.subdomain : body.customDomain;
        }

        // Check if domain is already taken in our system
        const existingDomain = await prisma.subscription.findFirst({
            where: {
                domainName: domainName,
                status: {
                    in: ['DONE', 'PROGRES', 'DRAFT']
                }
            }
        });

        if (existingDomain) {
            return NextResponse.json(
                { message: "Domain name is already taken" },
                { status: 400 }
            );
        }

        // Check if Custom Domain is available externally
        if (body.domainType === 'CUSTOM_DOMAIN') {
            try {
                const apiKey = '1KFwkMpz7KayZNUdunTEgZcpyPcpf1p0W9ZUXinW';
                const apiRes = await axios.get(`https://api.api-ninjas.com/v1/domain?domain=${domainName}`, {
                    headers: { 'X-Api-Key': apiKey }
                });

                // If available is explicitly false, it means the domain is registered/reserved
                if (apiRes.data && apiRes.data.available === false) {
                    return NextResponse.json(
                        { message: "Domain is reserved and cannot be added" },
                        { status: 400 }
                    );
                }
            } catch (error) {
                console.error("External domain check failed:", error);
                // We choose to proceed if the external check fails (e.g. API down), 
                // or you could block it. Here we proceed to avoid blocking users due to API issues.
            }
        }

        const startTime = Date.now();
        try {


            // Determine status and dates
            const isOnline = body.paymentMethod === 'ONLINE';
            const status: any = isOnline ? 'DONE' : 'PROGRES';
            const approvalDate = isOnline ? new Date() : null;
            const expiryDate = isOnline ? SubscriptionService.calculateExpiry(approvalDate!) : null;

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
                    cardHolderName: body.cardHolder || body.cardHolderName,
                    cardExpiryDate: body.expiryDate || body.cardExpiryDate,
                    cardCVV: hashedCVV,
                    bankReceipt: body.bankReceiptFile || body.bankReceipt,
                    packageId: body.packageId,
                    status: status,
                    approvalDate: approvalDate,
                    expiryDate: expiryDate,
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    status: true,
                    approvalDate: true,
                    expiryDate: true,
                }
            });

            // If ONLINE, create a payment record
            if (isOnline) {
                await prisma.payment.create({
                    data: {
                        subscriptionId: newSubscription.id,
                        amount: pkg.price,
                        method: 'ONLINE',
                        status: 'SUCCESS',
                    }
                });
            }
            return NextResponse.json({ ...newSubscription, message: "Subscription Successfully" }, { status: 201, });
        } catch (error: any) {
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
        console.log(user)

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
        console.log(subscription)
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
