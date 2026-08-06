// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { appReviews, reviewHelpfulVotes, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail, getReviewApprovedEmail, getReviewRejectedEmail } from '@/lib/notifications/email'

// GET /api/reviews/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  // ✅ Await params
  const { id } = await params
  const reviewId = parseInt(id)

  if (isNaN(reviewId)) {
    return NextResponse.json(
      { error: 'Invalid review ID' },
      { status: 400 }
    )
  }

  try {
    const review = await db
      .select()
      .from(appReviews)
      .where(eq(appReviews.id, reviewId))
      .limit(1)

    if (!review.length) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(review[0])
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

// PATCH /api/reviews/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  // ✅ Await params
  const { id } = await params
  const reviewId = parseInt(id)

  if (isNaN(reviewId)) {
    return NextResponse.json(
      { error: 'Invalid review ID' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const { status, adminNotes } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    // Get review with contractor info
    const reviewResult = await db
      .select()
      .from(appReviews)
      .where(eq(appReviews.id, reviewId))
      .limit(1)

    if (!reviewResult.length) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const review = reviewResult[0]

    if (review.contractorId == null) {
      return NextResponse.json(
        { error: 'Review contractor not found' },
        { status: 404 }
      )
    }

    // Update review status
    await db
      .update(appReviews)
      .set({
        status: status,
        updatedAt: new Date(),
      })
      .where(eq(appReviews.id, reviewId))

    // Get contractor info for email
    const contractorResult = await db
      .select({
        name: contractors.name,
        slug: contractors.slug,
      })
      .from(contractors)
      .where(eq(contractors.id, review.contractorId))
      .limit(1)

    const contractor = contractorResult[0]

    // Send email notification to user
    const userEmail = review.userEmail
    if (userEmail && contractor) {
      try {
        let emailResult
        const reviewData = {
          id: review.id,
          contractorName: contractor.name,
          contractorSlug: contractor.slug,
          rating: review.rating,
          title: review.title || undefined,
          content: review.content || undefined,
          status: status as 'approved' | 'rejected',
          adminNotes: adminNotes || undefined,
        }

        if (status === 'approved') {
          emailResult = await getReviewApprovedEmail(reviewData, userEmail)
        } else {
          emailResult = await getReviewRejectedEmail(reviewData, userEmail)
        }

        if (!emailResult.success) {
          console.error('Failed to send email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('Email error:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Review ${status} successfully`,
      reviewId: review.id,
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  // ✅ Await params
  const { id } = await params
  const reviewId = parseInt(id)

  if (isNaN(reviewId)) {
    return NextResponse.json(
      { error: 'Invalid review ID' },
      { status: 400 }
    )
  }

  try {
    // Delete review and associated helpful votes
    await db
      .delete(reviewHelpfulVotes)
      .where(eq(reviewHelpfulVotes.reviewId, reviewId))

    await db
      .delete(appReviews)
      .where(eq(appReviews.id, reviewId))

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}