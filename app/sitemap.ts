// app/sitemap.ts
import { db } from '@/lib/db'
import { states, cities, contractors, blogPosts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roofleakrepaird.com'

  // Static pages
  const staticPages = [
    '',
    '/services',
    '/blog',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  // State pages
  const stateList = await db.select().from(states)
  const statePages = stateList.map(state => ({
    url: `${baseUrl}/${state.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // City pages
  const cityList = await db
    .select()
    .from(cities)
    .innerJoin(states, eq(cities.stateId, states.id))
  
  const cityPages = cityList.map(({ cities, states }) => ({
    url: `${baseUrl}/${states.slug}/${cities.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Contractor pages
  const contractorList = await db
    .select()
    .from(contractors)
    .innerJoin(cities, eq(contractors.cityId, cities.id))
    .innerJoin(states, eq(contractors.stateId, states.id))
    .where(eq(contractors.published, true))

  const contractorPages = contractorList.map(({ contractors, cities, states }) => ({
    url: `${baseUrl}/${states.slug}/${cities.slug}/${contractors.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Blog pages
  const blogList = await db
    .select()
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
}