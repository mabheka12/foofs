// app/api/contractors/search/route.ts
//
// Powers the "find your listing" step on /advertise. Deliberately narrow:
// only returns published contractors, only the fields needed to identify
// a listing and pick it, and requires a real query string to avoid
// dumping the whole table.

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { and, eq, ilike, or } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const db = getDb()
  const pattern = `%${q}%`

  const results = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      city: contractors.city,
      stateAbbrev: contractors.state_abbrev,
      slug: contractors.slug,
    })
    .from(contractors)
    .where(
      and(
        eq(contractors.published, true),
        or(ilike(contractors.name, pattern), ilike(contractors.city, pattern))
      )
    )
    .limit(10)

  return NextResponse.json({ results })
}