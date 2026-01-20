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
