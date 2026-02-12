import prisma from './db';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * HyperPay API Helper
 */
export class HyperPayService {
    private static baseUrl = process.env.HYPERPAY_BASE_URL;
    private static accessToken = process.env.HYPERPAY_ACCESS_TOKEN;
    private static entityId = process.env.HYPERPAY_ENTITY_ID;

    /**
     * Request a checkout ID from HyperPay
     */
    static async createCheckout(amount: number | Decimal, currency: string = 'SAR'): Promise<string> {
        // In a real implementation, this would call HyperPay's /v1/checkouts endpoint
        // For now, we mock the response as requested in the workflow
        console.log(`[HyperPay] Creating checkout for ${amount} ${currency}`);

        // Mocking the API response
        // const response = await axios.post(`${this.baseUrl}/v1/checkouts`, {
        //   entityId: this.entityId,
        //   amount: amount.toString(),
        //   currency,
        //   paymentType: 'DB'
        // }, {
        //   headers: { Authorization: `Bearer ${this.accessToken}` }
        // });

        return `MOCK_CHECKOUT_${Math.random().toString(36).substring(7)}`;
    }

    /**
     * Verify payment status
     */
    static async verifyPayment(checkoutId: string): Promise<boolean> {
        console.log(`[HyperPay] Verifying payment for session ${checkoutId}`);
        // Mock verify
        return checkoutId.startsWith('MOCK_CHECKOUT_');
    }
}

/**
 * Subscription Logic Service
 */
export class SubscriptionService {
    /**
     * Calculate expiry date (1 year from start)
     */
    static calculateExpiry(startDate: Date): Date {
        const expiry = new Date(startDate);
        expiry.setFullYear(expiry.getFullYear() + 1);
        return expiry;
    }

    /**
     * Get near expiry setting
     */
    static async getNearExpiryDays(): Promise<number> {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'nearExpiryDays' }
        });
        return setting ? parseInt(setting.value) : 30; // Default to 30 days
    }

    /**
     * Check if subscription is near expiry
     */
    static async isNearExpiry(subscriptionId: number): Promise<boolean> {
        const sub = await prisma.subscription.findUnique({
            where: { id: subscriptionId }
        });
        if (!sub || !sub.expiryDate || sub.status !== 'DONE') return false;

        const nearExpiryDays = await this.getNearExpiryDays();
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + nearExpiryDays);

        return sub.expiryDate <= thresholdDate;
    }

    /**
     * Apply a request to its target subscription
     */
    static async applyRequest(requestId: number) {
        const request = await prisma.subscriptionRequest.findUnique({
            where: { id: requestId },
            include: { subscription: true, package: true, services: true }
        });

        if (!request || request.status !== 'APPROVED') return null;

        const { subscription, package: pkg } = request;
        let updateData: any = {
            status: 'DONE',
            approvalDate: new Date(),
        };

        if (request.type === 'UPGRADE' && request.packageId) {
            updateData.packageId = request.packageId;
        }

        // Apply license file if provided in the request (e.g., during renewal)
        if (request.licenseFile) {
            updateData.licenseFile = request.licenseFile;
        }

        // Apply expiry date logic
        const now = new Date();
        const currentExpiry = subscription.expiryDate ? new Date(subscription.expiryDate) : null;

        if (request.type === 'UPGRADE') {
            // Upgrade resets expiry to 1 year from NOW (approval date)
            updateData.expiryDate = this.calculateExpiry(now);
        } else if (currentExpiry && now < currentExpiry) {
            // For other types (like RENEW) IF renewing BEFORE expiry, add 1 year to current expiry
            updateData.expiryDate = this.calculateExpiry(currentExpiry);
        } else {
            // For other types AFTER expiry, add 1 year from NOW
            updateData.expiryDate = this.calculateExpiry(now);
        }

        if (request.services && request.services.length > 0) {
            updateData.services = {
                connect: request.services.map((s: any) => ({ id: s.id }))
            };
        }

        const updatedSubscription = await prisma.subscription.update({
            where: { id: subscription.id },
            data: updateData
        });

        // Also create a payment record
        if (pkg) {
            await prisma.payment.create({
                data: {
                    subscriptionId: subscription.id,
                    amount: pkg.price,
                    method: request.paymentMethod,
                    status: 'SUCCESS',
                }
            });
        }

        return updatedSubscription;
    }
}
