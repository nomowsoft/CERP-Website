"use client";
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import type { AppDispatch } from '@/app/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getPackages } from '@/app/store/slices/packagesSlice';
import { useEffect } from 'react';
import { PackageDTO, PackageFeturesDto } from '@/utils/types';
import { useLocale } from 'next-intl';


export const Backages = () => {
    const locale = useLocale();
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(getPackages());
    }, [dispatch]);

    const Packeges = useSelector((state: any) => state.packages.packages);
    return (
        <section className="container md:mx-auto">
            <div className="text-center my-10">
                <h1 className="text-4xl font-doto2">الباقات</h1>
                <p className="text-xl text-gray-500 mt-2">اختر الباقة التي تناسب حجم مؤسستك واحتياجاتك</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:mx-0 mx-10">
                {Packeges.map((packege: PackageDTO) => (
                    <div key={packege.id} className="shadow-xl rounded-4xl text-center flex flex-col justify-between transition-all duration-300 hover:scale-105 animate-slide-up hover:bg-secondary/10 hover:border hover:border-secondary">
                        <div className="py-10">
                            <div className="flex justify-center items-center">
                                <Image src={packege.image} alt="" width={120} height={10} />
                            </div>
                            <h1 className="font-doto2 text-2xl mt-5">{packege.name}</h1>
                            <span className="text-lg text-gray-500">{packege.type}</span>
                            <p className="py-4 text-xl text-gray-500">{packege.description}</p>
                            <a className="text-primary text-xl">تواصل معنا</a>
                            <ul className="text-start px-10 mt-10">
                                {packege.features?.map((feature: PackageFeturesDto) => (
                                    <li key={feature.id}>
                                        <div className="flex items-center">
                                            <div className="flex items-center">
                                                <Image src="/backage_service/Vector.svg" alt="" width={20} height={20} />
                                            </div>
                                            <p className="text-lg text-gray-500 ps-2">{feature.text}</p>
                                        </div>
                                        <hr className="text-gray-300 my-3" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="px-5 w-full">
                            <a href={`/${locale}/subscription`} className="bg-info my-5 flex justify-center mx- w-full border border-gray-200 rounded-2xl py-3 hover:text-info  hover:bg-primary text-xl font-doto2">
                                <span>اشترك الأن</span>
                                <ArrowLeft />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
