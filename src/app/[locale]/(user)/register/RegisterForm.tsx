"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';

const RegisterForm = () => {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale;
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
        if (username === "") return toast.error("Username is required");
        if (email === "") return toast.error("Email is required");
        if (password === "") return toast.error("Password is required");

        try {
            setLoading(true);
            await axios.post(`${DOMAIN}/api/users/register`, {
                email,
                password ,
                name: username,
                phone,
                charityName: charityName,
                confirmPassword: confirmPassword
            });
            router.replace('/');
            setLoading(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error?.response?.data.message);
            setLoading(false);
        }
    }

    return (
        <section className="mx-auto mt-20 p-8  w-11/12 md:w-2/3">
            <form onSubmit={formSubmitHandler} className="flex flex-col shadow-2xl rounded-2xl p-8 mx-auto">
                <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-4 mt-6 text-center">
                    <span>تسجيل</span>
                    <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">الحساب</span>
                </h1>
                <p className="text-center text-lg text-gray-500 mb-8">انضم إلى نظام سـرب المتكامل اليوم</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="font-doto2 mt-10 md:mt-0">الاسم</label>
                        <input
                            className="mb-4 border border-gray-300 rounded-xl py-4 px-2"
                            type="text"
                            placeholder="Enter Your Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-doto2">رقم الهاتف</label>
                        <input
                            className="mb-4 border border-gray-300 rounded-xl py-4 px-2"
                            type="text"
                            placeholder="Enter Your Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>
                <label className="font-doto2">البريد الإلكتروني</label>
                <input
                    className="mb-4  border border-gray-300 rounded-xl py-4 px-2"
                    type="email"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label className="font-doto2">اسم الجمعية / المنظمة</label>
                <input
                    className="mb-4  border border-gray-300 rounded-xl py-4 px-2"
                    type="text"
                    placeholder="Enter Your Organization Name"
                    value={charityName}
                    onChange={(e) => setCharityName(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="font-doto2">كلمة المرور</label>
                        <input
                            className="mb-4  border border-gray-300 rounded-xl py-4 px-2"
                            type="password"
                            placeholder="Enter Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-doto2">تأكيد كلمة المرور</label>
                        <input
                            className="mb-4  border border-gray-300 rounded-xl py-4 px-2"
                            type="password"
                            placeholder="Enter Your Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                <button disabled={loading} type="submit" className="text-2xl text-white bg-primary py-4 px-2 rounded-xl font-bold">
                    {loading ? "dddd" : "Register"}
                </button>
                <hr className="my-8 text-gray-300" />
                <p className="text-center text-gray-500">
                    <span className="font-bold cursor-pointer" onClick={() => router.push(`/${locale}/login`)}>تسجيل الدخول</span>
                </p>
            </form>
        </section>
    )
}

export default RegisterForm