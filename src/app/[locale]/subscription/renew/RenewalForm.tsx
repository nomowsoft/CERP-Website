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
    Lock,
    Calendar,
    User
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";

export default function RenewalForm() {
    const router = useRouter();
    const t = useTranslations('subscription');
    const td = useTranslations('dashboard');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    const { subscriptionInfo } = useSelector((state: any) => state.subscription);
    const { userInfo } = useSelector((state: any) => state.user);

    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'BANK'>('BANK');
    const [bankReceiptFile, setBankReceiptFile] = useState<File | null>(null);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(getUser());
        dispatch(getSubscription());
    }, [dispatch]);

    const mySubscription = subscriptionInfo?.find((s: any) => s.userId === userInfo?.id);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
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
            };

            if (paymentMethod === 'BANK') {
                payload.bankReceipt = await fileToBase64(bankReceiptFile!);
            } else {
                payload.cardNumber = cardData.cardNumber;
                payload.cardHolderName = cardData.cardHolder;
                payload.cardExpiryDate = cardData.expiryDate;
                payload.cardCVV = cardData.cvv;
            }

            await axios.put(`/api/subscription/${mySubscription.id}`, payload);

            toast.success(
                paymentMethod === 'ONLINE'
                    ? t('messages.paymentSuccessDesc')
                    : t('messages.orderConfirmDesc')
            );

            setTimeout(() => {
                router.push(`/${locale}/admin/subscription`);
            }, 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('messages.errorDesc'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mySubscription && subscriptionInfo) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center bg-white rounded-[2.5rem] shadow-xl border border-gray-50">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">{isAr ? "لا يوجد اشتراك نشط لتجديده" : "No active subscription to renew"}</h2>
                <Button onClick={() => router.push(`/${locale}/admin/subscription`)} className="mt-6 bg-primary text-white px-8 py-3 rounded-xl">
                    {isAr ? "العودة للوحة التحكم" : "Back to Dashboard"}
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
                    {isAr ? "تجديد الاشتراك" : "Renew Subscription"}
                </h1>
                <p className="text-gray-500 font-medium">
                    {isAr ? "تحديث السجل التجاري وإتمام الدفع في خطوة واحدة" : "Update commercial record and complete payment in one step"}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Right: Summary Sidebar */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-primary/20" />

                        <h3 className="text-xl font-black mb-8 border-b border-gray-50 pb-4 text-gray-800">
                            {isAr ? "ملخص الطلب" : "Order Summary"}
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isAr ? "الباقة" : "Package"}</span>
                                <p className="font-black text-gray-800 text-lg">
                                    {isAr ? (mySubscription.package?.name_ar || mySubscription.package?.name) : (mySubscription.package?.name_en || mySubscription.package?.name)}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isAr ? "النطاق" : "Domain"}</span>
                                <p className="font-bold text-primary truncate">{mySubscription.domainName}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isAr ? "تاريخ الانتهاء" : "Expiry"}</span>
                                <p className="font-bold text-gray-600">{new Date(mySubscription.expiryDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</p>
                            </div>

                            <div className="pt-6 border-t border-gray-100 mt-6 group">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-gray-800 text-lg">{isAr ? "الإجمالي" : "Total"}</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-primary font-doto">{mySubscription.package?.price}</span>
                                        <span className="text-xs font-bold text-primary ml-1 uppercase">{mySubscription.package?.currency || (isAr ? "ر.س." : "SAR")}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium mt-2 leading-relaxed">
                                    {isAr ? "* سيتم إضافة سنة كاملة إلى مدة اشتراكك الحالية" : "* One full year will be added to your current duration"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="w-full py-4 text-gray-400 font-bold flex items-center justify-center gap-2 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                    >
                        <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
                        {isAr ? "العودة للخلف" : "Go Back"}
                    </button>

                    <div className="p-6 bg-yellow-50/50 rounded-[2rem] border border-yellow-100/50">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                            <p className="text-xs font-medium text-yellow-700 leading-relaxed">
                                {isAr ? "بمجرد تقديم الطلب ومراجعته من قبل الإدارة، سيتم تحديث تاريخ الانتهاء تلقائياً." : "Once the request is submitted and reviewed, the expiry date will be updated automatically."}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Left: Form */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Commercial Record Upload */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10" />

                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Upload className="w-5 h-5 text-primary" />
                            </div>
                            {isAr ? "السجل التجاري (ملخص السجل)" : "Commercial Record"}
                        </h3>

                        <div className="relative group">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 ${licenseFile ? 'border-green-200 bg-green-50/30' : 'border-gray-200 group-hover:border-primary/50 bg-gray-50/50'}`}>
                                <Upload className={`w-12 h-12 mx-auto mb-4 ${licenseFile ? 'text-green-500' : 'text-gray-400'}`} />
                                <p className="font-bold text-gray-700 text-lg">
                                    {licenseFile ? licenseFile.name : (isAr ? "اضغط لرفع السجل الجديد" : "Click to upload new record")}
                                </p>
                                <p className="text-sm text-gray-400 mt-2 font-medium">PDF, Image (Max 5MB)</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/5 rounded-br-[5rem] -ml-10 -mt-10" />

                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-800">
                            <div className="p-2 bg-secondary/10 rounded-lg">
                                <CreditCard className="w-5 h-5 text-secondary" />
                            </div>
                            {isAr ? "طريقة التجديد" : "Payment Method"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentMethod('ONLINE')}
                                className={`p-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-4 ${paymentMethod === 'ONLINE' ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/10' : 'border-gray-50 bg-gray-50/30 hover:border-primary/20 hover:bg-white'}`}
                            >
                                <div className={`p-4 rounded-2xl ${paymentMethod === 'ONLINE' ? 'bg-secondary text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                    <CreditCard className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <span className="block font-black text-gray-800">{isAr ? "بطاقة ائتمانية" : "Credit Card"}</span>
                                    <span className="text-xs text-gray-400 font-medium">{isAr ? "تفعيل فوري" : "Instant Activation"}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('BANK')}
                                className={`p-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-4 ${paymentMethod === 'BANK' ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/10' : 'border-gray-50 bg-gray-50/30 hover:border-primary/20 hover:bg-white'}`}
                            >
                                <div className={`p-4 rounded-2xl ${paymentMethod === 'BANK' ? 'bg-secondary text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                    <Building className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <span className="block font-black text-gray-800">{isAr ? "تحويل بنكي" : "Bank Transfer"}</span>
                                    <span className="text-xs text-gray-400 font-medium">{isAr ? "خلال 24 ساعة" : "Within 24 Hours"}</span>
                                </div>
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {paymentMethod === 'ONLINE' ? (
                                <motion.div
                                    key="online"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-10 space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label className="font-bold text-gray-600 px-1">{isAr ? "رقم البطاقة" : "Card Number"}</Label>
                                        <Input
                                            placeholder="XXXX XXXX XXXX XXXX"
                                            value={cardData.cardNumber}
                                            onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                                            className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-secondary/20"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="font-bold text-gray-600 px-1">{isAr ? "تاريخ الانتهاء" : "Expiry (MM/YY)"}</Label>
                                            <Input
                                                placeholder="MM/YY"
                                                value={cardData.expiryDate}
                                                onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-bold text-gray-600 px-1">CVV</Label>
                                            <Input
                                                type="password"
                                                placeholder="***"
                                                value={cardData.cvv}
                                                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="bank"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-10 space-y-6"
                                >
                                    <div className="p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10 flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <Building className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-primary uppercase tracking-wider">{isAr ? "حساب مصرف الراجحي" : "Rajhi Bank Account"}</p>
                                            <p className="font-black text-gray-800 text-lg truncate">SA12 3400 0001 2345 6789 0123</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="font-bold text-gray-600 px-1">{isAr ? "إيصال التحويل" : "Transfer Receipt"}</Label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setBankReceiptFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={`border-2 border-dashed rounded-[1.5rem] p-8 text-center transition-all ${bankReceiptFile ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-gray-50/30 group-hover:border-primary/20'}`}>
                                                <div className="flex items-center justify-center gap-3">
                                                    <Upload className={`w-6 h-6 ${bankReceiptFile ? 'text-green-500' : 'text-gray-400'}`} />
                                                    <span className="font-bold text-gray-600">
                                                        {bankReceiptFile ? bankReceiptFile.name : (isAr ? "رفع صورة الإيصال" : "Upload Receipt Photo")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-8 text-xl font-black bg-primary hover:bg-primary/90 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] text-white"
                    >
                        {isSubmitting ? (isAr ? "جاري المعالجة..." : "Processing...") : (isAr ? "تأكيد طلب التجديد" : "Confirm Renewal Request")}
                    </Button>
                </div>

            </div>
        </div>
    );
}
