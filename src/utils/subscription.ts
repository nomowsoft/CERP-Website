export interface SubscriptionFormData {
  // المعلومات الشخصية
  fullName: string;
  email: string;
  phone: string;
  
  // بيانات الجمعية
  associationNumber: string;
  license: string;
  licenseFile?: File;
  
  // اختيار النطاق
  domainType: 'subdomain' | 'custom';
  subdomain: string;
  customDomain: string;
  
  // الدفع
  paymentMethod: 'electronic' | 'bank';
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
  associationNumber: '',
  license: '',
  domainType: 'subdomain',
  subdomain: '',
  customDomain: '',
  paymentMethod: 'electronic',
  cardNumber: '',
  cardHolder: '',
  expiryDate: '',
  cvv: '',
};
