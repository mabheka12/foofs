// app/search/page.tsx
'use client'

import {
  Suspense,
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'
import {
  useRouter,
  useSearchParams,
} from 'next/navigation'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

import { ContractorCard } from '@/components/directory/ContractorCard'
import { DirectoryDisclosure } from '@/components/directory/DirectoryDisclosure'
import { SearchFilter } from '@/components/directory/SearchFilter'

const RESULTS_PER_PAGE = 12

interface SearchResult {
  id: number | string
  name: string
  slug: string
  description?: string | null
  address?: string | null
  phone?: string | null
  website?: string | null
  rating?: string | number | null
  reviewCount?: number | null
  city?: string | { name?: string; slug?: string } | null
  cityName?: string | null
  citySlug?: string | null
  state?: string | {
    name?: string
    slug?: string
    abbreviation?: string
  } | null
  stateName?: string | null
  stateSlug?: string | null
  stateAbbrev?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  openingHours?: string | null
  verified?: boolean | null
  featured?: boolean | null
  insuranceVerified?: boolean | null
  freeEstimates?: boolean | null
  emergencyService?: boolean | null
}

interface SearchResponse {
  results?: SearchResult[]
  total?: number
  error?: string
}

function SearchLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-64 animate-pulse rounded-lg bg-gray-200"
        />
      ))}
    </div>
  )
}

function parsePageNumber(value: string | null) {
  const parsed = Number.parseInt(value || '1', 10)

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : 1
}

function normalizeSearchResult(result: SearchResult) {
  const cityName =
    typeof result.city === 'string'
      ? result.city
      : result.city?.name ||
        result.cityName ||
        null

  const stateName =
    typeof result.state === 'string'
      ? result.state
      : result.state?.name ||
        result.stateName ||
        null

  const stateAbbrev =
    result.stateAbbrev ||
    (typeof result.state === 'object'
      ? result.state?.abbreviation
      : null)

  return {
    ...result,
    city: cityName,
    state: stateName,
    stateAbbrev,
  }
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get('q')?.trim() || ''
  const cityFilter =
    searchParams.get('city')?.trim() || ''
  const stateFilter =
    searchParams
      .get('state')
      ?.trim()
      .toUpperCase() || ''

  const parsedRating = Number(
    searchParams.get('minRating') || 0
  )

  const minRating =
    Number.isFinite(parsedRating) &&
    parsedRating >= 0 &&
    parsedRating <= 5
      ? parsedRating
      : 0

  const page = parsePageNumber(
    searchParams.get('page')
  )

  const [results, setResults] = useState<
    SearchResult[]
  >([])

  const [totalResults, setTotalResults] =
    useState(0)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalResults / RESULTS_PER_PAGE
    )
  )

  useEffect(() => {
    const controller = new AbortController()

    async function fetchResults() {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()

        if (query) {
          params.set('q', query)
        }

        if (cityFilter) {
          params.set('city', cityFilter)
        }

        if (stateFilter) {
          params.set('state', stateFilter)
        }

        if (minRating > 0) {
          params.set(
            'minRating',
            String(minRating)
          )
        }

        params.set('page', String(page))
        params.set(
          'limit',
          String(RESULTS_PER_PAGE)
        )

        const response = await fetch(
          `/api/search?${params.toString()}`,
          {
            signal: controller.signal,
          }
        )

        const data =
          (await response.json()) as SearchResponse

        if (!response.ok) {
          throw new Error(
            data.error ||
              'Unable to load search results.'
          )
        }

        setResults(
          Array.isArray(data.results)
            ? data.results
            : []
        )

        setTotalResults(
          Number(data.total) || 0
        )
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        console.error(
          'Search request failed:',
          requestError
        )

        setResults([])
        setTotalResults(0)

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load search results.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchResults()

    return () => {
      controller.abort()
    }
  }, [
    query,
    cityFilter,
    stateFilter,
    minRating,
    page,
  ])

  function buildQueryString(newPage: number) {
    const params = new URLSearchParams()

    if (query) {
      params.set('q', query)
    }

    if (cityFilter) {
      params.set('city', cityFilter)
    }

    if (stateFilter) {
      params.set('state', stateFilter)
    }

    if (minRating > 0) {
      params.set(
        'minRating',
        String(minRating)
      )
    }

    params.set('page', String(newPage))

    return params.toString()
  }

  function clearFilter(
    filter:
      | 'q'
      | 'city'
      | 'state'
      | 'minRating'
  ) {
    const params = new URLSearchParams()

    if (query && filter !== 'q') {
      params.set('q', query)
    }

    if (
      cityFilter &&
      filter !== 'city'
    ) {
      params.set('city', cityFilter)
    }

    if (
      stateFilter &&
      filter !== 'state'
    ) {
      params.set('state', stateFilter)
    }

    if (
      minRating > 0 &&
      filter !== 'minRating'
    ) {
      params.set(
        'minRating',
        String(minRating)
      )
    }

    params.set('page', '1')

    router.push(
      params.size
        ? `/search?${params.toString()}`
        : '/search'
    )
  }

  function clearAllFilters() {
    router.push('/search')
  }

  const hasActiveFilters = Boolean(
    query ||
      cityFilter ||
      stateFilter ||
      minRating > 0
  )

  const visiblePages = Array.from(
    {
      length: Math.min(totalPages, 5),
    },
    (_, index) => {
      if (totalPages <= 5) {
        return index + 1
      }

      if (page <= 3) {
        return index + 1
      }

      if (page >= totalPages - 2) {
        return totalPages - 4 + index
      }

      return page - 2 + index
    }
  )

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-sm text-gray-600">
        <Link
          href="/"
          className="hover:text-blue-600"
        >
          Home
        </Link>

        <span className="mx-2">/</span>
        <span className="text-gray-800">
          Search
        </span>
      </nav>

      <header className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          {query
            ? `Results for “${query}”`
            : 'Search Contractor Listings'}
        </h1>

        <p className="mb-5 max-w-3xl text-gray-600">
          Search published roofing contractor listings by business
          name, location and available rating information.
        </p>

        <SearchFilter />
      </header>

      <section aria-live="polite">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {!isLoading && !error && (
              <p className="text-gray-600">
                {totalResults > 0 ? (
                  <>
                    Found{' '}
                    <span className="font-semibold text-gray-900">
                      {totalResults.toLocaleString(
                        'en-US'
                      )}
                    </span>{' '}
                    {totalResults === 1
                      ? 'listing'
                      : 'listings'}
                  </>
                ) : (
                  'No matching listings found'
                )}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {query && (
              <FilterChip
                label={`Search: ${query}`}
                onRemove={() =>
                  clearFilter('q')
                }
              />
            )}

            {cityFilter && (
              <FilterChip
                label={`City: ${cityFilter}`}
                onRemove={() =>
                  clearFilter('city')
                }
              />
            )}

            {stateFilter && (
              <FilterChip
                label={`State: ${stateFilter}`}
                onRemove={() =>
                  clearFilter('state')
                }
              />
            )}

            {minRating > 0 && (
              <FilterChip
                label={`Rating: ${minRating}+`}
                onRemove={() =>
                  clearFilter('minRating')
                }
              />
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />

              <div>
                <h2 className="font-semibold text-red-900">
                  Search could not be completed
                </h2>

                <p className="mt-1 text-sm text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <SearchLoading />
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => {
                const stateSlug =
                  result.stateSlug ||
                  (typeof result.state ===
                  'object'
                    ? result.state?.slug
                    : '') ||
                  ''

                return (
                  <ContractorCard
                    key={result.id}
                    contractor={normalizeSearchResult(
                      result
                    )}
                    stateSlug={stateSlug}
                    variant="summary"
                  />
                )
              })}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Search result pages"
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
              >
                {page > 1 && (
                  <Link
                    href={`/search?${buildQueryString(
                      page - 1
                    )}`}
                    rel="prev"
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                )}

                {visiblePages.map(
                  (pageNumber) => (
                    <Link
                      key={pageNumber}
                      href={`/search?${buildQueryString(
                        pageNumber
                      )}`}
                      aria-current={
                        pageNumber === page
                          ? 'page'
                          : undefined
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm transition ${
                        pageNumber === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  )
                )}

                {page < totalPages && (
                  <Link
                    href={`/search?${buildQueryString(
                      page + 1
                    )}`}
                    rel="next"
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-lg bg-gray-50 py-16 text-center">
            <div
              aria-hidden="true"
              className="mb-4 text-6xl"
            >
              🔍
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              No matching listings
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-600">
              Try a shorter business name, remove one of the location
              filters or browse contractors by state.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
              >
                Clear filters
              </button>

              <Link
                href="/states"
                className="rounded-lg border border-gray-300 px-6 py-2 transition hover:bg-white"
              >
                Browse by state
              </Link>
            </div>
          </div>
        )}
      </section>

      <div className="mt-10">
        <DirectoryDisclosure />
      </div>
    </main>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
      {label}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="ml-1 text-gray-400 hover:text-gray-700"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
}