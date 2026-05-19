import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userPayload = verifyToken(request);
        
        if (!userPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userPayload.id }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const serverId = parseInt(id, 10);

        if (isNaN(serverId)) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
        }

        // Fetch server details before deleting
        const server = await prisma.server.findUnique({
            where: { id: serverId }
        });

        if (!server) {
            return NextResponse.json({ error: 'Server not found' }, { status: 404 });
        }

        // Delete from database
        await prisma.server.delete({
            where: { id: serverId }
        });

        // Call the webhook to delete from the API/N8N
        try {
            const webhookUrl = process.env.PROVISIONING_WEBHOOK_URL || 'https://n8n.masa.sa/webhook/manage-client-jam3iat-cerp';
            const authToken = process.env.PROVISIONING_AUTH_TOKEN;

            const webhookData = {
                PROJECT_NAME: server.projectName,
                action: "delete",
                ADMIN_USER: server.login
            };
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = authToken;
            }

            const webhookResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(webhookData)
            });
            
            console.log('[Servers API] Webhook response status:', webhookResponse.status);
            const responseText = await webhookResponse.text();
            console.log('[Servers API] Webhook response body:', responseText);

        } catch (webhookError) {
            console.error('[Servers API] Webhook Error:', webhookError);
        }

        return NextResponse.json({ message: 'Server deleted successfully' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
