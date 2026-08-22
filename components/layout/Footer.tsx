// components/layout/Footer.tsx
import Link from 'next/link'
import { eq, sql } from 'drizzle-orm'
import {
  Award,
  Building,
  Mail,
  MapPin,
  SearchCheck,
} from 'lucide-react'

import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { BusinessActions } from '../business/BusinessActions'

interface FooterProps {
  states?: { name: string; slug: string }[]
  cities?: { name: string; slug: string; stateSlug: string }[]
}

export default async function Footer({
  states: _states = [],
  cities: _cities = [],
}: FooterProps) {
  const db = getDb()
  const currentYear = new Date().getFullYear()

  const [statesWithCounts, totalsResult] = await Promise.all([
    db
      .select({
        name: contractors.state,
        slug: contractors.stateSlug,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(contractors)
      .where(eq(contractors.published, true))
      .groupBy(contractors.state, contractors.stateSlug)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(12),

    db
      .select({
        totalContractors: sql<number>`COUNT(*)`,
        totalStates: sql<number>`
          COUNT(DISTINCT ${contractors.stateSlug})
        `,
      })
      .from(contractors)
      .where(eq(contractors.published, true)),
  ])

  const footerStates = statesWithCounts
    .filter((item) => item.name && item.slug)
    .map((item) => ({
      name: item.name as string,
      slug: item.slug as string,
      count: Number(item.count) || 0,
    }))

  const totalContractors = Number(
    totalsResult[0]?.totalContractors || 0
  )

  const totalStates = Number(
    totalsResult[0]?.totalStates || 0
  )

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
                RN
              </div>

              <div>
                <span className="text-xl font-bold text-white">
                  Roofer
                </span>
                <span className="-mt-1 block text-xl text-gray-400">
                  Net.com
                </span>
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              Explore roofing contractors by state and location.
              Compare available ratings, contact details and business
              information before contacting a provider.
            </p>

            <Link
              href="/how-roofernet-works"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              <SearchCheck className="h-4 w-4" />
              How RooferNet works
            </Link>
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-white">
              Quick Links
            </h2>

            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/states" className="hover:text-white">
                  Browse States
                </Link>
              </li>

              <li>
                <Link href="/services" className="hover:text-white">
                  Services
                </Link>
              </li>

              <li>
                <Link href="/blog" className="hover:text-white">
                  Roofing Guides
                </Link>
              </li>

              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/how-roofernet-works"
                  className="hover:text-white"
                >
                  How RooferNet Works
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>

            <h2 className="mb-4 mt-6 font-semibold text-white">
              For Businesses
            </h2>

            <BusinessActions variant="footer" />
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-white">
              Top States
            </h2>

            <div className="grid grid-cols-2 gap-1">
              {footerStates.map((state) => (
                <Link
                  key={state.slug}
                  href={`/${state.slug}`}
                  className="py-0.5 text-sm transition hover:text-white"
                >
                  {state.name} ({state.count})
                </Link>
              ))}

              {totalStates > 12 && (
                <Link
                  href="/states"
                  className="py-1 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  View all states →
                </Link>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-white">
              Contact and Directory
            </h2>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />

                <div>
                  <div className="font-medium text-white">
                    Email
                  </div>

                  <a
                    href="mailto:info@roofernet.com"
                    className="hover:text-white"
                  >
                    info@roofernet.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />

                <div>
                  <div className="font-medium text-white">
                    Coverage
                  </div>

                  <span>
                    Contractors listed across {totalStates} states
                  </span>
                </div>
              </li>
            </ul>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-xs">
                <Building className="h-4 w-4 text-blue-400" />

                <span>
                  {totalContractors.toLocaleString('en-US')} listings
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-xs">
                <Award className="h-4 w-4 text-yellow-400" />

                <span>Business claims available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-400 md:flex-row">
            <p>
              &copy; {currentYear} RooferNet.com. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                href="/how-roofernet-works"
                className="hover:text-white"
              >
                Directory Methodology
              </Link>

              <Link
                href="/privacy-policy"
                className="hover:text-white"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="hover:text-white"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}