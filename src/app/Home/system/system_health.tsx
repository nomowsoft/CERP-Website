"use client";
import Image from "next/image";
import { useState } from "react";
import { health } from "@/utils/data";

const SystemHealth = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-screen-xl mx-auto mt-10 px-4">
      <div className="rounded-3xl bg-slate-500 text-white bg-hifz relative bg-cover bg-no-repeat" data-aos="zoom-in">
        <div className="flex flex-col md:flex-row">
          <div className="mt-6 md:mt-0  md:mr-10 text-center md:text-right">
            <h1 className="text-white text-2xl md:text-4xl font-bold leading-snug mt-20">
            نظام ســرب لجمعيات الخدمات الصحية
            </h1>
            <p className="text-white mt-4 md:ml-12 text-xl text-center md:text-right">
                     رحلة المستفيد من التسجيل على البوابة أو التطبيق وتقديم الطلب والإنتهاء بإكمال الخدمة من خلال اجراءات محوكمة
            </p>
            <div className="flex md:justify-start justify-center">
                <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-success text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center mt-10 mb-5"
                >
                تعرف على المزيد عن النظام
                <div className="bg-gray-500 rounded p-1 mr-2 flex justify-center items-center">
                    <Image
                    src={isOpen ? "/system/Vector2.png" : "/system/Vector.png"}
                    alt="Toggle Icon"
                    height={20}
                    width={20}
                    />
                </div>
                </button>
            </div>
          </div>
          <Image
                src="/system_hifz/New Project (4).png"
                alt="System Image"
                height={200}
                width={5000}
                className="w-full md:w-auto"
            />
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          <div className="md:col-span-5">
            {health.slice(0, 7).map((item) => (
              <div className="flex items-center mt-4" key={item.id}>
                <div className="flex-shrink-0">
                  <Image
                    src="/features/Group3.svg"
                    alt="Feature Icon"
                    width={30}
                    height={20}
                  />
                </div>
                <div className="ml-4 py-4">
                  <h1 className="text-lg md:text-xl text-success">{item.title}</h1>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:flex justify-center items-center md:col-span-1">
            <Image src="/system/Line 5.png" alt="Divider" width={4} height={200} />
          </div>

          <div className="md:col-span-6">
            {health.slice(7, 14).map((item) => (
              <div className="flex items-center mt-4" key={item.id}>
                <div className="flex-shrink-0">
                  <Image
                    src="/features/Group3.svg"
                    alt="Feature Icon"
                    width={30}
                    height={20}
                  />
                </div>
                <div className="ml-4 py-4">
                  <h1 className="text-lg md:text-xl text-success">{item.title}</h1>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;