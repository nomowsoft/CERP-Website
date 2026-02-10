"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useTranslations, useLocale } from 'next-intl';

const LoginForm = () => {
    const router = useRouter();
    const DOMAIN = process.env.NEXT_PUBLIC_API_URL;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const locale = useLocale();
    const t = useTranslations("contact.login");
    const tCommon = useTranslations("dashboard.common");

    const formSubmitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email === "") return toast.error(t("emailPlaceholder"));
        if (password === "") return toast.error(t("passwordPlaceholder"));

        try {
            setLoading(true);
            await axios.post(`${DOMAIN}/api/users/login`, { email, password });
            router.replace(`/${locale}/admin`);
            setLoading(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error?.response?.data.message);
            setLoading(false);
        }

    }

    return (
        <section className="mx-auto mt-20 p-8  w-11/12 md:w-2/3" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <form onSubmit={formSubmitHandler} className="flex flex-col shadow-2xl rounded-2xl p-8 mx-auto">
                <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-4 mt-6 text-center">
                    <span>{t('title')}</span>
                    <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block ms-2">{t('subtitle')}</span>
                </h1>
                <p className="text-center text-lg text-gray-500">{t('welcome')}</p>
                <label className="text-xl font-bold mt-10">{t('email')}</label>
                <input
                    className="mb-4 border border-gray-300 rounded-lg p-2"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label className="text-xl font-bold mt-1">{t('password')}</label>
                <input
                    className="mb-4 border border-gray-300 rounded-lg p-2 text-xl text-gray-400"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <label className={`text-gray-500 mb-4 ${locale === 'ar' ? 'text-left' : 'text-right'}`}>{t('forgotPassword')}</label>
                <button disabled={loading} type="submit" className="text-2xl text-white bg-primary p-2 rounded-xl font-bold">
                    {loading ? tCommon("inProgress") : t("loginButton")}
                </button>
                <hr className="my-8 text-gray-300" />
                <p className="text-center text-gray-500">
                    {t('noAccount')} <span className="text-primary font-bold cursor-pointer" onClick={() => router.push(`/${locale}/register`)}>{t('registerNow')}</span>
                </p>
            </form>
        </section>
    )
}

export default LoginForm