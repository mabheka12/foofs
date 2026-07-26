// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// IMPORTANT: this must be cached on `globalThis`, not a plain module-scope
// `let`. In Next.js dev mode, Fast Refresh re-evaluates modules when files
// change -- a module-scope `let client = null` gets reset to `null` on
// every one of those reloads, which silently creates a BRAND NEW postgres
// pool (up to `max: 10` connections) on top of whichever old pool(s) are
// still holding their connections open. A handful of hot-reloads is enough
// to blow past Supabase's session-mode pooler cap of 15 connections --
// which is exactly the "EMAXCONNSESSION: max clients reached" error.
// `globalThis` survives that module re-evaluation, so the same client/pool
// gets reused across reloads instead of leaking a new one each time.

type DbGlobal = typeof globalThis & {
  __dbClient?: postgres.Sql
  __db?: ReturnType<typeof drizzle>
}

const g = globalThis as DbGlobal

export function getDb() {
  if (!g.__db) {
    if (!g.__dbClient) {
      const connectionString = process.env.DATABASE_URL!

      g.__dbClient = postgres(connectionString, {
        // Use a smaller pool for serverless/edge
        max: process.env.NODE_ENV === 'production' ? 3 : 10,
        idle_timeout: 20,
        connect_timeout: 10,
        // For serverless, keep connections alive
        prepare: false,
      })
    }
    g.__db = drizzle(g.__dbClient, { schema })
  }
  return g.__db
}

// For cleanup during build
export async function closeDb() {
  if (g.__dbClient) {
    await g.__dbClient.end()
    g.__dbClient = undefined
    g.__db = undefined
  }
}