
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
    const [userCount, activeSubCount, pendingRequestCount, totalPackageCount] = await Promise.all([
        prisma.user.count(),
        prisma.subscription.count({
            where: { status: 'DONE' }
        }),
        prisma.subscriptionRequest.count({
            where: { status: 'PENDING' }
        }),
        prisma.package.count()
    ]);

    return [
        { id: 1, name: activeSubCount, title: t('stats.activeSubscriptions'), img: '/admin/supscription.svg', value: t('stats.activeUntil') },
        { id: 2, name: userCount, title: t('stats.totalUsers'), img: '/admin/invoice.svg', value: t('stats.totalRegistered') },
        { id: 3, name: pendingRequestCount, title: t('stats.pendingRequests'), img: '/admin/payment.svg', value: t('stats.requiresAction') },
        { id: 4, name: totalPackageCount, title: t('stats.availablePackages'), img: '/admin/payment.svg', value: t('stats.totalPackages') },
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
