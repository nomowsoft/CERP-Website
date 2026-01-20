"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useLocale } from 'next-intl';

const LoginForm = () => {
    const router = useRouter();
    const DOMAIN = process.env.NEXT_PUBLIC_API_URL;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const locale = useLocale();

    const formSubmitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email === "") return toast.error("Email is required");
        if (password === "") return toast.error("Password is required");

        try {
            setLoading(true);
            await axios.post(`${DOMAIN}/api/users/login`, { email, password });
            router.replace('/');
            setLoading(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error?.response?.data.message);
            console.log(error);
            setLoading(false);
        }

    }

    return (
        <section className="mx-auto mt-20 p-8  w-11/12 md:w-2/3">
            <form onSubmit={formSubmitHandler} className="flex flex-col shadow-2xl rounded-2xl p-8 mx-auto">
                <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-4 mt-6 text-center">
                    <span>تسجيل</span>
                    <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">الدخول</span>
                </h1>
                <p className="text-center text-lg text-gray-500">مرحبًا بك في النظام المتكامل سِرب</p>
                <label className="text-xl font-bold mt-10">البريد الإلكتروني</label>
                <input
                    className="mb-4 border border-gray-300 rounded-lg p-2"
                    type="email"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label className="text-xl font-bold mt-1">كلمة المرور</label>
                <input
                    className="mb-4 border border-gray-300 rounded-lg p-2 text-xl text-gray-400"
                    type="password"
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <label className="text-gray-500 mb-4 text-end">هل نسيت كلمة المرور؟</label>
                <button disabled={loading} type="submit" className="text-2xl text-white bg-primary p-2 rounded-xl font-bold">
                    {loading ? "ddddd" : "Login"}
                </button>
                <hr className="my-8 text-gray-300" />
                <p className="text-center text-gray-500">
                    لا تملك حساب؟ <span className="text-primary font-bold cursor-pointer" onClick={() => router.push(`/${locale}/register`)}>التسجيل الأن</span>
                </p>
            </form>
        </section>
    )
}

export default LoginForm