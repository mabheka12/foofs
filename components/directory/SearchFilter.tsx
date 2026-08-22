// components/directory/SearchFilter.tsx
'use client'

import {
  useEffect,
  useState,
  useTransition,
} from 'react'
import {
  useRouter,
  useSearchParams,
} from 'next/navigation'
import {
  Filter,
  Search,
  X,
} from 'lucide-react'

interface SearchFilterProps {
  className?: string
  compact?: boolean
}

export function SearchFilter({
  className = '',
  compact = false,
}: SearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [minRating, setMinRating] = useState('')
  const [showAdvanced, setShowAdvanced] =
    useState(false)

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
    setCity(searchParams.get('city') || '')
    setState(searchParams.get('state') || '')
    setMinRating(
      searchParams.get('minRating') || ''
    )

    if (searchParams.get('minRating')) {
      setShowAdvanced(true)
    }
  }, [searchParams])

  function buildSearchUrl() {
    const params = new URLSearchParams()

    const cleanedQuery = query.trim()
    const cleanedCity = city.trim()
    const cleanedState = state
      .trim()
      .toUpperCase()

    if (cleanedQuery) {
      params.set('q', cleanedQuery)
    }

    if (!compact && cleanedCity) {
      params.set('city', cleanedCity)
    }

    if (!compact && cleanedState) {
      params.set('state', cleanedState)
    }

    if (!compact && minRating) {
      params.set('minRating', minRating)
    }

    params.set('page', '1')

    return `/search?${params.toString()}`
  }

  function handleSearch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    startTransition(() => {
      router.push(buildSearchUrl())
    })
  }

  function clearFilters() {
    setQuery('')
    setCity('')
    setState('')
    setMinRating('')
    setShowAdvanced(false)

    startTransition(() => {
      router.push('/search')
    })
  }

  const hasActiveFilters = Boolean(
    query.trim() ||
      (!compact &&
        (city.trim() ||
          state.trim() ||
          minRating))
  )

  if (compact) {
    return (
      <form
        onSubmit={handleSearch}
        role="search"
        className={`flex flex-col gap-3 sm:flex-row ${className}`}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <label
            htmlFor="compact-contractor-search"
            className="sr-only"
          >
            Search contractors by name or location
          </label>

          <input
            id="compact-contractor-search"
            type="search"
            placeholder="Search by contractor name or location"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Searching
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search
            </>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-white/80 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </form>
    )
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className={`rounded-xl bg-white p-6 shadow-md ${className}`}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <label
            htmlFor="contractor-search"
            className="sr-only"
          >
            Search by contractor name or location
          </label>

          <input
            id="contractor-search"
            type="search"
            placeholder="Contractor name or search term"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
        </div>

        <div>
          <label
            htmlFor="contractor-city"
            className="sr-only"
          >
            City
          </label>

          <input
            id="contractor-city"
            type="text"
            placeholder="City"
            value={city}
            onChange={(event) =>
              setCity(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
        </div>

        <div>
          <label
            htmlFor="contractor-state"
            className="sr-only"
          >
            Two-letter state abbreviation
          </label>

          <input
            id="contractor-state"
            type="text"
            placeholder="State, e.g. TX"
            value={state}
            onChange={(event) =>
              setState(
                event.target.value.toUpperCase()
              )
            }
            maxLength={2}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() =>
            setShowAdvanced((current) => !current)
          }
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <Filter className="h-4 w-4" />

          {showAdvanced
            ? 'Hide rating filter'
            : 'Filter by rating'}
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Searching
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-lg px-4 py-2.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="minimum-rating"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Minimum available rating
            </label>

            <select
              id="minimum-rating"
              value={minRating}
              onChange={(event) =>
                setMinRating(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            >
              <option value="">Any rating</option>
              <option value="4.5">
                4.5 and above
              </option>
              <option value="4.0">
                4.0 and above
              </option>
              <option value="3.5">
                3.5 and above
              </option>
              <option value="3.0">
                3.0 and above
              </option>
            </select>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-800">
              Search tips
            </p>

            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                Search by a contractor’s business name.
              </li>
              <li>
                Enter a city to narrow the results.
              </li>
              <li>
                Use a two-letter state abbreviation such as TX.
              </li>
              <li>
                Ratings may originate from an identified external source.
              </li>
            </ul>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        Service specialization and emergency availability are not
        currently searchable because RooferNet does not have verified
        data for those fields across the directory.
      </p>
    </form>
  )
}