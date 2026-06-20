"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/Skeleton";
import { AppDispatch } from "@/app/store/store";
import { getSubscription } from "@/app/store/slices/subscriptionSlice";
import { getUser } from "@/app/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    TrendingUp,
    Upload,
    CreditCard,
    Building,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Package as PackageIcon,
    Calendar,
    Star
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import HyperPayWidget from "@/components/payment/HyperPayWidget";
import { SaudiRiyalIcon } from "@/components/ui/SaudiRiyalIcon";

export default function UpgradeForm() {
    const router = useRouter();
    const t = useTranslations('subscription');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    const { subscriptionInfo } = useSelector((state: any) => state.subscription);
    const { userInfo } = useSelector((state: any) => state.user);

    const [packages, setPackages] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'BANK'>('BANK');
    const [bankReceiptFile, setBankReceiptFile] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [checkoutId, setCheckoutId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        dispatch(getUser());
        dispatch(getSubscription());
        fetchInitialData();
    }, [dispatch]);

    const fetchInitialData = async () => {
        try {
            const [pkgsRes, svcsRes] = await Promise.all([
                axios.get('/api/packages'),
                axios.get('/api/services')
            ]);
            setPackages(pkgsRes.data);
            setServices(svcsRes.data);
            setIsLoadingData(false);
        } catch (error) {
            console.error("Failed to fetch data", error);
            setIsLoadingData(false);
        }
    };

    const mySubscription = subscriptionInfo?.data?.find((s: any) => s.userId === userInfo?.id);
    const activeServiceIds = mySubscription?.services?.map((s: any) => s.id) || [];
    const availableServices = services.filter(s => !activeServiceIds.includes(s.id));

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const toggleService = (id: number) => {
        setSelectedServiceIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const calculateTotal = () => {
        const pkgToCalc = selectedPackageId ? packages.find(p => p.id === selectedPackageId) : mySubscription?.package;

        // Safety parsing for pkg price
        let pkgPrice = 0;
        if (pkgToCalc?.price) {
            const parsed = parseFloat(String(pkgToCalc.price).replace(/,/g, ''));
            pkgPrice = isNaN(parsed) ? 0 : parsed;
        }

        const svcsPrice = services
            .filter(s => selectedServiceIds.includes(s.id))
            .reduce((sum, s) => {
                const parsed = parseFloat(String(s.price).replace(/,/g, ''));
                return sum + (isNaN(parsed) ? 0 : parsed);
            }, 0);

        return (pkgPrice + svcsPrice).toFixed(2);
    };

    const initiateOnlinePayment = async () => {
        if (!mySubscription) return;

        setIsSubmitting(true);
        try {
            const amount = calculateTotal();
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

            // console.log("DEBUG: Sending Payment Payload:", payload);
            const response = await axios.post('/api/payment/checkout', payload);
            if (response.data.id) {
                sessionStorage.setItem('pendingUpgrade', JSON.stringify({
                    subscriptionId: mySubscription.id,
                    packageId: selectedPackageId || mySubscription.packageId,
                    selectedServices: selectedServiceIds,
                    action: 'UPGRADE'
                }));

                setCheckoutId(response.data.id);
            } else {
                toast.error(isAr ? "فشل إنشاء عملية الدفع" : "Failed to initiate payment");
            }
        } catch (error: any) {
            console.error("Payment init error", error);
            toast.error(error.response?.data?.message || (isAr ? "حدث خطأ أثناء الاتصال ببوابة الدفع" : "Error connecting to payment gateway"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!mySubscription) {
            toast.error(isAr ? "لم يتم العثور على اشتراك نشط" : "No active subscription found");
            return;
        }

        if (!selectedPackageId && selectedServiceIds.length === 0) {
            toast.error(isAr ? "يرجى اختيار باقة أو خدمة للترقية" : "Please select a package or service to upgrade");
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
                action: 'UPGRADE',
                paymentMethod: paymentMethod,
                packageId: selectedPackageId || mySubscription.packageId,
                selectedServices: selectedServiceIds,
                licenseFile: licenseFile ? await fileToBase64(licenseFile) : null,
                bankReceiptFile: bankReceiptFile ? await fileToBase64(bankReceiptFile) : null
            };

            await axios.put(`/api/subscription/${mySubscription.id}`, payload);

            toast.success(isAr ? "تم إرسال طلب الترقية للمراجعة" : "Upgrade request submitted for review");

            setTimeout(() => {
                router.push(`/${locale}/admin/subscription`);
            }, 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('messages.errorDesc'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted || isLoadingData) {
        return (
            <div className="max-w-5xl mx-auto py-12 px-4" dir={isAr ? 'rtl' : 'ltr'}>
                {/* Header Skeleton */}
                <div className="text-center mb-12 space-y-4">
                    <Skeleton className="h-10 w-2/3 md:w-1/3 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Fields Skeleton */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Packages section */}
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-28 w-full rounded-2xl" />
                                <Skeleton className="h-28 w-full rounded-2xl" />
                            </div>
                        </div>

                        {/* Services section */}
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/4" />
                            <div className="space-y-3">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Summary section */}
                    <div className="lg:col-span-1">
                        <div className="border border-gray-100 rounded-3xl p-6 bg-white space-y-6">
                            <Skeleton className="h-6 w-1/2" />
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                                <div className="h-px bg-gray-100 my-4" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-6 w-1/4" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!mySubscription && subscriptionInfo) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center bg-white rounded-[2.5rem] shadow-xl border border-gray-50">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">{isAr ? "لا يوجد اشتراك نشط لترقيته" : "No active subscription to upgrade"}</h2>
                <Button onClick={() => router.push(`/${locale}/admin/subscription`)} className="mt-6 bg-primary text-white px-8 py-3 rounded-xl">
                    {isAr ? "العودة للوحة التحكم" : "Back to Dashboard"}
                </Button>
            </div>
        );
    }

    if (checkoutId) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4" dir={isAr ? 'rtl' : 'ltr'}>
                <button onClick={() => setCheckoutId(null)} className="mb-4 text-gray-500 hover:text-primary flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180 rtl:rotate-0" />
                    {isAr ? "العودة" : "Back"}
                </button>
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-center">{isAr ? "الدفع الإلكتروني" : "Secure Payment"}</h2>
                    <HyperPayWidget checkoutId={checkoutId} />
                </div>
            </div>
        );
    }

    const selectedPkg = selectedPackageId ? packages.find(p => p.id === selectedPackageId) : mySubscription?.package;

    return (
        <div className="max-w-6xl mx-auto px-4" dir={isAr ? 'rtl' : 'ltr'}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-bold mb-4">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    {isAr ? "نظام الترقية الذكي" : "Smart Upgrade System"}
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {isAr ? "ترقية العضوية" : "Upgrade Membership"}
                </h1>
                <p className="text-gray-500 font-medium">
                    {isAr ? "اختر باقتك الجديدة والخدمات التي تفضلها" : "Choose your new package and the services you prefer"}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                        <h3 className="text-lg font-black mb-6 pb-4 border-b border-gray-50 text-gray-800">
                            {isAr ? "تفاصيل الفاتورة" : "Invoice Details"}
                        </h3>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold">{isAr ? "الباقة" : "Package"}</span>
                                <span className="font-bold text-gray-800">
                                    {isAr ? selectedPkg?.name_ar : selectedPkg?.name_en}
                                </span>
                            </div>

                            {selectedServiceIds.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 px-1">{isAr ? "الخدمات المضافة" : "Added Services"}</p>
                                    {services.filter(s => selectedServiceIds.includes(s.id)).map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-2 bg-purple-50/50 rounded-lg">
                                            <span className="text-xs font-bold text-gray-600">{isAr ? s.name_ar : s.name_en}</span>
                                            <span className="text-xs font-black text-purple-600">+{s.price}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-50 mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-800 font-black text-lg">{isAr ? "إجمالي المبلغ" : "Total Amount"}</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-primary font-doto">{calculateTotal()}</span>
                                        <span className="text-xs font-bold text-primary ml-1 flex items-center">{isAr ? <SaudiRiyalIcon size={12} /> : "SAR"}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-101/50 mt-4">
                                    <Calendar className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-yellow-700 font-bold leading-relaxed">
                                        {isAr ? "سيتم تمديد اشتراكك لمدة سنة كاملة من تاريخ اعتماد الترقية." : "Your subscription will be extended for 1 year from approval date."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full mt-8 py-7 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1"
                        >
                            {isSubmitting ? (isAr ? "جاري المعالجة..." : "Processing...") : (isAr ? "تأكيد الترقية" : "Confirm Upgrade")}
                        </Button>
                    </div>

                    <button onClick={() => router.back()} className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold hover:text-primary transition-colors">
                        <ArrowRight className="w-4 h-4 rotate-180 rtl:rotate-0" />
                        {isAr ? "الرجوع" : "Go Back"}
                    </button>
                </div>
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <PackageIcon className="w-5 h-5 text-primary" />
                            </div>
                            {isAr ? "تغيير الباقة" : "Change Package"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {packages.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    onClick={() => setSelectedPackageId(pkg.id)}
                                    className={`relative p-6 rounded-[2rem] border-2 transition-all text-right flex flex-col h-full ${selectedPackageId === pkg.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-50 bg-gray-50/30 hover:border-primary/20 hover:bg-white'}`}
                                >
                                    {selectedPackageId === pkg.id && (
                                        <div className="absolute top-4 left-4">
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        </div>
                                    )}
                                    <span className="text-lg font-black text-gray-800 mb-1">
                                        {isAr ? pkg.name_ar : pkg.name_en}
                                    </span>
                                    <div className="flex flex-col gap-1 mb-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-primary">{pkg.price}</span>
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">{isAr ? <SaudiRiyalIcon size={12} /> : (pkg.currency || "SAR")}</span>
                                        </div>
                                        {pkg.renewalPrice !== undefined && pkg.renewalPrice !== null && Number(pkg.renewalPrice) > 0 && (
                                            <div className="text-[10px] text-gray-500 flex items-center gap-1 font-semibold">
                                                <span>{isAr ? 'التجديد:' : 'Renewal:'}</span>
                                                <span className="font-bold text-primary">{Number(pkg.renewalPrice)}</span>
                                                <span>{isAr ? <SaudiRiyalIcon size={8} /> : "SAR"}</span>
                                            </div>
                                        )}
                                    </div>
                                    {mySubscription?.packageId === pkg.id && (
                                        <div className="mt-auto">
                                            <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-full">{isAr ? "باقتك الحالية" : "Current"}</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {availableServices.length > 0 && (
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-purple-500" />
                                </div>
                                {isAr ? "إضافة خدمات جديدة" : "Add New Services"}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableServices.map((svc) => (
                                    <div
                                        key={svc.id}
                                        onClick={() => toggleService(svc.id)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedServiceIds.includes(svc.id) ? 'border-purple-500 bg-purple-50/30 shadow-md' : 'border-gray-50 bg-gray-50/30 hover:border-purple-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg transition-colors ${selectedServiceIds.includes(svc.id) ? 'bg-purple-500 text-white' : 'bg-white text-gray-300 border'}`}>
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div className="text-right flex flex-col gap-0.5">
                                                <span className="block font-bold text-gray-800">{isAr ? svc.name_ar : svc.name_en}</span>
                                                <span className="text-sm text-purple-600 font-bold flex items-center gap-1">{svc.price} {isAr ? <SaudiRiyalIcon size={12} /> : (svc.currency || "SAR")}</span>
                                                {svc.renewalPrice !== undefined && svc.renewalPrice !== null && Number(svc.renewalPrice) > 0 && (
                                                    <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                                                        {isAr ? 'التجديد السنوي:' : 'Annual Renewal:'} <span className="font-bold text-primary">{Number(svc.renewalPrice)}</span> {isAr ? <SaudiRiyalIcon size={8} /> : "SAR"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-gray-800">
                            <div className="p-2 bg-secondary/10 rounded-lg">
                                <CreditCard className="w-5 h-5 text-secondary" />
                            </div>
                            {isAr ? "وسيلة الدفع" : "Payment Method"}
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
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-400">{isAr ? "بطاقة ائتمانية" : "Credit Card"}</span>
                                    <span className="text-[10px] text-gray-400">{isAr ? "غير متوفر حالياً" : "Currently unavailable"}</span>
                                </div>
                            </button>
                            <button onClick={() => setPaymentMethod('BANK')} className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'BANK' ? 'border-secondary bg-secondary/5' : 'border-gray-50 bg-gray-50/50'}`}>
                                <div className={`p-3 rounded-xl ${paymentMethod === 'BANK' ? 'bg-secondary text-white' : 'bg-white text-gray-400 border'}`}>
                                    <Building className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-800">{isAr ? "تحويل بنكي" : "Bank Transfer"}</span>
                                    <span className="text-xs text-gray-400">{isAr ? "يوم عمل" : "Manual Approval"}</span>
                                </div>
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {paymentMethod === 'ONLINE' ? (
                                <motion.div key="online" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-8 space-y-4">
                                    <div className="p-6 bg-blue-50/50 text-blue-700 rounded-xl border border-blue-100/50 text-sm">
                                        <p className="font-bold flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            {isAr ? "سيتم توجيهك إلى بوابة الدفع الآمنة عند تأكيد الترقية." : "You will be redirected to the secure payment gateway upon confirmation."}
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="bank" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-8 space-y-4">
                                    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                                        <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{isAr ? "بيانات التحويل" : "Transfer Details"}</p>
                                        <p className="font-black text-gray-800">الراجحي: SA12 3400 0001 2345 6789 0123</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-600">{isAr ? "صورة الإيصال" : "Transfer Receipt"}</Label>
                                        <div className="relative border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                                            <input type="file" onChange={(e) => setBankReceiptFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                            <p className="font-bold text-gray-600">{bankReceiptFile ? bankReceiptFile.name : (isAr ? "إرفاق الإيصال" : "Attach Receipt")}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
