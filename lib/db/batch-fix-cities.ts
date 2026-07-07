// lib/db/batch-fix-cities.ts
import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { eq, ilike, isNull, sql } from 'drizzle-orm'

config({ path: resolve(process.cwd(), '.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set in .env')
  process.exit(1)
}

async function batchFixCities() {
  console.log('🔧 Batch fixing city mappings...\n')

  try {
    const client = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false }
    })
    
    const db = drizzle(client, { schema })

    // Use raw SQL for batch update
    const result = await db.execute(sql`
      WITH city_matches AS (
        SELECT 
          ct.id as contractor_id,
          c.id as city_id,
          c.state_id,
          ROW_NUMBER() OVER (PARTITION BY ct.id ORDER BY 
            CASE 
              WHEN ct.address ILIKE '%' || c.name || '%' THEN 1
              WHEN ct.name ILIKE '%' || c.name || '%' THEN 2
              WHEN ct.business_name ILIKE '%' || c.name || '%' THEN 3
              ELSE 4
            END
          ) as rn
        FROM contractors ct
        CROSS JOIN cities c
        WHERE (ct.city_id IS NULL OR ct.city_id = 0)
        AND (
          ct.address ILIKE '%' || c.name || '%'
          OR ct.name ILIKE '%' || c.name || '%'
          OR ct.business_name ILIKE '%' || c.name || '%'
        )
      )
      UPDATE contractors 
      SET 
        city_id = cm.city_id,
        state_id = cm.state_id,
        updated_at = NOW()
      FROM city_matches cm
      WHERE contractors.id = cm.contractor_id
      AND cm.rn = 1
      AND contractors.city_id IS NULL
      RETURNING contractors.id, contractors.name
    `)

    console.log(`✅ Updated ${result.length} contractors`)

    // Show some updated contractors
    if (result.length > 0) {
      console.log('\n📋 Sample of updated contractors:')
      for (const row of result.slice(0, 10)) {
        console.log(`   - ${row.name} (ID: ${row.id})`)
      }
    }

    // Check remaining
    const remaining = await db
      .select()
      .from(schema.contractors)
      .where(
        sql`${schema.contractors.cityId} IS NULL OR ${schema.contractors.cityId} = 0`
      )
    
    console.log(`\n📊 Remaining contractors without city: ${remaining.length}`)

    // Show top cities now
    console.log('\n📊 Top 20 cities after update:')
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

    await client.end()
  } catch (error: any) {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  }
}

batchFixCities()