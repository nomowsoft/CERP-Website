"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { fetchClients, createClient, deleteClient } from "@/app/store/slices/clientsSlice";
import { useTranslations, useLocale } from "next-intl";
import {
    Users,
    Trash2,
    Plus,
    AlertCircle,
    Image as ImageIcon,
    Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Image from "next/image";

export default function ClientsManagement() {
    const t = useTranslations('dashboard');
    const ta = useTranslations('admin.users');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    const { clients, loading } = useSelector((state: RootState) => state.clients);
    const { userInfo } = useSelector((state: RootState) => state.user);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

    const [newName, setNewName] = useState("");
    const [newImage, setNewImage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dispatch(fetchClients());
    }, [dispatch]);

    const handleAddClick = () => {
        setNewName("");
        setNewImage("");
        setShowAddModal(true);
    };

    const handleDeleteClick = (client: any) => {
        setSelectedClient(client);
        setShowDeleteModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error(isAr ? "حجم الصورة يجب أن يكون أقل من 2 ميجابايت" : "Image size should be less than 2MB");
            return;
        }

        setIsUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImage(reader.result as string);
                toast.success(isAr ? "تم رفع الصورة بنجاح" : "Image uploaded successfully");
                setIsUploading(false);
            };
            reader.onerror = () => {
                toast.error(isAr ? "حدث خطأ أثناء الرفع" : "Error uploading image");
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            toast.error(isAr ? "حدث خطأ أثناء الرفع" : "Error uploading image");
            setIsUploading(false);
        }
    };

    const confirmAdd = async () => {
        if (!newName) {
            toast.error(isAr ? "يرجى إدخال اسم العميل" : "Please enter the client name");
            return;
        }

        try {
            await dispatch(createClient({ name: newName, image: newImage })).unwrap();
            toast.success(isAr ? "تم إضافة العميل بنجاح" : "Client added successfully");
            setShowAddModal(false);
        } catch (error: any) {
            toast.error(error || (isAr ? "حدث خطأ" : "An error occurred"));
        }
    };

    const confirmDelete = async () => {
        try {
            await dispatch(deleteClient(selectedClient.id)).unwrap();
            toast.success(t("common.deleteSuccess"));
            setShowDeleteModal(false);
        } catch (error: any) {
            toast.error(error || t("common.deleteError"));
        }
    };

    if (userInfo?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-800">{ta("accessDenied")}</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto font-bold">{ta("adminOnly")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/10 rounded-[1.5rem]">
                        <Users className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">
                            {t("nav.clients")}
                        </h1>
                        <p className="text-gray-500 font-bold">{isAr ? "إدارة عملاء النظام وعرضهم في الصفحة الرئيسية" : "Manage system clients to show on homepage"}</p>
                    </div>
                </div>

                <Button
                    onClick={handleAddClick}
                    className="group bg-primary text-white px-8 py-7 rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    {isAr ? "إضافة عميل" : "Add Client"}
                </Button>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" dir={isAr ? 'rtl' : 'ltr'}>
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-5 px-6 text-gray-400 font-bold text-sm tracking-wider uppercase text-start">
                                    {isAr ? "الصورة" : "Image"}
                                </th>
                                <th className="py-5 px-6 text-gray-400 font-bold text-sm tracking-wider uppercase text-start">
                                    {isAr ? "اسم العميل" : "Client Name"}
                                </th>
                                <th className="py-5 px-6 text-gray-400 font-bold text-sm tracking-wider uppercase text-end">
                                    {t("common.actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 animate-pulse">
                                        <td className="py-4 px-6"><div className="w-12 h-12 bg-gray-100 rounded-xl" /></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-100 rounded w-1/3" /></td>
                                        <td className="py-4 px-6 text-end"><div className="h-8 bg-gray-100 rounded w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : clients.length > 0 ? (
                                clients.map((client: any) => (
                                    <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            {client.image ? (
                                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 relative bg-white flex items-center justify-center p-2">
                                                    <Image src={client.image} alt={client.name} fill className="object-contain p-2" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-bold text-gray-900 text-lg">{client.name}</span>
                                        </td>
                                        <td className="py-4 px-6 text-end">
                                            <button 
                                                onClick={() => handleDeleteClick(client)}
                                                className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white shadow-sm transition-all duration-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="py-16 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <Users className="w-8 h-8" />
                                        </div>
                                        <p className="text-gray-500 font-bold">{t("common.noResults")}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative z-10 border border-white/20"
                            dir={isAr ? 'rtl' : 'ltr'}
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">{isAr ? "إضافة عميل جديد" : "Add New Client"}</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{isAr ? "اسم العميل" : "Client Name"}</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                        placeholder={isAr ? "أدخل اسم العميل" : "Enter client name"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{isAr ? "شعار العميل" : "Client Logo"}</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                                                    newImage ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                                }`}
                                            >
                                                {isUploading ? (
                                                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                                                ) : newImage ? (
                                                    <div className="relative w-full h-24">
                                                        <Image src={newImage} alt="Preview" fill className="object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <Upload className="w-8 h-8 mb-2" />
                                                        <span className="text-sm font-bold">{isAr ? "اضغط لرفع الصورة" : "Click to upload image"}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleImageUpload} 
                                                className="hidden" 
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                    {newImage && (
                                        <div className="mt-2 text-center">
                                            <button 
                                                onClick={() => setNewImage("")}
                                                className="text-red-500 text-sm font-bold hover:underline"
                                            >
                                                {isAr ? "إزالة الصورة" : "Remove Image"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button 
                                    onClick={confirmAdd} 
                                    disabled={!newName}
                                    className="flex-1 py-6 rounded-2xl bg-primary text-white font-black hover:bg-primary-focus shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isAr ? "إضافة" : "Add"}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowAddModal(false)} 
                                    className="flex-1 py-6 rounded-2xl font-black border-2 border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    {t("common.cancel")}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setShowDeleteModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative z-10 text-center border border-white/20"
                        >
                            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Trash2 className="w-12 h-12" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-3">{t("common.confirmDelete")}</h3>
                            <p className="text-gray-500 font-bold mb-10 leading-relaxed px-4">
                                {isAr 
                                    ? `هل أنت متأكد من رغبتك في حذف العميل "${selectedClient?.name}"؟ لا يمكن التراجع عن هذا الإجراء.` 
                                    : `Are you sure you want to delete the client "${selectedClient?.name}"? This action cannot be undone.`}
                            </p>
                            <div className="flex gap-4">
                                <Button 
                                    onClick={confirmDelete} 
                                    className="flex-1 py-7 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 shadow-lg shadow-red-200"
                                >
                                    {t("common.yesDelete")}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowDeleteModal(false)} 
                                    className="flex-1 py-7 rounded-2xl font-black border-2 border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    {t("common.cancel")}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
