// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Global singleton for database connection
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined
  db: ReturnType<typeof drizzle> | undefined
}

// Connection configuration
const createConnection = () => {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment variables')
  }

  // Use transaction pooler (port 6543) for better connection management
  const client = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
    // Connection pool settings
    max: 10, // Maximum connections in pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout
    max_lifetime: 60 * 5, // Close connections after 5 minutes
    // Prevent connection leaks
    onclose: (conn) => {
      console.log('🔌 Database connection closed')
    },
  })

  return client
}

// Get database connection (singleton)
function getConnection() {
  if (!globalForDb.conn) {
    console.log('🔌 Creating new database connection pool...')
    globalForDb.conn = createConnection()
  }
  return globalForDb.conn
}

// Get drizzle instance (singleton)
export function getDb() {
  if (!globalForDb.db) {
    const conn = getConnection()
    globalForDb.db = drizzle(conn, { schema })
    console.log('✅ Database connection pool ready')
  }
  return globalForDb.db
}

// For backward compatibility
export const db = getDb()

// Helper to close connection (useful for testing/cleanup)
export async function closeDb() {
  if (globalForDb.conn) {
    await globalForDb.conn.end()
    globalForDb.conn = undefined
    globalForDb.db = undefined
    console.log('🔌 Database connection pool closed')
  }
}

// Export schema for convenience
export * from './schema'