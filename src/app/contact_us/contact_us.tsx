import Link from "next/link";

const Contactus = () => {
  return (
    <section className="py-20 lg:py-44">
      <div className="max-w-screen-lg mx-auto">
        <div className="bg-white shadow-2xl rounded-lg py-6 px-10">
          <h1 className="text-success text-center text-5xl font-extrabold">تواصل معنا</h1>
          <div className="py-10">
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="py-2">
                  <label htmlFor="name" className="text-success text-2xl">الاسم</label>
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
                  <label htmlFor="email" className="text-success text-2xl">البريد الإلكتروني</label>
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
                  <label htmlFor="phone" className="text-success text-2xl">رقم الهاتف</label>
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
                  <label htmlFor="address" className="text-success text-2xl">العنوان</label>
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
                  <label htmlFor="subject" className="text-success text-2xl">الموضوع</label>
                  <input
                    type="text"
                    className="border border-b-gray-500 border-r-white border-l-white border-t-white 
                    placeholder:text-gray-500 text-gray-500 text-xl font-bold w-full h-10 
                    focus:outline-none focus:border-b-success  focus:placeholder:text-success focus:text-success
                    hover:border-b-success transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-center mt-10">
                <Link
                  href="/contact_us"
                  className="mx-2 bg-success border border-success py-2 px-2 w-32 rounded-md flex justify-center items-center"
                >
                  <span className="mx-2 text-lg text-white">
                    إرسال
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
