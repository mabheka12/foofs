// app/sitemap.ts
import { AmazonLinks } from '@/data/roofing-products';
import { getDb } from '@/lib/db'
import { contractors, blogPosts } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { roofingProducts, roofingCategories } from '@/data/roofing-products'

export type RoofingProduct = {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  description: string;
  amazon: AmazonLinks;
  features: string[];
  lastModified: string;
};

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roofernet.com'
  const db = getDb()

  // Static pages
  const staticPages = [
    '',
    '/services',
    '/blog',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/states',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  try {
    // ✅ State pages - from contractors table (no cities table needed)
    const stateList = await db
      .select({
        stateSlug: contractors.stateSlug,
        state: contractors.state,
      })
      .from(contractors)
      .where(eq(contractors.published, true))
      .groupBy(contractors.state, contractors.stateSlug)
    
    const statePages = stateList
      .filter(item => item.stateSlug) // Filter out null slugs
      .map(state => ({
        url: `${baseUrl}/${state.stateSlug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }))

    // ✅ City pages - from contractors table (no cities table needed)
    const cityList = await db
      .select({
        citySlug: contractors.citySlug,
        city: contractors.city,
        stateSlug: contractors.stateSlug,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(contractors)
      .where(eq(contractors.published, true))
      .groupBy(contractors.city, contractors.citySlug, contractors.stateSlug)
      .orderBy(sql`count DESC`)
      .limit(500) // Limit to prevent timeout
    
    const cityPages = cityList
      .filter(item => item.citySlug && item.stateSlug) // Filter out null slugs
      .map(({ citySlug, stateSlug }) => ({
        url: `${baseUrl}/${stateSlug}?city=${citySlug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

    // ✅ Contractor pages - from contractors table (no cities table needed)
    const contractorList = await db
      .select({
        slug: contractors.slug,
        stateSlug: contractors.stateSlug,
        updatedAt: contractors.updatedAt,
      })
      .from(contractors)
      .where(eq(contractors.published, true))
      .limit(1000) // Limit to prevent timeout

    const contractorPages = contractorList
      .filter(item => item.slug && item.stateSlug) // Filter out null slugs
      .map(({ slug, stateSlug, updatedAt }) => ({
        url: `${baseUrl}/${stateSlug}/${slug}`,
        lastModified: updatedAt || new Date().toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))

    // Blog pages
    const blogList = await db
      .select({
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))

    const blogPages = blogList.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt || new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
//products
    const productUrls = roofingProducts.map((product) => ({
  url: `${baseUrl}/roofing-products/product/${product.slug}`,
  lastModified: 'lastModified' in product
    ? product.lastModified
    : new Date().toISOString(),
  changeFrequency: "monthly" as const,
  priority: 0.6,
}));

const categoryUrls = roofingCategories.map((category) => ({
    url: `${baseUrl}/roofing-products/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

    return [
      ...staticPages,
      ...statePages,
      ...cityPages,
      ...contractorPages,
      ...blogPages,
      ...productUrls,
      ...categoryUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static pages if database fails
    return staticPages
  }
}