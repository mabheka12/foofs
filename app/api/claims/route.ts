// app/api/claims/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { businessClaims, claimHistory, contractors } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

// GET - Fetch claims (admin only)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const db = getDb()
    let conditions: any[] = []

    if (status && status !== 'all') {
      conditions.push(eq(businessClaims.status, status))
    }

    const claims = await db
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
      })
      .from(businessClaims)
      .leftJoin(contractors, eq(businessClaims.contractorId, contractors.id))
      .where(and(...conditions))
      .orderBy(desc(businessClaims.createdAt))
      .limit(limit)
      .offset(offset)

    const total = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(businessClaims)
      .where(and(...conditions))

    return NextResponse.json({
      claims,
      total: total[0]?.count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    )
  }
}

// POST - Submit a new claim
export async function POST(request: Request) {
  try {
    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { contractorId, userPhone, role, proofDocuments, message } = body

    if (!contractorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = getDb()

    // Check if claim already exists
    const existing = await db
      .select()
      .from(businessClaims)
      .where(
        and(
          eq(businessClaims.contractorId, contractorId),
          eq(businessClaims.userEmail, user.email!),
          eq(businessClaims.status, 'pending')
        )
      )
      .limit(1)

    if (existing.length) {
      return NextResponse.json(
        { error: 'You already have a pending claim for this business' },
        { status: 400 }
      )
    }

    const [claim] = await db
      .insert(businessClaims)
      .values({
        contractorId,
        userEmail: user.email!,
        userName: user.user_metadata.name || user.email!,
        userPhone,
        role: role || 'owner',
        proofDocuments: proofDocuments || [],
        message,
        status: 'pending',
      })
      .returning()

    // Log to claim history
    await db.insert(claimHistory).values({
      claimId: claim.id,
      action: 'submitted',
      note: `Claim submitted by ${user.user_metadata.name || user.email!} (${user.email!})`,
      performedBy: user.email!,
    })

    return NextResponse.json({ success: true, claim })
  } catch (error) {
    console.error('Error submitting claim:', error)
    return NextResponse.json(
      { error: 'Failed to submit claim' },
      { status: 500 }
    )
  }
}