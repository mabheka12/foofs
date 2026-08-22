// app/states/page.tsx
import Link from 'next/link'
import {
  Building,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { eq, sql } from 'drizzle-orm'

import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { DirectoryDisclosure } from '@/components/directory/DirectoryDisclosure'
import { FAQSchema } from '@/components/seo/FAQSchema'

export const metadata = generateSeoMetadata({
  title: 'Roofing Contractors by State',

  description:
    'Browse published roofing contractor listings by state and location. Compare available ratings, contact details and business information.',

  keywords: [
    'roofing contractors by state',
    'roofing directory',
    'roofing contractors',
    'roof repair directory',
  ],

  canonical: '/states',
})

const faqs = [
  {
    question:
      'How do I find contractors in my state?',

    answer:
      'Select a state or district from the directory. On the resulting page, you can browse published listings and use the city filters to narrow the results.',
  },
  {
    question:
      'Are all contractors verified by RooferNet?',

    answer:
      'No. Unless a listing specifically displays a verified label, visitors should not assume RooferNet has independently verified its credentials. Confirm licensing, insurance and other important information directly.',
  },
  {
    question:
      'Can I filter contractors by roofing service?',

    answer:
      'RooferNet does not currently verify service specializations across every listing. The roofing service pages are educational guides; confirm the required service directly with each contractor.',
  },
  {
    question:
      'How current is the contractor information?',

    answer:
      'Listing information can change. RooferNet displays an available update date on contractor pages and provides a way to report inaccurate information, but important details should still be confirmed directly.',
  },
]

interface StateSummary {
  name: string
  slug: string
  abbreviation: string | null
  contractorCount: number
  cityCount: number
}

export default async function StatesPage() {
  const db = getDb()

  const statesWithCounts = await db
    .select({
      state: contractors.state,
      stateSlug: contractors.stateSlug,
      stateAbbrev: contractors.state_abbrev,

      contractorCount: sql<number>`
        COUNT(*)
      `.as('contractor_count'),

      cityCount: sql<number>`
        COUNT(
          DISTINCT ${contractors.citySlug}
        )
      `.as('city_count'),
    })
    .from(contractors)
    .where(eq(contractors.published, true))
    .groupBy(
      contractors.state,
      contractors.stateSlug,
      contractors.state_abbrev
    )
    .orderBy(
      sql`COUNT(*) DESC`,
      contractors.state
    )

  const formattedStates: StateSummary[] =
    statesWithCounts
      .filter(
        (
          item
        ): item is typeof item & {
          state: string
          stateSlug: string
        } =>
          Boolean(
            item.state &&
              item.stateSlug
          )
      )
      .map((item) => ({
        name: item.state,
        slug: item.stateSlug,
        abbreviation:
          item.stateAbbrev || null,
        contractorCount:
          Number(item.contractorCount) || 0,
        cityCount:
          Number(item.cityCount) || 0,
      }))

  const topStates = formattedStates.slice(0, 5)

  const totalContractors =
    formattedStates.reduce(
      (sum, state) =>
        sum + state.contractorCount,
      0
    )

  const totalLocations =
    formattedStates.reduce(
      (sum, state) =>
        sum + state.cityCount,
      0
    )

  const totalStatePages =
    formattedStates.length

  const largestStateCount =
    topStates[0]?.contractorCount || 1

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      <FAQSchema faqs={faqs} />

      <nav className="mb-8 text-sm text-gray-600">
        <Link
          href="/"
          className="hover:text-blue-600"
        >
          Home
        </Link>

        <span className="mx-2">/</span>

        <span className="text-gray-800">
          States
        </span>
      </nav>

      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
          Roofing Contractors by State
        </h1>

        <p className="mt-5 max-w-3xl text-xl leading-relaxed text-gray-600">
          Browse published roofing contractor listings across the
          United States and the District of Columbia. Select an area to
          view available ratings, contact details, locations and
          business information.
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
          A listing’s presence in the directory is not an endorsement.
          Confirm credentials, availability and project requirements
          directly with any contractor you contact.
        </p>
      </header>

      <section
        aria-label="Directory statistics"
        className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-lg bg-blue-50 p-5 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {totalStatePages.toLocaleString(
              'en-US'
            )}
          </div>

          <div className="mt-1 text-sm text-gray-600">
            State and District Pages
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-5 text-center">
          <div className="text-3xl font-bold text-green-600">
            {totalContractors.toLocaleString(
              'en-US'
            )}
          </div>

          <div className="mt-1 text-sm text-gray-600">
            Published Listings
          </div>
        </div>

        <div className="rounded-lg bg-purple-50 p-5 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {totalLocations.toLocaleString(
              'en-US'
            )}
          </div>

          <div className="mt-1 text-sm text-gray-600">
            Locations Represented
          </div>
        </div>
      </section>

      {topStates.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Largest State Directories
          </h2>

          <p className="mb-6 max-w-3xl text-gray-600">
            These areas currently contain the largest numbers of
            published contractor listings on RooferNet.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {topStates.map((state) => {
              const relativeWidth = Math.min(
                (state.contractorCount /
                  largestStateCount) *
                  100,
                100
              )

              return (
                <Link
                  key={state.slug}
                  href={`/${state.slug}`}
                  className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="text-lg font-bold text-gray-900 transition group-hover:text-blue-600">
                      {state.name}
                    </span>

                    {state.abbreviation && (
                      <span className="text-sm font-medium text-gray-500">
                        {state.abbreviation}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-blue-500" />

                      {state.contractorCount.toLocaleString(
                        'en-US'
                      )}{' '}
                      listings
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-blue-500" />

                      {state.cityCount.toLocaleString(
                        'en-US'
                      )}{' '}
                      locations
                    </span>
                  </div>

                  <div className="mt-4 h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-blue-600"
                      style={{
                        width: `${relativeWidth}%`,
                      }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            All State and District Pages
          </h2>

          <p className="mt-2 text-gray-600">
            Counts reflect currently published RooferNet listings and
            distinct location values.
          </p>
        </div>

        {formattedStates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {formattedStates.map((state) => (
              <Link
                key={state.slug}
                href={`/${state.slug}`}
                className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="font-semibold text-gray-900 transition group-hover:text-blue-600">
                    {state.name}
                  </span>

                  {state.abbreviation && (
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                      {state.abbreviation}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />

                    {state.contractorCount.toLocaleString(
                      'en-US'
                    )}
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />

                    {state.cityCount.toLocaleString(
                      'en-US'
                    )}
                  </span>
                </div>

                <div className="mt-3 text-xs text-blue-600">
                  View published listings →
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-10 text-center">
            <p className="text-gray-600">
              No published state directories are currently available.
            </p>
          </div>
        )}
      </section>

      <section className="mt-12">
        <DirectoryDisclosure />
      </section>

      <section className="mt-12 rounded-xl bg-gray-50 p-6 md:p-8">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Frequently Asked Questions
        </h2>

        <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-lg border border-gray-200 bg-white p-5"
            >
              <summary className="cursor-pointer list-none font-semibold text-gray-900">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}

                  <span className="text-blue-600 transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>

              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}