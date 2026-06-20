"use client";
import { useEffect, useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
    Image as ImageIcon,
    Trash2,
    Plus,
    AlertCircle,
    Upload,
    ArrowLeft,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";

interface HeroImage {
    id: number;
    image: string;
    createdAt: string;
}

export default function HeroImagesManagement() {
    const t = useTranslations('dashboard');
    const locale = useLocale();
    const isAr = locale === 'ar';
    
    const [images, setImages] = useState<HeroImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<HeroImage | null>(null);

    const [newImage, setNewImage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user info and check if admin
    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setIsAdmin(data.role === 'ADMIN');
                }
            } catch (err) {
                console.error("Failed to check user authentication", err);
            }
        };
        checkUser();
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/hero-images');
            if (response.ok) {
                const data = await response.json();
                setImages(data);
            } else {
                toast.error(isAr ? "فشل تحميل الصور" : "Failed to fetch images");
            }
        } catch (error) {
            toast.error(isAr ? "حدث خطأ أثناء تحميل الصور" : "Error loading images");
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setNewImage("");
        setShowAddModal(true);
    };

    const handleDeleteClick = (image: HeroImage) => {
        setSelectedImage(image);
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
        if (!newImage) {
            toast.error(isAr ? "يرجى رفع صورة أولاً" : "Please upload an image first");
            return;
        }

        try {
            const response = await fetch('/api/hero-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: newImage })
            });

            if (response.ok) {
                toast.success(isAr ? "تم إضافة الصورة بنجاح" : "Image added successfully");
                setShowAddModal(false);
                fetchImages();
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to add image");
            }
        } catch (error) {
            toast.error(isAr ? "حدث خطأ" : "An error occurred");
        }
    };

    const confirmDelete = async () => {
        if (!selectedImage) return;

        try {
            const response = await fetch(`/api/hero-images/${selectedImage.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success(isAr ? "تم حذف الصورة بنجاح" : "Image deleted successfully");
                setShowDeleteModal(false);
                fetchImages();
            } else {
                toast.error(isAr ? "فشل الحذف" : "Failed to delete");
            }
        } catch (error) {
            toast.error(isAr ? "حدث خطأ" : "An error occurred");
        }
    };

    // Note: We'll show access denied if the user is not an admin, but let's default to verified logic
    // we can also do loading state for checking admin status
    if (loading && images.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/10 rounded-[1.5rem]">
                        <ImageIcon className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">
                            {isAr ? "صور البنر الرئيسي (الهيرو)" : "Hero Slider Images"}
                        </h1>
                        <p className="text-gray-500 font-bold">
                            {isAr ? "إدارة وتعديل الصور المعروضة في شريط البنر الرئيسي بالصفحة الرئيسية" : "Manage images displayed in the homepage main slider banner"}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleAddClick}
                    className="group bg-primary text-white px-8 py-7 rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    {isAr ? "إضافة صورة" : "Add Image"}
                </Button>
            </div>

            {/* Images Grid */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                {images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {images.map((img) => (
                            <motion.div
                                key={img.id}
                                layout
                                className="group relative rounded-3xl overflow-hidden border border-gray-150 bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[280px]"
                            >
                                <div className="relative flex-1 bg-white p-2">
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                                        <Image
                                            src={img.image}
                                            alt="Hero Banner"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-400 font-medium">
                                        {new Date(img.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteClick(img)}
                                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <ImageIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">
                            {isAr ? "لا توجد صور حالياً" : "No images found"}
                        </h3>
                        <p className="text-gray-500 font-bold mb-8">
                            {isAr ? "قم بإضافة أول صورة ليتم عرضها في السلايدر الرئيسي للموقع." : "Add your first image to be displayed on the homepage slider banner."}
                        </p>
                        <Button
                            onClick={handleAddClick}
                            className="bg-primary text-white px-6 py-5 rounded-xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30"
                        >
                            {isAr ? "رفع صورة الآن" : "Upload Image Now"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Add Image Modal */}
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
                            className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-lg relative z-10 border border-white/20"
                            dir={isAr ? 'rtl' : 'ltr'}
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">
                                {isAr ? "إضافة صورة بنر جديدة" : "Add New Banner Image"}
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        {isAr ? "اختر صورة البنر" : "Select Banner Image"}
                                    </label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                                            newImage ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                        }`}
                                    >
                                        {isUploading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mb-3" />
                                                <span className="text-sm text-gray-500 font-bold">
                                                    {isAr ? "جاري رفع الصورة..." : "Uploading image..."}
                                                </span>
                                            </div>
                                        ) : newImage ? (
                                            <div className="relative w-full h-[180px] rounded-xl overflow-hidden">
                                                <Image src={newImage} alt="Preview" fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400">
                                                <Upload className="w-12 h-12 mb-3 text-gray-300" />
                                                <span className="text-base font-bold text-gray-500 mb-1">
                                                    {isAr ? "اضغط لرفع الصورة من جهازك" : "Click to upload image from your device"}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {isAr ? "يفضل أبعاد عريضة مثل 1920x800 بكسل" : "Recommended size 1920x800 pixels"}
                                                </span>
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

                            <div className="flex gap-4 mt-10">
                                <Button 
                                    onClick={confirmAdd} 
                                    disabled={!newImage || isUploading}
                                    className="flex-1 py-6 rounded-2xl bg-primary text-white font-black hover:bg-primary-focus shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isAr ? "إضافة وحفظ" : "Add & Save"}
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
                            <h3 className="text-3xl font-black text-gray-900 mb-3">
                                {isAr ? "تأكيد الحذف" : "Confirm Delete"}
                            </h3>
                            <p className="text-gray-500 font-bold mb-10 leading-relaxed px-4">
                                {isAr 
                                    ? "هل أنت متأكد من رغبتك في حذف هذه الصورة من البنر؟ هذا الإجراء سيؤدي لإزالتها تماماً من السلايدر الرئيسي." 
                                    : "Are you sure you want to delete this image from the banner? This action will remove it completely from the main slider."}
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
