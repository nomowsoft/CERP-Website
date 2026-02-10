import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Upload } from "lucide-react";
import { SubscriptionFormData } from "@/utils/subscription";
import { useTranslations } from "next-intl";

interface AssociationDataStepProps {
  data: SubscriptionFormData;
  onChange: (data: Partial<SubscriptionFormData>) => void;
}

const Step2 = ({ data, onChange }: AssociationDataStepProps) => {
  const t = useTranslations('subscription.associationData');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({ licenseFile: file });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-doto mb-6">
        {t('title')}
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="charityRegisterNo" className="flex items-center gap-2 font-doto2">
            <Building2 className="w-5 h-5" />
            {t('associationNumberLabel')}
          </Label>
          <Input
            id="charityRegisterNo"
            value={data.charityRegisterNo}
            onChange={(e) => onChange({ charityRegisterNo: e.target.value })}
            placeholder={t('associationNumberPlaceholder')}
            className="text-right border border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseFile" className="flex items-center gap-2 font-doto2">
            <Upload className="w-5 h-5" />
            {t('licenseFileLabel')}
          </Label>
          <div className="relative w-full">
            {/* Native file input */}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
            />

            <div className="flex items-center justify-center gap-2 border border-dashed bg-gray-100 border-gray-300 rounded-md py-10 text-gray-500 pointer-events-none">
              <Upload className="w-5 h-5" />
              <span className="text-sm font-doto2">{t('licenseFilePlaceholder')}</span>
            </div>

            {data.licenseFile && (
              <p className="text-sm text-muted-foreground mt-2">
                {t('fileSelected')} {data.licenseFile.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2;
