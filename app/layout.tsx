// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { eq, sql } from 'drizzle-orm'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import './globals.css'

import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RoofingPromoRibbon from '@/components/business/RoofingPromoRibbon'
import { Toaster } from '@/components/ui/Toaster'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.roofernet.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    template: '%s | RooferNet',
    default: 'RooferNet – Roofing Contractor Directory',
  },

  description:
    'Browse roofing contractors by state and location. Compare available ratings, contact details and business information.',

  keywords: [
    'roofing contractors',
    'roofing directory',
    'roof repair',
    'roof inspection',
    'roof replacement',
    'roof maintenance',
  ],

  authors: [
    {
      name: 'RooferNet',
      url: siteUrl,
    },
  ],

  creator: 'RooferNet',
  publisher: 'RooferNet',

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'RooferNet – Roofing Contractor Directory',
    description:
      'Browse roofing contractors by state and location. Compare available ratings, contact details and business information.',
    url: '/',
    siteName: 'RooferNet',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RooferNet roofing contractor directory',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'RooferNet – Roofing Contractor Directory',
    description:
      'Browse roofing contractors by state and location. Compare available ratings, contact details and business information.',
    images: ['/og-image.jpg'],
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_ID,
  },

  category: 'Business Directory',
}

async function getStates() {
  try {
    const db = getDb()

    return await db
      .select({
        name: contractors.state,
        slug: contractors.stateSlug,
        count: sql<number>`COUNT(*)`.as('contractor_count'),
      })
      .from(contractors)
      .where(eq(contractors.published, true))
      .groupBy(
        contractors.state,
        contractors.stateSlug
      )
      .orderBy(contractors.state)
  } catch (error) {
    console.error('Unable to load navigation states:', error)
    return []
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const statesList = await getStates()

  const navStates = statesList
    .filter(
      (
        state
      ): state is typeof state & {
        name: string
        slug: string
      } => Boolean(state.name && state.slug)
    )
    .map((state) => ({
      name: state.name,
      slug: state.slug,
      count: Number(state.count) || 0,
    }))

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6988145475779418"
          crossOrigin="anonymous"
        />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-559VYGT9H5"
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            gtag('js', new Date());
            gtag('config', 'G-559VYGT9H5');
          `}
        </Script>
      </head>

      <body
        className={`${inter.className} flex min-h-screen flex-col`}
      >
        <RoofingPromoRibbon />

        <Navbar states={navStates} />

        <main className="flex-grow pt-16">
          {children}
        </main>

        <Footer states={navStates} />

        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}