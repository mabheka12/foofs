// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/Toaster' 
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | RooferNet',
    default: 'RooferNet - Find Trusted Contractors Near You',
  },
  description: 'Find the best roof leak repair contractors in your area. Compare reviews, get free estimates, and find emergency roof repair services near you.',
  keywords: ['roof leak repair', 'roofing contractors', 'emergency roof repair', 'roof maintenance', 'roof repair services'],
  authors: [{ name: 'RooferNet', url: 'https://roofernet.com' }],
  creator: 'RooferNet',
  publisher: 'RooferNet',
  openGraph: {
    title: 'Find Roof Leak Repair Contractors Near You',
    description: 'Compare top-rated roof leak repair contractors. Get free estimates and find emergency service 24/7.',
    url: 'https://roofernet.com',
    siteName: 'RooferNet',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RooferNet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Roof Leak Repair Contractors Near You',
    description: 'Compare top-rated roof leak repair contractors. Get free estimates and find emergency service 24/7.',
    images: ['/og-image.jpg'],
  },
}



async function getStates() {
  try {
    const db = getDb()
    return await db.select().from(contractors).groupBy(contractors.state).orderBy(contractors.state)
  } catch {
    return []
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const statesList = await getStates()
  
  const navStates = statesList.map(s => ({
    name: s.name,
    slug: s.slug,
    count: (s as { count?: number }).count ?? 0,
  }))

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Add preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
         <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-559VYGT9H5"
          strategy="afterInteractive"
        />
          <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-559VYGT9H5');
          `}
        </Script>
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
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