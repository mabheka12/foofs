// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/Toaster' 
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getDb } from '@/lib/db'
import { states } from '@/lib/db/schema'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Roof Leak Repair Directory',
    default: 'Roof Leak Repair Directory - Find Trusted Contractors Near You',
  },
  description: 'Find the best roof leak repair contractors in your area. Compare reviews, get free estimates, and find emergency roof repair services near you.',
}

async function getStates() {
  try {
    const db = getDb()
    return await db.select().from(states).orderBy(states.name)
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
  }))

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Add preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Navbar is now properly inside the body */}
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