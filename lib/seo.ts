// lib/seo.ts
import type { Metadata } from 'next'

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

const SITE_NAME = 'RooferNet'

const DEFAULT_TITLE =
  'RooferNet – Roofing Contractor Directory'

const DEFAULT_DESCRIPTION =
  'Browse roofing contractors by state and location. Compare available ratings, contact details and business information.'

export function generateMetadata({
  title,
  description,
  keywords,
  canonical,
  openGraph,
  robots = {
    index: true,
    follow: true,
  },
  alternates,
}: SEOProps): Metadata {
  const pageTitle = title || DEFAULT_TITLE
  const pageDescription =
    description || DEFAULT_DESCRIPTION

  const socialTitle = title
    ? `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE

  const canonicalUrl =
    canonical || alternates?.canonical

  return {
    /*
     * The root layout applies "%s | RooferNet" to page titles.
     * Do not append the brand here, or titles become duplicated.
     */
    title: pageTitle,

    description: pageDescription,

    keywords,

    robots: {
      index: robots.index ?? true,
      follow: robots.follow ?? true,
    },

    alternates: {
      ...alternates,
      canonical: canonicalUrl,
    },

    openGraph: {
      title:
        openGraph?.title || socialTitle,

      description:
        openGraph?.description || pageDescription,

      images:
        openGraph?.images || ['/og-image.jpg'],

      type:
        openGraph?.type || 'website',

      siteName: SITE_NAME,

      url: canonicalUrl,
    },

    twitter: {
      card: 'summary_large_image',

      title:
        openGraph?.title || socialTitle,

      description:
        openGraph?.description || pageDescription,

      images:
        openGraph?.images || ['/og-image.jpg'],
    },

    verification: {
      google:
        process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_ID,
    },

    category: 'Business Directory',

    authors: [
      {
        name: SITE_NAME,
      },
    ],

    creator: SITE_NAME,
    publisher: SITE_NAME,
  }
}