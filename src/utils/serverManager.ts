import prisma from './db';

// Define the response type for better TypeScript support
export interface ProvisionResult {
    success: boolean;
    message?: string;
    data?: any;
    domain?: string;
}

export class ServerManager {
    private static readonly WEBHOOK_URL = process.env.PROVISIONING_WEBHOOK_URL || 'https://n8n.masa.sa/webhook/manage-client-jam3iat-cerp';
    private static readonly AUTH_TOKEN = process.env.PROVISIONING_AUTH_TOKEN || '';

    /**
     * Provision a new server instance for a subscription
     */
    static async provisionServer(subscriptionId: number): Promise<ProvisionResult> {
        try {
            console.log(`[ServerManager] Starting provisioning for subscription ${subscriptionId}`);

            const subscription = await prisma.subscription.findUnique({
                where: { id: subscriptionId },
                include: {
                    package: {
                        include: {
                            systems: true
                        }
                    },
                    systems: true,
                    user: true
                }
            });

            if (!subscription) {
                console.error(`[ServerManager] Subscription ${subscriptionId} not found`);
                return { success: false, message: "Subscription not found" };
            }

            // Prepare ADDONS_LIST from BOTH package systems and individual systems (sanitized: trim, lowercase, alphanumeric only)
            const packageSystems = subscription.package?.systems || [];
            const individualSystems = subscription.systems || [];
            const allSystemsList = [...packageSystems, ...individualSystems];
            
            // Use a Set to ensure unique names in case of overlaps
            const addonsSet = new Set(allSystemsList.map(s => 
                (s.name_en || s.name).trim().toLowerCase().replace(/[^a-z0-9]/g, '')
            ).filter(name => name.length > 0));

            const addonsList = Array.from(addonsSet);

            // Ensure fully qualified domain name for the payload and lowercase
            const domainNameStr = subscription.domainName || `sub-${subscriptionId}`;
            const fullDomain = (domainNameStr.includes('.') 
                ? domainNameStr 
                : `${domainNameStr}.cerp.sa`).toLowerCase();

            const payload = {
                // Use the domain name as the project name because it's guaranteed to be alphanumeric/English
                PROJECT_NAME: domainNameStr.toLowerCase().replace(/[^a-z0-9]/g, ''),
                action: "create",
                DOMAIN_NAME: fullDomain,
                ADDONS_LIST: addonsList,
                ADMIN_USER: "admin-cerp"
            };

            console.log(`[ServerManager] Sending webhook payload:`, payload);

            // Use native fetch API (recommended in Next.js App Router)
            const response = await fetch(this.WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.AUTH_TOKEN}`
                },
                body: JSON.stringify(payload),
                cache: 'no-store'
            });

            // Safely parse the response data
            let data: any;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json().catch(() => null);
            } else {
                data = await response.text().catch(() => null);
            }

            if (!response.ok) {
                // Determine the exact error message from the response
                const serverError = typeof data === 'string' ? data : 
                    (data?.message || data?.error || data?.msg || data?.detail || `HTTP Error: ${response.status}`);
                throw new Error(serverError);
            }

            console.log(`[ServerManager] Webhook response:`, data);

            // Update subscription with instance info
            const instanceUrl = `https://${fullDomain}`;

            await prisma.subscription.update({
                where: { id: subscriptionId },
                data: {
                    instanceUrl: instanceUrl,
                    status: 'DONE'
                }
            });

            return { success: true, data: data, domain: instanceUrl };

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف";
            console.error(`[ServerManager] Provisioning failed for subscription ${subscriptionId}:`, errorMessage);
            
            let translatedMessage = errorMessage;

            // Translate common technical errors to clear Arabic messages
            const lowerError = errorMessage.toLowerCase();
            if (lowerError.includes('validation failed') || lowerError.includes('ensure domain_name') || lowerError.includes('alphanumeric')) {
                translatedMessage = "فشل التحقق: يرجى التأكد من أن اسم النطاق واسم المشروع يحتويان فقط على أحرف إنجليزية وأرقام ولا يحتويان على مسافات.";
            } else if (lowerError.includes('already exists') || lowerError.includes('exists')) {
                translatedMessage = "هذا النطاق مستخدم بالفعل، يرجى اختيار اسم نطاق آخر.";
            } else if (lowerError.includes('authorization') || lowerError.includes('401')) {
                translatedMessage = "فشل في المصادقة مع سيرفر التجهيز، يرجى التحقق من الإعدادات.";
            }

            return { 
                success: false, 
                message: translatedMessage || "حدث خطأ غير متوقع أثناء تجهيز النظام." 
            };
        }
    }
}
