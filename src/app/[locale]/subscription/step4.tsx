import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building, Upload, User, Calendar, Lock } from "lucide-react";
import { SubscriptionFormData } from "@/utils/subscription";
import { useTranslations } from "next-intl";

interface PaymentStepProps {
  data: SubscriptionFormData;
  onChange: (data: Partial<SubscriptionFormData>) => void;
}

const Step4 = ({ data, onChange }: PaymentStepProps) => {
  const t = useTranslations('subscription.payment');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({ bankReceiptFile: file });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-doto2 mb-6">
        {t('title')}
      </h2>

      {/* Payment Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Electronic Payment */}
        <div
          onClick={() => onChange({ paymentMethod: 'ONLINE' })}
          className={`p-10 rounded-3xl border-2 cursor-pointer transition-all ${data.paymentMethod === 'ONLINE'
              ? 'border-secondary bg-secondary/5 shadow-md'
              : 'border-primary hover:border-primary/50'
            }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${data.paymentMethod === 'ONLINE' ? 'bg-accent' : 'bg-muted'
              }`}>
              <div className={`h-15 w-15 flex justify-center items-center rounded-2xl ${data.paymentMethod === 'ONLINE' ? 'bg-secondary' : 'bg-primary'}`}>
                <CreditCard className={`w-7 h-7 ${data.paymentMethod === 'ONLINE' ? 'text-info' : 'text-info'
                  }`} />
              </div>
            </div>
            <h3 className="font-doto">{t('electronicPayment')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('electronicPaymentDesc')}
            </p>
          </div>
        </div>

        {/* Bank Transfer */}
        <div
          onClick={() => onChange({ paymentMethod: 'BANK' })}
          className={`p-10 rounded-3xl border-2 cursor-pointer transition-all ${data.paymentMethod === 'BANK'
              ? 'border-secondary bg-secondary/5 shadow-md'
              : 'border-primary hover:border-primary/50'
            }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${data.paymentMethod === 'BANK' ? 'bg-accent' : 'bg-muted'
              }`}>
              <div className={`h-15 w-15 flex justify-center items-center rounded-2xl ${data.paymentMethod === 'BANK' ? 'bg-secondary' : 'bg-primary'}`}>
                <Building className={`w-7 h-7 ${data.paymentMethod === 'BANK' ? 'text-info' : 'text-info'
                  }`} />
              </div>
            </div>
            <h3 className="font-doto2">{t('bankTransfer')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('bankTransferDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      {data.paymentMethod === 'ONLINE' ? (
        <div className="space-y-4 mt-6 p-6 bg-muted/30 rounded-xl">
          <h3 className="font-doto2 text-xl mb-4">{t('cardDetailsTitle')}</h3>

          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="flex items-center font-doto2 gap-2">
              <CreditCard className="w-5 h-5" />
              {t('cardNumberLabel')}
            </Label>
            <Input
              id="cardNumber"
              value={data.cardNumber}
              onChange={(e) => onChange({ cardNumber: e.target.value })}
              placeholder="1234 5678 9012 3456"
              className="text-left border border-gray-300"
              dir="ltr"
              maxLength={19}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardHolder" className="flex items-center font-doto2 gap-2">
              <User className="w-5 h-5" />
              {t('cardHolderLabel')}
            </Label>
            <Input
              id="cardHolder"
              value={data.cardHolder}
              onChange={(e) => onChange({ cardHolder: e.target.value })}
              placeholder={t('cardHolderPlaceholder')}
              className="text-left border border-gray-300"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="flex items-center font-doto2 gap-2">
                <Calendar className="w-5 h-5" />
                {t('expiryDateLabel')}
              </Label>
              <Input
                id="expiryDate"
                value={data.expiryDate}
                onChange={(e) => onChange({ expiryDate: e.target.value })}
                placeholder="MM/YY"
                className="text-left border border-gray-300"
                dir="ltr"
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv" className="flex items-center font-doto2 gap-2">
                <Lock className="w-5 h-5" />
                CVV
              </Label>
              <Input
                id="cvv"
                type="password"
                value={data.cvv}
                onChange={(e) => onChange({ cvv: e.target.value })}
                placeholder="123"
                className="text-left border border-gray-300"
                dir="ltr"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mt-6 p-6 bg-muted/30 rounded-xl">
          <h3 className="font-doto2 text-xl mb-4">{t('uploadBankReceiptTitle')}</h3>

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
              <span className="text-sm font-doto2">{t('uploadReceiptPlaceholder')}</span>
            </div>

            {data.bankReceiptFile && (
              <p className="text-sm text-muted-foreground mt-2">
                {data.bankReceiptFile.name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4;
