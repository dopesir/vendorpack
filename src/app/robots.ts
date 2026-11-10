import { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nobuswork.pages.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/upload'],
        disallow: ['/api/', '/download/', '/report/']
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Googlebot', 'Bingbot'],
        allow: ['/', '/upload'],
        disallow: ['/api/', '/download/', '/report/']
      }
    ],
    sitemap: `${appUrl}/sitemap.xml`
  };
}
