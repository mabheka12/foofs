// app/api/reviews/[id]/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { appReviews, reviewHelpfulVotes, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail, getReviewApprovedEmail, getReviewRejectedEmail } from '@/lib/notifications/email'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb()

    const review = await db
      .select()
      .from(appReviews)
      .where(eq(appReviews.id, parseInt(id)))
      .limit(1)

    if (!review.length) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ review: review[0] })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

// PATCH - Update review status (admin moderation)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, adminNotes } = body

    if (!status || !['approved', 'rejected', 'flagged', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const db = getDb()
    const reviewId = parseInt(id)

    // Get current review with contractor details
    const current = await db
      .select({
        id: appReviews.id,
        userEmail: appReviews.userEmail,
        userName: appReviews.userName,
        rating: appReviews.rating,
        title: appReviews.title,
        content: appReviews.content,
        contractorName: contractors.name,
        contractorSlug: contractors.slug,
      })
      .from(appReviews)
      .leftJoin(contractors, eq(appReviews.contractorId, contractors.id))
      .where(eq(appReviews.id, reviewId))
      .limit(1)

    if (!current.length) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const [updated] = await db
      .update(appReviews)
      .set({
        status,
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(appReviews.id, reviewId))
      .returning()

    // Send email notification
    try {
      if (status === 'approved') {
        const emailData = getReviewApprovedEmail({
          contractorName: current[0].contractorName,
          contractorSlug: current[0].contractorSlug,
          rating: current[0].rating,
          title: current[0].title,
          content: current[0].content,
        })
        await sendEmail({
          to: current[0].userEmail,
          subject: emailData.subject,
          html: emailData.html,
        })
      } else if (status === 'rejected') {
        const emailData = getReviewRejectedEmail({
          contractorName: current[0].contractorName,
          adminNotes,
        })
        await sendEmail({
          to: current[0].userEmail,
          subject: emailData.subject,
          html: emailData.html,
        })
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
    }

    return NextResponse.json({ success: true, review: updated })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a review
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb()
    const reviewId = parseInt(id)

    // Delete helpful votes first
    await db
      .delete(reviewHelpfulVotes)
      .where(eq(reviewHelpfulVotes.reviewId, reviewId))

    // Delete review
    await db
      .delete(appReviews)
      .where(eq(appReviews.id, reviewId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}