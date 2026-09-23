// app/api/claims/route.ts

import {
  NextResponse,
} from 'next/server'

import {
  and,
  desc,
  eq,
  sql,
} from 'drizzle-orm'

import { getDb } from '@/lib/db'

import {
  businessClaims,
  claimHistory,
  contractors,
} from '@/lib/db/schema'

import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'


export async function GET(
  request: Request
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      }
    )
  }

  const {
    searchParams,
  } = new URL(request.url)

  const status =
    searchParams.get('status')

  const limit = Math.min(
    Number(
      searchParams.get('limit') ||
        50
    ),
    100
  )

  const offset = Math.max(
    Number(
      searchParams.get('offset') ||
        0
    ),
    0
  )

  try {
    const db = getDb()

    const conditions: any[] = []

    if (
      status &&
      status !== 'all'
    ) {
      conditions.push(
        eq(
          businessClaims.status,
          status
        )
      )
    }

    const claims =
      await db
        .select({
          id:
            businessClaims.id,

          contractorId:
            businessClaims.contractorId,

          userId:
            businessClaims.userId,

          userEmail:
            businessClaims.userEmail,

          userName:
            businessClaims.userName,

          userPhone:
            businessClaims.userPhone,

          role:
            businessClaims.role,

          proofDocuments:
            businessClaims.proofDocuments,

          message:
            businessClaims.message,

          status:
            businessClaims.status,

          adminNotes:
            businessClaims.adminNotes,

          createdAt:
            businessClaims.createdAt,

          updatedAt:
            businessClaims.updatedAt,

          contractorName:
            contractors.name,

          contractorSlug:
            contractors.slug,

          contractorCity:
            contractors.city,

          contractorState:
            contractors.state,
        })
        .from(businessClaims)
        .leftJoin(
          contractors,
          eq(
            businessClaims.contractorId,
            contractors.id
          )
        )
        .where(
          conditions.length
            ? and(...conditions)
            : undefined
        )
        .orderBy(
          desc(
            businessClaims.createdAt
          )
        )
        .limit(limit)
        .offset(offset)

    const totalResult =
      await db
        .select({
          count:
            sql<number>`COUNT(*)`,
        })
        .from(businessClaims)
        .where(
          conditions.length
            ? and(...conditions)
            : undefined
        )

    return NextResponse.json({
      claims,
      total:
        Number(
          totalResult[0]?.count ||
            0
        ),
      limit,
      offset,
    })
  } catch (error) {
    console.error(
      'Error fetching claims:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to fetch claims',
      },
      {
        status: 500,
      }
    )
  }
}


export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient()

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser()

    if (
      authError ||
      !user ||
      !user.email
    ) {
      return NextResponse.json(
        {
          error:
            'You must be signed in to claim a business.',
        },
        {
          status: 401,
        }
      )
    }

    const body =
      await request.json()

    const contractorId =
      Number(body.contractorId)

    if (
      !Number.isInteger(
        contractorId
      ) ||
      contractorId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid contractor ID',
        },
        {
          status: 400,
        }
      )
    }

    const db = getDb()

    const [contractor] =
      await db
        .select({
          id:
            contractors.id,
          name:
            contractors.name,
        })
        .from(contractors)
        .where(
          eq(
            contractors.id,
            contractorId
          )
        )
        .limit(1)

    if (!contractor) {
      return NextResponse.json(
        {
          error:
            'Business listing not found',
        },
        {
          status: 404,
        }
      )
    }

    const existing =
      await db
        .select({
          id:
            businessClaims.id,
        })
        .from(businessClaims)
        .where(
          and(
            eq(
              businessClaims.contractorId,
              contractorId
            ),
            eq(
              businessClaims.userId,
              user.id
            ),
            eq(
              businessClaims.status,
              'pending'
            )
          )
        )
        .limit(1)

    if (existing.length) {
      return NextResponse.json(
        {
          error:
            'You already have a pending claim for this business.',
        },
        {
          status: 409,
        }
      )
    }

    const userName =
      user.user_metadata
        ?.full_name ||
      user.user_metadata?.name ||
      String(
        body.userName || ''
      ).trim() ||
      user.email

    const proofDocuments =
      Array.isArray(
        body.proofDocuments
      )
        ? body.proofDocuments
            .filter(
              (
                item: unknown
              ): item is string =>
                typeof item ===
                  'string' &&
                item.length > 0
            )
        : []

    const claim =
      await db.transaction(
        async (tx) => {
          const [created] =
            await tx
              .insert(
                businessClaims
              )
              .values({
                contractorId,
                userId:
                  user.id,
                userEmail:
                  user.email!,
                userName,
                userPhone:
                  String(
                    body.userPhone ||
                      ''
                  ).trim() ||
                  null,

                role:
                  body.role ||
                  'owner',

                proofDocuments,

                message:
                  String(
                    body.message ||
                      ''
                  ).trim() ||
                  null,

                status:
                  'pending',
              })
              .returning()

          await tx
            .insert(
              claimHistory
            )
            .values({
              claimId:
                created.id,

              action:
                'submitted',

              note:
                `Claim submitted by ${userName} (${user.email})`,

              performedBy:
                user.email!,
            })

          return created
        }
      )

    return NextResponse.json(
      {
        success: true,
        claim,
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(
      'Error submitting claim:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to submit claim',
      },
      {
        status: 500,
      }
    )
  }
}