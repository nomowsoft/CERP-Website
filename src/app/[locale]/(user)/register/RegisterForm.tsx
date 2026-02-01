"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

const RegisterForm = () => {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("contact.register");
    const tCommon = useTranslations("dashboard.common");
    const DOMAIN = process.env.NEXT_PUBLIC_API_URL;
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [charityName, setCharityName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const formSubmitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username === "") return toast.error(t("fullName"));
        if (email === "") return toast.error(t("email"));
        if (password === "") return toast.error(t("password"));

        try {
            setLoading(true);
            await axios.post(`${DOMAIN}/api/users/register`, {
                email,
                password,
                name: username,
                phone,
                charityName: charityName,
                confirmPassword: confirmPassword
            });
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
                <p className="text-center text-lg text-gray-500 mb-8">{t('welcome')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="font-doto2 mt-10 md:mt-0">{t('fullName')}</label>
                        <input
                            className="mb-4 border border-gray-300 rounded-xl py-4 px-2"
                            type="text"
                            placeholder={t('fullName')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-doto2">{t('phone')}</label>
                        <input
                            className="mb-4 border border-gray-300 rounded-xl py-4 px-2"
                            type="text"
                            placeholder={t('phone')}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>
                <label className="font-doto2">{t('email')}</label>
                <input
                    className="mb-4  border border-gray-300 rounded-xl py-4 px-2"
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label className="font-doto2">{tCommon('organization')}</label>
                <input
                    className="mb-4  border border-gray-300 rounded-xl py-4 px-2"
                    type="text"
                    placeholder={tCommon('organization')}
                    value={charityName}
                    onChange={(e) => setCharityName(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="font-doto2">{t('password')}</label>
                        <input
                            className="mb-4  border border-gray-300 rounded-xl py-4 px-2"
                            type="password"
                            placeholder={t('password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-doto2">{t('confirmPassword')}</label>
                        <input
                            className="mb-4  border border-gray-300 rounded-xl py-4 px-2"
                            type="password"
                            placeholder={t('confirmPassword')}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                <button disabled={loading} type="submit" className="text-2xl text-white bg-primary py-4 px-2 rounded-xl font-bold">
                    {loading ? tCommon('inProgress') : t('registerButton')}
                </button>
                <hr className="my-8 text-gray-300" />
                <p className="text-center text-gray-500">
                    <span className="font-bold cursor-pointer" onClick={() => router.push(`/${locale}/login`)}>{t('loginNow')}</span>
                </p>
            </form>
        </section>
    )
}

export default RegisterForm