import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Link } from "lucide-react";
import { SubscriptionFormData } from "@/utils/subscription";
import { useTranslations } from "next-intl";

interface DomainSelectionStepProps {
  data: SubscriptionFormData;
  onChange: (data: Partial<SubscriptionFormData>) => void;
}

const Step3 = ({ data, onChange }: DomainSelectionStepProps) => {
  const t = useTranslations('subscription.domainSelection');
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-doto2 mb-6">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subdomain Option */}
        <div
          onClick={() => onChange({ domainType: 'subdomain' })}
          className={`p-10 rounded-3xl border-2 cursor-pointer transition-all ${data.domainType === 'subdomain'
              ? 'border-secondary bg-secondary/5 shadow-md'
              : 'border-primary hover:border-primary/50'
            }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${data.domainType === 'subdomain' ? 'bg-accent' : 'bg-muted'
              }`}>
              <div className={`h-15 w-15 flex justify-center items-center rounded-2xl ${data.domainType === 'subdomain' ? 'bg-secondary' : 'bg-primary'}`}>
                <Globe className={`w-7 h-7 text-info ${data.domainType === 'subdomain' ? 'text-accent-foreground' : 'text-muted-foreground'
                  }`} />
              </div>
            </div>
            <h3 className="font-doto">{t('subdomainOption')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              yourname.cerp.com
            </p>
          </div>
        </div>

        {/* Custom Domain Option */}
        <div
          onClick={() => onChange({ domainType: 'custom' })}
          className={`p-10 rounded-3xl border-2 cursor-pointer transition-all ${data.domainType === 'custom'
              ? 'border-secondary bg-secondary/5 shadow-md'
              : 'border-primary hover:border-primary/50'
            }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${data.domainType === 'custom' ? 'bg-accent' : 'bg-muted'
              }`}>
              <div className={`h-15 w-15 flex justify-center items-center rounded-2xl ${data.domainType === 'custom' ? 'bg-secondary' : 'bg-primary'}`}>
                <Link className={`w-7 h-7 ${data.domainType === 'custom' ? 'text-info' : 'text-info'
                  }`} />
              </div>
            </div>
            <h3 className="font-doto">{t('customDomainOption')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              www.example.com
            </p>
          </div>
        </div>
      </div>

      {/* Domain Input */}
      <div className="space-y-2 mt-6">
        {data.domainType === 'subdomain' ? (
          <div className="space-y-2">
            <Label htmlFor="subdomain" className="font-doto2">{t('subdomainLabel')}</Label>
            <div className="flex items-center gap-2" dir="ltr">
              <span className="text-muted-foreground">.cerp.com</span>
              <Input
                id="subdomain"
                value={data.subdomain}
                onChange={(e) => onChange({ subdomain: e.target.value })}
                placeholder="yourname"
                className="text-left flex-1 border border-gray-300"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="customDomain" className="font-doto2">{t('customDomainLabel')}</Label>
            <Input
              id="customDomain"
              value={data.customDomain}
              onChange={(e) => onChange({ customDomain: e.target.value })}
              placeholder="www.example.com"
              className="text-left border border-gray-300"
              dir="ltr"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3;
