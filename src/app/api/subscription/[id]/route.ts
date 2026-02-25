import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { SubscriptionService } from '@/utils/payment';
import { PaymentGateway } from '@/utils/paymentGateway';

type Props = {
    params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, { params }: Props) {
    try {
        const userFromToken = verifyToken(request);
        const { id } = await params;
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const sub = await prisma.subscription.findUnique({ where: { id: parseInt(id) } });
        if (!sub) return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } }) as any;
        if (userFromToken.id === user?.id || user?.role === 'ADMIN') {
            await prisma.subscription.delete({ where: { id: parseInt(id) } });
            return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
        }
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest, { params }: Props) {
    try {
        const userFromToken = verifyToken(request);
        const { id } = await params;
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const sub = await prisma.subscription.findUnique({
            where: { id: parseInt(id) },
            include: { package: true, services: true, payments: true }
        });
        if (!sub) return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } }) as any;
        if (userFromToken.id === user?.id || user?.role === 'ADMIN') {
            const { cardCVV, cardNumber, ...other } = sub as any;
            return NextResponse.json(other, { status: 200 });
        }
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Props) {
    try {
        const userFromToken = verifyToken(request);
        const { id } = await params;
        const subId = parseInt(id);

        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } }) as any;
        const subscription = await prisma.subscription.findUnique({ where: { id: subId } });

        if (!subscription) return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });

        const body = await request.json() as any;

        if (userFromToken.id === user.id || user.role === 'ADMIN') {
            let domainName = body.domainName;
            if (!domainName) {
                domainName = body.domainType === 'SUBDOMAIN' ? body.subdomain : body.customDomain;
            }

            let dataToUpdate: any = {
                fullName: body.fullName,
                email: body.email,
                phone: body.phone,
                charityRegisterNo: body.charityRegisterNo,
                licenseFile: body.licenseFile,
                domainType: body.domainType,
                domainName: domainName,
                paymentMethod: body.paymentMethod,
                cardHolderName: body.cardHolderName || body.cardHolder,
                cardExpiryDate: body.cardExpiryDate || body.expiryDate,
                bankReceipt: body.bankReceipt || body.bankReceiptFile,
            };

            const action = body.action; // RENEW, UPGRADE, or NEW
            const isOnline = body.paymentMethod === 'ONLINE';
            const paymentId = body.paymentId;

            if (action === 'RENEW' || action === 'UPGRADE' || action === 'NEW') {
                const pkgId = body.packageId || subscription.packageId;
                const pkg = await prisma.package.findUnique({ where: { id: pkgId } });
                if (!pkg) return NextResponse.json({ message: 'Package not found' }, { status: 404 });

                let servicesTotal = 0;
                const newServiceIds = body.selectedServices || [];
                if (newServiceIds.length > 0) {
                    const dbServices = await prisma.service.findMany({
                        where: { id: { in: newServiceIds } }
                    });
                    servicesTotal = dbServices.reduce((sum, s) => sum + Number(s.price), 0);
                }
                const totalPrice = Number(pkg.price) + servicesTotal;

                if (isOnline) {
                    if (!paymentId) {
                        // Attempt legacy payment if no paymentId (backward compatibility)
                        if (body.cardNumber && body.cardCVV) {
                            const paymentResult = await PaymentGateway.processPayment({
                                cardNumber: body.cardNumber, cvv: body.cardCVV, amount: totalPrice,
                                currency: pkg.currency || 'SAR', cardHolderName: body.cardHolderName || body.fullName,
                                expiryDate: body.cardExpiryDate || ''
                            });
                            if (!paymentResult.success) return NextResponse.json({ message: paymentResult.message || "Payment failed" }, { status: 400 });
                        }
                    }

                    if (action === 'NEW') {
                        // Only update user if fields are different
                        if (
                            (body.fullName && body.fullName !== user.name) ||
                            (body.email && body.email !== user.email) ||
                            (body.phone && body.phone !== user.phone)
                        ) {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    name: body.fullName || user.name,
                                    email: body.email || user.email,
                                    phone: body.phone || user.phone,
                                }
                            });
                        }

                        const approvalDate = new Date();
                        const updated = await prisma.subscription.update({
                            where: { id: subId },
                            data: {
                                ...dataToUpdate,
                                status: 'DONE',
                                approvalDate,
                                expiryDate: SubscriptionService.calculateExpiry(approvalDate),
                                packageId: pkgId,
                                services: { set: newServiceIds.map((sid: number) => ({ id: sid })) }
                            }
                        });
                        await prisma.payment.create({
                            data: { subscriptionId: subId, amount: totalPrice, method: 'ONLINE', status: 'SUCCESS', transactionId: paymentId || 'MANUAL' }
                        });
                        return NextResponse.json(updated, { status: 200 });
                    } else {
                        const req = await prisma.subscriptionRequest.create({
                            data: {
                                subscriptionId: subId, type: action as any, packageId: pkgId,

                                paymentMethod: 'ONLINE', licenseFile: body.licenseFile, status: 'APPROVED',
                                services: { connect: newServiceIds.map((sid: number) => ({ id: sid })) }
                            }
                        });
                        const updated = await SubscriptionService.applyRequest(req.id);
                        await prisma.payment.create({
                            data: { subscriptionId: subId, amount: totalPrice, method: 'ONLINE', status: 'SUCCESS', transactionId: paymentId || 'MANUAL' }
                        });
                        return NextResponse.json(updated, { status: 200 });
                    }
                } else {
                    // BANK Transfer
                    await prisma.subscriptionRequest.create({
                        data: {
                            subscriptionId: subId, type: (action === 'NEW' ? 'RENEW' : action) as any,
                            packageId: pkgId, paymentMethod: 'BANK', licenseFile: body.licenseFile,
                            bankReceipt: body.bankReceipt || body.bankReceiptFile, status: 'PENDING',
                            services: { connect: newServiceIds.map((sid: number) => ({ id: sid })) }
                        }
                    });
                    if (action === 'NEW') {
                        // Only update user if fields are different
                        if (
                            (body.fullName && body.fullName !== user.name) ||
                            (body.email && body.email !== user.email) ||
                            (body.phone && body.phone !== user.phone)
                        ) {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    name: body.fullName || user.name,
                                    email: body.email || user.email,
                                    phone: body.phone || user.phone,
                                }
                            });
                        }
                        await prisma.subscription.update({ where: { id: subId }, data: { ...dataToUpdate, status: 'DRAFT' } });
                    }
                    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 200 });
                }
            }

            // Regular admin updates
            if (user.role === 'ADMIN') {
                if (body.expiryDate) dataToUpdate.expiryDate = new Date(body.expiryDate);
                if (body.approvalDate) dataToUpdate.approvalDate = new Date(body.approvalDate);
                if (body.status) dataToUpdate.status = body.status;
                if (body.packageId) dataToUpdate.packageId = body.packageId;
            } else {
                dataToUpdate.status = subscription.status;
            }

            const updatedSub = await prisma.subscription.update({ where: { id: subId }, data: dataToUpdate });
            return NextResponse.json(updatedSub, { status: 200 });
        }
        return NextResponse.json({ message: 'Unauthorized action' }, { status: 403 });
    } catch (error: any) {
        console.error("PUT Error:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}