import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const path = request.nextUrl.searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Document path is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.storage
      .from('claim-documents')
      .createSignedUrl(path, 60 * 10) // 10 minutes

    if (error || !data?.signedUrl) {
      console.error('Signed URL error:', error)

      return NextResponse.json(
        { error: 'Unable to open document' },
        { status: 500 }
      )
    }

    return NextResponse.redirect(data.signedUrl)
  } catch (error) {
    console.error('Document retrieval error:', error)

    return NextResponse.json(
      { error: 'Failed to retrieve document' },
      { status: 500 }
    )
  }
}