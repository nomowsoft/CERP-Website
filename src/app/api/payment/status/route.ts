import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url); // Use NextRequest's URL
    const resourcePath = searchParams.get('resourcePath');
    const checkoutId = searchParams.get('checkoutId');

    // If resourcePath is not provided, try to construct it if checkoutId is present, 
    // though usually redirect gives resourcePath.
    // resourcePath example: /v1/checkouts/8ac7a4c782.../payment

    if (!resourcePath) {
        return NextResponse.json({ message: "Missing resourcePath" }, { status: 400 });
    }

    const accessToken = process.env.HYPERPAY_ACCESS_TOKEN;
    // In production, use live URL. For now using test.
    const baseUrl = "https://eu-test.oppwa.com";

    try {
        const response = await axios.get(`${baseUrl}${resourcePath}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = response.data;
        const code = result.result.code;

        // Check for success code
        // Regex for success: /^(000\.000\.|000\.100\.1|000\.[36])/
        const isSuccess = /^(000\.000\.|000\.100\.1|000\.[36])/.test(code);

        return NextResponse.json({
            success: isSuccess,
            data: result
        });

    } catch (error: any) {
        console.error("HyperPay Status Check Error:", error.response?.data || error.message);
        return NextResponse.json({
            message: "Failed to verify payment",
            details: error.response?.data || error.message
        }, { status: 500 });
    }
}
