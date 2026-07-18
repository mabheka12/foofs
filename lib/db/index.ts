// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let client: postgres.Sql | null = null
let db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!db) {
    if (!client) {
      // Use a smaller pool for serverless/edge
      const connectionString = process.env.DATABASE_URL!
      
      client = postgres(connectionString, {
        max: process.env.NODE_ENV === 'production' ? 3 : 10,
        idle_timeout: 20,
        connect_timeout: 10,
        // For serverless, keep connections alive
        prepare: false,
      })
    }
    db = drizzle(client, { schema })
  }
  return db
}

// For cleanup during build
export async function closeDb() {
  if (client) {
    await client.end()
    client = null
    db = null
  }
}