import { PrismaClient, PackageType } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Systems (Anzima)
  // Delete existing systems to avoid duplicates
  await prisma.system.deleteMany({});

  const systemsData = [
    { name: 'CRM', name_ar: 'إدارة علاقات العملاء', name_en: 'CRM', description_ar: 'نظام إدارة علاقات العملاء لمتابعة المبيعات والعملاء المحتملين', description_en: 'Customer Relationship Management system to track sales and leads', price: 50 },
    { name: 'Sales', name_ar: 'المبيعات', name_en: 'Sales', description_ar: 'نظام المبيعات لإدارة أوامر البيع والفواتير', description_en: 'Sales system to manage sales orders and invoicing', price: 40 },
    { name: 'Accounting', name_ar: 'المحاسبة', name_en: 'Accounting', description_ar: 'نظام محاسبي متكامل لإدارة القيود والتقارير المالية', description_en: 'Integrated accounting system to manage entries and financial reports', price: 60 },
    { name: 'Inventory', name_ar: 'المخازن', name_en: 'Inventory', description_ar: 'نظام إدارة المستودعات والمخزون', description_en: 'Warehouse and inventory management system', price: 45 },
    { name: 'Purchase', name_ar: 'المشتريات', name_en: 'Purchase', description_ar: 'نظام المشتريات لإدارة الموردين وأوامر الشراء', description_en: 'Purchase system to manage vendors and purchase orders', price: 35 },
    { name: 'Manufacturing', name_ar: 'التصنيع', name_en: 'Manufacturing', description_ar: 'نظام التصنيع وتخطيط موارد الإنتاج', description_en: 'Manufacturing and production resource planning system', price: 70 },
    { name: 'Project', name_ar: 'إدارة المشاريع', name_en: 'Project', description_ar: 'نظام إدارة المشاريع والمهام', description_en: 'Project and task management system', price: 30 },
    { name: 'Website', name_ar: 'الموقع الإلكتروني', name_en: 'Website', description_ar: 'نظام إنشاء وإدارة المواقع الإلكترونية', description_en: 'Website builder and management system', price: 20 },
    { name: 'E-commerce', name_ar: 'المتجر الإلكتروني', name_en: 'E-commerce', description_ar: 'نظام إدارة المتاجر الإلكترونية والبيع عبر الإنترنت', description_en: 'Online store and e-commerce management system', price: 40 },
    { name: 'Point of Sale', name_ar: 'نقاط البيع', name_en: 'Point of Sale', description_ar: 'نظام نقاط البيع للمحلات والمطاعم', description_en: 'Point of Sale system for shops and restaurants', price: 45 },
    { name: 'Human Resources', name_ar: 'الموارد البشرية', name_en: 'Human Resources', description_ar: 'نظام إدارة الموظفين والملفات الشخصية', description_en: 'Employee and profile management system', price: 35 },
    { name: 'Payroll', name_ar: 'الرواتب', name_en: 'Payroll', description_ar: 'نظام إدارة الرواتب والمسيرات الشهرية', description_en: 'Payroll and monthly payment management system', price: 40 },
    { name: 'Timesheet', name_ar: 'سجلات الوقت', name_en: 'Timesheet', description_ar: 'نظام تسجيل ساعات العمل والحضور', description_en: 'Work hours and attendance tracking system', price: 15 },
    { name: 'Helpdesk', name_ar: 'الدعم الفني', name_en: 'Helpdesk', description_ar: 'نظام تذاكر الدعم الفني وخدمة العملاء', description_en: 'Technical support tickets and customer service system', price: 30 },
    { name: 'Quality', name_ar: 'الجودة', name_en: 'Quality', description_ar: 'نظام مراقبة وضمان الجودة', description_en: 'Quality control and assurance system', price: 35 },
    { name: 'Maintenance', name_ar: 'الصيانة', name_en: 'Maintenance', description_ar: 'نظام إدارة الصيانة الوقائية والإصلاحية', description_en: 'Preventive and corrective maintenance management system', price: 25 },
    { name: 'Recruitment', name_ar: 'التوظيف', name_en: 'Recruitment', description_ar: 'نظام إدارة عمليات التوظيف والمتقدمين', description_en: 'Recruitment and applicant management system', price: 20 },
    { name: 'Appraisal', name_ar: 'التقييم', name_en: 'Appraisal', description_ar: 'نظام تقييم أداء الموظفين', description_en: 'Employee performance appraisal system', price: 20 },
    { name: 'Fleet', name_ar: 'الأسطول', name_en: 'Fleet', description_ar: 'نظام إدارة أسطول المركبات', description_en: 'Fleet management system', price: 25 },
    { name: 'Marketing Automation', name_ar: 'أتمتة التسويق', name_en: 'Marketing Automation', description_ar: 'نظام أتمتة الحملات التسويقية والبريد الإلكتروني', description_en: 'Marketing campaigns and email automation system', price: 45 },
  ];

  for (const system of systemsData) {
    await prisma.system.create({
      data: {
        name: system.name,
        name_ar: system.name_ar,
        name_en: system.name_en,
        description: system.description_en,
        description_ar: system.description_ar,
        description_en: system.description_en,
        price: system.price,
      },
    });
  }
  console.log('Systems seeded.');

  // 2. Create Packages (Baqat)
  // Delete existing packages to avoid duplicates
  await prisma.packageFeature.deleteMany({});
  await prisma.package.deleteMany({});

  const packagesData = [
    {
      name: 'Starter Package',
      name_ar: 'باقة الأنطلاقة',
      name_en: 'Starter Package',
      type: PackageType.STARTER,
      description_ar: 'الباقة المثالية للشركات الناشئة للبدء في التحول الرقمي',
      description_en: 'Perfect package for startups to begin digital transformation',
      price: 299,
      features: [
        { ar: 'دعم 3 أنظمة أساسية', en: 'Support 3 basic systems' },
        { ar: 'تحديثات مجانية', en: 'Free updates' },
        { ar: 'دعم فني عبر البريد', en: 'Email technical support' },
      ],
    },
    {
      name: 'Upgrade Package',
      name_ar: 'باقة الترقية',
      name_en: 'Upgrade Package',
      type: PackageType.BUSINESS,
      description_ar: 'باقة متقدمة للشركات المتنامية التي تحتاج ميزات أكثر',
      description_en: 'Advanced package for growing companies needing more features',
      price: 599,
      features: [
        { ar: 'دعم جميع الأنظمة الأساسية', en: 'Support all basic systems' },
        { ar: 'أولوية في الدعم الفني', en: 'Priority technical support' },
        { ar: 'جلسات تدريبية شهرية', en: 'Monthly training sessions' },
        { ar: 'تقارير أداء متقدمة', en: 'Advanced performance reports' },
      ],
    },
  ];

  for (const pkg of packagesData) {
    const createdPackage = await prisma.package.create({
      data: {
        name: pkg.name,
        name_ar: pkg.name_ar,
        name_en: pkg.name_en,
        type: pkg.type,
        description: pkg.description_en,
        description_ar: pkg.description_ar,
        description_en: pkg.description_en,
        price: pkg.price,
        features: {
          create: pkg.features.map(f => ({
            text: f.en,
            text_ar: f.ar,
            text_en: f.en,
          })),
        },
      },
    });
  }
  console.log('Packages seeded.');

  // 3. Create Services (Khedmat)
  // Delete existing services to avoid duplicates
  await prisma.serviceType.deleteMany({});
  await prisma.service.deleteMany({});

  const servicesData = [
    {
      name: 'Implementation & Configuration',
      name_ar: 'التركيب والإعداد',
      name_en: 'Implementation & Configuration',
      description_ar: 'خدمة تركيب أنظمة أودو وإعدادها وفق احتياجات العمل',
      description_en: 'Service for implementing and configuring Odoo systems based on business needs',
      price: 1500,
    },
    {
      name: 'Training',
      name_ar: 'التدريب',
      name_en: 'Training',
      description_ar: 'تدريب الموظفين على استخدام أنظمة أودو بكفاءة',
      description_en: 'Training employees on using Odoo systems efficiently',
      price: 800,
    },
    {
      name: 'Technical Support',
      name_ar: 'الدعم الفني',
      name_en: 'Technical Support',
      description_ar: 'دعم فني متواصل لحل المشكلات التقنية',
      description_en: 'Continuous technical support to resolve technical issues',
      price: 500,
    },
    {
      name: 'Technical Consultancy',
      name_ar: 'الاستشارات التقنية',
      name_en: 'Technical Consultancy',
      description_ar: 'استشارات تقنية لتحسين سير العمل وتطوير الأنظمة',
      description_en: 'Technical consultancy to improve workflow and system development',
      price: 1200,
    },
  ];

  for (const service of servicesData) {
    await prisma.service.create({
      data: {
        name: service.name,
        name_ar: service.name_ar,
        name_en: service.name_en,
        description: service.description_en,
        description_ar: service.description_ar,
        description_en: service.description_en,
        price: service.price,
      },
    });
  }
  console.log('Services seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
