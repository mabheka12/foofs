// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { and, ilike, eq, sql, or } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const location = searchParams.get('location')

    const db = getDb()

    let whereConditions = []
    
    if (q) {
      whereConditions.push(
        or(
          ilike(contractors.name, `%${q}%`),
          ilike(contractors.description, `%${q}%`)
        )
      )
    }

    if (location) {
      whereConditions.push(
        or(
          ilike(contractors.city, `%${location}%`),
          ilike(contractors.state, `%${location}%`),
          ilike(contractors.state_abbrev, `%${location}%`)
        )
      )
    }

    whereConditions.push(eq(contractors.published, true))

    const results = await db
      .select({
        id: contractors.id,
        name: contractors.name,
        slug: contractors.slug,
        city: contractors.city,
        state: contractors.state,
        stateAbbrev: contractors.state_abbrev,
        rating: contractors.rating,
        description: contractors.description,
        phone: contractors.phone,
        address: contractors.address,
        emergencyService: contractors.emergencyService,
        verified: contractors.verified,
        featured: contractors.featured,
      })
      .from(contractors)
      .where(and(...whereConditions))
      .orderBy(contractors.rating)
      .limit(50)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}