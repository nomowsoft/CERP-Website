import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React from 'react'

export const Invoicing = () => {
    const t = useTranslations('dashboard.invoices');
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
                            {t('latestInvoices')}
                        </h2>
                    </div>
                    <div>
                        <button className="hover:bg-primary border border-primary text-primary hover:text-white px-4 py-2 rounded-xl transition-colors">{t('viewAll')}</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b border-gray-400 text-center text-gray-500">{t('invoiceNumber')}</th>
                                <th className="py-2 px-4 border-b border-gray-400 text-center text-gray-500">{t('date')}</th>
                                <th className="py-2 px-4 border-b border-gray-400 text-center text-gray-500">{t('amount')}</th>
                                <th className="py-2 px-4 border-b border-gray-400 text-center text-gray-500">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-6 px-4 border-b border-gray-300 text-center">INV-001</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">2024-01-15</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">$150.00</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">
                                    <span className="border border-blue-600 text-blue-600 px-2 py-1 rounded-full text-sm bg-blue-50">
                                        {t('pending')}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-6 px-4 border-b border-gray-300 text-center">INV-002</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">2024-02-10</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">$200.00</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">
                                    <span className="border border-red-600 text-red-600 px-2 py-1 rounded-full text-sm bg-red-50">
                                        {t('suspended')}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-6 px-4 border-b border-gray-300 text-center">INV-003</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">2024-03-05</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">$250.00</td>
                                <td className="py-6 px-4 border-b border-gray-300 text-center text-gray-500">
                                    <span className="border border-green-600 text-green-600 px-2 py-1 rounded-full text-sm bg-green-50">
                                        {t('paid')}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </section>
    )
}
