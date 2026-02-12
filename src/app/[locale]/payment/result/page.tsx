"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function PaymentResultPage({ params: { locale } }: { params: { locale: string } }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('subscription.messages'); // Assuming messages exist
    const isAr = locale === 'ar';

    const resourcePath = searchParams.get('resourcePath');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!resourcePath) {
            setStatus('error');
            setMessage(isAr ? "رابط غير صالح" : "Invalid link");
            return;
        }

        verifyPayment();
    }, [resourcePath]);

    const verifyPayment = async () => {
        try {
            // 1. Verify Payment with HyperPay
            const verifyRes = await axios.get(`/api/payment/status?resourcePath=${encodeURIComponent(resourcePath!)}`);

            if (verifyRes.data.success) {
                // 2. Payment Successful - Retrieve pending upgrade data
                const pendingUpgrade = sessionStorage.getItem('pendingUpgrade');

                if (pendingUpgrade) {
                    const upgradeData = JSON.parse(pendingUpgrade);

                    // 3. Execute Upgrade
                    await axios.put(`/api/subscription/${upgradeData.subscriptionId}`, {
                        ...upgradeData,
                        paymentId: verifyRes.data.data.id, // Transaction ID
                        paymentMethod: 'ONLINE'
                    });

                    sessionStorage.removeItem('pendingUpgrade');
                    setStatus('success');
                    setMessage(isAr ? "تمت عملية الدفع وتفعيل الاشتراك بنجاح!" : "Payment successful! Subscription activated successfully.");

                    setTimeout(() => {
                        router.push(`/${locale}/admin/subscription`);
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(isAr ? "لم يتم العثور على بيانات الترقية المعلقة" : "Pending upgrade data not found");
                }
            } else {
                setStatus('error');
                setMessage(isAr ? "فشلت عملية الدفع. يرجى المحاولة مرة أخرى." : "Payment failed. Please try again.");
            }
        } catch (error: any) {
            console.error("Payment verification failed", error);
            setStatus('error');
            setMessage(error.response?.data?.message || (isAr ? "حدث خطأ أثناء التحقق من الدفع" : "Error verifying payment"));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <h2 className="text-xl font-bold text-gray-700">{isAr ? "جاري التحقق من الدفع..." : "Verifying Payment..."}</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-green-600">{isAr ? "تمت العملية بنجاح" : "Success!"}</h2>
                        <p className="text-gray-500">{message}</p>
                        <Button onClick={() => router.push(`/${locale}/admin/subscription`)} className="w-full">
                            {isAr ? "الذهاب للاشتراكات" : "Go to Subscriptions"}
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-red-600">{isAr ? "خطأ" : "Error"}</h2>
                        <p className="text-gray-500">{message}</p>
                        <Button onClick={() => router.push(`/${locale}/subscription/upgrade`)} variant="outline" className="w-full">
                            {isAr ? "المحاولة مرة أخرى" : "Try Again"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
