import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stephanieyrodrigo.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/save-the-date', '/w/stephanie-y-rodrigo'],
        disallow: ['/admin/', '/i/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
