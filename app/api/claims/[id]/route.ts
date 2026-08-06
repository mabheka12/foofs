// app/api/claims/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { businessClaims, claimHistory, contractors } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { sendEmail, getClaimApprovedEmail, getClaimRejectedEmail } from '@/lib/notifications/email'

// GET /api/claims/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  // ✅ Await params
  const { id } = await params
  const claimId = parseInt(id)

  if (isNaN(claimId)) {
    return NextResponse.json(
      { error: 'Invalid claim ID' },
      { status: 400 }
    )
  }

  try {
    const claim = await db
      .select()
      .from(businessClaims)
      .where(eq(businessClaims.id, claimId))
      .limit(1)

    if (!claim.length) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(claim[0])
  } catch (error) {
    console.error('Error fetching claim:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claim' },
      { status: 500 }
    )
  }
}

// PATCH /api/claims/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  // ✅ Await params
  const { id } = await params
  const claimId = parseInt(id)

  if (isNaN(claimId)) {
    return NextResponse.json(
      { error: 'Invalid claim ID' },
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

    // Get the claim with contractor info
    const claimResult = await db
      .select()
      .from(businessClaims)
      .where(eq(businessClaims.id, claimId))
      .limit(1)

    if (!claimResult.length) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    const claim = claimResult[0]
    const contractorId = claim.contractorId

    if (contractorId == null) {
      return NextResponse.json(
        { error: 'Claim missing contractor ID' },
        { status: 400 }
      )
    }

    const contractorResult = await db
      .select({ name: contractors.name })
      .from(contractors)
      .where(eq(contractors.id, contractorId))
      .limit(1)

    const contractorName = contractorResult.length
      ? contractorResult[0].name
      : 'Your Business'

    // Update claim status
    await db
      .update(businessClaims)
      .set({
        status: status,
        updatedAt: new Date(),
      })
      .where(eq(businessClaims.id, claimId))

    // Add to history
    await db.insert(claimHistory).values({
      claimId: claimId,
      action: status,
      note: adminNotes || null,
      createdAt: new Date(),
    })

    // If approved, update contractor's verified status
    if (status === 'approved') {
      await db
        .update(contractors)
        .set({
          verified: true,
          updatedAt: new Date(),
        })
        .where(eq(contractors.id, contractorId))
    }

    // Send email notification
    const userEmail = claim.userEmail

    if (userEmail) {
      try {
        let emailResult
        if (status === 'approved') {
          emailResult = await getClaimApprovedEmail({
            id: claim.id,
            contractorName: contractorName,
            contractorId: contractorId,
            email: userEmail,
            status: 'approved',
          })
        } else {
          emailResult = await getClaimRejectedEmail({
            id: claim.id,
            contractorName: contractorName,
            contractorId: contractorId,
            email: userEmail,
            status: 'rejected',
            adminNotes: adminNotes || undefined,
          })
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
      message: `Claim ${status} successfully`,
      claimId: claim.id,
    })
  } catch (error) {
    console.error('Error updating claim:', error)
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    )
  }
}

// DELETE /api/claims/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  // ✅ Await params
  const { id } = await params
  const claimId = parseInt(id)

  if (isNaN(claimId)) {
    return NextResponse.json(
      { error: 'Invalid claim ID' },
      { status: 400 }
    )
  }

  try {
    // Delete claim and associated history
    await db
      .delete(claimHistory)
      .where(eq(claimHistory.claimId, claimId))

    await db
      .delete(businessClaims)
      .where(eq(businessClaims.id, claimId))

    return NextResponse.json({
      success: true,
      message: 'Claim deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting claim:', error)
    return NextResponse.json(
      { error: 'Failed to delete claim' },
      { status: 500 }
    )
  }
}