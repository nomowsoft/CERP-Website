"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { getAllUsers, adminUpdateUser, adminDeleteUser } from "@/app/store/slices/usersSlice";
import { useTranslations, useLocale } from "next-intl";
import {
    Users,
    UserPlus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Shield,
    Mail,
    Phone,
    X,
    Check,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Image from "next/image";

export default function UsersManagement() {
    const t = useTranslations('admin.users');
    const td = useTranslations('dashboard');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    const { users, loading } = useSelector((state: RootState) => state.users);
    const { userInfo } = useSelector((state: RootState) => state.user);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editData, setEditData] = useState<any>({});

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            charityName: user.charityName
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (user: any) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(adminUpdateUser({ id: selectedUser.id, data: editData })).unwrap();
            toast.success(t("updateSuccess"));
            setShowEditModal(false);
        } catch (error: any) {
            toast.error(error || t("updateError"));
        }
    };

    const confirmDelete = async () => {
        try {
            await dispatch(adminDeleteUser(selectedUser.id)).unwrap();
            toast.success(t("deleteSuccess"));
            setShowDeleteModal(false);
        } catch (error: any) {
            toast.error(error || t("deleteError"));
        }
    };

    const roles = [
        { value: 'ADMIN', label: isAr ? 'مدير' : 'Admin' },
        { value: 'EDITOR', label: isAr ? 'محرر' : 'Editor' },
        { value: 'VIEWER', label: isAr ? 'مشاهد' : 'Viewer' }
    ];

    if (userInfo?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">{t("accessDenied")}</h2>
                <p className="text-gray-500">{t("adminOnly")}</p>
            </div>
        );
    }

    return (
        <section className="container mx-auto p-4 lg:p-8" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                            {t("title")}
                        </h2>
                        <p className="text-gray-500 mt-1 font-medium">
                            {t("subtitle")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/60 backdrop-blur-xl border border-white shadow-2xl shadow-gray-200/40 rounded-[2rem] p-6 mb-8">
                <div className="relative max-w-md">
                    <Search className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-gray-400 w-5 h-5`} />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`py-6 ${isAr ? 'pr-12' : 'pl-12'} rounded-2xl bg-gray-50/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold transition-all`}
                        placeholder={t("searchPlaceholder")}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest text-start">{t("userColumn")}</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest text-start">{t("roleColumn")}</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest text-start">{t("orgColumn")}</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest text-center">{t("actionsColumn")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                    <td className="py-6 px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                                {user.name?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-900 text-lg">{user.name}</div>
                                                <div className="text-gray-400 font-bold text-sm flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase
                                            ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                                                user.role === 'EDITOR' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                                        `}>
                                            <Shield className="w-3 h-3" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="font-black text-gray-600">{user.charityName || t("notSet")}</div>
                                        <div className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {user.phone}
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                disabled={user.id === userInfo.id}
                                                className={`p-3 rounded-xl transition-all duration-300
                                                    ${user.id === userInfo.id ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'}
                                                `}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowEditModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-xl relative z-10 overflow-hidden"
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-8">{t("editTitle")}</h3>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{td("settings.fullName")}</label>
                                    <Input
                                        value={editData.name}
                                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                                        className="py-6 rounded-2xl bg-gray-50 border-none font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{td("settings.email")}</label>
                                    <Input
                                        value={editData.email}
                                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                                        className="py-6 rounded-2xl bg-gray-50 border-none font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{t("roleColumn")}</label>
                                        <select
                                            value={editData.role}
                                            onChange={e => setEditData({ ...editData, role: e.target.value })}
                                            className="w-full py-3 px-4 rounded-2xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{td("settings.phone")}</label>
                                        <Input
                                            value={editData.phone}
                                            onChange={e => setEditData({ ...editData, phone: e.target.value })}
                                            className="py-6 rounded-2xl bg-gray-50 border-none font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <Button type="submit" className="flex-1 py-8 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
                                        {td("settings.saveChanges")}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 py-8 rounded-2xl font-black border-2 border-gray-100">
                                        {td("settings.cancel")}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowDeleteModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-sm relative z-10 text-center"
                        >
                            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{t("deleteTitle")}</h3>
                            <p className="text-gray-500 font-bold mb-8">
                                {t('deleteConfirm', { name: selectedUser?.name })}
                            </p>
                            <div className="flex gap-4">
                                <Button onClick={confirmDelete} className="flex-1 py-6 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700">
                                    {td("common.yesDelete")}
                                </Button>
                                <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1 py-6 rounded-2xl font-black border-2 border-gray-100">
                                    {td("common.cancel")}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
