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

const formatImage = (image: any) => {
    try {
        if (!image) return null;
        
        // If it's already a string, check if it's a URL or base64
        if (typeof image === 'string') {
            if (image.startsWith('http') || image.startsWith('data:image')) {
                return image;
            }
            return `data:image/png;base64,${image}`;
        }

        // Handle Buffer/Uint8Array
        const buf = Buffer.from(image);
        if (buf.length === 0) return null;

        // Try to see if it's a string stored in the buffer
        try {
            const imageStr = buf.toString('utf8');
            if (imageStr.startsWith('http') || imageStr.startsWith('data:image')) {
                return imageStr;
            }
        } catch (e) {
            // Not a UTF-8 string, proceed to base64
        }

        return `data:image/png;base64,${buf.toString('base64')}`;
    } catch (error) {
        console.error("Error in formatImage:", error);
        return null;
    }
};

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

        let packagePrice = 0;
        let currency = 'SAR';
        if (body.packageId) {
            const pkg = await prisma.package.findUnique({ where: { id: body.packageId } });
            if (!pkg) {
                return NextResponse.json({ message: "Package not found" }, { status: 404 });
            }
            packagePrice = Number(pkg.price);
            currency = pkg.currency || 'SAR';
        }

        let servicesTotal = 0;
        const selectedServiceIds = body.selectedServices || [];
        if (selectedServiceIds.length > 0) {
            const dbServices = await prisma.service.findMany({
                where: { id: { in: selectedServiceIds } }
            });
            servicesTotal = dbServices.reduce((sum, s) => sum + Number(s.price), 0);
        }

        let systemsTotal = 0;
        const selectedSystemIds = body.selectedSystems || [];
        if (selectedSystemIds.length > 0) {
            const dbSystems = await prisma.system.findMany({
                where: { id: { in: selectedSystemIds } }
            });
            systemsTotal = dbSystems.reduce((sum, s) => sum + Number(s.price || 0), 0);
        }

        const totalPrice = packagePrice + servicesTotal + systemsTotal;
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
                currency: currency,
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

        // Update user if fields are different
        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } }) as any;
        if (user && (
            (body.fullName && body.fullName !== user.name) ||
            (body.email && body.email !== user.email) ||
            (body.phone && body.phone !== user.phone)
        )) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    name: body.fullName || user.name,
                    email: body.email || user.email,
                    phone: body.phone || user.phone,
                }
            });
        }

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
                },
                systems: {
                    connect: selectedSystemIds.map((id: number) => ({ id }))
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
                    user: { select: { name: true, email: true, charityName: true } },
                    package: { include: { systems: true } },
                    services: true,
                    systems: true,
                    payments: true
                }
            });
        } else {
            subscriptions = await prisma.subscription.findMany({
                where: { userId: user.id },
                include: {
                    package: { include: { systems: true } },
                    services: true,
                    systems: true,
                    payments: true
                }
            });
        }

        const formattedSubscriptions = subscriptions.map((sub: any) => {
            try {
                // Ensure all Decimal fields are converted to strings for safe JSON serialization
                const serializeDecimal = (obj: any) => {
                    if (!obj) return obj;
                    const newObj = { ...obj };
                    for (const key in newObj) {
                        if (newObj[key] && typeof newObj[key] === 'object' && newObj[key].constructor?.name === 'Decimal') {
                            newObj[key] = newObj[key].toString();
                        }
                    }
                    return newObj;
                };

                const formattedSub = {
                    ...sub,
                    package: sub.package ? {
                        ...sub.package,
                        price: sub.package.price?.toString(),
                        image: formatImage(sub.package.image),
                        systems: sub.package.systems?.map((sys: any) => ({
                            ...sys,
                            price: sys.price?.toString(),
                            icon: formatImage(sys.icon)
                        }))
                    } : null,
                    services: sub.services?.map((s: any) => ({
                        ...s,
                        price: s.price?.toString()
                    })),
                    systems: sub.systems?.map((sys: any) => ({
                        ...sys,
                        price: sys.price?.toString(),
                        icon: formatImage(sys.icon)
                    })),
                    payments: sub.payments?.map((p: any) => ({
                        ...p,
                        amount: p.amount?.toString()
                    }))
                };

                return formattedSub;
            } catch (mapError: any) {
                console.error("Error mapping subscription:", sub?.id, mapError);
                return sub; // Return unformatted as fallback instead of throwing
            }
        });

        return NextResponse.json(formattedSubscriptions, { status: 200 });
    } catch (error: any) {
        console.error("Error in GET /api/subscription:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
