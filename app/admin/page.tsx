// app/admin/page.tsx
import { getDb } from '@/lib/db'
import { businessClaims, businessSubmissions, appReviews, contractors, adminUsers } from '@/lib/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import Link from 'next/link'
import { Building, FileCheck, Star, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { AdminNav } from '@/components/admin/AdminNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  // Check if user is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const db = getDb()

  // ✅ Fix: Use a simpler query to check admin status
  let isAdmin = false
  try {
    const adminCheck = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, user.id))
      .limit(1)
    
    isAdmin = adminCheck.length > 0
  } catch (error) {
    console.error('Admin check failed:', error)
    isAdmin = false
  }

  if (!isAdmin) {
    redirect('/dashboard')
  }

  // Get counts
  try {
    const [pendingClaims, pendingSubmissions, pendingReviews, totalContractors] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(businessClaims).where(eq(businessClaims.status, 'pending')),
      db.select({ count: sql<number>`COUNT(*)` }).from(businessSubmissions).where(eq(businessSubmissions.status, 'pending')),
      db.select({ count: sql<number>`COUNT(*)` }).from(appReviews).where(eq(appReviews.status, 'pending')),
      db.select({ count: sql<number>`COUNT(*)` }).from(contractors).where(eq(contractors.published, true)),
    ])

    const stats = [
      {
        title: 'Total Contractors',
        value: totalContractors[0]?.count || 0,
        icon: Building,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
      },
      {
        title: 'Pending Claims',
        value: pendingClaims[0]?.count || 0,
        icon: Users,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        href: '/admin/claims',
      },
      {
        title: 'Pending Submissions',
        value: pendingSubmissions[0]?.count || 0,
        icon: FileCheck,
        color: 'text-purple-600',
        bg: 'bg-purple-100',
        href: '/admin/submissions',
      },
      {
        title: 'Pending Reviews',
        value: pendingReviews[0]?.count || 0,
        icon: Star,
        color: 'text-green-600',
        bg: 'bg-green-100',
        href: '/admin/reviews',
      },
    ]

    return (
      <>
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage claims, submissions, and reviews</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-full`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                {stat.href && (
                  <Link
                    href={stat.href}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                  >
                    View all →
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/claims"
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Business Claims</h2>
              </div>
              <p className="text-sm text-gray-600">
                Review and approve business claim requests from owners.
              </p>
              {pendingClaims[0]?.count > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded mt-3">
                  <AlertCircle className="w-3 h-3" />
                  {pendingClaims[0]?.count} pending
                </span>
              )}
            </Link>

            <Link
              href="/admin/submissions"
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FileCheck className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="font-semibold text-gray-900">New Businesses</h2>
              </div>
              <p className="text-sm text-gray-600">
                Review and approve new business submissions.
              </p>
              {pendingSubmissions[0]?.count > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded mt-3">
                  <AlertCircle className="w-3 h-3" />
                  {pendingSubmissions[0]?.count} pending
                </span>
              )}
            </Link>

            <Link
              href="/admin/reviews"
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Reviews</h2>
              </div>
              <p className="text-sm text-gray-600">
                Moderate and manage user reviews and ratings.
              </p>
              {pendingReviews[0]?.count > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded mt-3">
                  <AlertCircle className="w-3 h-3" />
                  {pendingReviews[0]?.count} pending
                </span>
              )}
            </Link>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error loading admin dashboard:', error)
    return (
      <>
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-semibold">Error Loading Dashboard</div>
            <p className="text-gray-500 mt-2">There was an error loading the admin dashboard. Please try again.</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </>
    )
  }
}