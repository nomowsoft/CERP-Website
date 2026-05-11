/**
 * Utility to map Odoo technical module names to friendly human-readable names.
 */

export interface ModuleInfo {
  technicalName: string;
  nameAr: string;
  nameEn: string;
}

const MODULE_REGISTRY: Record<string, { ar: string; en: string }> = {
  'nomow_automation_account': {
    ar: 'نظام المحاسبة الآلي',
    en: 'Automation Accounting System'
  },
  'nomow_automation_hr': {
    ar: 'نظام الموارد البشرية',
    en: 'Automation HR System'
  },
  'nomow_automation_social_services': {
    ar: 'نظام الخدمات الاجتماعية',
    en: 'Social Services System'
  },
  'cerp_financial_resources_account': {
    ar: 'نظام الموارد المالية',
    en: 'Financial Resources System'
  },
  'base': {
    ar: 'النظام الأساسي',
    en: 'Base System'
  },
  'mail': {
    ar: 'نظام المراسلات',
    en: 'Mail System'
  },
  'contacts': {
    ar: 'جهات الاتصال',
    en: 'Contacts'
  },
  'hr': {
    ar: 'الموارد البشرية الأساسية',
    en: 'Basic HR'
  },
  'account': {
    ar: 'المحاسبة',
    en: 'Accounting'
  },
  'project': {
    ar: 'إدارة المشاريع',
    en: 'Project Management'
  },
  'crm': {
    ar: 'إدارة علاقات العملاء',
    en: 'CRM'
  },
  'sale_management': {
    ar: 'إدارة المبيعات',
    en: 'Sales Management'
  },
  'purchase': {
    ar: 'المشتريات',
    en: 'Purchase'
  },
  'stock': {
    ar: 'المخازن',
    en: 'Inventory'
  }
};

/**
 * Gets the friendly name for a module based on the locale.
 */
export const getModuleFriendlyName = (technicalName: string, locale: string = 'ar'): string => {
  const mapping = MODULE_REGISTRY[technicalName];
  if (!mapping) {
    // If no mapping found, format the technical name nicely
    return technicalName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
  return locale === 'ar' ? mapping.ar : mapping.en;
};

/**
 * Groups and flattens modules from multiple systems, removing duplicates.
 */
export const getUnifiedModules = (systems: any[]): string[] => {
  const allModules = new Set<string>();
  systems.forEach(system => {
    if (system.modules && Array.isArray(system.modules)) {
      system.modules.forEach((mod: string) => allModules.add(mod));
    }
  });
  return Array.from(allModules);
};
