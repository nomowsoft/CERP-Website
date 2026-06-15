"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Navlink from "./nav_link";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "../common/LanguageSwitcher";
import type { AppDispatch } from '@/app/store/store';
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "@/app/store/slices/userSlice";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("header");
  const local = useLocale();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const { userInfo } = useSelector((state: any) => state.user);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 bg-info ${pathname.includes('/admin') ? 'hidden' : ''} shadow-md`}>
        <nav className="w-full">
          <div className="flex flex-wrap justify-between items-center lg:mx-10 xl:mx-20">
          <Link href="/" className="flex items-center px-5 lg:px-0">
            <Image
              height={30}
              width={110}
              src="/cerp-logo.png"
              alt="CERP Logo"
              className="object-contain"
            />
          </Link>
          <div className="hidden lg:block">
            <Navlink />
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            <LanguageSwitcher />
            {userInfo.id && (
              <Link className="mx-2 border border-gray-700 py-3 px-6 rounded-2xl text-xl font-doto2" href={`/${local}/admin`}>{userInfo.name}</Link>
            )}
            {!userInfo.id && (
              <Link
                href={`/${local}/login`}
                className="mx-2 border border-gray-700 py-3 px-6 rounded-2xl text-xl font-doto2"
              >
                {t('login')}
              </Link>
            )}
            <Link
              href={`/${local}/contact-us`}
              className="mx-2 bg-gradient-to-l from-primary/70 to-primary text-info py-3 px-8 rounded-2xl text-xl font-doto2"
            >
              {t('contact')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
            className="lg:hidden inline-flex items-center px-2 h-10  mx-5 lg:mx-0 text-sm text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 border border-primary"
          >
            <span className="sr-only">{t('openMainMenu')}</span>
            {open ? (
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            )}
          </button>

          {/* Mobile menu */}
          {open && (
            <div className="fixed inset-0 z-[999] h-screen flex flex-col items-center justify-center bg-white/98 backdrop-blur-lg lg:hidden w-full px-6 py-20">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-primary"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <nav className="flex flex-col items-center gap-8 w-full max-w-sm">
                <div className="text-center text-primary text-2xl font-bold w-full">
                  <Navlink closeMenu={() => setOpen(false)} />
                </div>
                <div className="flex justify-center gap-4 w-full">
                  <LanguageSwitcher />
                </div>
                <div className="w-full flex justify-center mt-4">
                  <Link
                    href={`/${local}/contact-us`}
                    onClick={() => setOpen(false)}
                    className="w-full text-center bg-gradient-to-r from-primary to-secondary text-info py-4 px-8 rounded-2xl text-xl font-bold shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  >
                    {t('contact')}
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </nav>
    </header>
    {!pathname.includes('/admin') && (
      <div className="" />
    )}
  </>
  );
}