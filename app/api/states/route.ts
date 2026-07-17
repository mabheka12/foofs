// app/api/states/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET() {
  try {
    const db = getDb()

    // Get states with contractor counts
    const statesWithCounts = await db
      .select({
        name: contractors.state,
        slug: contractors.stateSlug,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(contractors)
      .where(eq(contractors.published, true))
      .groupBy(contractors.state, contractors.stateSlug)
      .orderBy(sql`count DESC`)

    // Format the response
    const states = statesWithCounts
      .filter(item => item.name)
      .map((item) => ({
        name: item.name || 'Unknown',
        slug: item.slug || 'unknown',
        count: Number(item.count) || 0,
      }))

    return NextResponse.json(states)
  } catch (error) {
    console.error('Error fetching states:', error)
    return NextResponse.json(
      { error: 'Failed to fetch states' },
      { status: 500 }
    )
  }
}