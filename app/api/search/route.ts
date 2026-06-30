// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { contractors, cities, states } from '@/lib/db/schema'
import { and, ilike, eq, sql, or } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() || ''
  const cityFilter = searchParams.get('city')?.trim() || ''
  const stateFilter = searchParams.get('state')?.trim() || ''
  const serviceFilter = searchParams.get('service')?.trim() || ''
  const minRating = parseFloat(searchParams.get('minRating') || '0')
  const emergencyOnly = searchParams.get('emergency') === 'true'
  const limit = parseInt(searchParams.get('limit') || '12')
  const offset = parseInt(searchParams.get('offset') || '0')

  // If no search params, return empty results
  if (!query && !cityFilter && !stateFilter && !serviceFilter && !minRating && !emergencyOnly) {
    return NextResponse.json({ results: [], total: 0 })
  }

  try {
    const db = getDb()

    // Build conditions
    let conditions: any[] = []
    conditions.push(eq(contractors.published, true))

    // Text search
    if (query) {
      conditions.push(
        or(
          ilike(contractors.name, `%${query}%`),
          ilike(contractors.businessName, `%${query}%`),
          ilike(cities.name, `%${query}%`),
          ilike(states.name, `%${query}%`),
          ilike(states.abbreviation, `%${query}%`)
        )
      )
    }

    // City filter
    if (cityFilter) {
      conditions.push(ilike(cities.name, `%${cityFilter}%`))
    }

    // State filter
    if (stateFilter) {
      conditions.push(
        or(
          ilike(states.name, `%${stateFilter}%`),
          ilike(states.abbreviation, `%${stateFilter}%`)
        )
      )
    }

    // Service filter
    if (serviceFilter) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${contractors.servicesOffered}) AS service
          WHERE service ILIKE ${`%${serviceFilter}%`}
        )`
      )
    }

    // Rating filter
    if (minRating > 0) {
      conditions.push(sql`${contractors.rating} >= ${minRating}`)
    }

    // Emergency only
    if (emergencyOnly) {
      conditions.push(eq(contractors.emergencyService, true))
    }

    const whereClause = and(...conditions)

    console.log('Search conditions:', { 
      query, 
      cityFilter, 
      stateFilter, 
      serviceFilter, 
      minRating, 
      emergencyOnly 
    })

    // Execute search
    const results = await db
      .select({
        id: contractors.id,
        name: contractors.name,
        businessName: contractors.businessName,
        slug: contractors.slug,
        description: contractors.description,
        address: contractors.address,
        phone: contractors.phone,
        website: contractors.website,
        rating: contractors.rating,
        reviewCount: contractors.reviewCount,
        emergencyService: contractors.emergencyService,
        verified: contractors.verified,
        freeEstimates: contractors.freeEstimates,
        yearsInBusiness: contractors.yearsInBusiness,
        servicesOffered: contractors.servicesOffered,
        latitude: cities.latitude,
        longitude: cities.longitude,
        cityName: cities.name,
        citySlug: cities.slug,
        stateName: states.name,
        stateSlug: states.slug,
        stateAbbr: states.abbreviation,
        city: cities,
        state: states,
      })
      .from(contractors)
      .leftJoin(cities, eq(contractors.cityId, cities.id))
      .leftJoin(states, eq(contractors.stateId, states.id))
      .where(whereClause)
      .orderBy(
        sql`${contractors.rating} DESC NULLS LAST`,
        sql`${contractors.verified} DESC`
      )
      .limit(limit)
      .offset(offset)

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(contractors)
      .leftJoin(cities, eq(contractors.cityId, cities.id))
      .leftJoin(states, eq(contractors.stateId, states.id))
      .where(whereClause)

    const total = countResult[0]?.count || 0

    console.log('Search results:', { total, resultsCount: results.length })

    return NextResponse.json({
      results,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}