"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getFaqs, deleteFaq, createFaq, updateFaq, Faq } from "@/app/store/slices/faqsSlice";
import { useTranslations, useLocale } from "next-intl";
import {
    HelpCircle,
    Plus,
    Edit2,
    Trash2,
    Save,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function FaqsManagement() {
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    const { faqs, loading } = useSelector((state: RootState) => state.faqs);
    const { userInfo } = useSelector((state: RootState) => state.user);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<number | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Partial<Faq> | null>(null);

    useEffect(() => {
        dispatch(getFaqs());
    }, [dispatch]);

    const handleOpenCreate = () => {
        setEditingFaq({
            question_ar: '',
            question_en: '',
            answer_ar: '',
            answer_en: '',
            order: faqs.length + 1
        });
        setIsEditing(true);
    };

    const handleOpenEdit = (faq: Faq) => {
        setEditingFaq(faq);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditingFaq(null);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!editingFaq?.question_ar || !editingFaq?.answer_ar || !editingFaq?.question_en || !editingFaq?.answer_en) {
            toast.error(isAr ? "يرجى تعبئة كافة الحقول" : "Please fill all fields");
            return;
        }

        try {
            if (editingFaq.id) {
                await dispatch(updateFaq({ id: editingFaq.id, data: editingFaq })).unwrap();
                toast.success(isAr ? "تم التعديل بنجاح" : "Updated successfully");
            } else {
                await dispatch(createFaq(editingFaq)).unwrap();
                toast.success(isAr ? "تمت الإضافة بنجاح" : "Created successfully");
            }
            setIsEditing(false);
            setEditingFaq(null);
        } catch (error: any) {
            toast.error(error || (isAr ? "حدث خطأ" : "An error occurred"));
        }
    };

    const handleDelete = async (id: number) => {
        setFaqToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (faqToDelete === null) return;
        try {
            await dispatch(deleteFaq(faqToDelete)).unwrap();
            toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
        } catch (error: any) {
            toast.error(error || (isAr ? "فشل الحذف" : "Deletion failed"));
        } finally {
            setFaqToDelete(null);
            setShowDeleteDialog(false);
        }
    };

    if (userInfo?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">{isAr ? "وصول غير مصرح" : "Access Denied"}</div>;
    }

    return (
        <section className="container mx-auto p-4 lg:p-8" dir={isAr ? 'rtl' : 'ltr'}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-2xl">
                            <HelpCircle className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                                {isAr ? 'الأسئلة الشائعة' : 'FAQs'}
                            </h2>
                            <p className="text-gray-500 mt-1 font-medium">
                                {isAr ? 'إدارة قائمة الأسئلة الشائعة' : 'Manage Frequently Asked Questions'}
                            </p>
                        </div>
                    </div>
                    {!isEditing && (
                        <Button onClick={handleOpenCreate} className="bg-primary text-white font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            {isAr ? "إضافة سؤال جديد" : "Add New FAQ"}
                        </Button>
                    )}
                </div>

                {isEditing && editingFaq ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 mb-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900">
                                {editingFaq.id ? (isAr ? "تعديل السؤال" : "Edit FAQ") : (isAr ? "إضافة سؤال" : "Add FAQ")}
                            </h3>
                            <button onClick={handleCancelEdit} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">🇸🇦 {isAr ? "السؤال بالعربية" : "Question (Arabic)"}</label>
                                <Input value={editingFaq.question_ar || ''} onChange={e => setEditingFaq({ ...editingFaq, question_ar: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-primary/10 transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">🇬🇧 {isAr ? "السؤال بالإنجليزية" : "Question (English)"}</label>
                                <Input value={editingFaq.question_en || ''} onChange={e => setEditingFaq({ ...editingFaq, question_en: e.target.value })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-primary/10 transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">🇸🇦 {isAr ? "الجواب بالعربية" : "Answer (Arabic)"}</label>
                                <textarea value={editingFaq.answer_ar || ''} onChange={e => setEditingFaq({ ...editingFaq, answer_ar: e.target.value })} className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold min-h-[120px] outline-none resize-none focus:ring-2 focus:ring-primary/10 transition-all" required dir="rtl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">🇬🇧 {isAr ? "الجواب بالإنجليزية" : "Answer (English)"}</label>
                                <textarea value={editingFaq.answer_en || ''} onChange={e => setEditingFaq({ ...editingFaq, answer_en: e.target.value })} className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold min-h-[120px] outline-none resize-none focus:ring-2 focus:ring-primary/10 transition-all" required dir="ltr" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{isAr ? "الترتيب" : "Order"}</label>
                                <Input type="number" value={editingFaq.order || 0} onChange={e => setEditingFaq({ ...editingFaq, order: parseInt(e.target.value) })} className="py-6 rounded-2xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-primary/10 transition-all max-w-[200px]" />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4">
                            <Button onClick={handleCancelEdit} variant="outline" className="px-8 py-6 rounded-2xl font-bold bg-white text-gray-500 hover:bg-gray-50">
                                {isAr ? "إلغاء" : "Cancel"}
                            </Button>
                            <Button onClick={handleSave} className="px-8 py-6 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                                <Save className="w-5 h-5" />
                                {isAr ? "حفظ" : "Save"}
                            </Button>
                        </div>
                    </motion.div>
                ) : null}

                {!isEditing && (
                    <div className="flex flex-col gap-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-24 bg-gray-100 rounded-[2rem] animate-pulse" />
                            ))
                        ) : faqs.length === 0 ? (
                            <div className="text-center p-12 text-gray-400 font-bold bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                                {isAr ? "لا يوجد أسئلة شائعة مضافة بعد" : "No FAQs added yet"}
                            </div>
                        ) : faqs.map((faq) => (
                            <div 
                                key={faq.id} 
                                className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                            >
                                <div className="flex-1">
                                    <h4 className="text-lg font-black text-gray-900 mb-2">
                                        {isAr ? faq.question_ar : faq.question_en}
                                    </h4>
                                    <p className="text-gray-500 text-sm line-clamp-2">
                                        {isAr ? faq.answer_ar : faq.answer_en}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Button 
                                        onClick={() => handleOpenEdit(faq)} 
                                        variant="outline"
                                        className="bg-gray-50 border-none text-gray-600 hover:bg-primary/10 hover:text-primary rounded-xl font-bold h-12 w-12 p-0 flex items-center justify-center transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" /> 
                                    </Button>
                                    <Button 
                                        onClick={() => handleDelete(faq.id)} 
                                        variant="outline"
                                        className="bg-red-50 border-none text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold h-12 w-12 p-0 flex items-center justify-center transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            <ConfirmDialog 
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title={isAr ? "حذف السؤال" : "Delete FAQ"}
                message={isAr ? "هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this FAQ? This action cannot be undone."}
                confirmText={isAr ? "حذف" : "Delete"}
                cancelText={isAr ? "إلغاء" : "Cancel"}
            />
        </section>
    );
}
