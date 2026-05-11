"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { getSubscription } from "@/app/store/slices/subscriptionSlice";
import { getUser } from "@/app/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    History,
    Upload,
    CreditCard,
    Building,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    RefreshCcw,
    Calendar
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import HyperPayWidget from "@/components/payment/HyperPayWidget";

export default function RenewalForm() {
    const router = useRouter();
    const t = useTranslations('subscription');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    const { subscriptionInfo } = useSelector((state: any) => state.subscription);
    const { userInfo } = useSelector((state: any) => state.user);

    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'BANK'>('BANK');
    const [bankReceiptFile, setBankReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutId, setCheckoutId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getUser());
        dispatch(getSubscription());
    }, [dispatch]);

    const mySubscription = subscriptionInfo?.data?.find((s: any) => s.userId === userInfo?.id);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const initiateOnlinePayment = async () => {
        if (!mySubscription) return;
        if (!licenseFile) {
            toast.error(isAr ? "يرجى رفع ملف السجل التجاري أولاً" : "Please upload the commercial record first");
            return;
        }

        setIsSubmitting(true);
        try {
            const amount = parseFloat(mySubscription.package?.price || "0").toFixed(2);
            const payload = {
                amount,
                customerEmail: userInfo?.email || "customer@example.com",
                customerGivenName: userInfo?.name?.split(' ')[0] || "Guest",
                customerSurname: userInfo?.name?.split(' ').slice(1).join(' ') || "User",
                billingStreet1: "Olaya St",
                billingCity: "Riyadh",
                billingState: "Riyadh",
                billingCountry: "SA",
                billingPostcode: "12345"
            };

            const response = await axios.post('/api/payment/checkout', payload);
            if (response.data.id) {
                // Save pending renewal details
                sessionStorage.setItem('pendingUpgrade', JSON.stringify({
                    subscriptionId: mySubscription.id,
                    action: 'RENEW',
                    packageId: mySubscription.packageId,
                    licenseFile: await fileToBase64(licenseFile)
                }));

                setCheckoutId(response.data.id);
            } else {
                toast.error(isAr ? "فشل إنشاء عملية الدفع" : "Failed to initiate payment");
            }
        } catch (error: any) {
            console.error("Payment init error", error);
            toast.error(isAr ? "حدث خطأ أثناء الاتصال ببوابة الدفع" : "Error connecting to payment gateway");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!mySubscription) {
            toast.error(isAr ? "لم يتم العثور على اشتراك نشط" : "No active subscription found");
            return;
        }

        if (!licenseFile) {
            toast.error(isAr ? "يرجى رفع ملف السجل التجاري" : "Please upload the commercial record file");
            return;
        }

        if (paymentMethod === 'ONLINE') {
            await initiateOnlinePayment();
            return;
        }

        if (paymentMethod === 'BANK' && !bankReceiptFile) {
            toast.error(isAr ? "يرجى رفع إيصال التحويل البنكي" : "Please upload the bank receipt");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: any = {
                action: 'RENEW',
                paymentMethod: paymentMethod,
                packageId: mySubscription.packageId,
                licenseFile: await fileToBase64(licenseFile),
                bankReceiptFile: bankReceiptFile ? await fileToBase64(bankReceiptFile) : null
            };

            await axios.put(`/api/subscription/${mySubscription.id}`, payload);

            toast.success(isAr ? "تم إرسال طلب التجديد للمراجعة" : "Renewal request submitted for review");

            setTimeout(() => {
                router.push(`/${locale}/admin/subscription`);
            }, 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('messages.errorDesc'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (checkoutId) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4" dir={isAr ? 'rtl' : 'ltr'}>
                <button onClick={() => setCheckoutId(null)} className="mb-4 text-gray-500 hover:text-primary flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180 rtl:rotate-0" />
                    {isAr ? "العودة" : "Back"}
                </button>
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-center">{isAr ? "الدفع الإلكتروني الآمن" : "Secure Electronic Payment"}</h2>
                    <HyperPayWidget checkoutId={checkoutId} />
                </div>
            </div>
        );
    }

    if (!mySubscription && subscriptionInfo) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center bg-white rounded-[2.5rem] shadow-xl border border-gray-50 uppercase tracking-widest">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">{isAr ? "لا يوجد اشتراك لتجديده" : "No subscription to renew"}</h2>
                <Button onClick={() => router.push(`/${locale}/admin/subscription`)} className="mt-6">
                    {isAr ? "العودة" : "Go Back"}
                </Button>
            </div>
        );
    }

    if (!mySubscription) return null;

    return (
        <div className="max-w-5xl mx-auto px-4" dir={isAr ? 'rtl' : 'ltr'}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-bold mb-4">
                    <History className="w-4 h-4" />
                    {isAr ? "نظام التجديد السريع" : "Quick Renewal System"}
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {isAr
                        ? `تجديد باقة ${mySubscription.package?.name_ar || mySubscription.package?.name} (${mySubscription.package?.price} ريال)`
                        : `Renew ${mySubscription.package?.name_en || mySubscription.package?.name} Plan (${mySubscription.package?.price} SAR)`}
                </h1>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Summary */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />

                        <h3 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">
                            <Calendar className="w-5 h-5 text-primary" />
                            {isAr ? "ملخص التجديد" : "Renewal Summary"}
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                                    {isAr ? "الباقة الحالية" : "Current Plan"}
                                </span>
                                <p className="text-lg font-black text-gray-800">
                                    {isAr ? (mySubscription.package?.name_ar || mySubscription.package?.name) : (mySubscription.package?.name_en || mySubscription.package?.name)}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-600 font-bold">{isAr ? "التكلفة" : "Cost"}</span>
                                    <div className="text-right">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-primary">{mySubscription.package?.price}</span>
                                            <span className="text-xs font-bold text-primary/60 uppercase">SAR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-primary" />
                            {isAr ? "تحديث السجل التجاري" : "Update Commercial Record"}
                        </h3>
                        <div className="relative border-2 border-dashed rounded-[1.5rem] p-10 text-center hover:bg-gray-50 transition-all">
                            <input type="file" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                            <p className="font-bold text-gray-600">{licenseFile ? licenseFile.name : (isAr ? "ارفع ملف السجل الجديد" : "Upload new record file")}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-secondary" />
                            {isAr ? "طريقة الدفع" : "Payment Method"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                disabled 
                                className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 opacity-50 cursor-not-allowed border-gray-50 bg-gray-50/50 relative overflow-hidden`}
                            >
                                <div className="absolute top-2 left-2 bg-gray-200 text-gray-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                                    {isAr ? "قريباً" : "Soon"}
                                </div>
                                <div className={`p-3 rounded-xl bg-white text-gray-300 border`}>
                                    <CreditCard className="w-6 h-6 text-gray-300" />
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-400">{isAr ? "بطاقة ائتمانية" : "Credit Card"}</span>
                                    <span className="text-[10px] text-gray-400">{isAr ? "غير متوفر حالياً" : "Currently unavailable"}</span>
                                </div>
                            </button>
                            <button onClick={() => setPaymentMethod('BANK')} className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'BANK' ? 'border-secondary bg-secondary/5' : 'border-gray-50 bg-gray-50/50'}`}>
                                <Building className="w-6 h-6 text-secondary" />
                                <div className="text-right">
                                    <span className="block font-bold text-gray-800">{isAr ? "تحويل بنكي" : "Bank Transfer"}</span>
                                    <span className="text-xs text-gray-400">{isAr ? "مراجعة يدوية" : "Manual Review"}</span>
                                </div>
                            </button>
                        </div>

                        {paymentMethod === 'BANK' && (
                            <div className="mt-8 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{isAr ? "بيانات التحويل" : "Transfer Details"}</p>
                                <p className="font-black text-gray-800">الراجحي: SA12 3400 0001 2345 6789 0123</p>
                                <div className="mt-4">
                                    <Label className="font-bold text-gray-600 mb-2 block">{isAr ? "صورة الإيصال" : "Transfer Receipt"}</Label>
                                    <Input type="file" onChange={(e) => setBankReceiptFile(e.target.files?.[0] || null)} className="rounded-xl border-gray-200" />
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-8 text-xl font-black bg-primary hover:bg-primary/90 rounded-[2rem] shadow-xl text-white"
                    >
                        {isSubmitting ? (isAr ? "جاري المعالجة..." : "Processing...") : (isAr ? "إرسال طلب التجديد" : "Submit Renewal")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
