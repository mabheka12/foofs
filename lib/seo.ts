// lib/seo.ts
import { Metadata } from 'next'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  openGraph?: {
    title?: string
    description?: string
    images?: string[]
    type?: 'website' | 'article' | 'profile'
  }
  robots?: {
    index?: boolean
    follow?: boolean
  }
  alternates?: {
    canonical?: string
    languages?: Record<string, string>
  }
}

export function generateMetadata({
  title,
  description,
  keywords,
  canonical,
  openGraph,
  robots = { index: true, follow: true },
  alternates,
}: SEOProps): Metadata {
  const siteName = 'Roof Leak Repair Directory'
  const defaultTitle = `${siteName} - Find Trusted Roof Leak Repair Contractors`
  const defaultDescription = 'Find the best roof leak repair contractors in your area. Compare reviews, get free estimates, and find emergency roof repair services near you.'

  return {
    title: title ? `${title} | ${siteName}` : defaultTitle,
    description: description || defaultDescription,
    keywords: keywords?.join(', '),
    robots: {
      index: robots.index,
      follow: robots.follow,
    },
    alternates,
    openGraph: {
      title: openGraph?.title || title || defaultTitle,
      description: openGraph?.description || description || defaultDescription,
      images: openGraph?.images || ['/og-image.jpg'],
      type: openGraph?.type || 'website',
      siteName,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: openGraph?.title || title || defaultTitle,
      description: openGraph?.description || description || defaultDescription,
      images: openGraph?.images || ['/og-image.jpg'],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_ID,
    },
    category: 'Roofing Services',
    authors: [{ name: 'Roof Leak Repair Directory' }],
  }
}