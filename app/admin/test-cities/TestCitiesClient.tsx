// app/admin/test-cities/TestCitiesClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CityTestResult {
  stateName: string
  stateSlug: string
  cityId: number
  cityName: string
  citySlug: string
  contractorCount: number
  actualContractors: number
  status: '✅' | '⚠️' | '❌'
  message: string
}

interface TestCitiesClientProps {
  initialData: {
    results: CityTestResult[]
    totalResults: number
    totalContractors: number
    citiesWithIssues: number
    totalCitiesWithContractors: number
    problemCities: CityTestResult[]
    allStates: { id: number; name: string }[]
    currentPage: number
    totalPages: number
    stateFilter: string
    showOnlyIssues: boolean
  }
}

export default function TestCitiesClient({ initialData }: TestCitiesClientProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [stateFilter, setStateFilter] = useState(initialData.stateFilter || '')
  const [showOnlyIssues, setShowOnlyIssues] = useState(initialData.showOnlyIssues || false)
  const [currentPage, setCurrentPage] = useState(initialData.currentPage || 1)

  // Ensure totalContractors is a number
  const totalContractors = data.totalContractors || 0
  const totalResults = data.totalResults || 0
  const citiesWithIssues = data.citiesWithIssues || 0
  const totalCitiesWithContractors = data.totalCitiesWithContractors || 0

  const updateFilters = (newStateFilter?: string, newShowIssues?: boolean, newPage?: number) => {
    const params = new URLSearchParams()
    const finalState = newStateFilter !== undefined ? newStateFilter : stateFilter
    const finalIssues = newShowIssues !== undefined ? newShowIssues : showOnlyIssues
    const finalPage = newPage !== undefined ? newPage : currentPage

    if (finalState) params.set('state', finalState)
    if (finalIssues) params.set('issue', 'true')
    if (finalPage > 1) params.set('page', finalPage.toString())

    setIsLoading(true)
    router.push(`/admin/test-cities?${params.toString()}`)
  }

  // Fetch data when filters change
  useEffect(() => {
  const fetchData = async () => {
    const params = new URLSearchParams()
    if (stateFilter) params.set('state', stateFilter)
    if (showOnlyIssues) params.set('issue', 'true')
    if (currentPage > 1) params.set('page', currentPage.toString())

    try {
      const response = await fetch(`/api/admin/test-cities?${params.toString()}`)
      const newData = await response.json()
      console.log('📊 API Response:', newData) // Debug log
      console.log('📊 Results count:', newData.results?.length) // Debug log
      console.log('📊 First result:', newData.results?.[0]) // Debug log
      setData(newData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  fetchData()
}, [stateFilter, showOnlyIssues, currentPage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test data...</p>
        </div>
      </div>
    )
  }

  // Filter out cities with "Unknown" state or 0 contractors
 const validResults = data.results.filter(r => {
  // Only filter out truly invalid data
  return r.cityName && r.cityName !== 'Unknown'
})

if (validResults.length === 0 && !isLoading) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h3>
        <p className="text-gray-600">
          {showOnlyIssues 
            ? 'No issues found! All cities are working correctly.' 
            : 'No cities with contractors found in the database.'}
        </p>
        <button
          onClick={() => {
            setShowOnlyIssues(false)
            setStateFilter('')
            setCurrentPage(1)
            updateFilters('', false, 1)
          }}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-4">🏗️ City Validation Test</h1>
      <p className="text-gray-600 mb-6">
        This page tests all cities to ensure they show the correct number of contractors.
        Cities with issues are highlighted in red.
      </p>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Filter by State:</label>
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value)
              setCurrentPage(1)
              updateFilters(e.target.value, showOnlyIssues, 1)
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All States</option>
            {(data.allStates || []).map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Show:</label>
          <select
            value={showOnlyIssues ? 'issues' : 'all'}
            onChange={(e) => {
              const showIssues = e.target.value === 'issues'
              setShowOnlyIssues(showIssues)
              setCurrentPage(1)
              updateFilters(stateFilter, showIssues, 1)
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Cities</option>
            <option value="issues">Only Issues</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          Showing {validResults.length} of {totalResults} cities
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCitiesWithContractors}</div>
          <div className="text-sm text-gray-600">Cities with Contractors</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalCitiesWithContractors - citiesWithIssues}
          </div>
          <div className="text-sm text-gray-600">Cities Working Correctly</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{citiesWithIssues}</div>
          <div className="text-sm text-gray-600">Cities with Issues</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalContractors}</div>
          <div className="text-sm text-gray-600">Total Contractors</div>
        </div>
      </div>

      {/* Problem Cities Alert */}
      {(data.problemCities || []).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-red-700 mb-4">
            🚨 {(data.problemCities || []).length} Cities with Issues
          </h2>
          <p className="text-red-600 mb-4">
            These cities show contractor counts on the state page but return 0 listings on their city page.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-red-200">
                  <th className="text-left py-2 text-red-700">State</th>
                  <th className="text-left py-2 text-red-700">City</th>
                  <th className="text-left py-2 text-red-700">Expected</th>
                  <th className="text-left py-2 text-red-700">Actual</th>
                  <th className="text-left py-2 text-red-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {(data.problemCities || []).map((city) => (
                  <tr key={`${city.stateSlug}-${city.citySlug}`} className="border-b border-red-100">
                    <td className="py-2">{city.stateName}</td>
                    <td className="py-2 font-medium">{city.cityName}</td>
                    <td className="py-2 text-red-600 font-bold">{city.contractorCount}</td>
                    <td className="py-2 text-red-600 font-bold">0</td>
                    <td className="py-2">
                      <Link
                        href={`/${city.stateSlug}/${city.citySlug}`}
                        target="_blank"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Visit Page →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold">City Validation Results</h2>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {data.totalPages || 1}
          </span>
        </div>
        <div className="overflow-x-auto">
          {validResults.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {validResults.map((city) => (
                  <tr
                    key={`${city.stateSlug}-${city.citySlug}`}
                    className={
                      city.status === '❌'
                        ? 'bg-red-50 hover:bg-red-100'
                        : city.status === '⚠️'
                        ? 'bg-yellow-50 hover:bg-yellow-100'
                        : 'hover:bg-gray-50'
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {city.stateName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {city.cityName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {city.citySlug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {city.contractorCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                      <span
                        className={
                          city.status === '❌'
                            ? 'text-red-600'
                            : city.status === '⚠️'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }
                      >
                        {city.actualContractors}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`text-sm ${
                          city.status === '❌'
                            ? 'text-red-600'
                            : city.status === '⚠️'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {city.status} {city.message}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        href={`/${city.stateSlug}/${city.citySlug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              {showOnlyIssues
                ? '🎉 No issues found! All cities are working correctly.'
                : 'No cities with contractors found.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {(data.totalPages || 1) > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => {
                const newPage = currentPage - 1
                setCurrentPage(newPage)
                updateFilters(stateFilter, showOnlyIssues, newPage)
              }}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {data.totalPages || 1}
            </span>
            <button
              onClick={() => {
                const newPage = currentPage + 1
                setCurrentPage(newPage)
                updateFilters(stateFilter, showOnlyIssues, newPage)
              }}
              disabled={currentPage === (data.totalPages || 1)}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === (data.totalPages || 1)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Quick Fix SQL */}
      {(data.problemCities || []).length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🔧 Quick Fix SQL</h3>
          <p className="text-blue-700 mb-4">
            Run this SQL to fix the problematic cities:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
{`-- Check which city IDs these cities have
SELECT id, name, slug, state_id FROM cities WHERE slug IN (
  ${(data.problemCities || []).map(c => `'${c.citySlug}'`).join(',\n  ')}
);

-- Update the slugs to be unique if needed
UPDATE cities 
SET slug = CONCAT(slug, '-', state_id) 
WHERE slug IN (
  ${(data.problemCities || []).map(c => `'${c.citySlug}'`).join(',\n  ')}
) AND id NOT IN (${(data.problemCities || []).map(c => c.cityId).join(', ')});`}
          </pre>
        </div>
      )}
    </div>
  )
}