// components/directory/SearchFilter.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Filter } from 'lucide-react'

interface SearchFilterProps {
  className?: string
  compact?: boolean
}

export function SearchFilter({ className = '', compact = false }: SearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [minRating, setMinRating] = useState('')
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Load initial values from URL
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
    setServiceType(searchParams.get('service') || '')
    setCity(searchParams.get('city') || '')
    setState(searchParams.get('state') || '')
    setMinRating(searchParams.get('minRating') || '')
    setEmergencyOnly(searchParams.get('emergency') === 'true')
  }, [searchParams])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (serviceType) params.set('service', serviceType)
    if (city) params.set('city', city)
    if (state) params.set('state', state)
    if (minRating) params.set('minRating', minRating)
    if (emergencyOnly) params.set('emergency', 'true')
    params.set('page', '1')

    router.push(`/search?${params.toString()}`)
    setIsSearching(false)
  }

  const clearFilters = () => {
    setQuery('')
    setServiceType('')
    setCity('')
    setState('')
    setMinRating('')
    setEmergencyOnly(false)
    router.push('/search')
  }

  const hasActiveFilters = query || serviceType || city || state || minRating || emergencyOnly

  // Compact version for header/navbar
  if (compact) {
    return (
      <form onSubmit={handleSearch} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by city, contractor, or service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            disabled={isSearching}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2.5 text-gray-600 hover:text-gray-900 transition flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </form>
    )
  }

  // Full version for search page
  return (
    <form onSubmit={handleSearch} className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {/* Row 1: Main Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by city, contractor, or service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            disabled={isSearching}
          />
        </div>

            <select
              value={serviceType}
              onChange={(e) => {
                const service = e.target.value
                setServiceType(service)
                // If there's a city selected, navigate directly
                if (city && service) {
                  router.push(`/services/${service.toLowerCase().replace(/\s+/g, '-')}/${city.toLowerCase().replace(/\s+/g, '-')}`)
                }
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              disabled={isSearching}
            >
              <option value="">All Services</option>
              <option value="Emergency">🚨 Emergency Repair</option>
              <option value="Inspection">🔍 Roof Inspection</option>
              <option value="Repair">🔧 Roof Leak Repair</option>
              <option value="Replacement">🏗️ Roof Replacement</option>
              <option value="Maintenance">🛠️ Maintenance</option>
            </select>

        {/* Location - City and State side by side */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            disabled={isSearching}
          />
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white uppercase"
            maxLength={2}
            disabled={isSearching}
          />
        </div>
      </div>

      {/* Row 2: Advanced Filters Toggle + Search Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
        >
          <Filter className="w-4 h-4" />
          {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2.5 text-gray-600 hover:text-gray-900 transition flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Row 3: Advanced Filters (expanded) */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              disabled={isSearching}
            >
              <option value="">Any Rating</option>
              <option value="4.5">⭐ 4.5+</option>
              <option value="4.0">⭐ 4.0+</option>
              <option value="3.5">⭐ 3.5+</option>
              <option value="3.0">⭐ 3.0+</option>
            </select>
          </div>

          {/* Emergency Only */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                disabled={isSearching}
              />
              <span className="text-sm font-medium text-gray-700">
                🚨 Emergency Services Only
              </span>
            </label>
          </div>

          {/* Search Tips */}
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Search Tips:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Search by city for local results</li>
              <li>Use state abbreviations (TX, CA, FL)</li>
              <li>Search by service type</li>
            </ul>
          </div>
        </div>
      )}
    </form>
  )
}