// app/api/admin/test-cities/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { states, cities, contractors } from '@/lib/db/schema'
import { eq, and, sql, ilike } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const CITIES_PER_PAGE = 50

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const stateFilter = searchParams.get('state') || ''
  const showOnlyIssues = searchParams.get('issue') === 'true'

  try {
    const db = getDb()

    // Get all states for filter
    const allStates = await db.select().from(states).orderBy(states.name)

    // Get all cities with their contractor counts
    let whereConditions = []
    if (stateFilter) {
      whereConditions.push(ilike(states.name, `%${stateFilter}%`))
    }

    const citiesQuery = db
      .select({
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
        stateId: cities.stateId,
        stateName: states.name,
        stateSlug: states.slug,
        stateAbbr: states.abbreviation,
        contractorCount: sql<number>`COUNT(DISTINCT ${contractors.id})`.as('contractor_count'),
      })
      .from(cities)
      .leftJoin(states, eq(cities.stateId, states.id))
      .leftJoin(contractors, 
        and(
          eq(contractors.cityId, cities.id),
          eq(contractors.published, true)
        )
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

    const citiesWithCounts = await citiesQuery
      .groupBy(cities.id, cities.name, cities.slug, cities.stateId, states.name, states.slug, states.abbreviation)
      .having(sql`COUNT(DISTINCT ${contractors.id}) > 0`) // Only cities with contractors
      .orderBy(sql`contractor_count DESC`, cities.name)

    console.log(`📊 Found ${citiesWithCounts.length} cities with contractors`)

    // Process each city to get actual contractor count
    const results = []
    let totalContractors = 0

    for (const city of citiesWithCounts) {
      if (!city.stateName) continue

      // Get actual contractors for this city
      const actualContractors = await db
        .select()
        .from(contractors)
        .where(
          and(
            eq(contractors.cityId, city.id),
            eq(contractors.stateId, city.stateId),
            eq(contractors.published, true)
          )
        )

      const actualCount = actualContractors.length
      const expectedCount = Number(city.contractorCount) || 0
      totalContractors += actualCount

      let status: '✅' | '⚠️' | '❌' = '✅'
      let message = `${actualCount} contractors`

      if (expectedCount > 0 && actualCount === 0) {
        status = '❌'
        message = `Expected ${expectedCount} but found 0!`
      } else if (expectedCount !== actualCount) {
        status = '⚠️'
        message = `Expected ${expectedCount} but found ${actualCount}`
      }

      results.push({
        stateName: city.stateName || 'Unknown',
        stateSlug: city.stateSlug || '',
        stateAbbr: city.stateAbbr || '',
        cityId: city.id,
        cityName: city.name,
        citySlug: city.slug,
        contractorCount: expectedCount,
        actualContractors: actualCount,
        status,
        message,
      })
    }

    // Filter for issues if requested
    let filteredResults = results
    if (showOnlyIssues) {
      filteredResults = results.filter(r => r.status === '❌')
    }

    // Sort by status (issues first)
    filteredResults.sort((a, b) => {
      if (a.status === '❌' && b.status !== '❌') return -1
      if (a.status !== '❌' && b.status === '❌') return 1
      return a.stateName.localeCompare(b.stateName)
    })

    // Paginate results
    const totalResults = filteredResults.length
    const totalPages = Math.max(1, Math.ceil(totalResults / CITIES_PER_PAGE))
    const paginatedResults = filteredResults.slice(
      (page - 1) * CITIES_PER_PAGE,
      page * CITIES_PER_PAGE
    )

    const problemCities = filteredResults.filter(r => r.status === '❌')
    const totalCitiesWithContractors = results.length
    const citiesWithIssues = problemCities.length

    console.log(`📊 Results: ${paginatedResults.length} shown, ${totalResults} total`)
    console.log(`📊 Problem cities: ${citiesWithIssues}`)

    return NextResponse.json({
      results: paginatedResults,
      totalResults,
      totalContractors,
      citiesWithIssues,
      totalCitiesWithContractors,
      problemCities,
      allStates,
      currentPage: page,
      totalPages,
      stateFilter,
      showOnlyIssues,
    })
  } catch (error) {
    console.error('Error in test-cities API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch test data', 
        details: (error as Error).message,
        results: [],
        totalResults: 0,
        totalContractors: 0,
        citiesWithIssues: 0,
        totalCitiesWithContractors: 0,
        problemCities: [],
        allStates: [],
        currentPage: 1,
        totalPages: 1,
        stateFilter: '',
        showOnlyIssues: false,
      },
      { status: 500 }
    )
  }
}