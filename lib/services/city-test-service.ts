// lib/services/city-test-service.ts
import { getDb } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

interface CityStats {
  cityId: number
  cityName: string
  citySlug: string
  stateId: number
  stateName: string
  stateSlug: string
  contractorCount: number
  activeContractorCount: number
}

// Cache the city stats for 1 hour
export const getCityStats = unstable_cache(
  async () => {
    const db = getDb()
    
    const result = await db.execute(sql`
      SELECT 
        city_id,
        city_name,
        city_slug,
        state_id,
        state_name,
        state_slug,
        contractor_count,
        active_contractor_count
      FROM city_stats
      WHERE contractor_count > 0
      ORDER BY state_name, city_name
    `)
    
    return result as unknown as CityStats[]
  },
  ['city-stats'],
  { revalidate: 3600 } // Cache for 1 hour
)

// Get stats for a specific state
export const getStateCityStats = unstable_cache(
  async (stateSlug: string) => {
    const db = getDb()
    
    const result = await db.execute(sql`
      SELECT 
        city_id,
        city_name,
        city_slug,
        state_id,
        state_name,
        state_slug,
        contractor_count,
        active_contractor_count
      FROM city_stats
      WHERE state_slug = ${stateSlug}
      AND contractor_count > 0
      ORDER BY city_name
    `)
    
    return result as unknown as CityStats[]
  },
  ['state-city-stats'],
  { revalidate: 3600 }
)

// Get problematic cities (where expected > 0 but actual = 0)
export const getProblematicCities = unstable_cache(
  async () => {
    const db = getDb()
    
    // Get all cities with contractor counts
    const stats = await getCityStats()
    
    // Check each city's actual contractors
    const problematic: CityStats[] = []
    
    for (const stat of stats) {
      const actual = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM contractors
        WHERE city_id = ${stat.cityId}
        AND state_id = ${stat.stateId}
        AND published = true
      `)

      const actualRows = actual as unknown as Array<{ count: number }>
      const actualCount = Number(actualRows[0]?.count || 0)
      
      // If expected > 0 but actual = 0, it's problematic
      if (stat.contractorCount > 0 && actualCount === 0) {
        problematic.push({
          ...stat,
          activeContractorCount: actualCount
        })
      }
    }
    
    return problematic
  },
  ['problematic-cities'],
  { revalidate: 3600 }
)