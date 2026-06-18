import { ServerManager } from './src/utils/serverManager';

async function test() {
    console.log("Starting test provisioning for subscription 18...");
    try {
        const result = await ServerManager.provisionServer(18);
        console.log("Provisioning result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Caught error during provisioning:", e);
    }
}

test();
