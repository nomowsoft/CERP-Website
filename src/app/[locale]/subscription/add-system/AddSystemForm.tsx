"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/Skeleton";
import { AppDispatch, RootState } from "@/app/store/store";
import { getSubscription } from "@/app/store/slices/subscriptionSlice";
import { getSystems } from "@/app/store/slices/systemsSlice";
import { getUser } from "@/app/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Check, Info, ArrowRight, ArrowLeft, Upload, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { isValidImage } from "@/utils/imageUtils";
import { Server } from "lucide-react";
import { SaudiRiyalIcon } from "@/components/ui/SaudiRiyalIcon";

export default function AddSystemForm() {
    const router = useRouter();
    const t = useTranslations('subscription');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const searchParams = useSearchParams();
    const initialSystemId = searchParams.get('systemId');

    const { subscriptionInfo, loading: subLoading } = useSelector((state: any) => state.subscription);
    const { userInfo } = useSelector((state: any) => state.user);
    const { systems: allSystems, loading: sysLoading } = useSelector((state: RootState) => state.systems);

    const [selectedSystems, setSelectedSystems] = useState<number[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const [step, setStep] = useState(1);
    const [bankReceipt, setBankReceipt] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(getUser());
        dispatch(getSubscription());
        dispatch(getSystems());
    }, [dispatch]);

    useEffect(() => {
        if (initialSystemId) {
            setSelectedSystems([Number(initialSystemId)]);
        }
    }, [initialSystemId]);

    const mySubscription = subscriptionInfo?.data?.find((s: any) => s.userId === userInfo?.id);
    const activeSystemIds = mySubscription?.systems?.map((s: any) => s.id) || [];
    const availableSystems = allSystems.filter(s => !activeSystemIds.includes(s.id));

    const handleSystemToggle = (id: number) => {
        setSelectedSystems(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setBankReceipt(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const totalPrice = selectedSystems.reduce((acc, id) => {
        const sys = allSystems.find(s => s.id === id);
        return acc + (Number(sys?.price) || 0);
    }, 0);

    const handleSubmit = async () => {
        if (!mySubscription) return;
        if (selectedSystems.length === 0) {
            toast.error(isAr ? "يرجى اختيار نظام واحد على الأقل" : "Please select at least one system");
            return;
        }
        if (!bankReceipt) {
            toast.error(isAr ? "يرجى إرفاق إيصال التحويل البنكي" : "Please attach bank receipt");
            return;
        }

        setIsSubmitting(true);
        try {
            const fileToBase64 = (file: File): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                });
            };

            const payload = {
                action: 'ADD_SYSTEM',
                selectedSystems: selectedSystems,
                paymentMethod: 'BANK',
                bankReceipt: await fileToBase64(bankReceipt)
            };

            await axios.put(`/api/subscription/${mySubscription.id}`, payload);

            toast.success(isAr ? "تم إرسال طلبك بنجاح. سيتم تفعيل الأنظمة فور مراجعة التحويل." : "Request sent successfully. Systems will be activated after verification.");
            router.push(`/${locale}/admin/subscription`);
        } catch (error) {
            console.error(error);
            toast.error(isAr ? "حدث خطأ أثناء إرسال الطلب" : "Error sending request");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted || subLoading || sysLoading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4" dir={isAr ? 'rtl' : 'ltr'}>
                {/* Header Skeleton */}
                <div className="text-center mb-12 space-y-4">
                    <Skeleton className="h-10 w-2/3 md:w-1/3 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>

                {/* Stepper Skeleton */}
                <div className="flex justify-center items-center gap-4 mb-12">
                    <Skeleton className="w-10 h-10" variant="circular" />
                    <Skeleton className="h-1 w-20" />
                    <Skeleton className="w-10 h-10" variant="circular" />
                </div>

                {/* Systems Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="p-6 rounded-[2rem] border-2 border-gray-100 bg-white flex items-start gap-4">
                            <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-6 w-1/3 pt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="text-center mb-12">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black text-gray-900 mb-4"
                >
                    {isAr ? "إضافة أنظمة تقنية" : "Add Technical Systems"}
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-500 text-lg"
                >
                    {isAr ? "اختر الأنظمة التي ترغب في إضافتها إلى اشتراكك الحالي" : "Select systems you want to add to your current subscription"}
                </motion.p>
            </div>

            {/* Stepper */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
                    <div className={`w-20 h-1 bg-gray-100 rounded-full overflow-hidden`}>
                        <div className={`h-full bg-primary transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: isAr ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isAr ? -50 : 50 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableSystems.map((system) => (
                                <div 
                                    key={system.id}
                                    onClick={() => handleSystemToggle(system.id)}
                                    className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer group ${
                                        selectedSystems.includes(system.id) 
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                                        : 'border-gray-100 bg-white hover:border-primary/30 hover:bg-gray-50/50'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-4 rounded-2xl transition-colors flex items-center justify-center w-[64px] h-[64px] ${
                                            selectedSystems.includes(system.id) ? 'bg-primary/20 text-primary' : 'bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'
                                        }`}>
                                            {isValidImage(system.icon) ? (
                                                <Image src={system.icon} alt={system.name} width={32} height={32} className="w-8 h-8 object-contain" />
                                            ) : (
                                                <Server className="w-8 h-8" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-gray-900 mb-1">{isAr ? system.name_ar : system.name_en}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{isAr ? system.description_ar : system.description_en}</p>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xl font-black text-primary flex items-center gap-1">
                                                    <span>{Number(system.price).toLocaleString()}</span>
                                                    {isAr ? <SaudiRiyalIcon size={14} /> : <span className="text-xs font-bold text-gray-400">SAR</span>}
                                                </div>
                                                {system.renewalPrice !== undefined && system.renewalPrice !== null && Number(system.renewalPrice) > 0 && (
                                                    <div className="text-sm text-gray-500 flex items-center gap-1 font-semibold">
                                                        <span>{isAr ? 'التجديد السنوي:' : 'Annual Renewal:'}</span>
                                                        <span className="font-bold text-primary">{Number(system.renewalPrice)}</span>
                                                        <span>{isAr ? <SaudiRiyalIcon size={10} /> : <span className="text-[10px] font-bold text-gray-400">SAR</span>}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {selectedSystems.includes(system.id) && (
                                            <div className="absolute top-6 left-6 p-1 bg-primary text-white rounded-full">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {availableSystems.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold">{isAr ? "لقد اشتركت في جميع الأنظمة المتاحة" : "You are already subscribed to all available systems"}</p>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                            <div className="text-2xl font-black text-gray-900 flex items-center gap-1">
                                <span>{isAr ? "الإجمالي:" : "Total:"}</span>
                                <span className="text-primary font-mono inline-flex items-center gap-1">
                                    {totalPrice.toLocaleString()}
                                    {isAr ? <SaudiRiyalIcon size={14} /> : <span className="text-xs font-bold text-gray-400">SAR</span>}
                                </span>
                            </div>
                            <Button 
                                onClick={() => setStep(2)}
                                disabled={selectedSystems.length === 0}
                                className="px-10 py-7 rounded-2xl bg-primary text-white font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                {isAr ? "التالي" : "Next"}
                                {isAr ? <ChevronLeft className="mr-2 w-6 h-6" /> : <ChevronRight className="ml-2 w-6 h-6" />}
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: isAr ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isAr ? 50 : -50 }}
                        className="space-y-8"
                    >
                        <div className="bg-amber-50 border-2 border-amber-100 rounded-[2rem] p-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-amber-900 mb-2">{isAr ? "بيانات التحويل البنكي" : "Bank Transfer Details"}</h3>
                                    <div className="space-y-2 text-amber-800/80 font-medium">
                                        <p>{isAr ? "اسم البنك: بنك الراجحي" : "Bank Name: Al Rajhi Bank"}</p>
                                        <p>{isAr ? "اسم الحساب: مؤسسة نمو البرمجيات لتقنية المعلومات" : "Account Name: Nomow Soft for IT"}</p>
                                        <p>{isAr ? "رقم الحساب: 123456789012345" : "Account Number: 123456789012345"}</p>
                                        <p>{isAr ? "رقم الآيبان: SA1234567890123456789012" : "IBAN: SA1234567890123456789012"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xl font-black text-gray-900 block px-2">{isAr ? "إرفاق إيصال التحويل" : "Attach Transfer Receipt"}</label>
                            <div 
                                onClick={() => document.getElementById('receipt-upload')?.click()}
                                className={`relative h-64 rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                                    bankReceipt ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                }`}
                            >
                                <input 
                                    id="receipt-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                />
                                {receiptPreview ? (
                                    <div className="relative w-full h-full">
                                        {bankReceipt?.type.includes('image') ? (
                                            <Image src={receiptPreview} alt="Receipt Preview" fill className="object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                                <FileText className="w-16 h-16 text-primary" />
                                                <span className="font-bold text-gray-700">{bankReceipt?.name}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button className="bg-white text-gray-900 font-bold px-6 py-2 rounded-xl">
                                                {isAr ? "تغيير الملف" : "Change File"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-5 bg-primary/10 text-primary rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="w-10 h-10" />
                                        </div>
                                        <p className="text-xl font-black text-gray-900">{isAr ? "اسحب وأفلت الملف هنا" : "Drag & drop file here"}</p>
                                        <p className="text-gray-400 font-medium mt-2">{isAr ? "أو انقر للاختيار من الجهاز" : "or click to browse"}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8 border-t border-gray-100">
                            <Button 
                                onClick={() => setStep(1)}
                                variant="outline"
                                className="flex-1 py-7 rounded-2xl border-2 border-gray-200 font-black text-xl hover:bg-gray-50 active:scale-95 transition-all"
                            >
                                {isAr ? <ChevronRight className="ml-2 w-6 h-6" /> : <ChevronLeft className="mr-2 w-6 h-6" />}
                                {isAr ? "السابق" : "Previous"}
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={!bankReceipt || isSubmitting}
                                className="flex-[2] py-7 rounded-2xl bg-primary text-white font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {isSubmitting ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "تأكيد الطلب" : "Confirm Request")}
                                {!isSubmitting && (isAr ? <Check className="mr-2 w-6 h-6" /> : <Check className="ml-2 w-6 h-6" />)}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
