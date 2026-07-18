// components/reviews/ReviewList.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, ThumbsUp, Flag, User, Calendar } from 'lucide-react'

interface Review {
  id: number
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
  source: string // 'platform' | 'google'
  googleReviewId: string
  createdAt: string
}

interface ReviewListProps {
  contractorId: number
  className?: string
  showSource?: boolean // Option to show/hide source badges
}

export function ReviewList({ contractorId, className = '', showSource = true }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
  }, [contractorId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews?contractorId=${contractorId}&status=approved`)
      const data = await res.json()
      const approvedReviews = data.reviews || []
      setReviews(approvedReviews)
      setTotalReviews(data.total || 0)
      
      if (approvedReviews.length > 0) {
        const avg = approvedReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / approvedReviews.length
        setAverageRating(avg)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHelpful = async (reviewId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userEmail = session?.user?.email || 'anonymous@example.com'
      
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      })
      if (res.ok) {
        await fetchReviews()
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error)
    }
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-32"></div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0,
  }))

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center w-full sm:w-auto">
          <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</div>
        </div>
        <div className="flex-1 w-full">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-gray-600">{rating}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-500 text-xs text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-900">{review.userName}</span>
                  
                  {/* ✅ Source Badge */}
                  {showSource && review.source === 'google' && (
                    <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3.97C17.782 2.096 15.045 1 12 1 7.392 1 3.393 3.467 1.638 7.014l3.628 2.751z" />
                        <path fill="#34A853" d="M16.458 18.788A6.99 6.99 0 0 1 12 21.09c-3.045 0-5.782-1.096-7.91-2.97l-3.628 2.751C3.393 22.533 7.392 25 12 25c3.045 0 5.782-1.096 7.91-2.97l-3.452-3.242z" />
                        <path fill="#4A90E2" d="M21.91 12.09c0-.69-.062-1.356-.182-2H12v4.364h5.545c-.618 1.909-2.182 3.273-4.182 3.273-1.636 0-3.091-.818-3.955-2.091l-3.628 2.751C7.393 20.533 9.545 22 12 22c3.045 0 5.782-1.096 7.91-2.97l3.452-3.242c.545-.909.818-2.091.818-3.273z" />
                        <path fill="#FBBC05" d="M5.266 9.765 1.638 7.014C1.038 8.091.667 9.273.667 10.636c0 1.364.371 2.545 1.01 3.622l3.628-2.751-.039-.742z" />
                      </svg>
                      Google
                    </span>
                  )}
                  {showSource && review.source === 'platform' && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                      <Star className="w-3 h-3 fill-blue-500 text-blue-500" />
                      Platform
                    </span>
                  )}
                  {review.verifiedPurchase && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                  {review.source === 'google' && review.googleReviewId && (
                    <a 
                      href={`https://www.google.com/maps/reviews/${review.googleReviewId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      View on Google
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
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
                    <span className="text-sm font-medium text-gray-700">• {review.title}</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                <Calendar className="w-3 h-3" />
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Content */}
            {review.content && (
              <p className="text-gray-700 text-sm mt-2 leading-relaxed">{review.content}</p>
            )}

            {/* Pros & Cons */}
            {(review.pros || review.cons) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                {review.pros && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <span className="font-medium text-green-700">👍 Pros</span>
                    <p className="text-gray-600 mt-1">{review.pros}</p>
                  </div>
                )}
                {review.cons && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <span className="font-medium text-red-700">👎 Cons</span>
                    <p className="text-gray-600 mt-1">{review.cons}</p>
                  </div>
                )}
              </div>
            )}

            {/* Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {review.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Review image ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition cursor-pointer"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleHelpful(review.id)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition group"
              >
                <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition" />
                Helpful
                {review.helpfulCount > 0 && (
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {review.helpfulCount}
                  </span>
                )}
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition">
                <Flag className="w-4 h-4" />
                Report
              </button>
              {review.source === 'google' && (
                <span className="text-xs text-gray-400 ml-auto">
                  Imported from Google
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show total reviews count */}
      <div className="text-center text-sm text-gray-400 pt-2">
        Showing {reviews.length} of {totalReviews} reviews
      </div>
    </div>
  )
}