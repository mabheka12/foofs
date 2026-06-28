// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contractors, cities, states } from '@/lib/db/schema'
import { eq, and, ilike, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '20')

  if (!q || q.length < 2) {
    return NextResponse.json({ contractors: [] })
  }

  try {
    const results = await db
      .select({
        contractor: contractors,
        city: cities,
        state: states,
      })
      .from(contractors)
      .innerJoin(cities, eq(contractors.cityId, cities.id))
      .innerJoin(states, eq(contractors.stateId, states.id))
      .where(
        and(
          eq(contractors.published, true),
          sql`${contractors.name} ILIKE ${`%${q}%`} OR ${contractors.businessName} ILIKE ${`%${q}%`} OR ${cities.name} ILIKE ${`%${q}%`}`
        )
      )
      .limit(limit)

    return NextResponse.json({ contractors: results })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search contractors' },
      { status: 500 }
    )
  }
}