"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "./StepIndicator";
import PersonalInfoStep from "./PersonalInfoStep";
import AssociationDataStep from "./AssociationDataStep";
import DomainSelectionStep from "./DomainSelectionStep";
import PaymentStep from "./PaymentStep";
import { SubscriptionFormData, initialFormData } from "@/utils/subscription";
import { useLocale, useTranslations } from "next-intl";

interface SubscriptionWizardProps {
  onSubmit?: (data: SubscriptionFormData) => Promise<void>;
}

const SubscriptionWizard = ({ onSubmit }: SubscriptionWizardProps) => {
  const t = useTranslations('subscription');
  const locale = useLocale();
  const { toast } = useToast();

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
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default behavior without API
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Form submitted:", formData);
      }

      toast({
        title: t('messages.successTitle'),
        description: formData.paymentMethod === 'electronic'
          ? t('messages.paymentSuccessDesc')
          : t('messages.orderConfirmDesc'),
      });
    } catch (error) {
      toast({
        title: t('messages.errorTitle'),
        description: t('messages.errorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep data={formData} onChange={handleDataChange} />;
      case 2:
        return <AssociationDataStep data={formData} onChange={handleDataChange} />;
      case 3:
        return <DomainSelectionStep data={formData} onChange={handleDataChange} />;
      case 4:
        return <PaymentStep data={formData} onChange={handleDataChange} />;
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
        {renderStep()}

        {/* Navigation Buttons */}
        <div className={`flex ${isFirstStep ? 'justify-end' : 'justify-between'} items-center mt-8 pt-6 border-t border-gray-300`}>
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
              {isSubmitting ? t('buttons.processing') : formData.paymentMethod === 'electronic' ? t('buttons.completePayment') : t('buttons.confirmOrder')}
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
        </div>
      </div>
    </section>
  );
};

export default SubscriptionWizard;
