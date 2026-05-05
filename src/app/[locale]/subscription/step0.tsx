import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { SubscriptionFormData } from "@/utils/subscription";
import { ServiceDTO } from "@/utils/types";
import { Check } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ServicesSelectionStepProps {
    data: SubscriptionFormData;
    onChange: (data: Partial<SubscriptionFormData>) => void;
    services: ServiceDTO[];
    onSkip: () => void;
    selectedPackage?: any;
    allSystems: any[];
    mySubscription: any;
}

const Step0 = ({ data, onChange, services, onSkip, selectedPackage, allSystems, mySubscription }: ServicesSelectionStepProps) => {
    const t = useTranslations('subscription.servicesSelection');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const filteredSystems = useMemo(() => {
        if (!allSystems) return [];
        
        // Get IDs of systems that should be hidden
        const hiddenSystemIds = new Set<number>();
        
        // 1. Hide systems already in the selected package (the one being subscribed to)
        if (selectedPackage?.systems) {
            selectedPackage.systems.forEach((s: any) => hiddenSystemIds.add(s.id));
        }

        // 2. Hide systems already in user's current subscription (if upgrading/renewing)
        if (mySubscription) {
            // Systems in the current package
            if (mySubscription.package?.systems) {
                mySubscription.package.systems.forEach((s: any) => hiddenSystemIds.add(s.id));
            }
            // Add-on systems in the current subscription
            if (mySubscription.systems) {
                mySubscription.systems.forEach((s: any) => hiddenSystemIds.add(s.id));
            }
        }

        return allSystems.filter(system => !hiddenSystemIds.has(system.id));
    }, [allSystems, selectedPackage, mySubscription]);

    const toggleService = (serviceId: number) => {
        const currentServices = data.selectedServices || [];
        const isSelected = currentServices.includes(serviceId);

        const newServices = isSelected
            ? currentServices.filter(id => id !== serviceId)
            : [...currentServices, serviceId];

        onChange({ selectedServices: newServices });
    };

    const toggleSystem = (systemId: number) => {
        const currentSystems = data.selectedSystems || [];
        const isSelected = currentSystems.includes(systemId);

        const newSystems = isSelected
            ? currentSystems.filter(id => id !== systemId)
            : [...currentSystems, systemId];

        onChange({ selectedSystems: newSystems });
    };

    const isServiceSelected = (serviceId: number) => {
        return (data.selectedServices || []).includes(serviceId);
    };

    const isSystemSelected = (systemId: number) => {
        return (data.selectedSystems || []).includes(systemId);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-doto2 mb-2">
                    {isAr ? "الخدمات الإضافية" : "Additional Services"}
                </h2>
                <p className="text-gray-500 mb-6">
                    {isAr ? "اختر الخدمات الإضافية التي تحتاجها (اختياري)" : "Select additional services you need (optional)"}
                </p>

                {selectedPackage && (
                    <div className="mb-8 inline-flex items-center gap-6 bg-primary/5 border border-primary/20 px-8 py-4 rounded-[2rem] shadow-sm">
                        <div className="flex flex-col items-center border-e border-primary/20 pe-6">
                            <span className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">{isAr ? "الباقة المختارة" : "Selected Package"}</span>
                            <span className="text-xl font-black text-gray-800">{isAr ? selectedPackage.name_ar : selectedPackage.name_en}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">{isAr ? "السعر" : "Price"}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-secondary">{Number(selectedPackage.price)}</span>
                                <span className="text-xs font-bold text-gray-500">{selectedPackage.currency || (isAr ? 'ر.س' : 'SAR')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => {
                    const isSelected = isServiceSelected(service.id);

                    return (
                        <div
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl ${isSelected
                                ? 'border-secondary bg-secondary/5 shadow-lg'
                                : 'border-gray-200 hover:border-primary/50'
                                }`}
                        >
                            {/* Checkmark */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                            )}

                            {/* Service Image */}
                            <div className="mb-4">
                                <Image
                                    src={service.image}
                                    alt={service.name}
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>

                            {/* Service Name */}
                            <h3 className="text-xl font-bold font-doto2 mb-2">
                                {isAr ? service.name_ar || service.name : service.name_en || service.name}
                            </h3>

                            {/* Service Price */}
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-2xl font-bold text-primary">
                                    {Number(service.price)}
                                </span>
                                <span className="text-sm text-gray-500 font-medium">
                                    {service.currency || (isAr ? 'ر.س' : 'SAR')}
                                </span>
                            </div>

                            {/* Service Description */}
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {isAr ? service.description_ar || service.description : service.description_en || service.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Systems Selection */}
            {filteredSystems && filteredSystems.length > 0 && (
                <div className="pt-10 border-t border-gray-100">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold font-doto2 mb-2">
                            {isAr ? "الأنظمة التقنية" : "Technical Systems"}
                        </h2>
                        <p className="text-gray-500">
                            {isAr ? "اختر الأنظمة التقنية الإضافية (اختياري)" : "Select additional technical systems (optional)"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSystems.map((system) => {
                            const isSelected = isSystemSelected(system.id);

                            return (
                                <div
                                    key={system.id}
                                    onClick={() => toggleSystem(system.id)}
                                    className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl ${isSelected
                                        ? 'border-primary bg-primary/5 shadow-lg'
                                        : 'border-gray-200 hover:border-primary/50'
                                        }`}
                                >
                                    {/* Checkmark */}
                                    {isSelected && (
                                        <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                    )}

                                    {/* System Icon */}
                                    <div className="mb-4">
                                        {system.icon && (system.icon.startsWith('http') || system.icon.startsWith('data:image')) ? (
                                            <Image src={system.icon} alt={system.name} width={48} height={48} className="w-12 h-12 object-contain" />
                                        ) : (
                                            <div className="w-12 h-12 flex items-center justify-center text-primary font-bold text-lg bg-white rounded-xl shadow-sm">
                                                {system.name ? system.name.substring(0, 2).toUpperCase() : 'SY'}
                                            </div>
                                        )}
                                    </div>

                                    {/* System Name */}
                                    <h3 className="text-lg font-bold font-doto2 mb-2">
                                        {isAr ? system.name_ar || system.name : system.name_en || system.name}
                                    </h3>

                                    {/* System Price */}
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-xl font-bold text-secondary">
                                            {Number(system.price || 0)}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {isAr ? 'ر.س' : 'SAR'}
                                        </span>
                                    </div>

                                    {/* System Description */}
                                    <p className="text-xs text-gray-400 line-clamp-2">
                                        {isAr ? system.description_ar || system.description : system.description_en || system.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Skip Button */}
            <div className="flex justify-center pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onSkip}
                    className="text-gray-500 hover:text-primary font-bold"
                >
                    {isAr ? "تخطي واستمر بدون خدمات إضافية" : "Skip and continue without additional services"}
                </Button>
            </div>
        </div>
    );
};

export default Step0;
