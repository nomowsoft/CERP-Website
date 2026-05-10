import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { SubscriptionService } from '@/utils/payment';
import { PaymentGateway } from '@/utils/paymentGateway';
import { ServerManager } from '@/utils/serverManager';

const formatImage = (image: any) => {
    if (!image) return null;
    const buf = Buffer.from(image);
    const imageStr = buf.toString('utf8');
    if (imageStr.startsWith('http') || imageStr.startsWith('data:image')) {
        return imageStr;
    }
    return `data:image/png;base64,${buf.toString('base64')}`;
};

type Props = {
    params: Promise<{ id: string }>;
};

// Strongly type the expected request body
interface UpdateSubscriptionBody {
    domainName?: string;
    domainType?: 'SUBDOMAIN' | 'CUSTOM';
    subdomain?: string;
    customDomain?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    charityRegisterNo?: string;
    licenseFile?: string;
    paymentMethod?: 'ONLINE' | 'BANK' | string;
    cardHolderName?: string;
    cardHolder?: string;
    cardExpiryDate?: string;
    expiryDate?: string | Date;
    bankReceipt?: string;
    bankReceiptFile?: string;
    action?: 'RENEW' | 'UPGRADE' | 'NEW' | string;
    paymentId?: string;
    packageId?: number;
    cardNumber?: string;
    cardCVV?: string;
    selectedServices?: number[];
    selectedSystems?: number[];
    approvalDate?: string | Date;
    status?: 'DRAFT' | 'PROGRES' | 'DONE' | 'CANCEL';
    provision?: boolean;
    requestId?: number;
}

export async function DELETE(request: NextRequest, { params }: Props) {
    try {
        const userFromToken = verifyToken(request);
        const { id } = await params;
        if (!userFromToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const sub = await prisma.subscription.findUnique({ where: { id: parseInt(id) } });
        if (!sub) return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        const isOwner = sub.userId === user?.id;
        const isAdmin = user?.role === 'ADMIN';

        if (isOwner || isAdmin) {
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
            include: { package: { include: { systems: true } }, services: true, payments: true, systems: true }
        });
        if (!sub) return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        const isOwner = sub.userId === user?.id;
        const isAdmin = user?.role === 'ADMIN';

        if (isOwner || isAdmin) {
            // Remove sensitive info using destructuring correctly
            const { cardCVV, cardNumber, ...other } = sub as any;
            
            // Format images and serializable numbers
            const formatted = {
                ...other,
                totalPrice: Number(other.totalPrice || 0),
                package: other.package ? {
                    ...other.package,
                    price: Number(other.package.price),
                    image: formatImage(other.package.image),
                    systems: other.package.systems?.map((sys: any) => ({
                        ...sys,
                        price: Number(sys.price),
                        icon: formatImage(sys.icon)
                    }))
                } : null,
                systems: other.systems?.map((sys: any) => ({
                    ...sys,
                    price: Number(sys.price),
                    icon: formatImage(sys.icon)
                }))
            };

            return NextResponse.json(formatted, { status: 200 });
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

        const user = await prisma.user.findUnique({ where: { id: userFromToken.id } });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const subscription = await prisma.subscription.findUnique({ where: { id: subId } });
        if (!subscription) return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });

        const body = (await request.json()) as UpdateSubscriptionBody;

        const isOwner = subscription.userId === user.id;
        const isAdmin = user.role === 'ADMIN';

        if (isOwner || isAdmin) {
            // New logic for approving requests (Management View)
            if (isAdmin && body.requestId) {
                const requestToProcess = await prisma.subscriptionRequest.findUnique({
                    where: { id: body.requestId }
                });

                if (!requestToProcess) return NextResponse.json({ message: "Request not found" }, { status: 404 });

                if (body.status === 'DONE') {
                    // Approve the request
                    await prisma.subscriptionRequest.update({
                        where: { id: body.requestId },
                        data: { status: 'APPROVED' }
                    });

                    // applyRequest handles updates and provisioning
                    const result = await SubscriptionService.applyRequest(body.requestId);
                    
                    return NextResponse.json({ 
                        message: "Request approved and applied successfully",
                        message_ar: "تمت الموافقة على الطلب وتطبيقه بنجاح",
                        result 
                    }, { status: 200 });
                } else if (body.status === 'CANCEL') {
                    // Reject the request
                    await prisma.subscriptionRequest.update({
                        where: { id: body.requestId },
                        data: { status: 'REJECTED' }
                    });
                    return NextResponse.json({ 
                        message: "Request rejected",
                        message_ar: "تم رفض الطلب" 
                    }, { status: 200 });
                }
            } else if (body.status === 'DONE' && subscription.status === 'DRAFT') {
                // Handling manual approval of a NEW subscription (DRAFT)
                const approvalDate = new Date();
                const updatedSub = await prisma.subscription.update({
                    where: { id: subId },
                    data: {
                        status: 'DONE',
                        approvalDate,
                        expiryDate: SubscriptionService.calculateExpiry(approvalDate),
                        // Connect any systems that were in the systems relation
                    }
                });

                // Provision server for the new subscription
                const provisioningResult = await ServerManager.provisionServer(subId);

                return NextResponse.json({
                    message: "Subscription approved and system provisioning started",
                    message_ar: "تمت الموافقة على الاشتراك وبدأ تجهيز النظام",
                    provisioning: provisioningResult,
                    subscription: updatedSub
                }, { status: 200 });
            }

            let domainName = body.domainName;
            let provisioningResult = null;
            if (!domainName) {
                domainName = body.domainType === 'SUBDOMAIN' ? body.subdomain : body.customDomain;
            }

            const dataToUpdate: Record<string, any> = {
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

            const action = body.action; // RENEW, UPGRADE, ADD_SYSTEM or NEW
            const isOnline = body.paymentMethod === 'ONLINE';
            const paymentId = body.paymentId;

            if (action === 'RENEW' || action === 'UPGRADE' || action === 'NEW' || action === 'ADD_SYSTEM') {
                const pkgId = body.packageId || subscription.packageId;
                if (!pkgId) return NextResponse.json({ message: 'Package not found' }, { status: 404 });
                
                const pkg = await prisma.package.findUnique({ where: { id: pkgId as number } });
                if (!pkg) return NextResponse.json({ message: 'Package not found' }, { status: 404 });

                let servicesTotal = 0;
                const newServiceIds = body.selectedServices || [];
                if (newServiceIds.length > 0) {
                    const dbServices = await prisma.service.findMany({
                        where: { id: { in: newServiceIds } }
                    });
                    servicesTotal = dbServices.reduce((sum, s) => sum + Number(s.price), 0);
                }
                const totalPrice = (pkg ? Number(pkg.price) : 0) + servicesTotal;
                
                let finalPrice = totalPrice;
                const newSystemIds = body.selectedSystems || [];
                if (action === 'ADD_SYSTEM') {
                    if (newSystemIds.length === 0) return NextResponse.json({ message: 'No systems selected' }, { status: 400 });
                    const dbSystems = await prisma.system.findMany({
                        where: { id: { in: newSystemIds } }
                    });
                    const systemsTotal = dbSystems.reduce((sum, s) => sum + Number(s.price), 0);
                    finalPrice = systemsTotal + servicesTotal;
                }

                if (isOnline) {
                    if (!paymentId) {
                        // Attempt legacy payment if no paymentId (backward compatibility)
                        if (body.cardNumber && body.cardCVV) {
                            const paymentResult = await PaymentGateway.processPayment({
                                cardNumber: body.cardNumber, cvv: body.cardCVV, amount: finalPrice,
                                currency: pkg.currency || 'SAR', cardHolderName: body.cardHolderName || body.fullName || 'Unknown',
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
                        await prisma.subscription.update({
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
                            data: { subscriptionId: subId, amount: finalPrice, method: 'ONLINE', status: 'SUCCESS', transactionId: paymentId || 'MANUAL' }
                        });
                        
                        // Provision server
                        provisioningResult = await ServerManager.provisionServer(subId);

                        // Refetch to get the latest data including instanceUrl
                        const finalUpdated = await prisma.subscription.findUnique({
                            where: { id: subId },
                            include: { package: true, services: true }
                        });

                        return NextResponse.json({ 
                            message: provisioningResult && !provisioningResult.success 
                                ? `Subscription created but provisioning failed: ${provisioningResult.message}` 
                                : "Success: System provisioned successfully.",
                            message_ar: provisioningResult && !provisioningResult.success 
                                ? `تم إنشاء الاشتراك ولكن فشل تجهيز النظام: ${provisioningResult.message}` 
                                : "تم تجهيز النظام بنجاح.",
                            provisioning: provisioningResult,
                            domain: finalUpdated?.instanceUrl || "Pending",
                            subscription: finalUpdated 
                        }, { status: 200 });
                    } else {
                        const req = await prisma.subscriptionRequest.create({
                            data: {
                                subscriptionId: subId, type: action as any, packageId: pkgId,
                                paymentMethod: 'ONLINE', licenseFile: body.licenseFile, status: 'APPROVED',
                                services: { connect: newServiceIds.map((sid: number) => ({ id: sid })) },
                                systems: { connect: newSystemIds.map((sid: number) => ({ id: sid })) }
                            }
                        });
                        const updated = await SubscriptionService.applyRequest(req.id);
                        await prisma.payment.create({
                            data: { subscriptionId: subId, amount: finalPrice, method: 'ONLINE', status: 'SUCCESS', transactionId: paymentId || 'MANUAL' }
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
                            services: { connect: newServiceIds.map((sid: number) => ({ id: sid })) },
                            systems: { connect: newSystemIds.map((sid: number) => ({ id: sid })) }
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

                // Auto-calculate dates if status becomes DONE and they aren't provided
                if (dataToUpdate.status === 'DONE') {
                    if (!dataToUpdate.approvalDate && !subscription.approvalDate) {
                        dataToUpdate.approvalDate = new Date();
                    }
                    if (!dataToUpdate.expiryDate && !subscription.expiryDate) {
                        const refDate = dataToUpdate.approvalDate || subscription.approvalDate || new Date();
                        dataToUpdate.expiryDate = SubscriptionService.calculateExpiry(new Date(refDate));
                    }
                }
            } else {
                dataToUpdate.status = subscription.status;
            }

            // 1. ALWAYS update the subscription metadata first so that provisioning uses the new data
            // and so that the manual retry button has the correct data to work with if provisioning fails.
            const updatedSub = await prisma.subscription.update({ 
                where: { id: subId }, 
                data: dataToUpdate,
                include: { package: true, services: true, payments: true } 
            });

            // Trigger provisioning ONLY if the provision flag is explicitly true
            const shouldProvision = body.provision === true && (body.status === 'DONE' || subscription.status === 'DONE');
            
            if (shouldProvision) {
                provisioningResult = await ServerManager.provisionServer(subId);
                
                if (!provisioningResult.success) {
                    // If provisioning failed, we return the error but the metadata is already saved.
                    // This allows the admin to use the "Provision Server" button to retry.
                    return NextResponse.json({ 
                        message: provisioningResult.message,
                        message_ar: provisioningResult.message,
                        provisioning: provisioningResult,
                        success: false,
                        subscription: updatedSub
                    }, { status: 400 });
                }
            }

            // Refetch to get the latest data including instanceUrl from provisioning
            const finalSub = await prisma.subscription.findUnique({ 
                where: { id: subId }, 
                include: { package: true, services: true, payments: true } 
            });

            const finalResponse = {
                ...(finalSub as any),
                totalPrice: Number((finalSub as any)?.totalPrice || 0),
                package: finalSub?.package ? {
                    ...finalSub.package,
                    price: Number(finalSub.package.price)
                } : null
            };

            return NextResponse.json({ 
                message: provisioningResult && !provisioningResult.success 
                    ? provisioningResult.message 
                    : "Subscription approved and system provisioned successfully.",
                message_ar: provisioningResult && !provisioningResult.success 
                    ? provisioningResult.message 
                    : "تمت الموافقة على الاشتراك وتجهيز النظام بنجاح.",
                provisioning: provisioningResult,
                domain: finalSub?.instanceUrl || "Not applicable",
                subscription: finalResponse 
            }, { status: 200 });
        }
        return NextResponse.json({ message: 'Unauthorized action' }, { status: 403 });
    } catch (error: any) {
        console.error("PUT Error:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}