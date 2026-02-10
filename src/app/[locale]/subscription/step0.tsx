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
}

const Step0 = ({ data, onChange, services, onSkip }: ServicesSelectionStepProps) => {
    const t = useTranslations('subscription.servicesSelection');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const toggleService = (serviceId: number) => {
        const currentServices = data.selectedServices || [];
        const isSelected = currentServices.includes(serviceId);

        const newServices = isSelected
            ? currentServices.filter(id => id !== serviceId)
            : [...currentServices, serviceId];

        onChange({ selectedServices: newServices });
    };

    const isServiceSelected = (serviceId: number) => {
        return (data.selectedServices || []).includes(serviceId);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-doto2 mb-2">
                    {isAr ? "الخدمات الإضافية" : "Additional Services"}
                </h2>
                <p className="text-gray-500">
                    {isAr ? "اختر الخدمات الإضافية التي تحتاجها (اختياري)" : "Select additional services you need (optional)"}
                </p>
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
