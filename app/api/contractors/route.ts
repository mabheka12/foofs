// app/api/contractors/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq, and, ilike, sql, or } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  const city = searchParams.get('city')
  const service = searchParams.get('service')
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const db = getDb()
    let conditions: any[] = [eq(contractors.published, true)]

    // ✅ Filter by state using stateSlug or state name
    if (state) {
      conditions.push(
        or(
          eq(contractors.stateSlug, state),
          ilike(contractors.state, `%${state}%`)
        )
      )
    }

    // ✅ Filter by city using citySlug or city name
    if (city) {
      conditions.push(
        or(
          eq(contractors.citySlug, city),
          ilike(contractors.city, `%${city}%`)
        )
      )
    }

    // ✅ Filter by service (checks if service exists in services_offered array)
    if (service) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${contractors.servicesOffered}) AS s 
          WHERE s ILIKE ${`%${service}%`}
        )`
      )
    }

    // ✅ Search query
    if (query) {
      conditions.push(
        or(
          ilike(contractors.name, `%${query}%`),
          ilike(contractors.description, `%${query}%`),
          ilike(contractors.city, `%${query}%`),
          ilike(contractors.state, `%${query}%`)
        )
      )
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(contractors)
      .where(and(...conditions))

    const total = countResult[0]?.count || 0

    // Get contractors
    const results = await db
      .select({
        id: contractors.id,
        name: contractors.name,
        slug: contractors.slug,
        businessName: contractors.name,
        address: contractors.address,
        city: contractors.city,
        citySlug: contractors.citySlug,
        state: contractors.state,
        stateSlug: contractors.stateSlug,
        stateAbbrev: contractors.state_abbrev,
        phone: contractors.phone,
        website: contractors.website,
        rating: contractors.rating,
        reviewCount: contractors.reviewCount,
        description: contractors.description,
        servicesOffered: contractors.servicesOffered,
        openingHours: contractors.openingHours,
        latitude: contractors.latitude,
        longitude: contractors.longitude,
        verified: contractors.verified,
        emergencyService: contractors.emergencyService,
        freeEstimates: contractors.freeEstimates,
        financingAvailable: contractors.financingAvailable,
        warrantyOffered: contractors.warrantyOffered,
        featured: contractors.featured,
        yearsInBusiness: contractors.yearsInBusiness,
        licenseNumber: contractors.licenseNumber,
        insuranceVerified: contractors.insuranceVerified,
      })
      .from(contractors)
      .where(and(...conditions))
      .orderBy(
        sql`${contractors.rating} DESC NULLS LAST`,
        sql`${contractors.verified} DESC`,
        contractors.name
      )
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      contractors: results,
      total,
      limit,
      offset,
      hasMore: offset + results.length < total,
    })
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractors' },
      { status: 500 }
    )
  }
}