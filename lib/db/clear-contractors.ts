// lib/db/clear-contractors.ts
import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { sql } from 'drizzle-orm'

config({ path: resolve(process.cwd(), '.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set in .env')
  process.exit(1)
}

async function clearContractors() {
  console.log('🗑️ Clearing contractors table...')
  
  try {
    const client = postgres(databaseUrl!, {
      ssl: { rejectUnauthorized: false }
    })
    
    const db = drizzle(client, { schema })
    
    // Truncate table
    await db.execute(sql`TRUNCATE TABLE contractors RESTART IDENTITY CASCADE`)
    
    console.log('✅ Contractors table cleared successfully!')
    console.log('📊 Table is now empty')
    
    await client.end()
  } catch (error: any) {
    console.error('❌ Failed to clear contractors:', error.message)
    process.exit(1)
  }
}

clearContractors()