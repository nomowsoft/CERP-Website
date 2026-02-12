import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { SubscriptionSchema } from '@/utils/validiton';
import prisma from '@/utils/db';
import bcrypt from "bcryptjs";
import { verifyToken } from '@/utils/verifyToken';
import { UserDashbord } from '@/utils/types';
import { PaymentGateway } from '@/utils/paymentGateway';

/**
 * @method POST
 * @route ~/api/subscription
 * @desc Create new Subscription
 * @access private for user to add Subscription
 */

export async function POST(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);

        if (!userFromToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json() as any;

        // Check for existing active subscription
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId: userFromToken.id,
                status: { in: ['DONE', 'PROGRES', 'DRAFT'] }
            }
        });

        if (existingSubscription) {
            return NextResponse.json(
                { message: "User already has an active or pending subscription." },
                { status: 400 }
            );
        }

        const validation = SubscriptionSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: validation.error.message }, { status: 400 });
        }

        const pkg = await prisma.package.findUnique({ where: { id: body.packageId } });
        if (!pkg) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        let servicesTotal = 0;
        const selectedServiceIds = body.selectedServices || [];
        if (selectedServiceIds.length > 0) {
            const dbServices = await prisma.service.findMany({
                where: { id: { in: selectedServiceIds } }
            });
            servicesTotal = dbServices.reduce((sum, s) => sum + Number(s.price), 0);
        }

        const totalPrice = Number(pkg.price) + servicesTotal;
        const salt = await bcrypt.genSalt(10);

        let hashedCardNumber: string | null = null;
        let hashedCVV: string | null = null;
        let transactionId: string | null = null;

        const cardNumber = body.cardNumber;
        const cardCVV = body.cvv || body.cardCVV;

        if (body.paymentMethod === "ONLINE" && cardNumber && cardCVV) {
            const paymentResult = await PaymentGateway.processPayment({
                cardNumber,
                cvv: cardCVV,
                amount: totalPrice,
                currency: pkg.currency || 'SAR',
                cardHolderName: body.cardHolder || body.cardHolderName || body.fullName,
                expiryDate: body.expiryDate || body.cardExpiryDate || ''
            });

            if (paymentResult.success) {
                transactionId = paymentResult.transactionId || null;
                hashedCardNumber = await bcrypt.hash(cardNumber, salt);
                hashedCVV = await bcrypt.hash(cardCVV, salt);
            }
        }

        // Domain Logic
        let domainName = body.domainName;
        if (!domainName) {
            domainName = body.domainType === 'SUBDOMAIN' ? body.subdomain : body.customDomain;
        }

        const existingDomain = await prisma.subscription.findFirst({
            where: {
                domainName: domainName,
                status: { in: ['DONE', 'PROGRES', 'DRAFT'] }
            }
        });

        if (existingDomain) {
            return NextResponse.json({ message: "Domain name is already taken" }, { status: 400 });
        }

        // External Domain Check
        if (body.domainType === 'CUSTOM_DOMAIN') {
            try {
                const apiKey = '1KFwkMpz7KayZNUdunTEgZcpyPcpf1p0W9ZUXinW';
                const apiRes = await axios.get(`https://api.api-ninjas.com/v1/domain?domain=${domainName}`, {
                    headers: { 'X-Api-Key': apiKey }
                });
                console.log(apiRes.data);
                if (apiRes.data?.available === false) {
                    return NextResponse.json({ message: "Domain is reserved" }, { status: 400 });
                }
            } catch (e) {
                console.error("Domain check error", e);
            }
        }

        // Initial Status
        const isOnline = body.paymentMethod === 'ONLINE';
        // Note: For ONLINE, if it's Legacy (has cardNumber), it might be DONE. 
        // If it's HyperPay (no cardNumber here), it's DRAFT.
        const initialStatus: any = (isOnline && transactionId) ? 'DONE' : 'DRAFT';

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
                status: initialStatus,
                services: {
                    connect: selectedServiceIds.map((id: number) => ({ id }))
                }
            }
        });

        if (isOnline && transactionId) {
            await prisma.payment.create({
                data: {
                    subscriptionId: newSubscription.id,
                    amount: totalPrice,
                    method: 'ONLINE',
                    status: 'SUCCESS',
                    transactionId: transactionId
                }
            });
        }

        return NextResponse.json({ ...newSubscription, message: "Subscription Created Successfully" }, { status: 201 });

    } catch (error: any) {
        console.error("Error in POST:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const userFromToken = verifyToken(request);
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } }) as any;
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        let subscriptions;
        if (user.role === 'ADMIN') {
            subscriptions = await prisma.subscription.findMany({
                include: {
                    user: { select: { name: true, email: true } },
                    package: true,
                    services: true,
                    payments: true
                }
            });
        } else {
            subscriptions = await prisma.subscription.findMany({
                where: { userId: user.id },
                include: {
                    package: true,
                    services: true,
                    payments: true
                }
            });
        }

        return NextResponse.json(subscriptions, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
