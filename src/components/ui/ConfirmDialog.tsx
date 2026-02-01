"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    locale?: string;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    variant = "danger",
    locale = "ar"
}: ConfirmDialogProps) {
    const t = useTranslations("dashboard.common");

    const defaultTitle = t("confirmAction");
    const defaultMessage = t("confirmMessage");
    const defaultConfirmText = t("confirm");
    const defaultCancelText = t("cancel");

    const variantStyles = {
        danger: {
            icon: "text-red-500",
            iconBg: "bg-red-50",
            confirmBtn: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
        },
        warning: {
            icon: "text-yellow-500",
            iconBg: "bg-yellow-50",
            confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-600/30"
        },
        info: {
            icon: "text-blue-500",
            iconBg: "bg-blue-50",
            confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
        }
    };

    const styles = variantStyles[variant];

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative z-10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className={`absolute top-6 ${locale === 'ar' ? 'left-6' : 'right-6'} p-2 rounded-full hover:bg-gray-100 transition-colors`}
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                className={`p-4 ${styles.iconBg} rounded-full`}
                            >
                                <AlertTriangle className={`w-12 h-12 ${styles.icon}`} />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-black text-gray-900 text-center mb-3">
                            {title || defaultTitle}
                        </h3>

                        {/* Message */}
                        <p className="text-gray-600 text-center mb-8 leading-relaxed">
                            {message || defaultMessage}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 py-6 rounded-xl font-bold border-2 border-gray-200 hover:bg-gray-50 transition-all"
                            >
                                {cancelText || defaultCancelText}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirm}
                                className={`flex-1 py-6 rounded-xl font-bold transition-all active:scale-95 ${styles.confirmBtn}`}
                            >
                                {confirmText || defaultConfirmText}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
