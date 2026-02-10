"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const t = useTranslations('footer');
    const pathname = usePathname();
    return (
        <footer className={`bg-gray-100 pt-20 pb-10 border-t border-primary/2 ${pathname.includes('/admin') ? 'hidden' : ''}`}>
            <section className="mx-auto container ">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Logo & Description */}
                    <div className="">
                        <div className="relative">
                            <div className="absolute -top-30 right-10 w-40 h-40 sm:w-60 sm:h-60 md:w-60 md:h-50 bg-primary/20 rounded-full blur-3xl animate-float" />
                            <Link href="/" className="flex">
                                <Image height={20} width={250} src="/footer/CERP.svg" alt="Flowbite Logo" />
                            </Link>
                        </div>
                        <p className="text-center text-gray-500">{t('tagline')}</p>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center">
                        <h4 className="font-bold font-doto2 text-xl mb-4">{t('quickLinks')}</h4>
                        <hr className="w-10 border border-primary/50 ms-8" />
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm">
                                    {t('home')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm">
                                    {t('features')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm">
                                    {t('systems')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm">
                                    {t('solutions')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Solutions */}
                    <div className="text-center">
                        <h4 className="font-bold text-xl font-doto2 mb-4">{t('solutions')}</h4>
                        <hr className="w-10 border border-primary/50 ms-8" />
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm">
                                    {t('healthAssociations')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm">
                                    {t('quranAssociations')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm">
                                    {t('coreSystems')}
                                </a>
                            </li>
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
