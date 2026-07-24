// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/admin/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://roofernet.com'}/sitemap.xml`,
  }
}