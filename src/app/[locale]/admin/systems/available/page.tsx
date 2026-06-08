"use client";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { SaudiRiyalIcon } from "@/components/ui/SaudiRiyalIcon";
import { 
    Check, 
    Plus, 
    ShieldCheck, 
    ArrowRight, 
    ArrowLeft, 
    X,
    Upload,
    CreditCard,
    Building2,
    Info
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function AvailableSystems() {
    const locale = useLocale();
    const t = useTranslations('programs');
    const td = useTranslations('dashboard');
    const tc = useTranslations('dashboard.common');
    
    const [systems, setSystems] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSystem, setSelectedSystem] = useState<any>(null);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [buySystem, setBuySystem] = useState<any>(null);
    
    // Form for bank transfer
    const [bankReceipt, setBankReceipt] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sysRes, subRes] = await Promise.all([
                    fetch('/api/systems'),
                    fetch('/api/subscription')
                ]);
                
                const sysData = await sysRes.json();
                const subData = await subRes.json();
                
                setSystems(sysData);
                // Assume the first active one
                setSubscription(subData.find((s: any) => s.status === 'DONE' || s.status === 'PROGRES') || subData[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBankReceipt(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePurchase = async () => {
        if (!subscription) {
            toast.error(locale === 'ar' ? "يجب أن يكون لديك اشتراك نشط أولاً" : "You must have an active subscription first");
            return;
        }

        if (!bankReceipt) {
            toast.error(locale === 'ar' ? "يرجى رفع إيصال الدفع البنكي" : "Please upload the bank receipt");
            return;
        }

        setIsSubmitting(true);
        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(bankReceipt);
            reader.onloadend = async () => {
                const base64Receipt = reader.result;
                
                const res = await fetch(`/api/subscription/${subscription.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'ADD_SYSTEM',
                        selectedSystems: [buySystem.id],
                        paymentMethod: 'BANK',
                        bankReceipt: base64Receipt
                    })
                });

                if (res.ok) {
                    toast.success(locale === 'ar' ? "تم إرسال طلب الاشتراك في النظام بنجاح" : "System subscription request sent successfully");
                    setShowBuyModal(false);
                    setBuySystem(null);
                    setBankReceipt(null);
                    setReceiptPreview(null);
                } else {
                    const data = await res.json();
                    toast.error(data.message || "Error");
                }
            };
        } catch (error) {
            toast.error("Error submitting request");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const currentSystemIds = subscription?.systems?.map((s: any) => s.id) || [];
    const packageSystemIds = subscription?.package?.systems?.map((s: any) => s.id) || [];
    const allActiveSystemIds = [...currentSystemIds, ...packageSystemIds];

    return (
        <div className="space-y-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{td('nav.availableSystems')}</h1>
                    <p className="text-slate-500 mt-1">{locale === 'ar' ? "قم بتوسيع نطاق عملك بإضافة أنظمة جديدة لاشتراكك" : "Expand your operations by adding new systems to your subscription"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {systems.map((system) => {
                    const isOwned = allActiveSystemIds.includes(system.id);
                    return (
                        <div 
                            key={system.id}
                            className={`group relative bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden ${isOwned ? 'border-primary/20 bg-primary/5 shadow-inner' : 'border-gray-100 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5'}`}
                        >
                            <div className="p-8 flex flex-col h-full">
                                {/* System Icon */}
                                <div className="mb-6 flex justify-between items-start">
                                    <div className="bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 p-5 rounded-3xl transition-all duration-300 flex items-center justify-center w-[70px] h-[70px]">
                                        {system.icon && typeof system.icon === 'string' ? (
                                            <Image src={system.icon} alt={system.name} width={40} height={40} className="w-10 h-10 object-contain" />
                                        ) : (
                                            <ShieldCheck className="w-10 h-10 text-primary/50" />
                                        )}
                                    </div>
                                    {isOwned && (
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            {locale === 'ar' ? "مفعل" : "Active"}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                                        {locale === 'en' ? system.name_en : system.name_ar}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6">
                                        {locale === 'en' ? system.description_en : system.description_ar}
                                    </p>
                                </div>

                                {/* Price & Buy */}
                                <div className="mt-auto pt-6 border-t border-gray-50">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-gray-900">{Number(system.price)}</span>
                                            <span className="text-sm text-gray-400 font-medium flex items-center gap-1">{locale === 'ar' ? <SaudiRiyalIcon size={12} /> : "SAR"}</span>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedSystem(system)}
                                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                                            title={locale === 'ar' ? "التفاصيل" : "Details"}
                                        >
                                            <Info className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {!isOwned ? (
                                        <button 
                                            onClick={() => {
                                                setBuySystem(system);
                                                setShowBuyModal(true);
                                            }}
                                            className="flex items-center justify-center w-full py-3.5 bg-gray-50 hover:bg-primary hover:text-white text-gray-900 font-bold rounded-2xl transition-all duration-300 gap-2 group-hover:bg-primary group-hover:text-white"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span>{locale === 'ar' ? "اشتراك الآن" : "Subscribe Now"}</span>
                                        </button>
                                    ) : (
                                        <div className="text-center py-3.5 text-primary/60 font-medium">
                                            {locale === 'ar' ? "مضمن في اشتراكك" : "Included in your subscription"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Info Modal (Hover Effect logic reuse) */}
            <AnimatePresence>
                {selectedSystem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSystem(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="bg-primary/5 p-4 rounded-3xl">
                                        {selectedSystem.icon ? (
                                            <Image src={selectedSystem.icon} alt={selectedSystem.name} width={50} height={50} />
                                        ) : (
                                            <ShieldCheck className="w-10 h-10 text-primary" />
                                        )}
                                    </div>
                                    <button onClick={() => setSelectedSystem(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>
                                
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    {locale === 'en' ? selectedSystem.name_en : selectedSystem.name_ar}
                                </h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-2">
                                            {locale === 'ar' ? "عن النظام" : "About System"}
                                        </h4>
                                        <p className="text-gray-600 leading-relaxed text-lg">
                                            {locale === 'en' ? selectedSystem.description_en : selectedSystem.description_ar}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-2xl p-6">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-900">{locale === 'ar' ? "تكلفة الاشتراك الإضافي" : "Additional Subscription Cost"}</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-primary">{Number(selectedSystem.price)}</span>
                                                <span className="text-sm text-primary/60 font-medium flex items-center gap-1">{locale === 'ar' ? <SaudiRiyalIcon size={12} /> : "SAR"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        setBuySystem(selectedSystem);
                                        setSelectedSystem(null);
                                        setShowBuyModal(true);
                                    }}
                                    disabled={allActiveSystemIds.includes(selectedSystem.id)}
                                    className="w-full mt-8 py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all disabled:bg-gray-200 disabled:shadow-none"
                                >
                                    {allActiveSystemIds.includes(selectedSystem.id) ? (locale === 'ar' ? "مفعل مسبقاً" : "Already Active") : (locale === 'ar' ? "اشتراك الآن" : "Subscribe Now")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Purchase Modal (Bank Transfer) */}
            <AnimatePresence>
                {showBuyModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSubmitting && setShowBuyModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{locale === 'ar' ? "تأكيد الاشتراك" : "Confirm Subscription"}</h2>
                                        <p className="text-gray-500 text-sm">{locale === 'ar' ? "إكمال عملية الدفع البنكي" : "Complete bank transfer payment"}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowBuyModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Order Summary */}
                                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                                            {buySystem.icon ? (
                                                <Image src={buySystem.icon} alt={buySystem.name} width={32} height={32} />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{locale === 'en' ? buySystem.name_en : buySystem.name_ar}</h4>
                                            <p className="text-primary font-bold flex items-center gap-1">{Number(buySystem.price)} {locale === 'ar' ? <SaudiRiyalIcon size={14} /> : "SAR"}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-start gap-2">
                                        <Info className="w-4 h-4 mt-0.5 text-primary" />
                                        <span>{locale === 'ar' ? "سيتم إرسال طلبك للإدارة للمراجعة وتفعيل النظام بعد التأكد من الحوالة." : "Your request will be sent to management for review and system activation after verifying the transfer."}</span>
                                    </div>
                                </div>

                                {/* Bank Details (Placeholder) */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                        {locale === 'ar' ? "بيانات التحويل البنكي" : "Bank Transfer Details"}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-xs text-gray-400 uppercase font-black">{locale === 'ar' ? "اسم البنك" : "Bank Name"}</span>
                                            <p className="font-bold text-gray-700">{locale === 'ar' ? "مصرف الراجحي" : "Al Rajhi Bank"}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-xs text-gray-400 uppercase font-black">IBAN</span>
                                            <p className="font-bold text-gray-700 select-all">SA82 8000 0000 0000 0000 0000</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Receipt */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        {locale === 'ar' ? "رفع إيصال التحويل" : "Upload Transfer Receipt"}
                                    </h4>
                                    
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange}
                                            className="hidden" 
                                            id="receipt-upload" 
                                        />
                                        <label 
                                            htmlFor="receipt-upload"
                                            className={`flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${receiptPreview ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary hover:bg-gray-50'}`}
                                        >
                                            {receiptPreview ? (
                                                <div className="relative w-full h-[200px] p-4">
                                                    <Image src={receiptPreview} alt="Receipt Preview" fill className="object-contain rounded-2xl" />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                                                        <span className="bg-white/90 px-4 py-2 rounded-xl text-sm font-bold text-gray-900">{locale === 'ar' ? "تغيير الصورة" : "Change Image"}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-6">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                        <Upload className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-900 font-bold mb-1">{locale === 'ar' ? "اضغط لرفع الإيصال" : "Click to upload receipt"}</p>
                                                    <p className="text-gray-400 text-sm">{locale === 'ar' ? "PNG, JPG حتى 5 ميجابايت" : "PNG, JPG up to 5MB"}</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-gray-50/80 border-t border-gray-100">
                                <button 
                                    onClick={handlePurchase}
                                    disabled={isSubmitting || !bankReceipt}
                                    className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-6 h-6" />
                                            <span>{locale === 'ar' ? "إرسال الطلب الآن" : "Send Request Now"}</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-center mt-4 text-xs text-gray-400">
                                    {locale === 'ar' ? "بمجرد الضغط على إرسال، فإنك توافق على شروط الخدمة." : "By clicking send, you agree to our terms of service."}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom CSS for Animations */}
            <style jsx global>{`
                .font-tajawalregular { font-family: 'Tajawal', sans-serif; }
                .font-doto2 { font-family: 'Doto', sans-serif; }
            `}</style>
        </div>
    );
}
