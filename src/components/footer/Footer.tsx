import Image from 'next/image';
import Link from 'next/link';
import SocialMedia from './social_media';
import { FaLocationDot, FaPhone, FaEarthAmericas } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";


export default function Footer() {
  return (
    <footer className="bg-slate-100 bg-footer bg-no-repeat bg-contain bg-right-bottom shadow py-6 border  border-t-success">
        <div className="mx-5 md:mx-20 rounded-3xl py-4 lg:py-4">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <Link href="/" className="flex justify-center">
                        <Image height={20} width={100} src="/footer/cerp_logos.svg" alt="Flowbite Logo" />
                    </Link>
                    <ul className="text-center md:text-right my-6 text-xl text-success">
                        <li>
                            <Link href="/" className="hover:underline me-4 md:me-6">الرئسية</Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <SocialMedia />
                </div>
                <div className="mb-6 text-2xl text-success mx-8 mt-5 md:mr-0 md:mt-0">
                    <div className="flex flex-wrap justify-start">
                        <div className="mx-2">
                            <span><FaLocationDot /></span>
                        </div>
                        <div className="text-lg">
                            <p>P.O.Box 295940</p>
                            <p>12612 Riyadh</p>
                            <p>المملكة العربية السعودية</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-start mt-2">
                        <div className="mx-2">
                            <FaPhone />
                        </div>
                        <div>
                            <p className="text-lg">+966 53 780 2802</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-start mt-2">
                        <div className="mx-2">
                            <FaEarthAmericas />
                        </div>
                        <div>
                            <Link href="http://masa.sa" target="new">
                                <p className="text-lg">http://masa.sa</p>
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-start mt-2">
                        <div className="mx-2">
                            <MdEmail />
                        </div>
                        <div>
                            <p className="text-lg">info@masa.sa</p>
                        </div>
                    </div>
                </div>
            </div>
            <hr className="my-6 border-success sm:mx-auto " />
            <span className="block text-lg text-success text-center">2025 ©<Link href="https://www.odoo.com/partners/masa-lshrk-l-rby-lmtkhss-llstshrt-wtqny-lm-lwmt-988848?country_id=185" className="hover:underline" target="new">جميع الحقوق محفوظة لشركة ماسا</Link></span>
        </div>
    </footer>
  )
}
