"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getPackages } from '@/app/store/slices/packagesSlice';

export default function Footer() {
    const t = useTranslations('footer');
    const pathname = usePathname();
    const locale = useLocale();
    const dispatch = useDispatch<any>();
    const packages = useSelector((state: any) => state.packages.packages);

    useEffect(() => {
        if (!packages || packages.length === 0) {
            dispatch(getPackages());
        }
    }, [dispatch, packages]);

    return (
        <footer className={`bg-gray-100 py-10 border-t border-primary/2 ${pathname.includes('/admin') ? 'hidden' : ''}`}>
            <section className="mx-auto container ">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Logo & Description */}
                    <div className="">
                        <div className="relative">
                            <div className="absolute -top-30 right-10 w-40 h-40 sm:w-60 sm:h-60 md:w-60 md:h-50 bg-primary/20 rounded-full blur-3xl animate-float" />
                            <Link href="/" className="flex justify-center md:justify-start">
                                <Image height={50} width={180} src="/cerp-logo.png" alt="CERP Logo" className="object-contain" />
                            </Link>
                        </div>
                        <p className="text-gray-500">{t('tagline')}</p>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center">
                        <h4 className="font-bold font-doto2 text-xl mb-4">{t('quickLinks')}</h4>
                        <hr className="w-10 border border-primary/50 ms-8 animate-pulse" />
                        <ul className="space-y-2">
                            <li>
                                <Link href={`/${locale}`} className="text-gray-500 hover:text-primary transition-colors text-sm">
                                    {t('home')}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/backages_service`} className="text-gray-500 hover:text-primary transition-colors text-sm">
                                    {t('systems')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Solutions */}
                    <div className="text-center">
                        <h4 className="font-bold text-xl font-doto2 mb-4">{t('solutions')}</h4>
                        <hr className="w-10 border border-primary/50 ms-8 animate-pulse" />
                        <ul className="space-y-2">
                            {packages && packages.length > 0 ? (
                                packages.map((pkg: any) => (
                                    <li key={pkg.id}>
                                        <Link href={`/${locale}/backages_service?packageId=${pkg.id}`} className="text-gray-500 hover:text-primary transition-colors text-sm">
                                            {locale === 'ar' ? pkg.name_ar : pkg.name_en}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li>
                                        <Link href={`/${locale}/backages_service`} className="text-gray-500 hover:text-primary transition-colors text-sm">
                                            {locale === 'ar' ? 'باقة الأنطلاقة' : 'Starter Package'}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={`/${locale}/backages_service`} className="text-gray-500 hover:text-primary transition-colors text-sm">
                                            {locale === 'ar' ? 'باقة الترقية' : 'Upgrade Package'}
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="text-center">
                        <h4 className="font-bold text-xl font-doto2 mb-4">{t('contactUs')}</h4>
                        <hr className="w-10 border border-primary/50 ms-8" />
                        <ul className="space-y-2">
                            <li className="text-gray-500 text-sm" dir="ltr">info.cerp@masa.sa</li>
                            <li className="text-gray-500 text-sm" dir="ltr">+966 53 780 2802</li>
                            <li className="text-gray-500 text-sm">{t('riyadhAddress')}</li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-primary/30 border-border/50 pt-6">
                    <p className="text-center text-gray-500 text-sm">
                        {t('copyright')}
                    </p>
                </div>
            </section>

        </footer>
    )
}
