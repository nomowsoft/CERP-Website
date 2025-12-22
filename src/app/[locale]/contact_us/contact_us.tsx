import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const Contactus = () => {
  const t = useTranslations('contact');
  return (
    <section className="py-20 lg:py-44 bg-system bg-cover bg-no-repeat bg-white">
      <div className="max-w-screen-lg mx-auto">
        <div className="bg-white shadow-2xl rounded-lg py-10 px-10">
          <h1 className="text-success text-center text-5xl font-extrabold">{t('title')}</h1>
          <div className="py-10">
            <form>
              <div className="flex  items-center"> 
                <div className="lg:flex justify-center items-center ml-10 hidden">
                  <Image
                    src="/contact_us/image.png"
                    alt="..."
                    width={50}
                    height={300}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="py-2">
                    <label htmlFor="name" className="text-success text-2xl">{t('name')}</label>
                    <input
                      id="name"
                      type="text"
                      className="border border-b-gray-500 border-r-white border-l-white border-t-white 
                      placeholder:text-gray-500 text-gray-500 text-xl font-bold w-full h-10 
                      focus:outline-none focus:border-b-success  focus:placeholder:text-success focus:text-success
                      hover:border-b-success transition-all"
                    />
                  </div>
                  <div className="py-2">
                    <label htmlFor="email" className="text-success text-2xl">{t('email')}</label>
                    <input
                      id="email"
                      type="text"
                      className="border border-b-gray-500 border-r-white border-l-white border-t-white 
                      placeholder:text-gray-500 text-gray-500 text-xl font-bold w-full h-10 
                      focus:outline-none focus:border-b-success  focus:placeholder:text-success focus:text-success
                      hover:border-b-success transition-all"
                    />
                  </div>
                  <div className="py-2">
                    <label htmlFor="phone" className="text-success text-2xl">{t('phone')}</label>
                    <input
                      id="phone"
                      type="text"
                      className="border border-b-gray-500 border-r-white border-l-white border-t-white 
                      placeholder:text-gray-500 text-gray-500 text-xl font-bold w-full h-10 
                      focus:outline-none focus:border-b-success  focus:placeholder:text-success focus:text-success
                      hover:border-b-success transition-all"
                    />
                  </div>
                  <div className="py-2">
                    <label htmlFor="address" className="text-success text-2xl">{t('address')}</label>
                    <input
                      id="address"
                      type="text"
                      className="border border-b-gray-500 border-r-white border-l-white border-t-white 
                      placeholder:text-gray-500 text-gray-500 text-xl font-bold w-full h-10 
                      focus:outline-none focus:border-b-success  focus:placeholder:text-success focus:text-success
                      hover:border-b-success transition-all"
                    />
                  </div>
                  <div className="py-2">
                    <label htmlFor="company" className="text-success text-2xl">{t('organization')}</label>
                    <input
                      id="company"
                      type="text"
                      className="border border-b-gray-500 border-r-white border-l-white border-t-white 
                      placeholder:text-gray-500 text-gray-500 text-xl font-bold w-full h-10 
                      focus:outline-none focus:border-b-success  focus:placeholder:text-success focus:text-success
                      hover:border-b-success transition-all"
                    />
                  </div>
                  <div className="py-2">
                    <label htmlFor="subject" className="text-success text-2xl">{t('subject')}</label>
                    <input
                      type="text"
                      className="border border-b-gray-500 border-r-white border-l-white border-t-white 
                      placeholder:text-gray-500 text-gray-500 text-xl font-bold w-full h-10 
                      focus:outline-none focus:border-b-success  focus:placeholder:text-success focus:text-success
                      hover:border-b-success transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-10">
                <Link
                  href="/contact_us"
                  className="mx-2 bg-success border border-success py-2 px-2 w-32 rounded-md flex justify-center items-center"
                >
                  <span className="mx-2 text-lg text-white">
                    {t('send')}
                  </span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contactus;