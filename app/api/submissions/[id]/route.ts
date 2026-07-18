// app/api/submissions/[id]/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { businessSubmissions, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb()

    const submission = await db
      .select()
      .from(businessSubmissions)
      .where(eq(businessSubmissions.id, parseInt(id)))
      .limit(1)

    if (!submission.length) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ submission: submission[0] })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}

// PATCH - Approve/reject submission
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, adminNotes } = body

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const db = getDb()
    const submissionId = parseInt(id)

    const [updated] = await db
      .update(businessSubmissions)
      .set({
        status,
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(businessSubmissions.id, submissionId))
      .returning()

    // If approved, create a new contractor
    if (status === 'approved') {
      const slug = updated.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Cast to any to satisfy generated typings for the contractors insert
      await db.insert(contractors).values({
        name: updated.businessName,
        slug,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        state_abbrev: updated.stateAbbrev,
        zip_code: updated.zipCode,
        phone: updated.phone,
        website: updated.website,
        email: updated.email,
        description: updated.description,
        services_offered: updated.servicesOffered,
        latitude: updated.latitude,
        longitude: updated.longitude,
        published: true,
        verified: false,
      } as any)
    }

    return NextResponse.json({ success: true, submission: updated })
  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}