// app/admin/reviews/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'
import Link from 'next/link'
import { 
  CheckCircle, XCircle, Clock, Star, User, Mail, 
  ChevronDown, ChevronUp, Flag, Search, Calendar,
  Shield, Check, X, RefreshCw, MessageSquare
} from 'lucide-react'

interface Review {
  id: number
  contractorId: number
  userEmail: string
  userName: string
  rating: number
  title: string
  content: string
  pros: string
  cons: string
  images: string[]
  verifiedPurchase: boolean
  helpfulCount: number
  status: string
  adminNotes: string
  createdAt: string
  contractorName: string
  contractorSlug: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('pending')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, flagged: 0 })
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/reviews?status=${filter}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to fetch reviews')
        return
      }
      const data = await res.json()
      const allReviews = data.reviews || []
      setReviews(allReviews)
      setStats({
        pending: allReviews.filter((r: Review) => r.status === 'pending').length,
        approved: allReviews.filter((r: Review) => r.status === 'approved').length,
        rejected: allReviews.filter((r: Review) => r.status === 'rejected').length,
        flagged: allReviews.filter((r: Review) => r.status === 'flagged').length,
      })
    } catch (err) {
      setError('Failed to load reviews. Please try again.')
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this review?`)) return

    setActionLoading(id)
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (res.ok) {
        setToast({ 
          message: `Review ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'flagged'} successfully!`, 
          type: 'success' 
        })
        await fetchReviews()
        setTimeout(() => setToast(null), 3000)
      } else {
        const data = await res.json()
        setToast({ message: data.error || 'Failed to update review', type: 'error' })
        setTimeout(() => setToast(null), 3000)
      }
    } catch (err) {
      setToast({ message: 'An error occurred', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; text: string; className: string }> = {
      pending: { icon: Clock, text: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      approved: { icon: CheckCircle, text: 'Approved', className: 'bg-green-100 text-green-700' },
      rejected: { icon: XCircle, text: 'Rejected', className: 'bg-red-100 text-red-700' },
      flagged: { icon: Flag, text: 'Flagged', className: 'bg-orange-100 text-orange-700' },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    )
  }

  const filteredReviews = reviews.filter(review =>
    review.contractorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-700">Error Loading Reviews</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchReviews}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNav />
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Review Moderation</h1>
            <p className="text-sm text-gray-500">Approve, reject, or flag user reviews</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchReviews}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Approved</p>
                <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Rejected</p>
                <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
              </div>
              <div className="bg-red-200 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Flagged</p>
                <p className="text-3xl font-bold text-orange-700">{stats.flagged}</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-lg">
                <Flag className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['pending', 'approved', 'rejected', 'flagged', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-1 text-xs opacity-75">
                ({reviews.filter(r => r.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews found</p>
            <p className="text-sm text-gray-400 mt-1">Reviews will appear here once users submit them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
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
                        <span className="font-semibold text-gray-900">
                          {review.title || 'Untitled Review'}
                        </span>
                        {review.contractorName && (
                          <Link
                            href={`/${review.contractorSlug}`}
                            target="_blank"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {review.contractorName}
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {review.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {review.userEmail}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.helpfulCount > 0 && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            👍 {review.helpfulCount} helpful
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(review.status)}
                      <button
                        onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        {expandedId === review.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedId === review.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                      {review.content && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Review</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {review.content}
                          </p>
                        </div>
                      )}

                      {(review.pros || review.cons) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {review.pros && (
                            <div className="bg-green-50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-green-700">👍 Pros</h4>
                              <p className="text-sm text-gray-600 mt-1">{review.pros}</p>
                            </div>
                          )}
                          {review.cons && (
                            <div className="bg-red-50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-red-700">👎 Cons</h4>
                              <p className="text-sm text-gray-600 mt-1">{review.cons}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {review.images && review.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Images</h4>
                          <div className="flex gap-2 flex-wrap">
                            {review.images.map((img, i) => (
                              <img 
                                key={i} 
                                src={img} 
                                alt={`Review ${i + 1}`} 
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition cursor-pointer"
                                onClick={() => window.open(img, '_blank')}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 pt-2">
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(review.id, 'approved')}
                              disabled={actionLoading === review.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === review.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(review.id, 'rejected')}
                              disabled={actionLoading === review.id}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === review.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(review.id, 'flagged')}
                              disabled={actionLoading === review.id}
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === review.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Flag className="w-4 h-4" />
                              )}
                              Flag
                            </button>
                          </>
                        )}
                        {review.status === 'flagged' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(review.id, 'approved')}
                              disabled={actionLoading === review.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === review.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(review.id, 'rejected')}
                              disabled={actionLoading === review.id}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === review.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </>
                        )}
                        {review.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(review.id, 'flagged')}
                            disabled={actionLoading === review.id}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading === review.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Flag className="w-4 h-4" />
                            )}
                            Flag
                          </button>
                        )}
                        {review.status !== 'pending' && review.status !== 'flagged' && (
                          <button
                            onClick={() => handleStatusUpdate(review.id, 'pending')}
                            disabled={actionLoading === review.id}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading === review.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}