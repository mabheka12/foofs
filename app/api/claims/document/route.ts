import {
  NextRequest,
  NextResponse,
} from 'next/server'

import { isAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest
) {
  try {
    // Only RooferNet admins may access claim evidence
    const admin =
      await isAdmin()

    if (!admin) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        {
          status: 401,
        }
      )
    }

    const path =
      request.nextUrl.searchParams.get(
        'path'
      )

    if (!path) {
      console.error(
        'Claim document request missing path'
      )

      return NextResponse.json(
        {
          error:
            'Document path is required',
        },
        {
          status: 400,
        }
      )
    }

    const cleanPath =
      path.trim()

    // Basic path hardening
    if (
      !cleanPath ||
      cleanPath.startsWith('/') ||
      cleanPath.includes('..')
    ) {
      console.error(
        'Invalid claim document path:',
        cleanPath
      )

      return NextResponse.json(
        {
          error:
            'Invalid document path',
        },
        {
          status: 400,
        }
      )
    }

    const supabaseAdmin =
      createAdminClient()

    const {
      data,
      error,
    } =
      await supabaseAdmin.storage
        .from('claim-documents')
        .createSignedUrl(
          cleanPath,
          60 * 10
        )

    if (error) {
      console.error(
        'Claim document signed URL error:',
        {
          path: cleanPath,
          message:
            error.message,
          error,
        }
      )

      return NextResponse.json(
        {
          error:
            error.message ||
            'Unable to access document',
        },
        {
          status: 404,
        }
      )
    }

    if (!data?.signedUrl) {
      console.error(
        'Supabase returned no signed URL:',
        cleanPath
      )

      return NextResponse.json(
        {
          error:
            'Document unavailable',
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.redirect(
      data.signedUrl
    )
  } catch (error) {
    console.error(
      'Claim document route error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to retrieve document',
      },
      {
        status: 500,
      }
    )
  }
}