import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            amount,
            customerEmail,
            billingStreet1,
            billingCity,
            billingState,
            billingCountry,
            billingPostcode,
            customerGivenName,
            customerSurname
        } = body;

        // Configuration
        const entityId = process.env.HYPERPAY_ENTITY_ID;
        const accessToken = process.env.HYPERPAY_ACCESS_TOKEN;
        const testMode = "EXTERNAL";
        const currency = "SAR";
        const paymentType = "DB";

        if (!entityId || !accessToken) {
            console.error("Missing HyperPay configuration");
            return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
        }

        // Prepare data for HyperPay
        const data = new URLSearchParams();
        data.append('entityId', entityId.trim());

        // Amount formatting: ensure it is a valid numeric string
        const parsedAmount = parseFloat(String(amount));
        const finalAmount = isNaN(parsedAmount) ? "0.00" : Math.round(parsedAmount).toFixed(2);
        
        data.append('amount', finalAmount);
        data.append('currency', currency);
        data.append('paymentType', paymentType);

        // Required parameters
        data.append('testMode', testMode);
        data.append('customParameters[3DS2_enrolled]', 'true');
        data.append('merchantTransactionId', uuidv4());

        // Use fallbacks for required fields
        data.append('customer.email', customerEmail || "customer@example.com");
        data.append('billing.street1', billingStreet1 || "Default St");
        data.append('billing.city', billingCity || "Riyadh");
        data.append('billing.state', billingState || "Riyadh");
        data.append('billing.country', billingCountry || "SA");
        data.append('billing.postcode', billingPostcode || "12345");
        data.append('customer.givenName', customerGivenName || "Guest");
        data.append('customer.surname', customerSurname || "User");


        const response = await axios.post('https://eu-test.oppwa.com/v1/checkouts', data, {
            headers: {
                'Authorization': `Bearer ${accessToken.trim()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return NextResponse.json(response.data);

    } catch (error: any) {
        const errorData = error.response?.data;
        const errorDetails = JSON.stringify(errorData || error.message, null, 2);

        console.error("HyperPay Checkout Error (Detailed):", errorDetails);

        if (errorData?.result?.parameterErrors) {
            console.error("Parameter Errors:", JSON.stringify(errorData.result.parameterErrors, null, 2));
        }

        return NextResponse.json({
            message: "Payment initialization failed",
            details: errorData || error.message
        }, { status: 500 });
    }
}
