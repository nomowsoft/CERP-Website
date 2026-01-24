export interface SubscriptionFormData {
  // المعلومات الشخصية
  fullName: string;
  email: string;
  phone: string;
  
  // بيانات الجمعية
  charityRegisterNo: string;
  licenseFile?: File;
  
  // اختيار النطاق
  domainType: 'SUBDOMAIN' | 'CUSTOM_DOMAIN';
  subdomain: string;
  customDomain: string;
  
  // الدفع
  paymentMethod: 'ONLINE' | 'BANK';
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  bankReceiptFile?: File;
}

export const initialFormData: SubscriptionFormData = {
  fullName: '',
  email: '',
  phone: '',
  charityRegisterNo: '',
  domainType: 'SUBDOMAIN',
  subdomain: '',
  customDomain: '',
  paymentMethod: 'ONLINE',
  cardNumber: '',
  cardHolder: '',
  expiryDate: '',
  cvv: '',
};
