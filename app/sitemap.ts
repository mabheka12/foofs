// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { and, eq, sql } from 'drizzle-orm'

import { getDb } from '@/lib/db'
import { blogPosts, contractors } from '@/lib/db/schema'
import {
  roofingCategories,
  roofingProducts,
} from '@/data/roofing-products'
import { shouldIndexContractor } from '@/lib/contractorContent'
import { serviceGuides } from '@/lib/serviceGuides'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.roofernet.com'

  const baseUrl = configuredBaseUrl.replace(/\/+$/, '')
  const db = getDb()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/states`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
  url: `${baseUrl}/how-roofernet-works`,
  changeFrequency: 'monthly',
  priority: 0.7,
},
  ]

  try {
    const stateList = await db
      .select({
        stateSlug: contractors.stateSlug,
        latestUpdate: sql<Date | null>`
          MAX(${contractors.updatedAt})
        `,
      })
      .from(contractors)
      .where(
        and(
          eq(contractors.published, true),
          sql`${contractors.stateSlug} IS NOT NULL`
        )
      )
      .groupBy(contractors.stateSlug)

    const statePages: MetadataRoute.Sitemap = stateList
      .filter(
        (state): state is typeof state & { stateSlug: string } =>
          Boolean(state.stateSlug)
      )
      .map((state) => ({
        url: `${baseUrl}/${state.stateSlug}`,
        lastModified: state.latestUpdate || undefined,
        changeFrequency: 'weekly',
        priority: 0.9,
      }))

    /*
     * Do not add ?city= URLs. They are filtered views of the state page,
     * canonicalize to the state page and are marked noindex.
     */
    const contractorList = await db
      .select({
        name: contractors.name,
        slug: contractors.slug,
        stateSlug: contractors.stateSlug,
        updatedAt: contractors.updatedAt,
        description: contractors.description,
        address: contractors.address,
        phone: contractors.phone,
        website: contractors.website,
        city: contractors.city,
        state: contractors.state,
        stateAbbrev: contractors.state_abbrev,
        latitude: contractors.latitude,
        longitude: contractors.longitude,
        openingHours: contractors.openingHours,
        servicesOffered: contractors.servicesOffered,
        rating: contractors.rating,
        reviewCount: contractors.reviewCount,
        verified: contractors.verified,
        licenseNumber: contractors.licenseNumber,
        insuranceVerified: contractors.insuranceVerified,
      })
      .from(contractors)
      .where(eq(contractors.published, true))

    const contractorPages: MetadataRoute.Sitemap = contractorList
      .filter((contractor) => {
        return (
          Boolean(contractor.slug) &&
          Boolean(contractor.stateSlug) &&
          shouldIndexContractor({
            ...contractor,
            openingHours: contractor.openingHours
              ? JSON.stringify(contractor.openingHours)
              : null,
          })
        )
      })
      .map((contractor) => ({
        url: `${baseUrl}/${contractor.stateSlug}/${contractor.slug}`,
        lastModified: contractor.updatedAt || undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      }))

    const blogList = await db
      .select({
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))

    const blogPages: MetadataRoute.Sitemap = blogList
      .filter((post) => Boolean(post.slug))
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.publishedAt || undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      }))

    const productPages: MetadataRoute.Sitemap =
      roofingProducts.map((product) => ({
        url: `${baseUrl}/roofing-products/product/${product.slug}`,
        lastModified:
          'lastModified' in product
            ? (product.lastModified as string | Date | undefined)
            : undefined,
        changeFrequency: 'monthly',
        priority: 0.6,
      }))

    const categoryPages: MetadataRoute.Sitemap =
      roofingCategories.map((category) => ({
        url: `${baseUrl}/roofing-products/${category.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      }))

      const serviceGuidePages: MetadataRoute.Sitemap = Object.keys(
        serviceGuides
      ).map((slug) => ({
        url: `${baseUrl}/services/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
      }))

    return [
      ...staticPages,
      ...statePages,
      ...contractorPages,
      ...blogPages,
      ...productPages,
      ...categoryPages,
      ...serviceGuidePages
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)

    return staticPages
  }
}