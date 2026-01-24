import Image from "next/image";
import { SubscriptionDTO } from "@/utils/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";

export default async function Subscription() {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get("jwtToken")?.value;

    if(!jwtToken) redirect("/");

    const DOMAIN = process.env.NEXT_PUBLIC_API_URL;
    const response = await axios.get(`${DOMAIN}/api/subscription`, {
        headers: {
            Cookie: `jwtToken=${jwtToken}`
        }
    });
    const subscription = response.data
    return (
        <section className="container mx-auto p-4">
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
                        {subscription.map((item: SubscriptionDTO) => (
                            <tr key={item.id}>
                                <td className="py-6 px-4 border-b border-gray-300 text-center">INV-001</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">2024-01-15</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">$150.00</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">
                                    <span className="border border-blue-600 text-blue-600 px-2 py-1 rounded-full text-sm bg-blue-50">
                                        انتظار الدفع
                                    </span>
                                </td>
                            </tr>
                        ))} 
                    </tbody>
                </table>

            </div>
        </section>
    );
}
