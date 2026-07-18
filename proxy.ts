// proxy.ts
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db'
// import adminUsers dynamically because the schema export name may vary
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // First, update session
  const response = await updateSession(request)
  
  // Check if trying to access admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check if user is admin using Drizzle (single connection)
    try {
      const db = getDb()
      const schemaMod = await import('@/lib/db/schema')
      // try common export names for the admin users table
      const adminUsersTable = (schemaMod as any).adminUsers || (schemaMod as any).admin_users || (schemaMod as any).admins
      if (!adminUsersTable) {
        console.error('admin users table not found in schema exports')
        return NextResponse.redirect(new URL('/', request.url))
      }

      const admin = await db
        .select()
        .from(adminUsersTable)
        .where(eq((adminUsersTable as any).userId, user.id))
        .limit(1)

      if (!admin.length) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Admin check failed:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}