import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";
import { SubscriptionFormData } from "@/utils/subscription";
import { useTranslations } from "next-intl";

interface PersonalInfoStepProps {
  data: SubscriptionFormData;
  onChange: (data: Partial<SubscriptionFormData>) => void;
}

const PersonalInfoStep = ({ data, onChange }: PersonalInfoStepProps) => {
  const t = useTranslations('subscription.personalInfo');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-doto mb-6">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2 font-doto2">
            <User className="w-5 h-5" />
            {t('fullNameLabel')}
          </Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder={t('fullNamePlaceholder')}
            className="text-right border border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 font-doto2">
            <Mail className="w-5 h-5" />
            {t('emailLabel')}
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="example@email.com"
            className="text-left border border-gray-300"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 font-doto2">
            <Phone className="w-5 h-5" />
            {t('phoneLabel')}
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+966 5XX XXX XXXX"
            className="text-left border border-gray-300"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
