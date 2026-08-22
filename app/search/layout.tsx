// app/search/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Contractor Listings',

  description:
    'Search RooferNet contractor listings by business name, city, state and available rating information.',

  alternates: {
    canonical: '/search',
  },

  robots: {
    index: false,
    follow: true,
  },
}

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}