// app/api/contractors/route.ts (With toast notifications in API)
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq, and, ilike, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  const city = searchParams.get('city')
  const service = searchParams.get('service')
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    let conditions = [eq(contractors.published, true)]

    if (state) {
      conditions.push(eq(contractors.stateId, parseInt(state)))
    }

    if (city) {
      conditions.push(eq(contractors.cityId, parseInt(city)))
    }

    if (service) {
      conditions.push(
        sql`${contractors.servicesOffered} @> ${[service]}`
      )
    }

    if (query) {
      conditions.push(
        sql`${contractors.name} ILIKE ${`%${query}%`} OR ${contractors.businessName} ILIKE ${`%${query}%`}`
      )
    }

    const results = await db
      .select()
      .from(contractors)
      .where(and(...conditions))
      .orderBy(
        sql`${contractors.rating} DESC NULLS LAST`,
        sql`${contractors.verified} DESC`
      )
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      contractors: results,
      total: results.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractors' },
      { status: 500 }
    )
  }
}