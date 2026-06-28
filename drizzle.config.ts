// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config()

console.log('📡 Using DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  // use the correct property name expected by drizzle-kit
  driver: 'pg',
  // drizzle-kit typings for dbCredentials can be restrictive depending on the target
  // environment. Cast to any to allow using a connection string from env vars.
  dbCredentials: ({ connectionString: process.env.DATABASE_URL || '' } as any),
})
