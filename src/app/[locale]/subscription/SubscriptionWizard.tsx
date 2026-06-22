"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/Skeleton";
import { AppDispatch } from "@/app/store/store";
import { getSubscription, updateSubscription } from "@/app/store/slices/subscriptionSlice";
import { getPackages } from "@/app/store/slices/packagesSlice";
import { getUser } from "@/app/store/slices/userSlice";
import { RootState } from "@/app/store/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import StepIndicator from "./StepIndicator";
import StepPackage from "./StepPackage";
import Step0 from "./step0";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import { getServices } from "@/app/store/slices/servicesSlice";
import { getSystems } from "@/app/store/slices/systemsSlice";
import { SubscriptionFormData, initialFormData } from "@/utils/subscription";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Schemastep1, Schemastep2, Schemastep3Subdomain, Schemastep3customdomain, Schemastep4bank, Schemastep4electronic } from "@/utils/validiton";
import { toast } from 'react-toastify';
import HyperPayWidget from "@/components/payment/HyperPayWidget";
import { SaudiRiyalIcon } from "@/components/ui/SaudiRiyalIcon";

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
  const { subscriptionInfo, loading: subscriptionLoading } = useSelector((state: any) => state.subscription);
  const { userInfo, loading: userLoading } = useSelector((state: any) => state.user);
  const { packages, loading: packagesLoading } = useSelector((state: RootState) => state.packages);
  const { services, loading: servicesLoading } = useSelector((state: RootState) => state.services);
  const { systems: allSystems, loading: systemsLoading } = useSelector((state: RootState) => state.systems);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only block the UI on critical data (User, Subscription, and Packages).
  // Services and Systems can load in the background since they are currently hidden or non-critical for initial render.
  const isLoading = !mounted || subscriptionLoading || userLoading || packagesLoading;

  useEffect(() => {
    setMounted(true);
  }, []);

  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const systemId = searchParams.get('systemId');

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SubscriptionFormData>(initialFormData);
  const selectedPkg = packages.find((p: any) => p.id === Number(formData.packageId || packageId));

  useEffect(() => {
    dispatch(getUser());
    dispatch(getSubscription());
    dispatch(getPackages());
    dispatch(getServices());
    dispatch(getSystems());
  }, [dispatch]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  useEffect(() => {
    if (packageId) {
      setFormData((prev) => ({ ...prev, packageId: Number(packageId) }));
    }
    const systemIds = searchParams.getAll('systemId');
    if (systemIds.length > 0) {
      const sIds = systemIds.map(id => Number(id)).filter(id => !isNaN(id));
      setFormData((prev) => {
        const uniqueIds = Array.from(new Set([...(prev.selectedSystems || []), ...sIds]));
        return { ...prev, selectedSystems: uniqueIds };
      });
    }
  }, [packageId, systemId]);

  const mySubscription = (subscriptionInfo?.data?.length > 0 && userInfo?.id) 
    ? subscriptionInfo.data.find((s: any) => s.userId == userInfo.id) 
    : null;

  useEffect(() => {
    if (mySubscription && !dataLoaded) {
      const {
        fullName,
        email,
        phone,
        charityRegisterNo,
        licenseFile,
        domainType,
        domainName,
      } = mySubscription;

      setFormData((prev) => {
        const next = { ...prev };
        
        if (!next.fullName && fullName) next.fullName = fullName;
        if (!next.email && email) next.email = email;
        if (!next.phone && phone) next.phone = phone;
        if (!next.charityRegisterNo && charityRegisterNo) next.charityRegisterNo = charityRegisterNo;
        
        if (domainType) {
          next.domainType = domainType;
          if (domainType === 'SUBDOMAIN') {
            if (domainName) next.subdomain = domainName;
          } else if (domainType === 'CUSTOM_DOMAIN') {
            if (domainName) next.customDomain = domainName;
          }
        }

        if (licenseFile) {
          next.licenseFile = licenseFile;
        }

        return next;
      });
      setDataLoaded(true);
    }
  }, [mySubscription, dataLoaded]);

  useEffect(() => {
    if (userInfo && Object.keys(userInfo).length > 0) {
      setFormData((prev) => {
        const next = { ...prev };
        let changed = false;

        if (!next.fullName && userInfo.name) {
          next.fullName = userInfo.name;
          changed = true;
        }
        if (!next.email && userInfo.email) {
          next.email = userInfo.email;
          changed = true;
        }
        if (!next.phone && userInfo.phone) {
          next.phone = userInfo.phone;
          changed = true;
        }

        return changed ? next : prev;
      });
    }
  }, [userInfo]);

  // Clean up selected systems if they are already in the selected package or current subscription
  useEffect(() => {
    if (selectedPkg || mySubscription) {
      setFormData(prev => {
        if (!prev.selectedSystems || prev.selectedSystems.length === 0) return prev;
        
        const hiddenSystemIds = new Set<number>();
        if (selectedPkg?.systems) {
          selectedPkg.systems.forEach((s: any) => hiddenSystemIds.add(s.id));
        }
        if (mySubscription) {
          if (mySubscription.package?.systems) {
            mySubscription.package.systems.forEach((s: any) => hiddenSystemIds.add(s.id));
          }
          if (mySubscription.systems) {
            mySubscription.systems.forEach((s: any) => hiddenSystemIds.add(s.id));
          }
        }

        const newSystems = prev.selectedSystems.filter(id => !hiddenSystemIds.has(id));
        
        if (newSystems.length !== prev.selectedSystems.length) {
          return { ...prev, selectedSystems: newSystems };
        }
        return prev;
      });
    }
  }, [selectedPkg, mySubscription]);

  const steps = [
    { id: 1, label: t('steps.servicesSelection') },
    { id: 2, label: t('steps.personalInfo') },
    { id: 3, label: t('steps.associationData') },
    { id: 4, label: t('steps.domainSelection') },
    { id: 5, label: t('steps.payment') },
  ];

  const handleDataChange = (data: Partial<SubscriptionFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      if (currentStep == 2) {
        const validation = Schemastep1.safeParse(formData);
        if (!validation.success) {
          toast.error(Object.values(validation.error.flatten().fieldErrors).flat()[0]);
          return;
        }
      }
      if (currentStep == 3) {
        const validation = Schemastep2.safeParse(formData);
        if (!validation.success) {
          toast.error(Object.values(validation.error.flatten().fieldErrors).flat()[0]);
          return;
        }
      }
      if (currentStep == 4) {
        const validation = formData.domainType === "SUBDOMAIN"
          ? Schemastep3Subdomain.safeParse(formData)
          : Schemastep3customdomain.safeParse(formData);
        if (!validation.success) {
          toast.error(Object.values(validation.error.flatten().fieldErrors).flat()[0]);
          return;
        }
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const getPriceBreakdown = () => {
    let packagePrice = 0;
    let servicesTotal = 0;
    let systemsTotal = 0;
    if (selectedPkg) packagePrice = Number(selectedPkg.price) || 0;
    (formData.selectedServices || []).forEach(id => {
      const s = services.find((sv: any) => sv.id === id);
      if (s) servicesTotal += Number(s.price) || 0;
    });
    (formData.selectedSystems || []).forEach(id => {
      const s = allSystems.find((sys: any) => sys.id === id);
      if (s) systemsTotal += Number(s.price) || 0;
    });
    return { packagePrice, servicesTotal, systemsTotal, grandTotal: packagePrice + servicesTotal + systemsTotal };
  };

  const initiateOnlinePayment = async (subscriptionId: number, totalAmount: number) => {
    try {
      const payload = {
        amount: totalAmount.toFixed(2),
        customerEmail: userInfo?.email || formData.email || "customer@example.com",
        customerGivenName: (userInfo?.name || formData.fullName)?.split(' ')[0] || "Guest",
        customerSurname: (userInfo?.name || formData.fullName)?.split(' ').slice(1).join(' ') || "User",
        billingStreet1: "Olaya St",
        billingCity: "Riyadh",
        billingState: "Riyadh",
        billingCountry: "SA",
        billingPostcode: "12345"
      };

      const resp = await axios.post('/api/payment/checkout', payload);
      if (resp.data.id) {
        sessionStorage.setItem('pendingUpgrade', JSON.stringify({
          subscriptionId: subscriptionId,
          action: 'NEW',
          packageId: formData.packageId,
          selectedServices: formData.selectedServices
        }));
        setCheckoutId(resp.data.id);
      } else {
        toast.error(isAr ? "فشل إنشاء عملية الدفع" : "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Checkout init error", error);
      toast.error(isAr ? "خطأ في بوابة الدفع" : "Payment gateway error");
    }
  };

  const handleSubmit = async () => {
    const validation = formData.paymentMethod === 'BANK' ? Schemastep4bank.safeParse(formData) : Schemastep4electronic.safeParse(formData);
    if (!validation.success) {
      toast.error(Object.values(validation.error.flatten().fieldErrors).flat()[0]);
      return;
    }

    setIsSubmitting(true);
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    try {
      const payload: any = { ...formData };
      if (formData.licenseFile instanceof File) payload.licenseFile = await fileToBase64(formData.licenseFile);
      if (formData.bankReceiptFile instanceof File) payload.bankReceiptFile = await fileToBase64(formData.bankReceiptFile);

      let subId = mySubscription?.id;
      if (mySubscription) {
        let action: 'RENEW' | 'UPGRADE' | 'ADD_SYSTEM' = 'RENEW';
        
        // If a packageId was passed in URL or selected, and it's DIFFERENT from current
        const hasNewPackage = formData.packageId && formData.packageId !== mySubscription.packageId;
        
        if (hasNewPackage) {
          action = 'UPGRADE';
        } else if (formData.selectedSystems && formData.selectedSystems.length > 0) {
          action = 'ADD_SYSTEM';
        }
        
        payload.action = action;
        await axios.put(`/api/subscription/${mySubscription.id}`, payload);
      } else {
        payload.action = 'NEW';
        const res = await axios.post('/api/subscription', payload);
        subId = res.data.id;
      }

      if (formData.paymentMethod === 'ONLINE') {
        const { grandTotal } = getPriceBreakdown();
        await initiateOnlinePayment(subId, grandTotal);
      } else {
        toast.success(t('messages.orderConfirmDesc'));
        setTimeout(() => router.push(`/${locale}`), 3000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.errorDesc'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (checkoutId) {
      return (
        <div className="space-y-6">
          <button onClick={() => setCheckoutId(null)} className="text-sm text-gray-500 hover:text-primary mb-4 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {isAr ? "العودة للخيارات" : "Back to options"}
          </button>
          <HyperPayWidget checkoutId={checkoutId} />
        </div>
      );
    }
    switch (currentStep) {
      case 1: return <Step0 data={formData} onChange={handleDataChange} services={services} onSkip={() => setCurrentStep(2)} selectedPackage={selectedPkg} allSystems={allSystems} mySubscription={mySubscription} />;
      case 2: return <Step1 data={formData} onChange={handleDataChange} />;
      case 3: return <Step2 data={formData} onChange={handleDataChange} mySubscription={mySubscription} />;
      case 4: return <Step3 data={formData} onChange={handleDataChange} mySubscription={mySubscription} />;
      case 5: return <Step4 data={formData} onChange={handleDataChange} />;
      default: return null;
    }
  };

  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;
  const { packagePrice, servicesTotal, grandTotal } = getPriceBreakdown();
  const currency = isAr ? <SaudiRiyalIcon size={14} className="inline-block" /> : (selectedPkg?.currency || 'SAR');

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-10" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Header Skeleton */}
        <div className="text-center mb-10 space-y-4">
          <Skeleton className="h-12 w-2/3 md:w-1/3 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>

        {/* Step Indicator Skeleton */}
        <div className="flex justify-center items-center gap-4 md:gap-8 mb-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <React.Fragment key={i}>
              <Skeleton className="w-10 h-10" variant="circular" />
              {i < 4 && <Skeleton className="h-1 flex-1 max-w-[80px] hidden sm:block" />}
            </React.Fragment>
          ))}
        </div>

        {/* Grid Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Wizard Form Skeleton */}
          <div className="lg:col-span-3">
            <div className="rounded-[2.5rem] border border-gray-100 p-8 bg-white space-y-8">
              <Skeleton className="h-6 w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-28" />
              </div>
            </div>
          </div>

          {/* Sidebar Summary Skeleton */}
          <div className="lg:col-span-1">
            <div className="rounded-[2rem] border border-gray-100 p-6 bg-white space-y-6">
              <Skeleton className="h-6 w-2/3" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-5xl mx-auto" dir={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-black font-doto2 mb-4">
          {isAr ? (
            <>
              {selectedPkg ? (
                <>اشترك في <span className="text-primary">{selectedPkg.name_ar}</span></>
              ) : formData.selectedSystems && formData.selectedSystems.length > 0 ? (
                <>اشترك في <span className="text-primary">
                  {allSystems.find(s => s.id === formData.selectedSystems![0])?.name_ar}
                </span></>
              ) : (
                <>اشترك في <span className="text-primary">CERP</span></>
              )}
            </>
          ) : (
            <>
              {selectedPkg ? (
                <>Subscribe to <span className="text-primary">{selectedPkg.name_en}</span></>
              ) : formData.selectedSystems && formData.selectedSystems.length > 0 ? (
                <>Subscribe to <span className="text-primary">
                  {allSystems.find(s => s.id === formData.selectedSystems![0])?.name_en}
                </span></>
              ) : (
                <>Subscribe to <span className="text-primary">CERP</span></>
              )}
            </>
          )}
        </h1>
        <p className="text-gray-500 text-lg">
          {t('subtitle')}
        </p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
        <div className="lg:col-span-3">
          <div className={`rounded-[2.5rem] shadow-2xl p-8 bg-white border border-gray-50 h-full`}>
            {/* {selectedPkg && (
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {isAr ? "أنت تشترك حالياً في:" : "Currently subscribing to:"}
                </span>
                <span className="text-sm font-black text-primary">
                  {isAr ? selectedPkg.name_ar : selectedPkg.name_en}
                </span>
              </div>
            )} */}
            {renderStep()}
            {!checkoutId && (
              <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-100">
                <Button variant="outline" onClick={handlePrevious} disabled={isFirstStep} className={`${isFirstStep ? 'invisible' : ''} px-8 py-6 rounded-2xl`}> {isAr ? "السابق" : "Back"} </Button>
                {isLastStep ? (
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary text-white px-10 py-6 rounded-2xl font-black">
                    {isSubmitting ? (isAr ? "جاري..." : "Submitting...") : (isAr ? "تأكيد وإتمام" : "Confirm & Pay")}
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-secondary text-white px-10 py-6 rounded-2xl font-black text-lg"> {isAr ? "التالي" : "Next"} </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-[2rem] shadow-xl p-6 bg-white border border-gray-50 space-y-6">
            <h3 className="text-xl font-bold font-doto2 border-b pb-4">
              {isAr ? "ملخص الاشتراك" : "Subscription Summary"}
            </h3>

            <div className="space-y-4">
              {/* Package Summary */}
              {selectedPkg ? (
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm text-gray-500">{isAr ? "الباقة:" : "Package:"}</p>
                    <p className="font-bold text-gray-800">{isAr ? selectedPkg.name_ar : selectedPkg.name_en}</p>
                  </div>
                  <p className="font-bold text-primary whitespace-nowrap">{selectedPkg.price} {currency}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">{isAr ? "لم يتم اختيار باقة بعد" : "No package selected yet"}</p>
              )}

              {/* Services Summary */}
              {formData.selectedServices && formData.selectedServices.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-dashed">
                  <p className="text-sm text-gray-500">{isAr ? "الخدمات الإضافية:" : "Additional Services:"}</p>
                  {formData.selectedServices.map(id => {
                    const s = services.find((sv: any) => sv.id === id);
                    if (!s) return null;
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-gray-600">• {isAr ? s.name_ar : s.name_en}</span>
                        <span className="font-medium">{Number(s.price)} {currency}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Systems Summary */}
              {formData.selectedSystems && formData.selectedSystems.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-dashed">
                  <p className="text-sm text-gray-500">{isAr ? "الأنظمة الإضافية:" : "Additional Systems:"}</p>
                  {formData.selectedSystems.map(id => {
                    const s = allSystems.find((sys: any) => sys.id === id);
                    if (!s) return null;
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-gray-600">• {isAr ? s.name_ar : s.name_en}</span>
                        <span className="font-medium">{Number(s.price)} {currency}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total */}
              <div className="pt-6 border-t-2 border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{isAr ? "المجموع:" : "Total:"}</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-secondary">{grandTotal} {currency}</p>
                    <p className="text-[10px] text-gray-400">{isAr ? "شامل الضريبة" : "VAT Included"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hint */}
            <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500">
              {isAr ? "سيتم احتساب الرسوم بناءً على الخيارات المختارة أعلاه." : "Fees will be calculated based on the selected options above."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionWizard;
