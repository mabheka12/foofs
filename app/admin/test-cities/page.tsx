// app/admin/test-cities/page.tsx
import type { ReactNode } from 'react'
import { getDb } from '@/lib/db'
import { states, cities, contractors } from '@/lib/db/schema'
import { eq, and, sql, count } from 'drizzle-orm'
import Link from 'next/link'

interface StateStat {
  stateId: number
  stateName: string
  stateSlug: string
  stateAbbr: string
  cityCount: number
  contractorCount: number
}

interface TopCity {
  cityId: number
  cityName: string
  citySlug: string
  stateName: string | null
  stateSlug: string | null
  stateAbbr: string | null
  contractorCount: number
}

interface ProblematicCity extends TopCity {
  actualCount: number
}

interface CountResult {
  count: number
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TestCitiesPage(): Promise<ReactNode> {
  const db = getDb()

  // Get all states with city counts
  const stateStats = await db
    .select({
      stateId: states.id,
      stateName: states.name,
      stateSlug: states.slug,
      stateAbbr: states.abbreviation,
      cityCount: sql<number>`COUNT(DISTINCT ${cities.id})`.as('city_count'),
      contractorCount: sql<number>`COUNT(DISTINCT ${contractors.id})`.as('contractor_count'),
    })
    .from(states)
    .leftJoin(cities, eq(cities.stateId, states.id))
    .leftJoin(contractors, 
      and(
        eq(contractors.stateId, states.id),
        eq(contractors.published, true)
      )
    )
    .groupBy(states.id, states.name, states.slug, states.abbreviation)
    .orderBy(sql`contractor_count DESC`)

  // Get cities with most contractors
  const topCities = await db
    .select({
      cityId: cities.id,
      cityName: cities.name,
      citySlug: cities.slug,
      stateName: states.name,
      stateSlug: states.slug,
      stateAbbr: states.abbreviation,
      contractorCount: sql<number>`COUNT(${contractors.id})`.as('contractor_count'),
    })
    .from(cities)
    .leftJoin(states, eq(cities.stateId, states.id))
    .leftJoin(contractors, 
      and(
        eq(contractors.cityId, cities.id),
        eq(contractors.published, true)
      )
    )
    .groupBy(cities.id, cities.name, cities.slug, states.name, states.slug, states.abbreviation)
    .having(sql`COUNT(${contractors.id}) > 0`)
    .orderBy(sql`contractor_count DESC`)
    .limit(100)

  // Quick check for problematic cities (expected > 0 but actual = 0)
  const problematicCities: ProblematicCity[] = []
  for (const city of topCities) {
    // Get actual contractors for this city
    const actual = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(contractors)
      .where(
        and(
          eq(contractors.cityId, city.cityId),
          eq(contractors.published, true)
        )
      )
    
    const actualCount = Number(actual[0]?.count || 0)
    if (city.contractorCount > 0 && actualCount === 0) {
      problematicCities.push({
        ...city,
        actualCount: 0,
      })
    }
  }

  const totalContractors = stateStats.reduce((sum, s) => sum + Number(s.contractorCount || 0), 0)
  const totalCities = topCities.length
  const problemCount = problematicCities.length

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-4">🏗️ City Validation Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Quick overview of city and contractor data. This page is optimized for fast loading.
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stateStats.length}</div>
          <div className="text-sm text-gray-600">Total States</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalCities}</div>
          <div className="text-sm text-gray-600">Cities with Contractors</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{problemCount}</div>
          <div className="text-sm text-gray-600">Cities with Issues</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalContractors}</div>
          <div className="text-sm text-gray-600">Total Contractors</div>
        </div>
      </div>

      {/* Problem Cities Alert */}
      {problematicCities.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-red-700 mb-4">
            🚨 {problematicCities.length} Cities with Issues
          </h2>
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
                {problematicCities.map((city) => (
                  <tr key={city.cityId} className="border-b border-red-100">
                    <td className="py-2">{city.stateName ?? 'Unknown State'}</td>
                    <td className="py-2 font-medium">{city.cityName}</td>
                    <td className="py-2 text-red-600 font-bold">{city.contractorCount}</td>
                    <td className="py-2 text-red-600 font-bold">0</td>
                    <td className="py-2">
                      <Link
                        href={`/${city.stateSlug ?? 'unknown'}/${city.citySlug}`}
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

      {/* Top Cities */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold">Top Cities by Contractors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contractors</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topCities.slice(0, 50).map((city) => {
                const isProblem = problematicCities.some(p => p.cityId === city.cityId)
                return (
                  <tr key={city.cityId} className={isProblem ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{city.stateName ?? 'Unknown State'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{city.cityName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                      <span className={isProblem ? 'text-red-600' : 'text-green-600'}>
                        {city.contractorCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm ${isProblem ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                        {isProblem ? '❌ Issue' : '✅ OK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        href={`/${city.stateSlug ?? 'unknown'}/${city.citySlug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* All States Summary */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold">State Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cities</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contractors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stateStats.map((state) => (
                <tr key={state.stateId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/${state.stateSlug}`} className="hover:text-blue-600">
                      {state.stateName} ({state.stateAbbr})
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{state.cityCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">{state.contractorCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}