import axios from 'axios';

interface PaymentRequest {
    cardNumber: string;
    cvv: string;
    amount: number;
    currency: string;
    cardHolderName: string;
    expiryDate: string;
}

interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    message?: string;
}

/**
 * Mock Payment Gateway Service
 * Simulates processing a payment with an external provider.
 */
export const PaymentGateway = {
    async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
        try {
            // In a real application, you would make an API call here.
            // const response = await axios.post('https://external-payment-gateway.com/api/pay', paymentData);

            // Simulating a successful API call for demonstration
            // We are using a timeout to simulate network latency
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Basic validation simulation
            if (!paymentData.cardNumber || !paymentData.cvv) {
                return { success: false, message: 'Invalid card details' };
            }

            // Mock successful response
            return {
                success: true,
                transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                message: 'Payment processed successfully'
            };

        } catch (error: any) {
            console.error("Payment Processing Error:", error);
            return {
                success: false,
                message: error.message || 'Payment processing failed'
            };
        }
    }
};
