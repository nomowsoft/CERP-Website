"use client"
import Image from "next/image"
import Link from "next/link"

const NotFOUNFPAge = () => {
  return (
    <section className="fix-height m-auto pt-7 text-center">
      <div className="flex flex-col items-center">
        <Image
          src="/not_found/ERREUR 1.png"
          alt="Not Found"
          width={500}
          height={200}
        />
        <h1 className="text-3xl font-bold text-success mb-4">
          الصفحة غير موجودة
        </h1>
        <p className="text-gray-500 mb-6">
          عذرًا، الصفحة التي تبحث عنها غير موجودة. قد تكون قد تمت إزالتها أو تغيير عنوانها.
        </p>
        <Link href="/" className="bg-success text-white py-2 px-4 rounded">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </section>
  )
}

export default NotFOUNFPAge