// lib/db/fix-city-mappings.ts
import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { eq, ilike, and, sql } from 'drizzle-orm'

config({ path: resolve(process.cwd(), '.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set in .env')
  process.exit(1)
}

async function fixCityMappings() {
  console.log('🔧 Fixing city mappings...\n')

  try {
    const client = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false }
    })
    
    const db = drizzle(client, { schema })

    // Get all cities
    const allCities = await db.select().from(schema.cities)
    console.log(`📊 Found ${allCities.length} cities in database`)

    // Build city mapping for common names
    const cityMap = new Map()
    for (const city of allCities) {
      const key = city.name.toLowerCase()
      if (!cityMap.has(key)) {
        cityMap.set(key, city)
      }
    }

    // Get contractors with city_id that doesn't match their address
    const contractorsToFix = await db
      .select()
      .from(schema.contractors)
      .where(
        sql`${schema.contractors.address} IS NOT NULL`
      )

    console.log(`📊 Checking ${contractorsToFix.length} contractors for city mismatches...`)

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const contractor of contractorsToFix) {
      try {
        const address = contractor.address?.toLowerCase() || ''
        
        // Try to find city in address
        let matchedCity = null
        let matchedKey = ''

        for (const [key, city] of cityMap) {
          if (address.includes(key)) {
            if (!matchedCity || key.length > matchedKey.length) {
              matchedCity = city
              matchedKey = key
            }
          }
        }

        if (matchedCity && matchedCity.id !== contractor.cityId) {
          // Check if a contractor with this slug already exists in the target city
          const existing = await db
            .select()
            .from(schema.contractors)
            .where(
              and(
                eq(schema.contractors.slug, contractor.slug),
                eq(schema.contractors.cityId, matchedCity.id),
                eq(schema.contractors.stateId, matchedCity.stateId)
              )
            )
            .limit(1)

          if (existing.length > 0 && existing[0].id !== contractor.id) {
            // Duplicate found - generate unique slug
            console.log(`   ⚠️ Duplicate found for ${contractor.name}, generating unique slug`)
            const newSlug = `${contractor.slug}-${Date.now().toString().slice(-6)}`
            
            await db
              .update(schema.contractors)
              .set({
                cityId: matchedCity.id,
                stateId: matchedCity.stateId,
                slug: newSlug,
                updatedAt: new Date(),
              })
              .where(eq(schema.contractors.id, contractor.id))
          } else {
            console.log(`   ✏️ ${contractor.name}: ${contractor.cityId} → ${matchedCity.id} (${matchedCity.name})`)
            await db
              .update(schema.contractors)
              .set({
                cityId: matchedCity.id,
                stateId: matchedCity.stateId,
                updatedAt: new Date(),
              })
              .where(eq(schema.contractors.id, contractor.id))
          }
          updated++
        } else {
          skipped++
        }
      } catch (error: any) {
        console.error(`   ❌ Error updating ${contractor.name}:`, error.message)
        errors++
      }
    }

    console.log(`\n✅ Updated ${updated} contractors`)
    console.log(`⏭️ Skipped ${skipped} contractors (no match or already correct)`)
    console.log(`❌ Errors: ${errors}`)

    // Verify results
    console.log('\n📊 Verification - Top cities:')
    const cityCounts = await db
      .select({
        cityName: schema.cities.name,
        stateName: schema.states.name,
        count: sql<number>`COUNT(${schema.contractors.id})`
      })
      .from(schema.cities)
      .leftJoin(schema.states, eq(schema.cities.stateId, schema.states.id))
      .leftJoin(schema.contractors, eq(schema.contractors.cityId, schema.cities.id))
      .groupBy(schema.cities.name, schema.states.name)
      .orderBy(sql`count DESC`)
      .limit(20)
    
    for (const row of cityCounts) {
      console.log(`   ${row.cityName}, ${row.stateName}: ${row.count} contractors`)
    }

    // Check Jacksonville specifically
    const jacksonvilleCheck = await db
      .select({
        cityName: schema.cities.name,
        stateName: schema.states.name,
        count: sql<number>`COUNT(${schema.contractors.id})`
      })
      .from(schema.cities)
      .leftJoin(schema.states, eq(schema.cities.stateId, schema.states.id))
      .leftJoin(schema.contractors, eq(schema.contractors.cityId, schema.cities.id))
      .where(ilike(schema.cities.name, '%Jacksonville%'))
      .groupBy(schema.cities.name, schema.states.name)
    
    console.log('\n📊 Jacksonville breakdown:')
    for (const row of jacksonvilleCheck) {
      console.log(`   ${row.cityName}, ${row.stateName}: ${row.count} contractors`)
    }

    await client.end()
  } catch (error: any) {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  }
}

fixCityMappings()