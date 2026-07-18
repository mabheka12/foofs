// app/api/reviews/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { appReviews, reviewHelpfulVotes } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

// GET - Fetch reviews
// app/api/reviews/route.ts - Update GET function
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const contractorId = searchParams.get('contractorId')
  const status = searchParams.get('status')
  const source = searchParams.get('source') // 'platform' | 'google' | 'all'
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const db = getDb()
    let conditions: any[] = []

    if (contractorId) {
      conditions.push(eq(appReviews.contractorId, parseInt(contractorId)))
    }

    if (status && status !== 'all') {
      conditions.push(eq(appReviews.status, status))
    }

    if (source && source !== 'all') {
      conditions.push(eq(appReviews.source, source))
    }

    const reviews = await db
      .select()
      .from(appReviews)
      .where(and(...conditions))
      .orderBy(desc(appReviews.createdAt))
      .limit(limit)
      .offset(offset)

    const total = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(appReviews)
      .where(and(...conditions))

    return NextResponse.json({
      reviews,
      total: total[0]?.count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST - Submit a review
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      contractorId,
      userEmail,
      userName,
      rating,
      title,
      content,
      pros,
      cons,
      images,
    } = body

    if (!contractorId || !userEmail || !userName || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const db = getDb()

    // Check if user already reviewed this contractor
    const existing = await db
      .select()
      .from(appReviews)
      .where(
        and(
          eq(appReviews.contractorId, contractorId),
          eq(appReviews.userEmail, userEmail)
        )
      )
      .limit(1)

    if (existing.length) {
      return NextResponse.json(
        { error: 'You have already reviewed this business' },
        { status: 400 }
      )
    }

    // ✅ Fix: Handle empty arrays properly
    const imagesArray = images && images.length > 0 ? images : null

    const [review] = await db
      .insert(appReviews)
      .values({
        contractorId,
        userEmail,
        userName,
        rating,
        title,
        content,
        pros,
        cons,
        images: imagesArray,
        status: 'pending',
      })
      .returning()

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}