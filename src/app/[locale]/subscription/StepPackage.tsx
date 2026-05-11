
import { useTranslations, useLocale } from "next-intl";
import { PackageDTO } from "@/utils/types";
import Image from "next/image";
import { Check, Package } from "lucide-react";
import { isValidImage } from "@/utils/imageUtils";

interface StepPackageProps {
    packages: PackageDTO[];
    selectedPackageId?: number;
    onSelect: (pkgId: number) => void;
}

const StepPackage = ({ packages, selectedPackageId, onSelect }: StepPackageProps) => {
    const t = useTranslations("programs");
    const locale = useLocale();
    const isAr = locale === 'ar';

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-doto2 mb-2">
                    {isAr ? "اختيار الباقة" : "Select Package"}
                </h2>
                <p className="text-gray-500 mb-6">
                    {isAr ? "اختر الباقة المناسبة لاحتياجاتك" : "Choose the right package for your needs"}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                        <div
                            key={pkg.id}
                            onClick={() => onSelect(pkg.id)}
                            className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${isSelected
                                ? 'border-primary bg-primary/5 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-primary/50'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div>
                                <div className="flex justify-center mb-4 w-20 h-20 mx-auto">
                                    {isValidImage(pkg.image) ? (
                                        <Image src={pkg.image} alt={pkg.name} width={80} height={80} className="object-contain" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center">
                                            <Package className="w-12 h-12 text-primary/20" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold font-doto2 text-center mb-1">
                                    {isAr ? pkg.name_ar || pkg.name : pkg.name_en || pkg.name}
                                </h3>
                                <div className="text-center text-sm text-gray-500 mb-4">{pkg.type}</div>

                                <div className="flex justify-center items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-black text-primary">
                                        {Number(pkg.price)}
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">
                                        {pkg.currency || (isAr ? 'ر.س' : 'SAR')}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-500 text-center line-clamp-3 mb-6">
                                    {isAr ? pkg.description_ar || pkg.description : pkg.description_en || pkg.description}
                                </p>
                            </div>

                            <ul className="space-y-2 border-t border-gray-100 pt-4">
                                {(pkg.features as any)?.slice(0, 3).map((feature: any) => (
                                    <li key={feature.id} className="flex items-center gap-2 text-xs text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                        {isAr ? feature.text_ar || feature.text : feature.text_en || feature.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepPackage;
