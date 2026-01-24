
import {
    Globe,
    FileText,
    Menu as MenuIcon,
    PlusSquare
} from 'lucide-react';
import prisma from '@/utils/db';
import { getTranslations } from 'next-intl/server';
import { title } from 'process';
import Image from 'next/image';

async function getStats(t: any) {
    const [UserCount] = await Promise.all([
        prisma.user.count(),

    ]);

    return [
        { id: 1, name: t('stats.activeSubscriptions'), title: t('stats.basicPlan'), img: '/admin/supscription.svg', value: t('stats.activeUntil') },
        { id: 2, name: UserCount, title: t('stats.totalInvoices'), img: '/admin/invoice.svg', value: t('stats.paidPending', { paid: 4, pending: 1 }) },
        { id: 3, name: t('stats.currency'), title: t('stats.nextPayment'), img: '/admin/payment.svg', value: '15 مارس 2024' },
        { id: 4, name: t('stats.activeSubscriptions'), title: t('stats.basicPlan'), img: '/admin/payment.svg', value: UserCount },
    ];
}
export async function KpiCard() {
    const t = await getTranslations('dashboard');
    const stats = await getStats(t);
    return (
        <section className="space-y-8 container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center p-4">
                                <Image src={stat.img} alt={stat.title} width={100} height={50} />
                            </div>
                            {/* <div className="text-3xl font-bold text-slate-900">{stat.value}</div> */}
                            <div className="ml-4">
                                <p className="text-sm text-gray-500 mb-4">
                                    {stat.title}
                                </p>
                                <h1 className="font-doto text-xl mb-2">
                                    {stat.name}
                                </h1>
                                <span className="text-sm text-gray-500">{stat.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
