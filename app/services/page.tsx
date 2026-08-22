// app/services/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { eq, sql } from 'drizzle-orm'
import {
  ArrowRight,
  BookOpen,
  Building,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react'

import { getDb } from '@/lib/db'
import { contractors, serviceTypes } from '@/lib/db/schema'
import { DirectoryDisclosure } from '@/components/directory/DirectoryDisclosure'

export const metadata: Metadata = {
  title: 'Roofing Service Guides and Contractor Directory',
  description:
    'Learn about common roofing services, compare project considerations and browse roofing contractors by state and location.',
  alternates: {
    canonical: '/services',
  },
}

export default async function ServicesPage() {
  const db = getDb()

  const [servicesList, directoryTotals, topCities] =
    await Promise.all([
      db
        .select()
        .from(serviceTypes)
        .orderBy(serviceTypes.name),

      db
        .select({
          totalContractors: sql<number>`COUNT(*)`,
          totalStates: sql<number>`
            COUNT(DISTINCT ${contractors.stateSlug})
          `,
          totalCities: sql<number>`
            COUNT(
              DISTINCT (
                ${contractors.stateSlug},
                ${contractors.citySlug}
              )
            )
          `,
        })
        .from(contractors)
        .where(eq(contractors.published, true)),

      db
        .select({
          cityName: contractors.city,
          citySlug: contractors.citySlug,
          stateName: contractors.state,
          stateSlug: contractors.stateSlug,
          stateAbbr: contractors.state_abbrev,
          contractorCount: sql<number>`
            COUNT(*)
          `.as('contractor_count'),
        })
        .from(contractors)
        .where(eq(contractors.published, true))
        .groupBy(
          contractors.city,
          contractors.citySlug,
          contractors.state,
          contractors.stateSlug,
          contractors.state_abbrev
        )
        .orderBy(sql`COUNT(*) DESC`)
        .limit(12),
    ])

  const totalContractors = Number(
    directoryTotals[0]?.totalContractors || 0
  )

  const totalStates = Number(
    directoryTotals[0]?.totalStates || 0
  )

  const totalCities = Number(
    directoryTotals[0]?.totalCities || 0
  )

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>

        <span className="mx-2">/</span>
        <span className="text-gray-800">Roofing Services</span>
      </nav>

      <header className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          <BookOpen className="h-4 w-4" />
          Roofing service guides
        </div>

        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
          Understand Common Roofing Services
        </h1>

        <p className="mt-5 max-w-3xl text-xl leading-relaxed text-gray-600">
          Learn what common roofing services involve, when they may be
          needed and what to discuss with a contractor before accepting
          an estimate.
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
          RooferNet does not currently verify service specializations for
          every listed contractor. Confirm the required service directly
          with any business you contact.
        </p>
      </header>

      <section
        aria-label="Directory statistics"
        className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl bg-blue-50 p-5 text-center">
          <Building className="mx-auto mb-2 h-6 w-6 text-blue-600" />

          <div className="text-2xl font-bold text-blue-700">
            {totalContractors.toLocaleString('en-US')}
          </div>

          <div className="text-sm text-gray-600">
            Published contractor listings
          </div>
        </div>

        <div className="rounded-xl bg-green-50 p-5 text-center">
          <MapPin className="mx-auto mb-2 h-6 w-6 text-green-600" />

          <div className="text-2xl font-bold text-green-700">
            {totalStates.toLocaleString('en-US')}
          </div>

          <div className="text-sm text-gray-600">
            States represented
          </div>
        </div>

        <div className="rounded-xl bg-purple-50 p-5 text-center">
          <Search className="mx-auto mb-2 h-6 w-6 text-purple-600" />

          <div className="text-2xl font-bold text-purple-700">
            {totalCities.toLocaleString('en-US')}
          </div>

          <div className="text-sm text-gray-600">
            Locations represented
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Browse Roofing Service Guides
          </h2>

          <p className="mt-2 max-w-3xl text-gray-600">
            Select a topic to understand the service, common warning
            signs and questions to ask when comparing contractors.
          </p>
        </div>

        {servicesList.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {servicesList.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-lg"
              >
                <div className="mb-4 text-4xl" aria-hidden="true">
                  {service.icon || '🔧'}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 transition group-hover:text-blue-600">
                  {service.name}
                </h3>

                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-600">
                  {service.description ||
                    `Learn what ${service.name.toLowerCase()} involves and what to discuss with a roofing contractor.`}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600">
                  Read service guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">
              Roofing service guides are being prepared.
            </p>

            <Link
              href="/states"
              className="mt-3 inline-block font-medium text-blue-600 hover:underline"
            >
              Browse contractors by state
            </Link>
          </div>
        )}
      </section>

      <section className="mb-12 rounded-2xl bg-gray-900 p-8 text-white">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Search the Contractor Directory
            </h2>

            <p className="mt-3 max-w-2xl leading-relaxed text-gray-300">
              Browse contractor listings by state and location. Compare
              available contact information, ratings and business
              details, then confirm project requirements directly with
              the contractor.
            </p>
          </div>

          <Link
            href="/states"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Browse all states
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Popular Contractor Locations
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {topCities.map((city) => {
            if (
              !city.cityName ||
              !city.citySlug ||
              !city.stateSlug
            ) {
              return null
            }

            return (
              <Link
                key={`${city.stateSlug}-${city.citySlug}`}
                href={`/${city.stateSlug}?city=${city.citySlug}`}
                className="rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="font-semibold text-gray-900">
                  {city.cityName}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  {city.stateAbbr || city.stateName}
                </div>

                <div className="mt-1 text-xs text-gray-400">
                  {Number(city.contractorCount).toLocaleString(
                    'en-US'
                  )}{' '}
                  listings
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mb-12 rounded-xl border border-gray-200 bg-white p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Before Contacting a Contractor
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <ShieldCheck className="mb-3 h-7 w-7 text-blue-600" />

            <h3 className="font-semibold text-gray-900">
              Check credentials
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Confirm licensing and insurance requirements applicable
              to your location and project.
            </p>
          </div>

          <div>
            <Search className="mb-3 h-7 w-7 text-blue-600" />

            <h3 className="font-semibold text-gray-900">
              Compare written estimates
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Compare the scope, materials, timeline, warranties and
              payment terms—not only the final price.
            </p>
          </div>

          <div>
            <Building className="mb-3 h-7 w-7 text-blue-600" />

            <h3 className="font-semibold text-gray-900">
              Confirm specialization
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Ask whether the contractor regularly works with your roof
              type and the specific repair or installation required.
            </p>
          </div>
        </div>
      </section>

      <DirectoryDisclosure />

      <section className="mt-12 rounded-xl border border-gray-200 bg-white p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Frequently Asked Questions
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-gray-900">
              Does RooferNet confirm each contractor’s services?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Not currently. Service pages explain common roofing work,
              but visitors should confirm specialization and
              availability directly with each contractor.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              How do I find contractors near me?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Browse the states directory and select a location filter
              to view published contractor listings in that area.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Does RooferNet provide roofing estimates?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              No. Estimates, project terms and contracts are provided
              directly by the businesses you contact.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Are all listed contractors verified?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              No. Unless a listing specifically shows a verified label,
              visitors should not assume RooferNet has independently
              verified its credentials.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}