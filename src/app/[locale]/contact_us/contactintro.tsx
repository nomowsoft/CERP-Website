import { MapPin, Phone, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

interface ContactItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
}

const ContactItem = ({ icon, label, value, subValue }: ContactItemProps) => (
    <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-primary mb-1">{label}</p>
            <p>{value}</p>
            {subValue && <p className="text-primary text-sm">{subValue}</p>}
        </div>
    </div>
);

const ContactInfo = () => {
    const t = useTranslations('contact.intro');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    <span className="text-foreground">{t('titlePart1')} </span>
                    <span className="bg-gradient-to-l from-primary to-primary/50 bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">{t('titlePart2')}</span>
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                    {t('description')}
                </p>
            </div>

            <div className="space-y-6">
                <ContactItem
                    icon={<MapPin className="w-5 h-5 text-info" />}
                    label={t('locationLabel')}
                    value={t('locationValue')}
                    subValue={t('locationSub')}
                />

                <ContactItem
                    icon={<Phone className="w-5 h-5 text-info" />}
                    label={t('phoneLabel')}
                    value="+966 53 780 2802"
                />

                <ContactItem
                    icon={<Mail className="w-5 h-5 text-info" />}
                    label={t('emailLabel')}
                    value="info.cerp@masa.sa"
                />
            </div>
        </div>
    );
};

export default ContactInfo;
