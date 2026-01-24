import Image from "next/image";
import prisma from "@/utils/db";
import { Input } from "@/components/ui/input";

export default async function Invoice() {
    const subscription = await prisma.subscription.findMany({

    })
    return (
        <section className="container mx-auto p-4">
            <div className="mb-10">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Image
                            src="/admin/SVG1.svg"
                            alt="Invoice Icon"
                            width={32}
                            height={32}
                        />
                    </div>
                    <h2 className="text-5xl font-doto2">
                        الفواتير
                    </h2>
                </div>
                <div>
                    <p className="text-xl text-gray-500">
                        عرض وإدارة جميع فواتيرك
                    </p>

                </div>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
                <div className="flex justify-between items-center gap-8">
                    <div className="relative w-full">
                        <Input type="serch" className="border border-gray-300 py-6 rounded-xl px-20" placeholder="البحث في الفواتير" />
                        <p className="absolute top-3.5 right-5">icon</p> 
                    </div>
                    <div className="relative w-full">
                        <Input type="serch" className="border border-gray-300 py-6 rounded-xl px-20" placeholder="البحث في الفواتير" />
                        <p className="absolute top-3.5 right-5">icon</p> 
                    </div>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-6">
                <div className="mb-20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Image
                                src="/admin/SVG1.svg"
                                alt="Invoice Icon"
                                width={32}
                                height={32}
                            />
                        </div>
                        <h2 className="text-2xl font-bold">
                            الفواتير الأخيرة
                        </h2>
                    </div>
                    <div>
                        <button className="hover:bg-primary border border-primary text-primary hover:text-white px-4 py-2 rounded-xl transition-colors">عرض جميع الفواتير</button>
                    </div>
                </div>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b border-gray-400 text-center text-gray-500">رقم الفاتورة</th>
                            <th className="py-2 px-4 border-b border-gray-400 text-center text-gray-500">التاريخ</th>
                            <th className="py-2 px-4 border-b border-gray-400 text-center text-gray-500">المبلغ</th>
                            <th className="py-2 px-4 border-b border-gray-400 text-center text-gray-500">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-6 px-4 border-b border-gray-300 text-center">INV-001</td>
                            <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">2024-01-15</td>
                            <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">$150.00</td>
                            <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">
                                <span className="border border-blue-600 text-blue-600 px-2 py-1 rounded-full text-sm bg-blue-50">
                                    انتظار الدفع
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-6 px-4 border-b border-gray-300 text-center">INV-002</td>
                            <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">2024-02-10</td>
                            <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">$200.00</td>
                            <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">
                                <span className="border border-red-600 text-red-600 px-2 py-1 rounded-full text-sm bg-red-50">
                                    معلقة
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-6 px-4 border-b border-gray-300 text-center">INV-003</td>
                            <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">2024-03-05</td>
                            <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">$250.00</td>
                            <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">
                                <span className="border border-green-600 text-green-600 px-2 py-1 rounded-full text-sm bg-green-50">
                                    مدفوعه
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </section>
    );
}
