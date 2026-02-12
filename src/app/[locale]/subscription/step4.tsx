import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { SubscriptionFormData } from "@/utils/subscription";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface PaymentStepProps {
  data: SubscriptionFormData;
  onChange: (data: Partial<SubscriptionFormData>) => void;
}

const Step4 = ({ data, onChange }: PaymentStepProps) => {
  const t = useTranslations('subscription.payment');
  const locale = useLocale();
  const isAr = locale === 'ar';

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
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${data.paymentMethod === 'ONLINE' ? 'bg-secondary' : 'bg-primary'}`}>
              <CreditCard className="w-7 h-7 text-info" />
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
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${data.paymentMethod === 'BANK' ? 'bg-secondary' : 'bg-primary'}`}>
              <Building className="w-7 h-7 text-info" />
            </div>
            <h3 className="font-doto2">{t('bankTransfer')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('bankTransferDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Form Instruction */}
      {data.paymentMethod === 'ONLINE' ? (
        <div className="space-y-4 mt-6 p-8 bg-blue-50/50 border border-blue-100/50 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-3 text-blue-700">
            <AlertCircle className="w-6 h-6" />
            <h3 className="font-bold text-lg">{isAr ? "الدفع الإلكتروني الآمن" : "Secure Electronic Payment"}</h3>
          </div>
          <p className="text-blue-600 font-medium leading-relaxed">
            {isAr
              ? "سيتم تفعيل الدفع الإلكتروني عبر بوابة HyperPay بعد تأكيد طلبك في الخطوة التالية. سيظهر لك نموذج الدفع الآمن مباشرةً."
              : "Secure payment via HyperPay will be activated after confirming your order in the next step. The secure payment form will appear directly."}
          </p>
          <div className="flex flex-wrap gap-2 mt-2 opacity-60">
            <span className="bg-white px-3 py-1 rounded-md text-[10px] font-bold border border-blue-100">MADA</span>
            <span className="bg-white px-3 py-1 rounded-md text-[10px] font-bold border border-blue-100">VISA</span>
            <span className="bg-white px-3 py-1 rounded-md text-[10px] font-bold border border-blue-100">MASTER</span>
            <span className="bg-white px-3 py-1 rounded-md text-[10px] font-bold border border-blue-100">APPLE PAY</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mt-6 p-6 bg-muted/30 rounded-xl">
          <h3 className="font-doto2 text-xl mb-4">{t('uploadBankReceiptTitle')}</h3>
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mb-4">
            <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{isAr ? "بيانات التحويل" : "Transfer Details"}</p>
            <p className="font-black text-gray-800">الراجحي: SA12 3400 0001 2345 6789 0123</p>
          </div>
          <div className="relative w-full">
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
              <p className="text-sm text-green-600 font-bold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {data.bankReceiptFile.name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4;
