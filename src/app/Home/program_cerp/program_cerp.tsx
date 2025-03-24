import Image from 'next/image'
import { program } from '@/utils/data';

const Program = () => {
    return (
        <section className="md:bg-hero bg-cover bg-no-repeat py-44">
            <div className="max-w-screen-xl mx-5 md:mx-auto">
                <h1 className="text-center text-success pb-20 text-5xl" data-aos="zoom-in">
                    يحتوي نظام سرب على الانظمة التالية
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-5">
                    {program.map((item) => (
                        <div className="bg-white rounded-lg px-4 py-2 text-center h-34" key={item.id} data-aos="zoom-in">
                            <div className="flex justify-center items-center">
                                <Image src={item.image} alt="..." width={60} height={20} />
                            </div>
                            <h1 className="mt-3">
                                {item.title}
                            </h1>
                        </div>
                    ))
                    }
                </div>
            </div>
        </section>
    )
}

export default Program