import { NextResponse } from 'next/server';
import { ServerManager } from '@/utils/serverManager';

/**
 * API Route to proxy provisioning requests to the n8n webhook.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('Authorization');

        const expectedToken = process.env.PROVISIONING_AUTH_TOKEN;
        
        // Flexible token check
        if (!authHeader || (authHeader !== `Bearer ${expectedToken}` && authHeader !== expectedToken)) {
            console.error('[Provisioning API] Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { PROJECT_NAME, action, DOMAIN_NAME } = body;
        if (!PROJECT_NAME || !action || !DOMAIN_NAME) {
            return NextResponse.json({ 
                error: 'Missing required fields: PROJECT_NAME, action, DOMAIN_NAME' 
            }, { status: 400 });
        }

        const result = await ServerManager.sendAction(body);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Action ${action} initiated successfully`,
                data: result.data
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                error: result.message 
            }, { status: 502 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
