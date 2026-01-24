import Image from "next/image";


export const ShowDownload = () => {
  return (
    <section className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col">
                <Image
                    src="/admin/SVG2.svg"
                    alt="Play Store"
                    width={40}
                    height={50}
                />
                <h2 className="text-xl font-doto2 mt-4">تفاصيل الإشتراك</h2>
                <p className="text-gray-500 mt-2">عؤض معلومات الإشتراك الحالي</p>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col">
                <Image
                    src="/admin/SVG1.svg"
                    alt="Play Store"
                    width={40}
                    height={50}
                />
                <h2 className="text-xl font-doto2 mt-4">جميع الفواتير</h2>
                <p className="text-gray-500 mt-2">استعرض وحمل الفواتير الخاصة بك.</p>
            </div>
        </div>
    </section>
  )
}
