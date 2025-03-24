import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
        <div className="bg-slate-200 py-14">
            <div className="xl:max-w-screen-2xl mx-auto relative flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-10 -mt-36">
                    <div className="flex items-center bg-white p-5 rounded-xl">
                        <Image src="/footer/Icon (1).png" alt="..." height={20} width={100} />
                        <div>
                            <p className="text-2xl text-success mx-2">
                                الموقع
                            </p>
                            <p className="text-gray-500 mx-2">
                            P.O.Box 295940 
                            </p>
                            <p className="text-gray-500 mx-2">
                            12612 Riyadh
                            </p>
                            <p className="text-gray-500 mx-2">
                                المملكة العربية السعودية
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center bg-white p-5 rounded-xl">
                        <Image src="/footer/Icon (2).png" alt="..." height={20} width={100} />
                        <div>
                            <p className="text-2xl text-success mx-2">
                                رقم التواصل
                            </p>
                            <p className="text-gray-500 mx-2">
                            +966 53 780 2802
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center bg-white p-5 rounded-xl">
                        <Image src="/footer/Icon (3).png" alt="..." height={20} width={100} />
                        <div>
                            <p className="text-2xl text-success mx-2">
                            الموقع الإلكتروني
                            </p>
                            <p className="text-gray-500 mx-2">
                            https://masa.sa
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center bg-white p-5 rounded-xl">
                        <Image src="/footer/Icon (4).png" alt="..." height={20} width={100} />
                        <div>
                            <p className="text-2xl text-success mx-2">
                            البريد الإلكتروني
                            </p>
                            <p className="text-gray-500 mx-2">
                            info@masa.sa
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-5 md:mx-20 rounded-3xl">
                <div className="lg:flex items-center justify-center">
                    <div className="py-10 lg:w-1/2">
                        <Link href="/" className="flex justify-center">
                            <Image height={20} width={250} src="/footer/cerp 1.png" alt="Flowbite Logo" />
                        </Link>
                    </div>
                    <div className="lg:w-1/9 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-20 lg:mx-10 px-10 text-center">
                        <div className="lg:text-2xl text-success ">
                            <Link href="/">
                                الرئسية
                            </Link>
                        </div>
                        <div className="lg:text-2xl text-success">
                            <Link href="#">
                            قصص النجاح
                            </Link>
                        </div>
                        <div className="lg:text-2xl text-success">
                            <Link href="#">
                            الأسئلة الشائعة
                            </Link>
                        </div>
                        <div className="lg:text-2xl text-success">
                            <Link href="#">
                            الدعم الفني والمساعدة
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="py-8 text-center">
            <p className="text-xl text-gray-600">
                2025 © جميع الحقوق محفوظة لشركة ماسا
            </p>
        </div>
    </footer>
  )
}
