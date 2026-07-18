// app/api/submissions/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { businessSubmissions } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'

// GET - Fetch submissions (admin only)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const db = getDb()
    let conditions: any[] = []

    if (status && status !== 'all') {
      conditions.push(eq(businessSubmissions.status, status))
    }

    const submissions = await db
      .select()
      .from(businessSubmissions)
      .where(and(...conditions))
      .orderBy(desc(businessSubmissions.createdAt))
      .limit(limit)
      .offset(offset)

    const total = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(businessSubmissions)
      .where(and(...conditions))

    return NextResponse.json({
      submissions,
      total: total[0]?.count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

// POST - Submit a new business
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      businessName,
      address,
      city,
      state,
      stateAbbrev,
      zipCode,
      phone,
      website,
      email,
      description,
      servicesOffered,
      latitude,
      longitude,
      submittedByEmail,
      submittedByName,
    } = body

    if (!businessName || !submittedByEmail || !submittedByName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = getDb()

    // Check if business already exists
    const existing = await db
      .select()
      .from(businessSubmissions)
      .where(
        and(
          eq(businessSubmissions.businessName, businessName),
          eq(businessSubmissions.status, 'pending')
        )
      )
      .limit(1)

    if (existing.length) {
      return NextResponse.json(
        { error: 'This business has already been submitted' },
        { status: 400 }
      )
    }

    const [submission] = await db
      .insert(businessSubmissions)
      .values({
        businessName,
        address,
        city,
        state,
        stateAbbrev,
        zipCode,
        phone,
        website,
        email,
        description,
        servicesOffered: servicesOffered || [],
        latitude,
        longitude,
        submittedByEmail,
        submittedByName,
        status: 'pending',
      })
      .returning()

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error('Error submitting business:', error)
    return NextResponse.json(
      { error: 'Failed to submit business' },
      { status: 500 }
    )
  }
}