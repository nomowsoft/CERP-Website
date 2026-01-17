"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const blogPosts = [
    {
        id: 1,
        titleKey: "post1Title",
        excerptKey: "post1Excerpt",
        dateKey: "post1Date",
        categoryKey: "post1Category",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
        image2: "/news/partner.svg",
        readTimeKey: "post1ReadTime"
    },
    {
        id: 2,
        titleKey: "post2Title",
        excerptKey: "post2Excerpt",
        dateKey: "post2Date",
        categoryKey: "post2Category",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        image2: "/news/new.svg",
        readTimeKey: "post2ReadTime"
    },
    {
        id: 3,
        titleKey: "post3Title",
        excerptKey: "post3Excerpt",
        dateKey: "post3Date",
        categoryKey: "post3Category",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop",
        image2: "/news/certifecat.svg",
        readTimeKey: "post3ReadTime"
    },
];

export const News = () => {
    const t = useTranslations('news');
    return (
        <section className="my-10 container mx-auto px-4 lg:px-20 xl:px-20 2xl:px-0">
            <section>
                <div className="flex justify-center">
                    <span className="text-primary flex items-center gap-2 mb-4 border border-primary rounded-3xl px-4 py-2 bg-primary/10">
                        <Image src="/news/Vector.svg" height={40} width={20} alt="..." />
                        <span>{t('tag')}</span>
                    </span>
                </div>
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
                        {t.rich('heading', {
                            highlight: (chunks) => <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">{chunks}</span>
                        })}
                    </h1>
                    <p className="text-xl text-gray-500 mb-8">
                        {t('subHeading')}
                    </p>
                </div>
            </section>
            {/* Blogs Posts Grid */}
            <section className="bg-background">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Card
                            key={post.id}
                            className="overflow-hidden group border-0 shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-3xl "
                        >
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={t(post.titleKey)}
                                    width={5000}
                                    height={20}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="flex mt-5 items-center">
                                <div>
                                    <Image src={post.image2} alt="" width={90} height={20} className="hover:-rotate-45" />
                                </div>
                                <div>
                                    <span className="border border-primary rounded-3xl px-3 py-2 bg-primary/10">
                                        {t(post.categoryKey)}
                                    </span>
                                    <div className="flex items-center gap-4 text-lg text-muted-foreground mt-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {t(post.dateKey)}
                                        </div>
                                        <div>{t(post.readTimeKey)}</div>
                                    </div>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl mb-3 line-clamp-2 group-hover:text-primary font-doto2">
                                    {t(post.titleKey)}
                                </CardTitle>
                                <CardDescription className="line-clamp-3 text-gray-500 h-15">
                                    {t(post.excerptKey)}
                                </CardDescription>
                            </CardHeader>
                            <hr className="text-gray-500 mx-5" />
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between text-primary">
                                    <Button variant="ghost" size="lg" className="items-center">
                                        <span className="text-xl font-bold">{t('readMore')}</span>
                                        <ArrowLeft className="w-6 h-6 ms-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </section>
    );
};
