"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { getSubscription, updateSubscription } from "@/app/store/slices/subscriptionSlice";
import { getPackages } from "@/app/store/slices/packagesSlice";
import { getUser } from "@/app/store/slices/userSlice";
import { RootState } from "@/app/store/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "./StepIndicator";
import Step0 from "./step0";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import { getServices } from "@/app/store/slices/servicesSlice";
import { SubscriptionFormData, initialFormData } from "@/utils/subscription";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
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
  const isAr = locale === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const { subscriptionInfo, loading } = useSelector((state: any) => state.subscription);
  const { userInfo } = useSelector((state: any) => state.user);
  const { packages } = useSelector((state: RootState) => state.packages);
  const { services } = useSelector((state: RootState) => state.services);
  const [dataLoaded, setDataLoaded] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                           Get Package ID from URL                          */
  /* -------------------------------------------------------------------------- */
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const selectedPkg = packages.find((p: any) => p.id === Number(packageId));

  useEffect(() => {
    dispatch(getUser());
    dispatch(getSubscription());
    dispatch(getPackages());
    dispatch(getServices());
  }, [dispatch]);

  useEffect(() => {
    if (packageId) {
      setFormData((prev) => ({ ...prev, packageId: Number(packageId) }));
    }
  }, [packageId]);

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
  const [showServicesScreen, setShowServicesScreen] = useState(true); // Show services screen first
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

    try {
      if (mySubscription) {
        // If it's a renewal or upgrade (re-submitting a DONE subscription that was returned to draft)
        // or just updating a regular draft/progress subscription
        if (mySubscription.status === 'DONE' || mySubscription.status === 'DRAFT' || mySubscription.status === 'PROGRES') {
          payload.action = (formData.packageId !== mySubscription.packageId) ? 'UPGRADE' : 'RENEW';
        }
        await axios.put(`/api/subscription/${mySubscription.id}`, payload);
      } else {
        await axios.post('/api/subscription', payload);
      }

      toast.success(
        formData.paymentMethod === 'ONLINE'
          ? t('messages.paymentSuccessDesc')
          : t('messages.orderConfirmDesc')
      );

      // Redirect or show success state
      setTimeout(() => {
        router.push(`/${locale}`);
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.errorDesc'));
    } finally {
      setIsSubmitting(false);
    }
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

  // Calculate total price breakdown
  const getPriceBreakdown = () => {
    let packagePrice = 0;
    let servicesTotal = 0;

    if (selectedPkg) {
      packagePrice = Number(selectedPkg.price) || 0;
    }

    if (formData.selectedServices && formData.selectedServices.length > 0) {
      formData.selectedServices.forEach(serviceId => {
        const service = services.find((s: any) => s.id === serviceId);
        if (service) {
          servicesTotal += Number(service.price) || 0;
        }
      });
    }

    return {
      packagePrice,
      servicesTotal,
      grandTotal: packagePrice + servicesTotal
    };
  };

  const { packagePrice, servicesTotal, grandTotal } = getPriceBreakdown();
  const currency = selectedPkg?.currency || (isAr ? 'ر.س' : 'SAR');

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-3xl mx-auto" dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      {showServicesScreen ? (
        // Services Selection Screen (Separate from wizard)
        <div className="space-y-8">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
              {isAr ? "الخدمات الإضافية" : "Additional Services"}
            </h1>
            <p className="text-xl text-gray-500 mb-8">
              {isAr ? "اختر الخدمات الإضافية التي تحتاجها (اختياري)" : "Select additional services you need (optional)"}
            </p>

            {selectedPkg && (
              <div className="mb-8 inline-flex items-center gap-4 bg-primary/5 border border-primary/20 px-6 py-3 rounded-2xl">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-primary font-bold uppercase tracking-wider">{isAr ? "الباقة المختارة" : "Selected Package"}</span>
                  <span className="text-lg font-black text-gray-900">{isAr ? selectedPkg.name_ar || selectedPkg.name : selectedPkg.name_en || selectedPkg.name}</span>
                </div>
                <div className="w-px h-8 bg-primary/20" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-primary font-bold uppercase tracking-wider">{isAr ? "سعر الباقة" : "Package Price"}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-gray-900">{Number(selectedPkg.price)}</span>
                    <span className="text-sm font-bold text-gray-500">{currency}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service: any) => {
              const isSelected = (formData.selectedServices || []).includes(service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => {
                    const currentServices = formData.selectedServices || [];
                    const newServices = isSelected
                      ? currentServices.filter(id => id !== service.id)
                      : [...currentServices, service.id];
                    handleDataChange({ selectedServices: newServices });
                  }}
                  className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl ${isSelected
                    ? 'border-secondary bg-secondary/5 shadow-lg'
                    : 'border-gray-200 hover:border-primary/50'
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className="mb-4">
                    <img
                      src={service.image}
                      alt={service.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>

                  <h3 className="text-xl font-bold font-doto2 mb-2">
                    {isAr ? service.name_ar || service.name : service.name_en || service.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {Number(service.price)}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      {service.currency || currency}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {isAr ? service.description_ar || service.description : service.description_en || service.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Total Price Summary */}
          <div className="bg-white border-2 border-primary/20 shadow-xl rounded-3xl overflow-hidden sticky bottom-4 z-10 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-primary/10">
              <div className="p-4 flex flex-col items-center justify-center bg-gray-50/50">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{isAr ? "سعر الباقة" : "Package Price"}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-gray-900">{packagePrice}</span>
                  <span className="text-sm font-bold text-gray-400">{currency}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col items-center justify-center bg-gray-50/50">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{isAr ? "خدمات إضافية" : "Additional Services"}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-secondary">+{servicesTotal}</span>
                  <span className="text-sm font-bold text-gray-400">{currency}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col items-center justify-center bg-primary/10">
                <span className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{isAr ? "المجموع الكلي" : "Grand Total"}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-primary">{grandTotal}</span>
                  <span className="text-lg font-bold text-primary/60">{currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleDataChange({ selectedServices: [] });
                setShowServicesScreen(false);
              }}
              className="px-8 py-6 rounded-xl text-lg font-bold"
            >
              {isAr ? "تخطي" : "Skip"}
            </Button>
            <Button
              type="button"
              onClick={() => setShowServicesScreen(false)}
              className="bg-gradient-to-r from-secondary from-5% via-secondary/80 via-50% to-secondary/70 to-90% text-info px-8 py-6 rounded-xl text-lg font-bold"
            >
              {isAr ? "استمرار" : "Continue"}
            </Button>
          </div>
        </div>
      ) : (
        // Wizard Steps
        <>
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

            {selectedPkg && (
              <div className="mb-8 inline-flex flex-col w-full bg-white border border-primary/10 shadow-sm rounded-2xl overflow-hidden animate-fade-in">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-primary/10">
                  <div className="flex-1 p-4 bg-primary/5 text-start md:text-center">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">{isAr ? "الباقة المختارة" : "Selected Package"}</span>
                    <span className="text-sm font-black text-gray-900">{isAr ? selectedPkg.name_ar || selectedPkg.name : selectedPkg.name_en || selectedPkg.name}</span>
                  </div>
                  <div className="flex-1 p-4 text-start md:text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{isAr ? "سعر الباقة" : "Package Price"}</span>
                    <div className="flex items-baseline gap-1 md:justify-center">
                      <span className="text-lg font-black text-gray-900">{packagePrice}</span>
                      <span className="text-xs font-bold text-gray-500">{currency}</span>
                    </div>
                  </div>

                  {/* Show selected services and total */}
                  <div className="flex-1 p-4 text-start md:text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{isAr ? "الخدمات الإضافية" : "Services"}</span>
                    <div className="flex items-baseline gap-1 md:justify-center">
                      <span className="text-lg font-black text-secondary">+{servicesTotal}</span>
                      <span className="text-xs font-bold text-gray-500">{currency}</span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 bg-primary/10 text-start md:text-center text-primary">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">{isAr ? "المجموع الكلي" : "Grand Total"}</span>
                    <div className="flex items-baseline gap-1 md:justify-center">
                      <span className="text-xl font-black">{grandTotal}</span>
                      <span className="text-xs font-bold opacity-60">{currency}</span>
                    </div>
                  </div>
                </div>

                {formData.selectedServices && formData.selectedServices.length > 0 && (
                  <div className="p-3 bg-gray-50/50 border-t border-primary/5">
                    <div className="flex flex-wrap gap-1.5 justify-start md:justify-center">
                      {formData.selectedServices.map(serviceId => {
                        const service = services.find((s: any) => s.id === serviceId);
                        return service ? (
                          <span key={serviceId} className="text-[10px] bg-white border border-secondary/20 text-secondary px-2 py-0.5 rounded-full font-medium shadow-sm">
                            {isAr ? service.name_ar || service.name : service.name_en || service.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
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
        </>
      )}
    </section>
  );
};

export default SubscriptionWizard;
