// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()
    
    // Simple database health check
    const result = await db.execute(sql`SELECT 1 as healthy`)
    
    // Get counts
    const stateCount = await db.execute(sql`SELECT COUNT(*) as count FROM states`)
    const cityCount = await db.execute(sql`SELECT COUNT(*) as count FROM cities`)
    const contractorCount = await db.execute(sql`SELECT COUNT(*) as count FROM contractors WHERE published = true`)
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      counts: {
        states: parseInt(String(stateCount[0]?.count ?? '0'), 10),
        cities: parseInt(String(cityCount[0]?.count ?? '0'), 10),
        contractors: parseInt(String(contractorCount[0]?.count ?? '0'), 10),
      }
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: (error as Error).message },
      { status: 500 }
    )
  }
}