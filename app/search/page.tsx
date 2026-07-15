// app/search/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'
import { ContractorCard } from '@/components/directory/ContractorCard'
import { SearchFilter } from '@/components/directory/SearchFilter'

// Loading component
function SearchLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

// Main search content component
function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get search params
  const query = searchParams.get('q') || ''
  const cityFilter = searchParams.get('city') || ''
  const stateFilter = searchParams.get('state') || ''
  const serviceFilter = searchParams.get('service') || ''
  const minRating = parseFloat(searchParams.get('minRating') || '0')
  const emergencyOnly = searchParams.get('emergency') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  
  const [results, setResults] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const limit = 12

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (cityFilter) params.set('city', cityFilter)
        if (stateFilter) params.set('state', stateFilter)
        if (serviceFilter) params.set('service', serviceFilter)
        if (minRating > 0) params.set('minRating', minRating.toString())
        if (emergencyOnly) params.set('emergency', 'true')
        params.set('page', page.toString())
        params.set('limit', limit.toString())
        
        const response = await fetch(`/api/search?${params.toString()}`)
        const data = await response.json()
        
        setResults(data.results || [])
        setTotalResults(data.total || 0)
        setTotalPages(Math.ceil((data.total || 0) / limit))
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchResults()
  }, [query, cityFilter, stateFilter, serviceFilter, minRating, emergencyOnly, page])

  // Build query string for navigation
  const buildQueryString = (newPage: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (cityFilter) params.set('city', cityFilter)
    if (stateFilter) params.set('state', stateFilter)
    if (serviceFilter) params.set('service', serviceFilter)
    if (minRating > 0) params.set('minRating', minRating.toString())
    if (emergencyOnly) params.set('emergency', 'true')
    params.set('page', newPage.toString())
    return params.toString()
  }

  // Clear a specific filter
  const clearFilter = (filter: string) => {
    const params = new URLSearchParams()
    if (query && filter !== 'q') params.set('q', query)
    if (cityFilter && filter !== 'city') params.set('city', cityFilter)
    if (stateFilter && filter !== 'state') params.set('state', stateFilter)
    if (serviceFilter && filter !== 'service') params.set('service', serviceFilter)
    if (minRating > 0 && filter !== 'minRating') params.set('minRating', minRating.toString())
    if (emergencyOnly && filter !== 'emergency') params.set('emergency', 'true')
    router.push(`/search?${params.toString()}`)
  }

  // Clear all filters
  const clearAllFilters = () => {
    router.push('/search')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Search</span>
      </nav>

      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {query ? `Results for "${query}"` : 'Search Contractors'}
        </h1>
        <SearchFilter />
      </div>

      {/* Results Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          {!isLoading && (
            <p className="text-gray-600">
              {totalResults > 0 ? (
                <>
                  Found <span className="font-semibold text-gray-900">{totalResults}</span> 
                  {totalResults === 1 ? ' contractor' : ' contractors'}
                  {query && ` matching "${query}"`}
                </>
              ) : (
                'No contractors found'
              )}
            </p>
          )}
          {query && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">Searching for:</span>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                {query}
                <button
                  onClick={() => clearFilter('q')}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {cityFilter && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
              City: {cityFilter}
              <button
                onClick={() => clearFilter('city')}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {stateFilter && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
              State: {stateFilter}
              <button
                onClick={() => clearFilter('state')}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {serviceFilter && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
              Service: {serviceFilter}
              <button
                onClick={() => clearFilter('service')}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minRating > 0 && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
              ⭐ {minRating}+
              <button
                onClick={() => clearFilter('minRating')}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {emergencyOnly && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full">
              🚨 Emergency Only
              <button
                onClick={() => clearFilter('emergency')}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(query || cityFilter || stateFilter || serviceFilter || minRating > 0 || emergencyOnly) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <SearchLoading />
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => {
              const citySlug = result.citySlug || result.city?.slug || ''
              const stateSlug = result.stateSlug || result.state?.slug || ''
              
              const contractorWithLocation = {
                ...result,
                latitude: result.latitude || result.city?.latitude || null,
                longitude: result.longitude || result.city?.longitude || null,
                city: result.city || { name: result.cityName || '', slug: result.citySlug || '' },
                state: result.state || { name: result.stateName || '', slug: result.stateSlug || '', abbreviation: result.stateAbbr || '' },
              }
              
              return (
                <ContractorCard
                  key={result.id}
                  contractor={contractorWithLocation}
                  stateSlug={stateSlug}
                  citySlug={citySlug}
                  variant="summary"
                />
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/search?${buildQueryString(page - 1)}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Previous
                </Link>
              )}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <Link
                      key={pageNum}
                      href={`/search?${buildQueryString(pageNum)}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm transition ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  )
                })}
              </div>
              {page < totalPages && (
                <Link
                  href={`/search?${buildQueryString(page + 1)}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contractors Found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {query ? (
              <>We couldn't find any contractors matching "{query}". Try adjusting your search terms.</>
            ) : (
              'Enter a search term to find contractors in your area.'
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear All Filters
            </button>
            <Link
              href="/states"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Browse by State
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// Main page with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
}