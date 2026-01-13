"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const blogPosts = [
    {
        id: 1,
        titleKey: "dcHosting",
        descriptionKey: "dcHostingDesc",
        image: "/features/f1.svg",
    },
    {
        id: 2,
        titleKey: "processGovernance",
        descriptionKey: "processGovernanceDesc",
        image: "/features/f2.svg",
    },
    {
        id: 3,
        titleKey: "financialGovernance",
        descriptionKey: "financialGovernanceDesc",
        image: "/features/f3.svg",
    },
    {
        id: 4,
        titleKey: "cyberSecurity",
        descriptionKey: "cyberSecurityDesc",
        image: "/features/f4.svg",
    },
    {
        id: 5,
        titleKey: "supportMaintenance",
        descriptionKey: "supportMaintenanceDesc",
        image: "/features/f5.svg",
    },
    {
        id: 6,
        titleKey: "liveChat",
        descriptionKey: "liveChatDesc",
        image: "/features/f6.svg",
    },
    {
        id: 7,
        titleKey: "backup",
        descriptionKey: "backupDesc",
        image: "/features/f7.svg",
    },
    {
        id: 8,
        titleKey: "continuousDevelopment",
        descriptionKey: "continuousDevelopmentDesc",
        image: "/features/f8.svg",
    },
    {
        id: 9,
        titleKey: "systemIntegration",
        descriptionKey: "systemIntegrationDesc",
        image: "/features/f9.svg",
    },
];

export const Feature = () => {
    const t = useTranslations('features');
    return (
        <section className="mt-40 relative">
            <div className="absolute -top-30 right-10 w-40 h-40 sm:w-60 sm:h-60 md:w-72 md:h-72 bg-primary/15 rounded-full blur-3xl animate-float" />
            <section>
                <div className="container mx-auto px-4">
                    <div className="flex justify-center">
                        <span className="text-primary flex items-center gap-2 mb-4 border border-primary rounded-3xl px-4 py-2 bg-primary/10">
                            <span>{t('featuresTag')}</span>
                        </span>
                    </div>
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-doto2 font-bold mb-6">
                            {t.rich('featuresHeading', {
                                highlight: (chunks) => <span className="bg-gradient-to-l from-primary/50 to-primary bg-clip-text text-transparent font-bold leading-tight py-1 inline-block">{chunks}</span>
                            })}
                        </h1>
                        <p className="text-xl text-gray-500 mb-8">
                            {t('featuresSubHeading')}
                        </p>
                    </div>
                </div>
            </section>
            {/* Blogs Posts Grid */}
            <section className="bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-15">
                        {blogPosts.map((post) => (
                            <Card
                                key={post.id}
                                className="overflow-hidden group border-0 shadow-xl text-center transition-all duration-300 hover:-translate-y-2 rounded-3xl "
                            >
                                <div className="flex mt-5 items-center justify-center">
                                    <Image src={post.image} alt="" width={120} height={20} />
                                </div>
                                <CardHeader className="-mt-10">
                                    <CardTitle className="text-2xl mb-3 line-clamp-2 group-hover:text-primary font-doto2">
                                        {t(post.titleKey)}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3 text-gray-500 leading-8 text-lg">
                                        {t(post.descriptionKey)}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </section>
    );
};
