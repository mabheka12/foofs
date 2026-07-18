// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db'
import { businessClaims, appReviews } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building, Star, Clock, CheckCircle, XCircle, AlertCircle, User, Mail, Phone } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const db = getDb()

  // Get user's claims
  const claims = await db
    .select()
    .from(businessClaims)
    .where(eq(businessClaims.userEmail, user.email!))
    .orderBy(desc(businessClaims.createdAt))

  // Get user's reviews
  const reviews = await db
    .select()
    .from(appReviews)
    .where(eq(appReviews.userEmail, user.email!))
    .orderBy(desc(appReviews.createdAt))

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; text: string; className: string }> = {
      pending: { icon: Clock, text: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      approved: { icon: CheckCircle, text: 'Approved', className: 'bg-green-100 text-green-700' },
      rejected: { icon: XCircle, text: 'Rejected', className: 'bg-red-100 text-red-700' },
      flagged: { icon: AlertCircle, text: 'Flagged', className: 'bg-orange-100 text-orange-700' },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* User Info Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.user_metadata?.full_name || 'User'}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/claim-business"
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:shadow-md transition text-center group"
        >
          <Building className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition" />
          <h3 className="font-semibold text-gray-900">Claim a Business</h3>
          <p className="text-sm text-gray-600">Claim ownership of a business listing</p>
        </Link>
        <Link
          href="/submit-business"
          className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:shadow-md transition text-center group"
        >
          <Building className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition" />
          <h3 className="font-semibold text-gray-900">Add a Business</h3>
          <p className="text-sm text-gray-600">Submit a new business to the directory</p>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Claims</p>
          <p className="text-2xl font-bold">{claims.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-2xl font-bold">{reviews.length}</p>
        </div>
      </div>

      {/* Claims Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          Your Claims
        </h2>
        {claims.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">You haven't claimed any businesses yet.</p>
            <Link href="/claim-business" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Claim a business →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Business ID: {claim.contractorId}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                    {claim.message && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{claim.message}</p>
                    )}
                  </div>
                  {getStatusBadge(claim.status ?? 'pending')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Your Reviews
        </h2>
        {reviews.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">You haven't written any reviews yet.</p>
            <p className="text-sm text-gray-400 mt-1">Find a business and leave a review!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.title && (
                        <span className="font-medium text-gray-900 text-sm">{review.title}</span>
                      )}
                    </div>
                    {review.content && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{review.content}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted: {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(review.status ?? 'pending')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}