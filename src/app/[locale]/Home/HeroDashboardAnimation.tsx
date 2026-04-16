"use client";

import { motion } from "framer-motion";
import { Shield, Users, TrendingUp, BarChart3 } from "lucide-react";

export const HeroDashboardAnimation = () => {
    return (
        <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[500px] flex items-center justify-center p-4">
            {/* Background Circles */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 m-auto w-[250px] sm:w-[350px] lg:w-[450px] h-[250px] sm:h-[350px] lg:h-[450px] border-[1px] border-dashed border-primary/30 rounded-full"
            />
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 m-auto w-[180px] sm:w-[280px] lg:w-[350px] h-[180px] sm:h-[280px] lg:h-[350px] border-[1px] border-dashed border-secondary/40 rounded-full"
            />
            
            {/* Main Dashboard Card */}
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative z-10 w-full max-w-md sm:max-w-lg"
            >
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden border border-white/50"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-b from-gray-100/50 to-transparent px-5 py-4 flex items-center justify-between border-b border-gray-100/50">
                        <span className="text-sm font-semibold text-gray-500">لوحة التحكم</span>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                            <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
                        </div>
                    </div>

                    {/* Body - Chart */}
                    <div className="p-6">
                        <div className="flex items-end justify-between h-32 sm:h-40 mb-8 gap-2">
                            {[40, 80, 45, 75, 40, 60, 35].map((height, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 1, delay: 0.5 + i * 0.1, type: "spring", bounce: 0.4 }}
                                    className={`w-full rounded-t-md ${i % 2 === 0 ? 'bg-primary/80 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'bg-secondary/70 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.3)]'}`}
                                    style={{
                                        backgroundImage: i % 2 === 0 
                                          ? 'linear-gradient(to top, rgba(0,0,0,0.05), transparent)' 
                                          : 'linear-gradient(to top, rgba(0,0,0,0.05), transparent)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Footer Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div 
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-start"
                            >
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">1,234</p>
                                    <p className="text-xs text-gray-500 font-medium">مستفيد</p>
                                </div>
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Users className="text-primary w-5 h-5" />
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-start"
                            >
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">98.5%</p>
                                    <p className="text-xs text-gray-500 font-medium">معدل الإنجاز</p>
                                </div>
                                <div className="p-2 bg-secondary/10 rounded-lg">
                                    <BarChart3 className="text-secondary w-5 h-5" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Floating Badge 1 - Top Left */}
            <motion.div
                initial={{ opacity: 0, x: -50, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 1, type: "spring" }}
                className="absolute top-4 sm:top-10 left-2 sm:left-10 lg:-left-5 z-20"
            >
                <motion.div 
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="bg-white/90 backdrop-blur-md shadow-xl border border-white rounded-2xl p-3 sm:p-4 flex items-center gap-4"
                >
                    <div className="bg-primary p-3 rounded-xl text-white shadow-lg shadow-primary/30">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm sm:text-base font-bold text-gray-800 leading-none mb-1">أمان عالي</p>
                        <p className="text-xs text-gray-500">معتمد</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Floating Badge 2 - Bottom Right */}
            <motion.div
                initial={{ opacity: 0, x: 50, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2, type: "spring" }}
                className="absolute bottom-4 sm:bottom-10 right-2 sm:right-10 lg:-right-5 z-20"
            >
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                    className="bg-white/90 backdrop-blur-md shadow-xl border border-white rounded-2xl p-3 sm:p-4 flex items-center gap-4"
                >
                    <div className="bg-secondary p-3 rounded-xl text-white shadow-lg shadow-secondary/30">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm sm:text-base font-bold text-gray-800 leading-none mb-1">% هذا الشهر</p>
                        <p className="text-xs text-gray-500">نسبة النمو</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};
