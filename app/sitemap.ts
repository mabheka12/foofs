// app/sitemap.ts
import { getDb } from '@/lib/db'
import { states, cities, contractors, blogPosts } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roofleakrepaird.com'
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
    // State pages - only get states (lightweight)
    const stateList = await db.select({
      slug: states.slug,
    }).from(states)
    
    const statePages = stateList.map(state => ({
      url: `${baseUrl}/${state.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    // City pages - get cities with their state slugs
    const cityList = await db
      .select({
        citySlug: cities.slug,
        stateSlug: states.slug,
      })
      .from(cities)
      .innerJoin(states, eq(cities.stateId, states.id))
      .limit(500) // Limit to prevent timeout
    
    const cityPages = cityList.map(({ citySlug, stateSlug }) => ({
      url: `${baseUrl}/${stateSlug}/${citySlug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Contractor pages - only get published contractors
    const contractorList = await db
      .select({
        contractorSlug: contractors.slug,
        citySlug: cities.slug,
        stateSlug: states.slug,
        updatedAt: contractors.updatedAt,
      })
      .from(contractors)
      .innerJoin(cities, eq(contractors.cityId, cities.id))
      .innerJoin(states, eq(contractors.stateId, states.id))
      .where(eq(contractors.published, true))
      .limit(1000) // Limit to prevent timeout

    const contractorPages = contractorList.map(({ contractorSlug, citySlug, stateSlug, updatedAt }) => ({
      url: `${baseUrl}/${stateSlug}/${citySlug}/${contractorSlug}`,
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

    return [
      ...staticPages,
      ...statePages,
      ...cityPages,
      ...contractorPages,
      ...blogPages,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static pages if database fails
    return staticPages
  }
}