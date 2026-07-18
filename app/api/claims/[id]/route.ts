// app/api/claims/[id]/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { businessClaims, claimHistory, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail, getClaimApprovedEmail, getClaimRejectedEmail } from '@/lib/notifications/email'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb()

    const claim = await db
      .select({
        id: businessClaims.id,
        contractorId: businessClaims.contractorId,
        userEmail: businessClaims.userEmail,
        userName: businessClaims.userName,
        userPhone: businessClaims.userPhone,
        role: businessClaims.role,
        proofDocuments: businessClaims.proofDocuments,
        message: businessClaims.message,
        status: businessClaims.status,
        adminNotes: businessClaims.adminNotes,
        createdAt: businessClaims.createdAt,
        updatedAt: businessClaims.updatedAt,
        contractorName: contractors.name,
        contractorSlug: contractors.slug,
        contractorCity: contractors.city,
        contractorState: contractors.state,
        contractorPhone: contractors.phone,
        contractorAddress: contractors.address,
      })
      .from(businessClaims)
      .leftJoin(contractors, eq(businessClaims.contractorId, contractors.id))
      .where(eq(businessClaims.id, parseInt(id)))
      .limit(1)

    if (!claim.length) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Get claim history
    const history = await db
      .select()
      .from(claimHistory)
      .where(eq(claimHistory.claimId, parseInt(id)))
      .orderBy(claimHistory.createdAt)

    return NextResponse.json({ claim: claim[0], history })
  } catch (error) {
    console.error('Error fetching claim:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claim' },
      { status: 500 }
    )
  }
}

// PATCH - Update claim status (approve/reject)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, adminNotes, performedBy } = body

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const db = getDb()
    const claimId = parseInt(id)

    // Get current claim with contractor details
    const current = await db
      .select({
        id: businessClaims.id,
        contractorId: businessClaims.contractorId,
        userEmail: businessClaims.userEmail,
        userName: businessClaims.userName,
        status: businessClaims.status,
        contractorName: contractors.name,
      })
      .from(businessClaims)
      .leftJoin(contractors, eq(businessClaims.contractorId, contractors.id))
      .where(eq(businessClaims.id, claimId))
      .limit(1)

    if (!current.length) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Update claim
    const [updated] = await db
      .update(businessClaims)
      .set({
        status,
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(businessClaims.id, claimId))
      .returning()

    // Log to history
    await db.insert(claimHistory).values({
      claimId,
      action: status,
      note: `Claim ${status} by ${performedBy || 'admin'}${adminNotes ? `: ${adminNotes}` : ''}`,
      performedBy: performedBy || 'admin',
    })

    // If approved, update contractor and send email
    if (status === 'approved') {
      const contractorId = current[0].contractorId

      if (contractorId != null) {
        await db
          .update(contractors)
          .set({
            verified: true,
          })
          .where(eq(contractors.id, contractorId))
      }

      // Send email notification
      try {
        const emailData = getClaimApprovedEmail({
          contractorName: current[0].contractorName,
        })
        await sendEmail({
          to: current[0].userEmail,
          subject: emailData.subject,
          html: emailData.html,
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
      }
    } else if (status === 'rejected') {
      // Send rejection email
      try {
        const emailData = getClaimRejectedEmail({
          contractorName: current[0].contractorName,
          adminNotes,
        })
        await sendEmail({
          to: current[0].userEmail,
          subject: emailData.subject,
          html: emailData.html,
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
      }
    }

    return NextResponse.json({ success: true, claim: updated })
  } catch (error) {
    console.error('Error updating claim:', error)
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a claim (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb()
    const claimId = parseInt(id)

    // Delete claim history first
    await db
      .delete(claimHistory)
      .where(eq(claimHistory.claimId, claimId))

    // Delete claim
    await db
      .delete(businessClaims)
      .where(eq(businessClaims.id, claimId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting claim:', error)
    return NextResponse.json(
      { error: 'Failed to delete claim' },
      { status: 500 }
    )
  }
}