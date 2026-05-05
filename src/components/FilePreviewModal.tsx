"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string | null;
    fileType?: string; // 'image' | 'pdf' | 'other'
    fileName?: string;
}

export default function FilePreviewModal({
    isOpen,
    onClose,
    fileUrl,
    fileType,
    fileName
}: FilePreviewModalProps) {
    const [inferredType, setInferredType] = useState<string>('other');
    const [displayUrl, setDisplayUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const blobUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (!fileUrl || !isOpen) {
            setDisplayUrl(null);
            setLoadError(false);
            return;
        }

        const handleTypeDetection = () => {
            let type = 'other';
            const lowerUrl = fileUrl.toLowerCase();
            if (fileType) {
                type = fileType;
            } else if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/) || lowerUrl.startsWith('data:image/')) {
                type = 'image';
            } else if (lowerUrl.match(/\.pdf($|\?)/) || lowerUrl.startsWith('data:application/pdf')) {
                type = 'pdf';
            }
            setInferredType(type);
            return type;
        };

        const type = handleTypeDetection();

        if (type === 'pdf') {
            loadPdf(fileUrl);
        } else {
            setDisplayUrl(fileUrl);
        }

        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [fileUrl, fileType, isOpen]);

    const loadPdf = async (url: string) => {
        if (url.startsWith('data:') || url.startsWith('blob:')) {
            setDisplayUrl(url);
            return;
        }

        setIsLoading(true);
        setLoadError(false);

        try {
            // Attempt 1: Fetch as blob to bypass X-Frame-Options (works if CORS is open)
            // This is the most "direct" way to show the PDF as it doesn't depend on iframe restriction logic if we have the blob.
            const response = await fetch(url);
            if (!response.ok) throw new Error('Fetch failed');

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobUrlRef.current = blobUrl;
            setDisplayUrl(blobUrl);
            setLoadError(false);
        } catch (error) {
            console.error('PDF fetch failed, using direct URL (now allowed by SAMEORIGIN):', error);
            // Attempt 2: Direct URL in iframe (Now works because we changed headers to SAMEORIGIN)
            setDisplayUrl(url);
            // We only set loadError if we suspect it might still fail (e.g. cross-origin still blocked)
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !fileUrl) return null;

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl flex flex-col shadow-2xl overflow-hidden z-10 border border-white/20"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b bg-gray-50/50 backdrop-blur-sm shrink-0">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 truncate max-w-md">
                                        {fileName || (inferredType === 'image' ? "Image Preview" : "PDF Preview")}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {inferredType.toUpperCase()} File
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-[#F8FAFC] flex items-center justify-center overflow-hidden relative">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-5">
                                    <div className="relative">
                                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                        <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse" />
                                    </div>
                                    <span className="text-gray-500 font-bold tracking-tight">Loading file content...</span>
                                </div>
                            ) : inferredType === 'image' ? (
                                <div className="relative w-full h-full p-6 flex items-center justify-center">
                                    <img
                                        src={displayUrl || fileUrl}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl bg-white p-1"
                                    />
                                </div>
                            ) : inferredType === 'pdf' ? (
                                <div className="w-full h-full relative">
                                    {displayUrl && (
                                        <iframe
                                            src={displayUrl}
                                            className="w-full h-full border-none bg-white font-sans"
                                            title="PDF Preview"
                                        />
                                    )}
                                    {loadError && (
                                        <div className="absolute inset-x-0 bottom-10 flex justify-center pointer-events-none px-4">
                                            <div className="bg-white/90 backdrop-blur-md border border-amber-200 p-6 rounded-[2rem] shadow-2xl max-w-md text-center pointer-events-auto animate-in slide-in-from-bottom-5">
                                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <ExternalLink className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-bold text-gray-800 mb-2">Display settings might block this preview</h4>
                                                <p className="text-sm text-gray-500 mb-5">
                                                    Some servers prevent PDFs from being embedded. Please use the button below to view it directly.
                                                </p>
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 text-lg"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                    <span>Open in New Tab</span>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-12">
                                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl inline-flex flex-col items-center border border-gray-100">
                                        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-3xl flex items-center justify-center mb-6">
                                            <FileText className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No direct preview</h3>
                                        <p className="text-gray-500 mb-8 max-w-xs leading-relaxed">
                                            {fileUrl.startsWith('data:') 
                                                ? "This content cannot be displayed directly here."
                                                : `This file type (${fileUrl.split('.').pop()?.substring(0, 10).toUpperCase()}${fileUrl.split('.').pop()!.length > 10 ? '...' : ''}) cannot be displayed here.`
                                            }
                                        </p>
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-10 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 flex items-center gap-3 transition-all font-bold shadow-lg shadow-primary/20 active:scale-95"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            <span>Open File</span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
