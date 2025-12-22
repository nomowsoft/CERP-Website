"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Navlink from "./nav_link";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "../common/LanguageSwitcher";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const new_path = `${pathname}`
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("header");
  const local = useLocale();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
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

  return (
    <header>
      <nav className="bg-white border-gray-200 lg:px-6 w-full z-50">
        <div className="flex flex-wrap justify-between items-center lg:mx-10 xl:mx-20 py-4 relative">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center px-5 lg:px-0">
              <Image
                height={20}
                width={150}
                src="/header/cerp.svg"
                alt="Logo"
              />
            </Link>
            <div className={`${ new_path === `/` ? 'hidden' : 'hidden lg:flex px-14'}`}>
              <Navlink />
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            <LanguageSwitcher />
            <Link
              href={`${local}/contact_us`}
              className="mx-2 border border-success bg-white text-success hover:text-white hover:bg-success py-2 px-8 rounded-md text-xl font-extrabold"
            >
              {t('contact')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
            className="lg:hidden inline-flex items-center p-2  mx-5 lg:mx-0 text-sm text-success rounded-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 border border-success"
          >
            <span className="sr-only">{t('openMainMenu')}</span>
            {isMobileMenuOpen ? (
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
        <div className="inset-0 z-[999] h-screen flex justify-center bg-success/20 backdrop-blur-sm lg:hidden mb-20 w-full">
          <nav className="py-4">
            <div className="mt-4 text-center text-success text-2xl font-bold">
              <Link href="/"  onClick={() => setOpen(false)}>
                {t("home")}
              </Link>
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <LanguageSwitcher />
            </div>
            <div className="mt-10">
              <Link
                href="/contact_us"
                className="bg-success text-white py-2 px-5 rounded-3xl hover:bg-white hover:text-success border border-white transition-all"
                onClick={() => setOpen(false)}
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
  );
}