import { useEffect, useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HyperPayWidgetProps {
    checkoutId: string;
    brands?: string; // e.g. "MADA VISA MASTER AMEX"
}

export default function HyperPayWidget({ checkoutId, brands = "MADA VISA MASTER AMEX" }: HyperPayWidgetProps) {
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'timeout'>('loading');
    const formRef = useRef<HTMLDivElement>(null);
    const scriptInjected = useRef(false);

    useEffect(() => {
        if (!checkoutId || scriptInjected.current) return;

        setStatus('loading');
        console.log("[HyperPay] Initializing for checkoutId:", checkoutId);

        // 1. Set global options
        // @ts-ignore
        window.wpwlOptions = {
            paymentTarget: "_top",
            locale: isAr ? "ar" : "en",
            style: "card",
            onReady: function () {
                console.log("[HyperPay] Widget Ready");
                setStatus('ready');
            },
            onError: function (error: any) {
                console.error("[HyperPay] Widget Error:", error);
                setStatus('error');
            }
        };

        // 2. Clear out any previous scripts/styles
        const existing = document.getElementById('hyperpay-script-injected');
        if (existing) existing.remove();

        const leftovers = document.querySelectorAll('link[href*="oppwa"], style[id*="wpwl"], .wpwl-container');
        leftovers.forEach(el => el.remove());

        // 3. Create the script
        const script = document.createElement('script');
        script.id = 'hyperpay-script-injected';
        script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
        script.async = true;

        script.onerror = () => {
            console.error("[HyperPay] Script download failed");
            setStatus('error');
        };

        // 4. Protection timeout
        const timer = setTimeout(() => {
            if (status === 'loading') {
                console.warn("[HyperPay] Initialization timeout reached");
                setStatus('timeout');
            }
        }, 20000);

        // 5. Inject script with a slight delay to ensure the formRef is stable
        const injectTimer = setTimeout(() => {
            console.log("[HyperPay] Appending script to body now");
            document.body.appendChild(script);
            scriptInjected.current = true;
        }, 800);

        return () => {
            clearTimeout(timer);
            clearTimeout(injectTimer);
            // We don't necessarily remove the script on unmount if we want it to persist during redirect, 
            // but for cleanup:
            // if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, [checkoutId, isAr, status]);

    const returnUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${isAr ? 'ar' : 'en'}/payment/result`
        : '';

    return (
        <div className="hyperpay-container w-full min-h-[400px] flex flex-col items-center justify-center relative bg-white rounded-3xl p-6 border border-gray-50 shadow-sm" ref={formRef}>

            {/* Loading Overlay */}
            {status === 'loading' && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 rounded-3xl space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="text-center">
                        <h4 className="font-bold text-gray-800">{isAr ? "جاري الاتصال بـ HyperPay..." : "Connecting to HyperPay..."}</h4>
                        <p className="text-sm text-gray-400 mt-1">{isAr ? "يرجى عدم إغلاق الصفحة" : "Please don't close this page"}</p>
                    </div>
                </div>
            )}

            {/* Error / Timeout Display */}
            {(status === 'error' || status === 'timeout') && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white rounded-3xl p-8 space-y-6 text-center">
                    <div className="p-4 bg-red-50 rounded-full">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {status === 'timeout'
                                ? (isAr ? "انتهت مهلة الانتظار" : "Connection Timeout")
                                : (isAr ? "حدث خطأ غير متوقع" : "An error occurred")}
                        </h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                            {isAr
                                ? "لم نستطع تحميل بوابة الدفع. يرجى التأكد من اتصال الإنترنت أو المحاولة لاحقاً."
                                : "We couldn't load the payment gateway. Please check your connection or try again later."}
                        </p>
                    </div>
                    <Button onClick={() => window.location.reload()} variant="default" className="px-10 py-6 rounded-2xl text-lg font-bold">
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        {isAr ? "إعادة المحاولة" : "Try Again"}
                    </Button>
                </div>
            )}

            {/* The form - ALWAYS present in DOM, script will find it by class */}
            <div className={`w-full transition-opacity duration-1000 ${status === 'ready' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                <form
                    action={returnUrl}
                    className="paymentWidgets"
                    data-brands={brands}
                ></form>
            </div>

            <style jsx global>{`
                /* Prevent HyperPay from polluting your UI before it's ready */
                .wpwl-container {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 auto !important;
                }
                .wpwl-form {
                    background: #ffffff !important;
                    border: 1px solid #f3f4f6 !important;
                    border-radius: 1.5rem !important;
                    box-shadow: none !important;
                    padding: 2rem !important;
                }
                .wpwl-label {
                    font-weight: 700 !important;
                    color: #4b5563 !important;
                }
                .wpwl-control {
                    border-radius: 0.75rem !important;
                    height: 3.5rem !important;
                    border-color: #e5e7eb !important;
                }
                .wpwl-button-pay {
                    background-color: #1e3a8a !important;
                    border-radius: 1rem !important;
                    height: 3.8rem !important;
                    font-weight: 800 !important;
                    font-size: 1.1rem !important;
                    margin-top: 1.5rem !important;
                }
                .wpwl-brand-MADA {
                    order: -1 !important;
                }
            `}</style>
        </div>
    );
}
