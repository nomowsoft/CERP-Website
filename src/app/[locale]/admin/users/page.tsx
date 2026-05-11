"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getAllUsers, adminDeleteUser } from "@/app/store/slices/usersSlice";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    Shield,
    Mail,
    Phone,
    AlertCircle,
    Building2,
    Plus,
    ExternalLink,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function UsersManagement() {
    const t = useTranslations('admin.users');
    const td = useTranslations('settings');
    const tc = useTranslations('dashboard.common');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const { users, loading, pagination } = useSelector((state: RootState) => state.users);
    const { userInfo } = useSelector((state: RootState) => state.user);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        dispatch(getAllUsers({ page: currentPage, search: searchTerm }));
    }, [dispatch, currentPage, searchTerm]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditClick = (id: string) => {
        router.push(`/${locale}/admin/users/${id}`);
    };

    const handleDeleteClick = (user: any) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await dispatch(adminDeleteUser(selectedUser.id)).unwrap();
            toast.success(t("deleteSuccess"));
            setShowDeleteModal(false);
            // Re-fetch to keep pagination synced
            dispatch(getAllUsers({ page: currentPage, search: searchTerm }));
        } catch (error: any) {
            toast.error(error || t("deleteError"));
        }
    };

    if (userInfo?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-800">{t("accessDenied")}</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto font-bold">{t("adminOnly")}</p>
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
                            {t("title")}
                        </h1>
                        <p className="text-gray-500 font-bold">{t("subtitle")}</p>
                    </div>
                </div>

                <Button
                    onClick={() => router.push(`/${locale}/admin/users/new`)}
                    className="group bg-primary text-white px-8 py-7 rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    {isAr ? "إضافة مستخدم" : "Add User"}
                </Button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                <div className="relative flex-1 group">
                    <Search className={`absolute ${isAr ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-primary transition-colors`} />
                    <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={searchTerm}
                        onChange={handleSearch}
                        className={`w-full ${isAr ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-gray-700 font-bold placeholder:text-gray-300`}
                    />
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-50 rounded-[2.5rem] animate-pulse border border-gray-100" />
                    ))
                ) : users.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {users.map((user: any) => (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 relative overflow-hidden"
                            >
                                {/* Background Accent */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

                                {/* Floating Actions */}
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
                                    <button 
                                        onClick={() => handleEditClick(String(user.id))}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white shadow-sm transition-all duration-300"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(user)}
                                        disabled={user.id === userInfo.id}
                                        className={`p-3 rounded-2xl shadow-sm transition-all duration-300 ${
                                            user.id === userInfo.id 
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                                            : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                        }`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-focus text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                                        {user.name?.[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black text-gray-900 truncate group-hover:text-primary transition-colors">
                                            {user.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1 font-bold">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-8">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase
                                        ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                            user.role === 'EDITOR' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                                            'bg-gray-50 text-gray-600 border border-gray-100'}
                                    `}>
                                        <Shield className="w-3.5 h-3.5" />
                                        {user.role}
                                    </span>
                                    {user.phone && (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-[10px] font-black border border-gray-100">
                                            <Phone className="w-3.5 h-3.5" />
                                            {user.phone}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
                                            {isAr ? "الجهة التابعة" : "Organization"}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-black text-gray-700 truncate max-w-[180px]">
                                                {user.charityName || t("notSet")}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleEditClick(String(user.id))}
                                        className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                            <Users className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{isAr ? "لا يوجد مستخدمين" : "No Users Found"}</h3>
                        <p className="text-gray-500 mt-2 font-bold max-w-sm mx-auto">{isAr ? "لم يتم العثور على أي مستخدم يطابق بحثك حالياً" : "We couldn't find any users matching your search criteria."}</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-12">
                    <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        className="p-4 rounded-xl border-gray-200 text-gray-500 hover:bg-primary hover:text-white disabled:opacity-50 transition-all duration-300"
                    >
                        {isAr ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        {Array.from({ length: pagination.totalPages }).map((_, i) => {
                            const pageNum = i + 1;
                            if (
                                pageNum === 1 || 
                                pageNum === pagination.totalPages || 
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-12 h-12 rounded-xl font-black transition-all duration-300 ${
                                            currentPage === pageNum 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                pageNum === currentPage - 2 || 
                                pageNum === currentPage + 2
                            ) {
                                return <span key={pageNum} className="text-gray-300">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        variant="outline"
                        className="p-4 rounded-xl border-gray-200 text-gray-500 hover:bg-primary hover:text-white disabled:opacity-50 transition-all duration-300"
                    >
                        {isAr ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </Button>
                </div>
            )}

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
                            <h3 className="text-3xl font-black text-gray-900 mb-3">{t("deleteTitle")}</h3>
                            <p className="text-gray-500 font-bold mb-10 leading-relaxed px-4">
                                {t('deleteConfirm', { name: selectedUser?.name })}
                            </p>
                            <div className="flex gap-4">
                                <Button 
                                    onClick={confirmDelete} 
                                    className="flex-1 py-7 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 shadow-lg shadow-red-200"
                                >
                                    {tc("yesDelete")}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowDeleteModal(false)} 
                                    className="flex-1 py-7 rounded-2xl font-black border-2 border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    {tc("cancel")}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
