"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from 'react-toastify';
import { useTranslations } from "next-intl";

const ContactForm = () => {
    const t = useTranslations('contact.form');
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        organization: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success(t('successMessage'));
        setFormData({
            fullName: "",
            phone: "",
            email: "",
            organization: "",
            message: "",
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="bg-info rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold font-doto2 mb-8">
                {t('title')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="font-doto2">
                            {t('fullNameLabel')} *
                        </Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            placeholder={t('fullNamePlaceholder')}
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="bg-muted/50 border border-gray-400 h-12 rounded-lg placeholder:text-muted-foreground/60"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="font-doto2">
                            {t('phoneLabel')} *
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder={t('phonePlaceholder')}
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            dir="ltr"
                            className="bg-muted/50 border border-gray-500 h-12 rounded-lg text-left placeholder:text-muted-foreground/60"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-doto2">
                            {t('emailLabel')} *
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            value={formData.email}
                            onChange={handleChange}
                            required
                            dir="ltr"
                            className="bg-muted/50 border border-gray-500 h-12 rounded-lg placeholder:text-muted-foreground/60"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="organization" className="font-doto2">
                            {t('orgLabel')}
                        </Label>
                        <Input
                            id="organization"
                            name="organization"
                            placeholder={t('orgPlaceholder')}
                            value={formData.organization}
                            onChange={handleChange}
                            className="bg-muted/50 border border-gray-500 h-12 rounded-lg placeholder:text-muted-foreground/60"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message" className="font-doto2">
                        {t('messageLabel')} *
                    </Label>
                    <Textarea
                        id="message"
                        name="message"
                        placeholder={t('messagePlaceholder')}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="bg-muted/50 border border-gray-500 rounded-lg resize-none placeholder:text-muted-foreground/60"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-lg font-medium rounded-lg bg-gradient-to-l from-primary/60 font-bold from-5% via-primary via-50% to-primary to-90% text-info"
                >
                    {t('submitButton')}
                </Button>
            </form>
        </div>
    );
};

export default ContactForm;
