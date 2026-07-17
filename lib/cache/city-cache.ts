// lib/cache/city-cache.ts
import { unstable_cache } from 'next/cache'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

// Cache city data for 1 hour
export const getCityData = unstable_cache(
  async (stateSlug: string, citySlug: string) => {
    const db = getDb()
    
    // Get all contractors for this state and city
    const contractorList = await db
      .select({
        id: contractors.id,
        name: contractors.name,
        businessName: contractors.name,
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
        city: contractors.city,
        citySlug: contractors.citySlug,
        state: contractors.state,
        stateSlug: contractors.stateSlug,
        stateAbbrev: contractors.state_abbrev,
        latitude: contractors.latitude,
        longitude: contractors.longitude,
      })
      .from(contractors)
      .where(
        and(
          eq(contractors.published, true),
          eq(contractors.stateSlug, stateSlug),
          eq(contractors.citySlug, citySlug)
        )
      )
      .orderBy(
        sql`${contractors.rating} DESC NULLS LAST`,
        sql`${contractors.verified} DESC`
      )

    // If no contractors found, return null
    if (contractorList.length === 0) {
      return null
    }

    // Get city and state info from the first contractor
    const firstContractor = contractorList[0]

    // Get contractor count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(contractors)
      .where(
        and(
          eq(contractors.published, true),
          eq(contractors.stateSlug, stateSlug),
          eq(contractors.citySlug, citySlug)
        )
      )

    const totalContractors = countResult[0]?.count || 0

    return {
      state: {
        name: firstContractor.state,
        slug: firstContractor.stateSlug,
        abbreviation: firstContractor.stateAbbrev,
      },
      city: {
        name: firstContractor.city,
        slug: firstContractor.citySlug,
      },
      contractors: contractorList,
      totalContractors,
    }
  },
  ['city-data'],
  { revalidate: 3600 } // Cache for 1 hour
)

// Cache all cities for a state
export const getStateCities = unstable_cache(
  async (stateSlug: string) => {
    const db = getDb()
    
    // Get all contractors in this state
    const contractorsInState = await db
      .select({
        city: contractors.city,
        citySlug: contractors.citySlug,
        state: contractors.state,
        stateSlug: contractors.stateSlug,
        stateAbbrev: contractors.state_abbrev,
      })
      .from(contractors)
      .where(
        and(
          eq(contractors.published, true),
          eq(contractors.stateSlug, stateSlug)
        )
      )
      .groupBy(
        contractors.city,
        contractors.citySlug,
        contractors.state,
        contractors.stateSlug,
        contractors.state_abbrev
      )

    if (contractorsInState.length === 0) {
      return null
    }

    // Get state info from first result
    const firstResult = contractorsInState[0]

    // Get cities with contractor counts
    const citiesWithCounts = await db
      .select({
        city: contractors.city,
        citySlug: contractors.citySlug,
        contractorCount: sql<number>`COUNT(*)`.as('contractor_count'),
      })
      .from(contractors)
      .where(
        and(
          eq(contractors.published, true),
          eq(contractors.stateSlug, stateSlug)
        )
      )
      .groupBy(contractors.city, contractors.citySlug)
      .orderBy(sql`contractor_count DESC`)

    return {
      state: {
        name: firstResult.state,
        slug: firstResult.stateSlug,
        abbreviation: firstResult.stateAbbrev,
      },
      cities: citiesWithCounts.map((c) => ({
        name: c.city,
        slug: c.citySlug,
        contractorCount: Number(c.contractorCount) || 0,
      })),
    }
  },
  ['state-cities'],
  { revalidate: 3600 }
)

// Cache all states with contractor counts
export const getAllStates = unstable_cache(
  async () => {
    const db = getDb()
    
    const statesWithCounts = await db
      .select({
        state: contractors.state,
        stateSlug: contractors.stateSlug,
        stateAbbrev: contractors.state_abbrev,
        contractorCount: sql<number>`COUNT(*)`.as('contractor_count'),
        cityCount: sql<number>`COUNT(DISTINCT ${contractors.city})`.as('city_count'),
      })
      .from(contractors)
      .where(eq(contractors.published, true))
      .groupBy(
        contractors.state,
        contractors.stateSlug,
        contractors.state_abbrev
      )
      .orderBy(sql`contractor_count DESC`)

    return statesWithCounts.map((s) => ({
      name: s.state,
      slug: s.stateSlug,
      abbreviation: s.stateAbbrev,
      contractorCount: Number(s.contractorCount) || 0,
      cityCount: Number(s.cityCount) || 0,
    }))
  },
  ['all-states'],
  { revalidate: 3600 }
)

// Cache featured contractors
export const getFeaturedContractors = unstable_cache(
  async (limit: number = 12) => {
    const db = getDb()
    
    const featured = await db
      .select({
        id: contractors.id,
        name: contractors.name,
        slug: contractors.slug,
        businessName: contractors.name,
        description: contractors.description,
        city: contractors.city,
        citySlug: contractors.citySlug,
        state: contractors.state,
        stateSlug: contractors.stateSlug,
        stateAbbrev: contractors.state_abbrev,
        rating: contractors.rating,
        reviewCount: contractors.reviewCount,
        phone: contractors.phone,
        address: contractors.address,
        emergencyService: contractors.emergencyService,
        verified: contractors.verified,
        featured: contractors.featured,
        servicesOffered: contractors.servicesOffered,
        openingHours: contractors.openingHours,
        latitude: contractors.latitude,
        longitude: contractors.longitude,
      })
      .from(contractors)
      .where(
        and(
          eq(contractors.published, true),
          eq(contractors.featured, true)
        )
      )
      .orderBy(
        sql`${contractors.rating} DESC NULLS LAST`
      )
      .limit(limit)

    return featured
  },
  ['featured-contractors'],
  { revalidate: 3600 }
)