"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { getSubscription, updateSubscription } from "@/app/store/slices/subscriptionSlice";
import { getUser } from "@/app/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "./StepIndicator";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import { SubscriptionFormData, initialFormData } from "@/utils/subscription";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Schemastep1, Schemastep2, Schemastep3Subdomain, Schemastep3customdomain, Schemastep4bank } from "@/utils/validiton";
import { toast } from 'react-toastify';


interface SubscriptionWizardProps {
  onSubmit?: (data: SubscriptionFormData) => Promise<void>;
}

const SubscriptionWizard = ({ onSubmit }: SubscriptionWizardProps) => {
  const router = useRouter();
  const t = useTranslations('subscription');
  const td = useTranslations('dashboard');
  const locale = useLocale();
  const dispatch = useDispatch<AppDispatch>();
  const { subscriptionInfo } = useSelector((state: any) => state.subscription);
  const { userInfo } = useSelector((state: any) => state.user);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    dispatch(getSubscription());
    dispatch(getUser());
  }, [dispatch]);

  // Find the relevant subscription for the current user
  const mySubscription = subscriptionInfo?.find((s: any) => s.userId === userInfo?.id);

  useEffect(() => {
    if (mySubscription && !dataLoaded) {
      const { licenseFile, bankReceiptFile, ...rest } = mySubscription;
      setFormData((prev) => ({
        ...prev,
        ...rest,
      }));
      setDataLoaded(true);
    }
  }, [mySubscription, dataLoaded]);

  const showReturnToDraft = mySubscription?.status === 'DONE' || mySubscription?.status === 'CANCEL';

  const handleReturnToDraft = async () => {
    if (mySubscription) {
      try {
        await dispatch(updateSubscription({
          id: mySubscription.id,
          data: { ...mySubscription, status: 'DRAFT' }
        })).unwrap();
        toast.success(t('messages.successTitle'));
        dispatch(getSubscription());
        setCurrentStep(1);
      } catch (error: any) {
        toast.error(error || t('messages.errorDesc'));
      }
    }
  };

  const steps = [
    { id: 1, label: t('steps.personalInfo') },
    { id: 2, label: t('steps.associationData') },
    { id: 3, label: t('steps.domainSelection') },
    { id: 4, label: t('steps.payment') },
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SubscriptionFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDataChange = (data: Partial<SubscriptionFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      if (currentStep == 1) {
        const validation = Schemastep1.safeParse(formData);
        if (!validation.success) {
          const errors = validation.error.flatten().fieldErrors;
          const firstError = Object.values(errors)
            .flat()
            .find(Boolean);
          if (firstError) {
            toast.error(firstError);
          }
          return;
        }
        setCurrentStep((prev) => prev + 1);
      }
      if (currentStep == 2) {
        const validation = Schemastep2.safeParse(formData);
        if (!validation.success) {
          const errors = validation.error.flatten().fieldErrors;
          const firstError = Object.values(errors)
            .flat()
            .find(Boolean);
          if (firstError) {
            toast.error(firstError);
          }
          return;
        }
        setCurrentStep((prev) => prev + 1);
      }
      if (currentStep == 3) {
        if (formData.domainType === "SUBDOMAIN") {
          const validation = Schemastep3Subdomain.safeParse(formData);
          if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            const firstError = Object.values(errors)
              .flat()
              .find(Boolean);
            if (firstError) {
              toast.error(firstError);
            }
            return;
          }
          setCurrentStep((prev) => prev + 1);
        }
        if (formData.domainType === "CUSTOM_DOMAIN") {
          const validation = Schemastep3customdomain.safeParse(formData);
          if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            const firstError = Object.values(errors)
              .flat()
              .find(Boolean);
            if (firstError) {
              toast.error(firstError);
            }
            return;
          }
          setCurrentStep((prev) => prev + 1);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Final Validation
    const validation = Schemastep4bank.safeParse(formData);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat().find(Boolean);
      if (firstError) toast.error(firstError);
      return;
    }

    setIsSubmitting(true);
    // Helper function to convert File to Base64
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    // Prepare payload (convert Files to Base64 strings)
    const payload: any = { ...formData };
    if (formData.licenseFile instanceof File) {
      payload.licenseFile = await fileToBase64(formData.licenseFile);
    }
    if (formData.bankReceiptFile instanceof File) {
      payload.bankReceiptFile = await fileToBase64(formData.bankReceiptFile);
    }
    const response = await axios.post('/api/subscription', payload);

    toast.success(
      formData.paymentMethod === 'ONLINE'
        ? t('messages.paymentSuccessDesc')
        : t('messages.orderConfirmDesc')
    );

    // Redirect or show success state
    setTimeout(() => {
      router.push(`/${locale}`);
    }, 3000);

  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 data={formData} onChange={handleDataChange} />;
      case 2:
        return <Step2 data={formData} onChange={handleDataChange} />;
      case 3:
        return <Step3 data={formData} onChange={handleDataChange} />;
      case 4:
        return <Step4 data={formData} onChange={handleDataChange} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;


  return (
    <section className="w-full max-w-3xl mx-auto" dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
          {t.rich('title', {
            highlight: (chunks) => <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">{chunks}</span>
          })}
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          {t('subtitle')}
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Form Card */}
      <div className="rounded-2xl shadow-xl p-6 md:p-8 mt-10">
        {showReturnToDraft && (
          <div className={`mb-8 p-6 rounded-2xl text-center font-bold text-xl border-2 ${mySubscription.status === 'DONE'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
            }`}>
            <span className="block text-sm opacity-70 mb-1">{t('currentStatus')}:</span>
            {mySubscription.status === 'DONE' ? td('common.accepted') : td('common.rejected')}
          </div>
        )}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className={`flex ${showReturnToDraft ? 'justify-center' : (isFirstStep ? 'justify-end' : 'justify-between')} items-center mt-8 pt-6 border-t border-gray-300`}>
          {showReturnToDraft ? (
            <Button
              onClick={handleReturnToDraft}
              className="bg-primary text-white font-bold px-10 py-6 rounded-xl text-lg hover:opacity-90 transition-all active:scale-95"
            >
              {t('buttons.returnToDraft')}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`${isFirstStep ? 'hidden' : 'flex'} items-center gap-2 rounded-xl`}
              >
                <ArrowRight className="w-4 h-4" />
                {t('buttons.back')}
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-secondary font-bold from-5% via-secondary/80 via-50% to-secondary/70 to-90% text-info flex items-center gap-2 rounded-xl"
                >
                  {isSubmitting ? t('buttons.processing') : formData.paymentMethod === 'ONLINE' ? t('buttons.completePayment') : t('buttons.confirmOrder')}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-secondary font-bold from-5% via-secondary/80 via-50% to-secondary/70 to-90% text-info"
                >
                  {t('buttons.next')}
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionWizard;
