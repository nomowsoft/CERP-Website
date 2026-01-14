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
  const t = useTranslations("header");
  const local = useLocale();

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

  return (
    <header>
      <nav className={`top-0 left-0 right-0 z-50 ${['/ar', '/en'].includes(pathname) ? 'fixed bg-info/10' : 'bg-info'}`}>
        <div className="flex flex-wrap justify-between items-center lg:mx-10 xl:mx-20 py-4">
          <Link href="/" className="flex items-center px-5 lg:px-0">
            <Image
              height={20}
              width={150}
              src="/header/CERP.svg"
              alt="Logo"
            />
          </Link>
          <div className="hidden lg:block">
            <Navlink />
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            <LanguageSwitcher />
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
            <div className="inset-0 z-[999] h-screen flex justify-center bg-success/20 backdrop-blur-sm lg:hidden mb-20 w-full">
              <nav className="py-4">
                <div className="mt-4 text-center text-success text-2xl font-bold">
                  <Navlink />
                </div>
                <div className="mt-8 flex justify-center gap-4">
                  <LanguageSwitcher />
                </div>
                <div className="mt-10">
                  <Link
                    href={`/${local}/contact-us`}
                    className="mx-2 bg-gradient-to-r from-primary to-emerald-600 text-info py-3 px-8 rounded-xl text-xl font-extrabold"
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