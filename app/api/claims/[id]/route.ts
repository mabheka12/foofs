// app/api/claims/[id]/route.ts

import {
  NextRequest,
  NextResponse,
} from 'next/server'

import {
  and,
  eq,
} from 'drizzle-orm'

import {
  getDb,
} from '@/lib/db'

import {
  businessClaims,
  claimHistory,
  contractors,
} from '@/lib/db/schema'

import {
  contractorUsers,
} from '@/lib/db/ownerSchema'

import {
  getCurrentUser,
  isAdmin,
} from '@/lib/admin'

import {
  createAdminClient,
} from '@/lib/supabase/admin'

import {
  getClaimApprovedEmail,
  getClaimRejectedEmail,
} from '@/lib/notifications/email'


async function resolveUserId(
  userId: string | null,
  email: string
) {
  if (userId) {
    return userId
  }

  const admin =
    createAdminClient()

  let page = 1

  while (page <= 5) {
    const {
      data,
      error,
    } =
      await admin.auth.admin.listUsers(
        {
          page,
          perPage: 1000,
        }
      )

    if (error) {
      throw error
    }

    const match =
      data.users.find(
        (user) =>
          user.email
            ?.toLowerCase() ===
          email.toLowerCase()
      )

    if (match) {
      return match.id
    }

    if (
      data.users.length < 1000
    ) {
      break
    }

    page += 1
  }

  return null
}


async function requireAdmin() {
  if (!(await isAdmin())) {
    return null
  }

  return getCurrentUser()
}


export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  const adminUser =
    await requireAdmin()

  if (!adminUser) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      }
    )
  }

  const { id } =
    await params

  const claimId =
    Number(id)

  if (
    !Number.isInteger(
      claimId
    )
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid claim ID',
      },
      {
        status: 400,
      }
    )
  }

  const db = getDb()

  const [claim] =
    await db
      .select()
      .from(businessClaims)
      .where(
        eq(
          businessClaims.id,
          claimId
        )
      )
      .limit(1)

  if (!claim) {
    return NextResponse.json(
      {
        error:
          'Claim not found',
      },
      {
        status: 404,
      }
    )
  }

  return NextResponse.json(
    claim
  )
}


export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  const adminUser =
    await requireAdmin()

  if (!adminUser) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      }
    )
  }

  const { id } =
    await params

  const claimId =
    Number(id)

  if (
    !Number.isInteger(
      claimId
    )
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid claim ID',
      },
      {
        status: 400,
      }
    )
  }

  try {
    const body =
      await request.json()

    const status =
      String(
        body.status || ''
      )

    if (
      ![
        'approved',
        'rejected',
        'pending',
      ].includes(status)
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid claim status',
        },
        {
          status: 400,
        }
      )
    }

    const db = getDb()

    const [claim] =
      await db
        .select()
        .from(businessClaims)
        .where(
          eq(
            businessClaims.id,
            claimId
          )
        )
        .limit(1)

    if (!claim) {
      return NextResponse.json(
        {
          error:
            'Claim not found',
        },
        {
          status: 404,
        }
      )
    }

    if (
      claim.contractorId ==
      null
    ) {
      return NextResponse.json(
        {
          error:
            'Claim has no contractor',
        },
        {
          status: 400,
        }
      )
    }

    const [contractor] =
      await db
        .select()
        .from(contractors)
        .where(
          eq(
            contractors.id,
            claim.contractorId
          )
        )
        .limit(1)

    if (!contractor) {
      return NextResponse.json(
        {
          error:
            'Contractor not found',
        },
        {
          status: 404,
        }
      )
    }

    const ownerUserId =
      await resolveUserId(
        claim.userId,
        claim.userEmail
      )

    if (
      status === 'approved' &&
      !ownerUserId
    ) {
      return NextResponse.json(
        {
          error:
            'Could not link this claim to a Supabase user account.',
        },
        {
          status: 400,
        }
      )
    }

    await db.transaction(
      async (tx) => {
        await tx
          .update(
            businessClaims
          )
          .set({
            status,
            adminNotes:
              body.adminNotes ||
              null,

            userId:
              ownerUserId ||
              claim.userId,

            updatedAt:
              new Date(),
          })
          .where(
            eq(
              businessClaims.id,
              claimId
            )
          )

        await tx
          .insert(
            claimHistory
          )
          .values({
            claimId,
            action:
              status,
            note:
              body.adminNotes ||
              null,

            performedBy:
              adminUser.email ||
              adminUser.id,

            createdAt:
              new Date(),
          })

        if (
          status ===
            'approved' &&
          ownerUserId
        ) {
          await tx
            .insert(
              contractorUsers
            )
            .values({
              contractorId:
                contractor.id,

              userId:
                ownerUserId,

              userEmail:
                claim.userEmail,

              role:
                claim.role ||
                'owner',

              status:
                'active',

              verifiedAt:
                new Date(),
            })
            .onConflictDoUpdate({
              target: [
                contractorUsers.contractorId,
                contractorUsers.userId,
              ],

              set: {
                userEmail:
                  claim.userEmail,

                role:
                  claim.role ||
                  'owner',

                status:
                  'active',

                verifiedAt:
                  new Date(),
              },
            })

          await tx
            .update(
              contractors
            )
            .set({
              verified:
                true,

              ownershipVerified:
                true,

              updatedAt:
                new Date(),
            })
            .where(
              eq(
                contractors.id,
                contractor.id
              )
            )
        }

        if (
          (
            status ===
              'rejected' ||
            status ===
              'pending'
          ) &&
          ownerUserId
        ) {
          await tx
            .update(
              contractorUsers
            )
            .set({
              status:
                'inactive',
            })
            .where(
              and(
                eq(
                  contractorUsers.contractorId,
                  contractor.id
                ),
                eq(
                  contractorUsers.userId,
                  ownerUserId
                )
              )
            )

          const [
            anotherOwner,
          ] =
            await tx
              .select({
                id:
                  contractorUsers.id,
              })
              .from(
                contractorUsers
              )
              .where(
                and(
                  eq(
                    contractorUsers.contractorId,
                    contractor.id
                  ),
                  eq(
                    contractorUsers.status,
                    'active'
                  )
                )
              )
              .limit(1)

          await tx
            .update(
              contractors
            )
            .set({
              ownershipVerified:
                Boolean(
                  anotherOwner
                ),

              updatedAt:
                new Date(),
            })
            .where(
              eq(
                contractors.id,
                contractor.id
              )
            )
        }
      }
    )

    if (
      status === 'approved'
    ) {
      try {
        await getClaimApprovedEmail(
          {
            id: claim.id,
            contractorName:
              contractor.name,
            contractorId:
              contractor.id,
            email:
              claim.userEmail,
            status:
              'approved',
          }
        )
      } catch (error) {
        console.error(
          'Claim approved email failed:',
          error
        )
      }
    }

    if (
      status === 'rejected'
    ) {
      try {
        await getClaimRejectedEmail(
          {
            id: claim.id,
            contractorName:
              contractor.name,
            contractorId:
              contractor.id,
            email:
              claim.userEmail,
            status:
              'rejected',

            adminNotes:
              body.adminNotes ||
              undefined,
          }
        )
      } catch (error) {
        console.error(
          'Claim rejected email failed:',
          error
        )
      }
    }

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error(
      'Claim update error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to update claim',
      },
      {
        status: 500,
      }
    )
  }
}


export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
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

  const { id } =
    await params

  const claimId =
    Number(id)

  if (
    !Number.isInteger(
      claimId
    )
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid claim ID',
      },
      {
        status: 400,
      }
    )
  }

  try {
    const db = getDb()

    await db.transaction(
      async (tx) => {
        await tx
          .delete(
            claimHistory
          )
          .where(
            eq(
              claimHistory.claimId,
              claimId
            )
          )

        await tx
          .delete(
            businessClaims
          )
          .where(
            eq(
              businessClaims.id,
              claimId
            )
          )
      }
    )

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(
      'Claim delete error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to delete claim',
      },
      {
        status: 500,
      }
    )
  }
}