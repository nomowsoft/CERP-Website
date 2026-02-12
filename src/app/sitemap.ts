import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://cerp.sa';
    const locales = ['ar', 'en'];
    const routes = ['', '/subscription', '/contact-us', '/backages_service'];

    const sitemapEntries: MetadataRoute.Sitemap = [];

    locales.forEach((locale) => {
        routes.forEach((route) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: route === '' ? 1 : 0.8,
            });
        });
    });

    return sitemapEntries;
}
