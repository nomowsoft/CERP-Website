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
     * Get the properly formatted authorization header
     */
    private static getAuthHeader(): string {
        const token = this.AUTH_TOKEN.trim();
        if (!token) return '';
        // If token already starts with Bearer (case insensitive), return it as is, otherwise add Bearer prefix
        return token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`;
    }

    /**
     * Provision a new server instance for a subscription
     */
    static async provisionServer(subscriptionId: number): Promise<ProvisionResult> {
        try {
            // console.log(`[ServerManager] Starting provisioning for subscription ${subscriptionId}`);

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
            
            // Improved mapping for Odoo module names (Addons)
            const addonsSet = new Set<string>();
            allSystemsList.forEach(s => {
                // Priority 1: Use explicitly defined modules if available
                if (s.modules && Array.isArray(s.modules) && s.modules.length > 0) {
                    s.modules.forEach(m => {
                        const sanitized = m.trim().toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
                        if (sanitized) addonsSet.add(sanitized);
                    });
                } else {
                    // Priority 2: Fallback to name-based mapping for systems without explicit modules
                    let name = (s.name_en || s.name).trim().toLowerCase();
                    
                    // Map common system names to Odoo module names
                    if (name === 'sales' || name === 'المبيعات') name = 'sale';
                    if (name === 'accounting' || name === 'المحاسبة') name = 'account';
                    if (name === 'inventory' || name === 'المخازن') name = 'stock';
                    if (name === 'crm' || name === 'إدارة العملاء') name = 'crm';
                    if (name === 'purchases' || name === 'المشتريات') name = 'purchase';
                    if (name === 'hr' || name === 'الموارد البشرية') name = 'hr';
                    if (name === 'website' || name === 'الموقع الإلكتروني') name = 'website';
                    if (name === 'point of sale' || name === 'pos' || name === 'نقاط البيع') name = 'point_of_sale';
                    if (name === 'fleet' || name === 'الأسطول') name = 'fleet';
                    if (name === 'marketing automation' || name === 'أتمتة التسويق') name = 'marketing_automation';
                    if (name === 'project' || name === 'المشاريع') name = 'project';
                    if (name === 'timesheet' || name === 'ساعات العمل') name = 'hr_timesheet';
                    if (name === 'helpdesk' || name === 'الدعم الفني') name = 'helpdesk';
                    if (name === 'manufacturing' || name === 'mrp' || name === 'التصنيع') name = 'mrp';
                    if (name === 'quality' || name === 'الجودة') name = 'quality_control';
                    if (name === 'maintenance' || name === 'الصيانة') name = 'maintenance';
                    
                    // Sanitize: lowercase, alphanumeric and underscores only
                    const sanitized = name.replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
                    if (sanitized) addonsSet.add(sanitized);
                }
            });

            const addonsList = Array.from(addonsSet);

            // Ensure fully qualified domain name for the payload and lowercase
            const domainNameStr = subscription.domainName || `sub-${subscriptionId}`;
            const fullDomain = (domainNameStr.includes('.') 
                ? domainNameStr 
                : `${domainNameStr}.cerp.sa`).toLowerCase();

            const payload = {
                PROJECT_NAME: domainNameStr.toLowerCase().replace(/[^a-z0-9]/g, ''),
                action: "create",
                DOMAIN_NAME: fullDomain,
                ADDONS_LIST: addonsList,
                ADMIN_USER: "admin-cerp"
            };

            // console.log(`[ServerManager] Sending webhook payload for subscription ${subscriptionId}:`, JSON.stringify(payload, null, 2));

            // Use native fetch API (recommended in Next.js App Router)
            const response = await fetch(this.WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.getAuthHeader()
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
                console.error(`[ServerManager] Webhook failed with status ${response.status}:`, data);
                // Determine the exact error message from the response
                const serverError = typeof data === 'string' ? data : 
                    (data?.message || data?.error || data?.msg || data?.detail || JSON.stringify(data) || `HTTP Error: ${response.status}`);
                throw new Error(serverError);
            }

            // console.log(`[ServerManager] Webhook response:`, data);

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
            } else if (lowerError.includes('authorization') || lowerError.includes('401') || lowerError.includes('jwt')) {
                translatedMessage = "فشل في المصادقة مع سيرفر التجهيز، يرجى التحقق من إعدادات التوكن (JWT).";
            }

            return { 
                success: false, 
                message: translatedMessage || "حدث خطأ غير متوقع أثناء تجهيز النظام." 
            };
        }
    }

    /**
     * Send a generic action to the provisioning webhook
     */
    static async sendAction(payload: any): Promise<ProvisionResult> {
        try {
            // console.log(`[ServerManager] Sending ${payload.action} action to webhook:`, payload);

            const response = await fetch(this.WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.getAuthHeader()
                },
                body: JSON.stringify(payload),
                cache: 'no-store'
            });

            let data: any;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json().catch(() => null);
            } else {
                data = await response.text().catch(() => null);
            }

            if (!response.ok) {
                const serverError = typeof data === 'string' ? data : 
                    (data?.message || data?.error || data?.msg || data?.detail || `HTTP Error: ${response.status}`);
                throw new Error(serverError);
            }

            return { success: true, data: data };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف";
            console.error(`[ServerManager] Action failed:`, errorMessage);
            return { success: false, message: errorMessage };
        }
    }
}
