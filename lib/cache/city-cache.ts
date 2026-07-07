// lib/cache/city-cache.ts
import { unstable_cache } from 'next/cache'
import { getDb } from '@/lib/db'
import { states, cities, contractors } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

// Cache city data for 1 hour
export const getCityData = unstable_cache(
  async (stateSlug: string, citySlug: string) => {
    const db = getDb()
    
    // Get state
    const stateData = await db
      .select()
      .from(states)
      .where(eq(states.slug, stateSlug))
      .limit(1)

    if (!stateData.length) return null

    // Get city with state filter
    const cityData = await db
      .select()
      .from(cities)
      .where(
        and(
          eq(cities.slug, citySlug),
          eq(cities.stateId, stateData[0].id)
        )
      )
      .limit(1)

    if (!cityData.length) return null

    // Get contractors
    const contractorList = await db
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
        openingHours: contractors.openingHours,
        cityName: cities.name,
        citySlug: cities.slug,
        stateName: states.name,
        stateSlug: states.slug,
        stateAbbr: states.abbreviation,
      })
      .from(contractors)
      .innerJoin(cities, eq(contractors.cityId, cities.id))
      .innerJoin(states, eq(contractors.stateId, states.id))
      .where(
        and(
          eq(contractors.cityId, cityData[0].id),
          eq(contractors.stateId, stateData[0].id),
          eq(contractors.published, true)
        )
      )
      .orderBy(
        sql`${contractors.rating} DESC NULLS LAST`,
        sql`${contractors.verified} DESC`
      )

    return {
      state: stateData[0],
      city: cityData[0],
      contractors: contractorList,
    }
  },
  ['city-data'],
  { revalidate: 3600 } // Cache for 1 hour
)

// Cache all cities for a state
export const getStateCities = unstable_cache(
  async (stateSlug: string) => {
    const db = getDb()
    
    const stateData = await db
      .select()
      .from(states)
      .where(eq(states.slug, stateSlug))
      .limit(1)

    if (!stateData.length) return null

    const citiesWithCounts = await db
      .select({
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
        contractorCount: sql<number>`COUNT(DISTINCT ${contractors.id})`.as('contractor_count'),
      })
      .from(cities)
      .leftJoin(contractors, 
        and(
          eq(contractors.cityId, cities.id),
          eq(contractors.published, true)
        )
      )
      .where(eq(cities.stateId, stateData[0].id))
      .groupBy(cities.id, cities.name, cities.slug)
      .orderBy(sql`contractor_count DESC`, cities.name)

    return {
      state: stateData[0],
      cities: citiesWithCounts,
    }
  },
  ['state-cities'],
  { revalidate: 3600 }
)