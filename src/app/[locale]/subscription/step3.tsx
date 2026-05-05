"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, Link, Search, CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { SubscriptionFormData } from "@/utils/subscription";
import { useTranslations, useLocale } from "next-intl";
import axios from "axios";

interface DomainSelectionStepProps {
  data: SubscriptionFormData;
  onChange: (data: Partial<SubscriptionFormData>) => void;
  mySubscription?: any;
}

type DomainCheckStatus = "idle" | "checking" | "available" | "unavailable" | "error";

const Step3 = ({ data, onChange, mySubscription }: DomainSelectionStepProps) => {
  const t = useTranslations('subscription.domainSelection');
  const locale = useLocale();

  const [checkStatus, setCheckStatus] = useState<DomainCheckStatus>("idle");
  const [checkMessage, setCheckMessage] = useState("");

  const isLocked = !!mySubscription?.domainName;

  useEffect(() => {
    if (isLocked && (data.subdomain || data.customDomain)) {
      setCheckStatus("available");
    }
  }, [isLocked, data.subdomain, data.customDomain]);

  const getDomainToCheck = (): string => {
    if (data.domainType === "SUBDOMAIN") {
      return data.subdomain ? `${data.subdomain}.cerp.sa` : "";
    }
    return data.customDomain || "";
  };

  const canCheck = (): boolean => {
    if (data.domainType === "SUBDOMAIN") {
      return (data.subdomain || "").trim().length >= 2;
    }
    return (data.customDomain || "").trim().length >= 4;
  };

  const handleCheckDomain = async () => {
    if (isLocked) return;
    const domainName = getDomainToCheck();
    if (!domainName) return;

    setCheckStatus("checking");
    setCheckMessage("");

    try {
      const res = await axios.post("/api/check-domain", {
        domainName: data.domainType === "SUBDOMAIN" ? data.subdomain : data.customDomain,
        domainType: data.domainType,
      });

      if (res.data.available) {
        setCheckStatus("available");
        setCheckMessage(t('availableMessage'));
      } else {
        setCheckStatus("unavailable");
        setCheckMessage(res.data.message || t('unavailableMessage'));
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setCheckStatus("error");
        setCheckMessage(t('loginRequired'));
      } else {
        setCheckStatus("error");
        setCheckMessage(t('errorMessage'));
      }
    }
  };

  // Reset check status when domain input changes
  const handleSubdomainChange = (value: string) => {
    if (isLocked) return;
    onChange({ subdomain: value });
    if (checkStatus !== "idle") {
      setCheckStatus("idle");
      setCheckMessage("");
    }
  };

  const handleCustomDomainChange = (value: string) => {
    if (isLocked) return;
    onChange({ customDomain: value });
    if (checkStatus !== "idle") {
      setCheckStatus("idle");
      setCheckMessage("");
    }
  };

  const handleDomainTypeChange = (type: "SUBDOMAIN" | "CUSTOM_DOMAIN") => {
    if (isLocked) return;
    onChange({ domainType: type });
    setCheckStatus("idle");
    setCheckMessage("");
  };

  const getStatusColor = () => {
    if (isLocked) return "border-gray-200 bg-gray-50";
    switch (checkStatus) {
      case "available":
        return "border-green-400 bg-green-50";
      case "unavailable":
        return "border-red-400 bg-red-50";
      case "error":
        return "border-yellow-400 bg-yellow-50";
      default:
        return "border-gray-300";
    }
  };

  const getStatusIcon = () => {
    if (isLocked) return <CheckCircle2 className="w-5 h-5 text-primary/40" />;
    switch (checkStatus) {
      case "checking":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case "available":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "unavailable":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-doto2 mb-6">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subdomain Option */}
        <div
          onClick={() => handleDomainTypeChange('SUBDOMAIN')}
          className={`p-10 rounded-3xl border-2 transition-all ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${data.domainType === 'SUBDOMAIN'
            ? 'border-secondary bg-secondary/5 shadow-md'
            : 'border-primary hover:border-primary/50'
            }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${data.domainType === 'SUBDOMAIN' ? 'bg-accent' : 'bg-muted'
              }`}>
              <div className={`h-15 w-15 flex justify-center items-center rounded-2xl ${data.domainType === 'SUBDOMAIN' ? 'bg-secondary' : 'bg-primary'}`}>
                <Globe className={`w-7 h-7 text-info ${data.domainType === 'SUBDOMAIN' ? 'text-accent-foreground' : 'text-muted-foreground'
                  }`} />
              </div>
            </div>
            <h3 className="font-doto">{t('subdomainOption')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              yourname.cerp.sa
            </p>
          </div>
        </div>

        {/* Custom Domain Option */}
        <div
          onClick={() => handleDomainTypeChange('CUSTOM_DOMAIN')}
          className={`p-10 rounded-3xl border-2 transition-all ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${data.domainType === 'CUSTOM_DOMAIN'
            ? 'border-secondary bg-secondary/5 shadow-md'
            : 'border-primary hover:border-primary/50'
            }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${data.domainType === 'CUSTOM_DOMAIN' ? 'bg-accent' : 'bg-muted'
              }`}>
              <div className={`h-15 w-15 flex justify-center items-center rounded-2xl ${data.domainType === 'CUSTOM_DOMAIN' ? 'bg-secondary' : 'bg-primary'}`}>
                <Link className={`w-7 h-7 ${data.domainType === 'CUSTOM_DOMAIN' ? 'text-info' : 'text-info'
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

      {/* Domain Input + Check */}
      <div className="space-y-4 mt-6">
        {data.domainType === 'SUBDOMAIN' ? (
          <div className="space-y-2">
            <Label htmlFor="subdomain" className="font-doto2">{t('subdomainLabel')}</Label>
            <div className="flex items-center gap-2" dir="ltr">
              <span className="text-muted-foreground text-sm shrink-0">.cerp.sa</span>
              <div className="relative flex-1">
                <Input
                  id="subdomain"
                  value={data.subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  placeholder="yourname"
                  className={`text-left flex-1 border transition-colors duration-300 ${getStatusColor()} ${checkStatus !== "idle" ? "pr-10" : ""} ${isLocked ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                  readOnly={isLocked}
                />
                {checkStatus !== "idle" && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getStatusIcon()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="customDomain" className="font-doto2">{t('customDomainLabel')}</Label>
            <div className="relative">
              <Input
                id="customDomain"
                value={data.customDomain}
                onChange={(e) => handleCustomDomainChange(e.target.value)}
                placeholder="www.example.com"
                className={`text-left border transition-colors duration-300 ${getStatusColor()} ${checkStatus !== "idle" ? "pr-10" : ""} ${isLocked ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                readOnly={isLocked}
                dir="ltr"
              />
              {checkStatus !== "idle" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getStatusIcon()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Check Domain Button (Only for Subdomains) */}
        {data.domainType === 'SUBDOMAIN' && (
          <Button
            type="button"
            onClick={handleCheckDomain}
            disabled={!canCheck() || checkStatus === "checking" || isLocked}
            className={`w-full py-6 rounded-xl font-bold text-base transition-all duration-300 ${checkStatus === "available"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : checkStatus === "unavailable"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gradient-to-r from-primary to-primary/80 text-white hover:opacity-90"
              }`}
          >
            {checkStatus === "checking" ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('checking')}
              </span>
            ) : checkStatus === "available" ? (
              <span className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-5 h-5" />
                {t('domainAvailable')}
              </span>
            ) : checkStatus === "unavailable" ? (
              <span className="flex items-center gap-2 justify-center">
                <RefreshCw className="w-5 h-5" />
                {t('domainUnavailable')}
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <Search className="w-5 h-5" />
                {t('checkAvailability')}
              </span>
            )}
          </Button>
        )}

        {/* Status Message Card */}
        {checkMessage && (
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-500 animate-fade-in ${checkStatus === "available"
              ? "border-green-300 bg-green-50 text-green-800"
              : checkStatus === "unavailable"
                ? "border-red-300 bg-red-50 text-red-800"
                : "border-yellow-300 bg-yellow-50 text-yellow-800"
              }`}
          >
            <div className="shrink-0 mt-0.5">
              {checkStatus === "available" && <CheckCircle2 className="w-6 h-6 text-green-500" />}
              {checkStatus === "unavailable" && <XCircle className="w-6 h-6 text-red-500" />}
              {checkStatus === "error" && <AlertCircle className="w-6 h-6 text-yellow-500" />}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">
                {checkStatus === "available"
                  ? t('availableTitle')
                  : checkStatus === "unavailable"
                    ? t('unavailableTitle')
                    : t('errorTitle')}
              </p>
              <p className="text-sm mt-1 opacity-80">{checkMessage}</p>
              {checkStatus === "available" && (
                <p className="text-xs mt-2 opacity-60">
                  {t('domainReserved')} {getDomainToCheck()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Domain Preview */}
        {canCheck() && checkStatus === "idle" && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500" dir="ltr">
              {getDomainToCheck()}
            </span>
            <span className="text-xs text-gray-400 ms-auto">
              {t('checkHint')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3;
