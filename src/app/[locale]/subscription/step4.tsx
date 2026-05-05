import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { SubscriptionFormData } from "@/utils/subscription";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PaymentStepProps {
  data: SubscriptionFormData;
  onChange: (data: Partial<SubscriptionFormData>) => void;
}

const Step4 = ({ data, onChange }: PaymentStepProps) => {
  const t = useTranslations('subscription.payment');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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

      {/* Terms and Conditions */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center h-5">
            <input
              type="checkbox"
              checked={data.acceptTerms}
              onChange={(e) => onChange({ acceptTerms: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary cursor-pointer transition-all"
            />
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              {isAr ? "أوافق على " : "I agree to the "}
            </span>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
              className="font-bold text-primary hover:underline bg-transparent border-none p-0 inline mx-1"
            >
              {isAr ? "الشروط والأحكام" : "Terms and Conditions"}
            </button>
            <span className="font-medium text-gray-900 mx-1">
              {isAr ? " و" : " and "}
            </span>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
              className="font-bold text-primary hover:underline bg-transparent border-none p-0 inline"
            >
              {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
            </button>
          </div>
        </label>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showTerms || showPrivacy) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => { setShowTerms(false); setShowPrivacy(false); }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-8 z-10 max-h-[80vh] overflow-y-auto"
            >
              <button 
                onClick={() => { setShowTerms(false); setShowPrivacy(false); }}
                className="absolute top-6 left-6 p-2 text-gray-400 hover:text-red-500 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-black mb-6">
                {showTerms ? (isAr ? "الشروط والأحكام" : "Terms and Conditions") : (isAr ? "سياسة الخصوصية" : "Privacy Policy")}
              </h3>
              
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-4">
                {showTerms ? (
                  isAr ? (
                    <>
                      <p>مرحباً بكم في منصة CERP. باستخدامكم لخدماتنا، فإنكم توافقون على الالتزام بالشروط التالية:</p>
                      <ul className="list-disc pr-5 space-y-2">
                        <li><strong>الاشتراكات:</strong> يتم تجديد الاشتراك تلقائياً ما لم يتم الإلغاء قبل موعد التجديد بـ 48 ساعة.</li>
                        <li><strong>الاستخدام العادل:</strong> يمنع استخدام الأنظمة في أغراض غير قانونية أو تضر بالمنصة.</li>
                        <li><strong>الدعم الفني:</strong> نلتزم بتوفير دعم فني خلال ساعات العمل الرسمية لكافة المشتركين.</li>
                        <li><strong>إلغاء الخدمة:</strong> يحق للمنصة إيقاف الخدمة في حال مخالفة أي من هذه الشروط.</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p>Welcome to CERP platform. By using our services, you agree to comply with the following terms:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Subscriptions:</strong> Subscriptions renew automatically unless cancelled 48 hours before the renewal date.</li>
                        <li><strong>Fair Use:</strong> Systems must not be used for illegal purposes or activities that harm the platform.</li>
                        <li><strong>Technical Support:</strong> We commit to providing technical support during official working hours for all subscribers.</li>
                        <li><strong>Termination:</strong> We reserve the right to suspend the service if any of these terms are violated.</li>
                      </ul>
                    </>
                  )
                ) : (
                  isAr ? (
                    <>
                      <p>نحن في CERP نولي أهمية قصوى لخصوصية بياناتكم:</p>
                      <ul className="list-disc pr-5 space-y-2">
                        <li><strong>جمع البيانات:</strong> نقوم بجمع البيانات الضرورية فقط لتقديم الخدمة وإتمام عمليات الدفع.</li>
                        <li><strong>أمن البيانات:</strong> نستخدم تقنيات تشفير متقدمة لحماية بياناتكم من الوصول غير المصرح به.</li>
                        <li><strong>مشاركة البيانات:</strong> لا نقوم ببيع أو مشاركة بياناتكم مع أي أطراف ثالثة لأغراض تسويقية.</li>
                        <li><strong>حقوق المستخدم:</strong> يحق لكم طلب تعديل أو حذف بياناتكم الشخصية في أي وقت.</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p>At CERP, we prioritize your data privacy:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Data Collection:</strong> We only collect data necessary to provide the service and complete payments.</li>
                        <li><strong>Data Security:</strong> We use advanced encryption technologies to protect your data from unauthorized access.</li>
                        <li><strong>Data Sharing:</strong> We do not sell or share your data with any third parties for marketing purposes.</li>
                        <li><strong>User Rights:</strong> You have the right to request modification or deletion of your personal data at any time.</li>
                      </ul>
                    </>
                  )
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button onClick={() => { setShowTerms(false); setShowPrivacy(false); }} className="px-8 py-4 rounded-xl bg-primary text-white font-bold">
                  {isAr ? "فهمت ذلك" : "Got it"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Step4;
