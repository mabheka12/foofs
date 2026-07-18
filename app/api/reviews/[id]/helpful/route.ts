// app/api/reviews/[id]/helpful/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { appReviews, reviewHelpfulVotes } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

// POST - Mark a review as helpful
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userEmail } = body

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      )
    }

    const db = getDb()
    const reviewId = parseInt(id)

    // Check if user already voted
    const existing = await db
      .select()
      .from(reviewHelpfulVotes)
      .where(
        and(
          eq(reviewHelpfulVotes.reviewId, reviewId),
          eq(reviewHelpfulVotes.userEmail, userEmail)
        )
      )
      .limit(1)

    if (existing.length) {
      return NextResponse.json(
        { error: 'You already marked this review as helpful' },
        { status: 400 }
      )
    }

    // Add vote
    await db.insert(reviewHelpfulVotes).values({
      reviewId,
      userEmail,
    })

    // Increment helpful count
    await db
      .update(appReviews)
      .set({
        helpfulCount: sql`${appReviews.helpfulCount} + 1`,
      })
      .where(eq(appReviews.id, reviewId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking review as helpful:', error)
    return NextResponse.json(
      { error: 'Failed to mark review as helpful' },
      { status: 500 }
    )
  }
}