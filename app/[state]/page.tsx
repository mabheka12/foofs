// app/[state]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { and, eq, sql } from 'drizzle-orm'
import { Building, ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react'

import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { stateIntros } from '@/lib/stateIntros'
import { getFaqsForState } from '@/lib/stateFaqs'
import { FeaturedContractors } from '@/components/directory/FeaturedContractors'
import { ContractorCard } from '@/components/directory/ContractorCard'
import { StateFaqSection } from '@/components/directory/StateFaqSection'
import AdvertiseCta from '@/components/business/AdvertiseCta'

const CONTRACTORS_PER_PAGE = 24

interface StatePageProps {
  params: Promise<{
    state: string
  }>
  searchParams: Promise<{
    city?: string
    page?: string
  }>
}

function formatSlug(slug: string) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function parsePageNumber(value?: string) {
  if (!value) return 1

  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

function buildPageHref({
  stateSlug,
  selectedCity,
  page,
}: {
  stateSlug: string
  selectedCity?: string
  page: number
}) {
  const params = new URLSearchParams()

  if (selectedCity) {
    params.set('city', selectedCity)
  }

  if (page > 1) {
    params.set('page', String(page))
  }

  const query = params.toString()

  return query ? `/${stateSlug}?${query}` : `/${stateSlug}`
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ])

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
}

export async function generateMetadata({
  params,
  searchParams,
}: StatePageProps): Promise<Metadata> {
  const { state } = await params
  const { city, page } = await searchParams

  if (!state) {
    return {
      title: 'State Not Found',
      description: 'The state you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const db = getDb()
  const stateName = formatSlug(state)
  const currentPage = parsePageNumber(page)

  const stateExists = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(contractors)
    .where(
      and(
        eq(contractors.published, true),
        eq(contractors.stateSlug, state)
      )
    )

  if (!Number(stateExists[0]?.count)) {
    return {
      title: 'State Not Found',
      description: 'The state you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const metadata = generateSeoMetadata({
    title:
      currentPage > 1
        ? `Roofing Contractors in ${stateName} - Page ${currentPage}`
        : `Roofing Contractors in ${stateName}`,
    description: `Find trusted roofing contractors in ${stateName}. Compare ratings, contact details and available roofing services.`,
    keywords: [
      `roofing ${stateName}`,
      `roofing contractors ${stateName}`,
      `roof repair ${stateName}`,
    ],
    canonical: `/${state}`,
  })

  return {
    ...metadata,

    // City filters and pagination are useful for visitors but should not
    // become separate indexed versions of the state landing page.
    robots:
      city || currentPage > 1
        ? {
            index: false,
            follow: true,
          }
        : {
            index: true,
            follow: true,
          },
  }
}

export default async function StatePage({
  params,
  searchParams,
}: StatePageProps) {
  const { state } = await params
  const { city: selectedCity, page } = await searchParams

  if (!state) {
    notFound()
  }

  const db = getDb()
  const stateSlug = state
  const stateName = formatSlug(state)
  const currentPage = parsePageNumber(page)

  const stateWhereClause = and(
    eq(contractors.published, true),
    eq(contractors.stateSlug, stateSlug)
  )

  const filteredWhereClause = selectedCity
    ? and(
        eq(contractors.published, true),
        eq(contractors.stateSlug, stateSlug),
        eq(contractors.citySlug, selectedCity)
      )
    : stateWhereClause

  /*
   * These statistics cover every contractor matching the current state/city
   * filter. They are not limited to the current pagination page.
   */
  const statisticsResult = await db
    .select({
      totalContractors: sql<number>`COUNT(*)`,
     averageRating: sql<string | null>`
        AVG(${contractors.rating})
      `,
      emergencyCount: sql<number>`
        COUNT(*) FILTER (
          WHERE ${contractors.emergencyService} = true
        )
      `,
    })
    .from(contractors)
    .where(filteredWhereClause)

  const totalContractors = Number(
    statisticsResult[0]?.totalContractors || 0
  )

  if (totalContractors === 0) {
    notFound()
  }

  const totalPages = Math.max(
    1,
    Math.ceil(totalContractors / CONTRACTORS_PER_PAGE)
  )

  /*
   * A page beyond the last available page should not return a duplicate or
   * empty 200 response.
   */
  if (currentPage > totalPages) {
    notFound()
  }

  const offset = (currentPage - 1) * CONTRACTORS_PER_PAGE

  const contractorsList = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      slug: contractors.slug,
      address: contractors.address,
      phone: contractors.phone,
      website: contractors.website,
      rating: contractors.rating,
      reviewCount: contractors.reviewCount,
      city: contractors.city,
      citySlug: contractors.citySlug,
      state: contractors.state,
      stateAbbrev: contractors.state_abbrev,
      description: contractors.description,
      servicesOffered: contractors.servicesOffered,
      openingHours: contractors.openingHours,
      latitude: contractors.latitude,
      longitude: contractors.longitude,
      verified: contractors.verified,
      emergencyService: contractors.emergencyService,
      insuranceVerified: contractors.insuranceVerified,
      freeEstimates: contractors.freeEstimates,
      financingAvailable: contractors.financingAvailable,
      warrantyOffered: contractors.warrantyOffered,
      featured: contractors.featured,
    })
    .from(contractors)
    .where(filteredWhereClause)
    .orderBy(
      sql`${contractors.rating} DESC NULLS LAST`,
    )
    .limit(CONTRACTORS_PER_PAGE)
    .offset(offset)

  const citiesWithCounts = await db
    .select({
      city: contractors.city,
      citySlug: contractors.citySlug,
      count: sql<number>`COUNT(${contractors.id})`.as('count'),
    })
    .from(contractors)
    .where(stateWhereClause)
    .groupBy(contractors.city, contractors.citySlug)
    .orderBy(
      sql`COUNT(${contractors.id}) DESC`,
      contractors.city
    )

  const averageRating = Number(
    statisticsResult[0]?.averageRating || 0
  )

  const emergencyCount = Number(
    statisticsResult[0]?.emergencyCount || 0
  )

  const selectedCityRecord = selectedCity
    ? citiesWithCounts.find((city) => city.citySlug === selectedCity)
    : null

  const selectedCityName = selectedCityRecord?.city
    ? selectedCityRecord.city
    : selectedCity
      ? formatSlug(selectedCity)
      : null

  const stateContent = stateIntros[stateSlug]

  const showPrimaryStateContent =
    currentPage === 1 && !selectedCity

  const faqs = showPrimaryStateContent
    ? getFaqsForState(stateSlug, stateName)
    : []

  const visiblePageNumbers = getVisiblePageNumbers(
    currentPage,
    totalPages
  )

  const firstResult = offset + 1
  const lastResult = Math.min(
    offset + CONTRACTORS_PER_PAGE,
    totalContractors
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-8 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>

        <span className="mx-2">/</span>

        <Link href="/states" className="hover:text-blue-600">
          States
        </Link>

        <span className="mx-2">/</span>

        {selectedCityName ? (
          <>
            <Link
              href={`/${stateSlug}`}
              className="hover:text-blue-600"
            >
              {stateName}
            </Link>

            <span className="mx-2">/</span>
            <span className="text-gray-800">
              {selectedCityName}
            </span>
          </>
        ) : (
          <span className="text-gray-800">{stateName}</span>
        )}

        {currentPage > 1 && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gray-800">
              Page {currentPage}
            </span>
          </>
        )}
      </nav>

      <header className="mb-12">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {selectedCityName
            ? `Roofing Contractors in ${selectedCityName}, ${stateName}`
            : `Roofing Contractors in ${stateName}`}
        </h1>

        <p className="text-xl text-gray-600">
          {selectedCityName
            ? `Compare roofing contractors serving ${selectedCityName}, ${stateName}. View ratings, contact details and available business information.`
            : `Compare roofing contractors across ${stateName}. View ratings, contact details and available business information to help you choose a provider.`}
        </p>

        {showPrimaryStateContent && stateContent && (
          <div className="mt-4 space-y-2 text-gray-700">
            <p>{stateContent.intro}</p>

            <p className="text-sm italic text-gray-500">
              💡 {stateContent.tip}
            </p>
          </div>
        )}
      </header>

      {showPrimaryStateContent && (
        <>
          <FeaturedContractors
            stateAbbrev={
              contractorsList[0]?.stateAbbrev ?? undefined
            }
            title={`Featured in ${stateName}`}
            limit={6}
          />

          <AdvertiseCta />
        </>
      )}

      <section
        aria-label="Contractor statistics"
        className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {totalContractors}
          </div>

          <div className="text-sm text-gray-600">
            {selectedCityName
              ? 'Contractors in City'
              : 'Total Contractors'}
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {selectedCityName ? 1 : citiesWithCounts.length}
          </div>

          <div className="text-sm text-gray-600">
            {selectedCityName
              ? 'Selected City'
              : 'Cities with Contractors'}
          </div>
        </div>

        <div className="rounded-lg bg-purple-50 p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {averageRating > 0
              ? averageRating.toFixed(1)
              : 'N/A'}
          </div>

          <div className="text-sm text-gray-600">
            Average Rating
          </div>
        </div>

        <div className="rounded-lg bg-orange-50 p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {emergencyCount}
          </div>

          <div className="text-sm text-gray-600">
            Emergency Service
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">
            Cities in {stateName}
          </h2>

          {selectedCity && (
            <Link
              href={`/${stateSlug}`}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
              Clear filter
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {citiesWithCounts.map((city) => {
            if (!city.citySlug || !city.city) return null

            const isActive = selectedCity === city.citySlug

            return (
              <Link
                key={city.citySlug}
                href={buildPageHref({
                  stateSlug,
                  selectedCity: city.citySlug,
                  page: 1,
                })}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />

                {city.city}

                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {Number(city.count)}
                </span>
              </Link>
            )
          })}
        </div>

        {showPrimaryStateContent && (
          <StateFaqSection faqs={faqs} />
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Building className="h-6 w-6" />

            {selectedCityName
              ? `Contractors in ${selectedCityName}`
              : `Contractors in ${stateName}`}
          </h2>

          <span className="text-sm text-gray-500">
            Showing {firstResult}–{lastResult} of{' '}
            {totalContractors}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contractorsList.map((contractor) => (
            <ContractorCard
              key={contractor.id}
              contractor={contractor}
              stateSlug={stateSlug}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="Contractor result pages"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {currentPage > 1 ? (
              <Link
                href={buildPageHref({
                  stateSlug,
                  selectedCity,
                  page: currentPage - 1,
                })}
                rel="prev"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-400">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </span>
            )}

            {visiblePageNumbers.map((pageNumber, index) => {
              const previousNumber =
                visiblePageNumbers[index - 1]

              const needsEllipsis =
                previousNumber &&
                pageNumber - previousNumber > 1

              return (
                <span
                  key={pageNumber}
                  className="contents"
                >
                  {needsEllipsis && (
                    <span
                      aria-hidden="true"
                      className="px-1 text-gray-400"
                    >
                      …
                    </span>
                  )}

                  {pageNumber === currentPage ? (
                    <span
                      aria-current="page"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                    >
                      {pageNumber}
                    </span>
                  ) : (
                    <Link
                      href={buildPageHref({
                        stateSlug,
                        selectedCity,
                        page: pageNumber,
                      })}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    >
                      {pageNumber}
                    </Link>
                  )}
                </span>
              )
            })}

            {currentPage < totalPages ? (
              <Link
                href={buildPageHref({
                  stateSlug,
                  selectedCity,
                  page: currentPage + 1,
                })}
                rel="next"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-400">
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        )}
      </section>
    </div>
  )
}