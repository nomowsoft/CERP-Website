"use client";
import Image from 'next/image'
import { program } from '@/utils/data';
import { useTranslations } from 'next-intl';

const Program = () => {
    const t = useTranslations();
    return (
        <section className="md:bg-hero bg-cover bg-no-repeat py-20 lg:py-40">
            <div className="max-w-screen-xl mx-5 md:mx-auto">
                <h1 className="text-center text-success pb-20 text-2xl lg:text-3xl xl:text-5xl" data-aos="zoom-in">
                    {t('programsMeta.heading')}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-5">
                    {program.map((item) => (
                        <div className="bg-white rounded-lg px-4 py-2 text-center h-34" key={item.id} data-aos="zoom-in">
                            <div className="flex justify-center items-center">
                                <Image src={item.image} alt="..." width={60} height={20} />
                            </div>
                            <h1 className="mt-3">
                                {t(item.titleKey)}
                            </h1>
                        </div>
                    ))
                    }
                </div>
            </div>
        </section>
    )
}

export default Program