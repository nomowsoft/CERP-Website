import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
    charityName: z.string().optional(),
}).refine(data => data.email || data.phone, {
    message: "Either email or phone is required"
});

export const LoginSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
}).refine(data => data.email, {
    message: "Either email or phone is required"
});


// subscription validations
export const Schemastep1 = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string({ error: "Email is required" }).email(),
    phone: z.string().min(1, { error: "Phone is required" }),
})
export const Schemastep2 = z.object({
    charityRegisterNo: z.string().min(1, "Charity RegisterNo is required"),
    licenseFile: z
        .instanceof(File, { message: "يرجى رفع ملف السجل" })
        .refine(
            (file) => file.size <= 5_000_000,
            "حجم الملف يجب أن يكون أقل من 5MB"
        )
})
export const Schemastep3Subdomain = z.object({
    subdomain: z.string().min(1, "Subdomain is required"),
})
export const Schemastep3customdomain = z.object({
    customDomain: z.string().min(1, "Custom Domain is required"),
})

export const Schemastep4electronic = z.object({
    licenseFile: z
        .instanceof(File, { message: "يرجى رفع ملف السجل" })
        .refine(
            (file) => file.size <= 5_000_000,
            "حجم الملف يجب أن يكون أقل من 5MB"
        )
})
export const Schemastep4bank = z.object({
    licenseFile: z
        .instanceof(File, { message: "يرجى رفع ملف السجل" })
        .refine(
            (file) => file.size <= 5_000_000,
            "حجم الملف يجب أن يكون أقل من 5MB"
        )
})

export const DomainTypeEnum = z.enum(['subdomain', 'custom']);
export const PaymentMethodEnum = z.enum(['electronic', 'bank']);

export const SubscriptionSchema = z.object({
    fullName: z.string().min(3, { message: 'الاسم الكامل مطلوب (على الأقل 3 أحرف)' }),
    email: z.string().email({ message: 'البريد الإلكتروني غير صحيح' }),
    phone: z.string().min(8, { message: 'رقم الهاتف مطلوب (على الأقل 8 أرقام)' }),
    charityRegisterNo: z.string().min(3, { message: 'رقم ترخيص الجمعية مطلوب' }),
    licenseFile: z.any().refine((val) => !!val, { message: 'ملف الترخيص مطلوب' }),
    domainType: DomainTypeEnum,
    subdomain: z.string().optional(),
    customDomain: z.string().optional(),
    paymentMethod: PaymentMethodEnum,
    cardNumber: z.string().optional(),
    cardHolder: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    bankReceiptFile: z.any().optional(),
})
    .superRefine((data, ctx) => {
        if (data.domainType === 'subdomain') {
            if (!data.subdomain || data.subdomain.trim() === '') {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'اسم النطاق الفرعي مطلوب', path: ['subdomain'] });
            }
        } else {
            if (!data.customDomain || data.customDomain.trim() === '') {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'النطاق الخاص مطلوب', path: ['customDomain'] });
            }
        }

        if (data.paymentMethod === 'electronic') {
            if (!data.cardNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'رقم البطاقة مطلوب', path: ['cardNumber'] });
            if (!data.cardHolder) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'اسم صاحب البطاقة مطلوب', path: ['cardHolder'] });
            if (!data.expiryDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'تاريخ الانتهاء مطلوب', path: ['expiryDate'] });
            if (!data.cvv) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'رمز التحقق مطلوب', path: ['cvv'] });
        } else {
            if (!data.bankReceiptFile) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'إيصال التحويل البنكي مطلوب', path: ['bankReceiptFile'] });
            }
        }
    });
