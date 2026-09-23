// lib/db/index.ts

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as coreSchema from './schema'
import * as ownerSchema from './ownerSchema'

const fullSchema = {
  ...coreSchema,
  ...ownerSchema,
}

type DbGlobal = typeof globalThis & {
  __dbClient?: postgres.Sql
  __db?: ReturnType<typeof drizzle>
}

const g = globalThis as DbGlobal

export function getDb() {
  if (!g.__db) {
    if (!g.__dbClient) {
      const connectionString =
        process.env.DATABASE_URL

      if (!connectionString) {
        throw new Error(
          'DATABASE_URL is not configured'
        )
      }

      g.__dbClient = postgres(
        connectionString,
        {
          max:
            process.env.NODE_ENV === 'production'
              ? 3
              : 10,

          idle_timeout: 20,
          connect_timeout: 10,
          prepare: false,
        }
      )
    }

    g.__db = drizzle(
      g.__dbClient,
      {
        schema: fullSchema,
      }
    )
  }

  return g.__db
}

export async function closeDb() {
  if (g.__dbClient) {
    await g.__dbClient.end()

    g.__dbClient = undefined
    g.__db = undefined
  }
}