// components/reviews/RatingSummary.tsx
'use client'

import { Star } from 'lucide-react'

interface RatingSummaryProps {
  averageRating: number
  totalReviews: number
  ratingDistribution: { [key: number]: number }
  className?: string
  showGoogleBadge?: boolean
  googleRating?: number
  googleTotalReviews?: number
}

export function RatingSummary({ 
  averageRating, 
  totalReviews, 
  ratingDistribution,
  className = '',
  showGoogleBadge = false,
  googleRating,
  googleTotalReviews,
}: RatingSummaryProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Average Rating */}
        <div className="text-center w-full sm:w-auto">
          <div className="text-4xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-0.5 mt-1 justify-center">
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
          <div className="text-sm text-gray-500 mt-1">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 w-full">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
            return (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-gray-600 text-xs">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-gray-500 text-xs text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Google Rating Badge (optional) */}
      {showGoogleBadge && googleRating && googleTotalReviews && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3.97C17.782 2.096 15.045 1 12 1 7.392 1 3.393 3.467 1.638 7.014l3.628 2.751z" />
              <path fill="#34A853" d="M16.458 18.788A6.99 6.99 0 0 1 12 21.09c-3.045 0-5.782-1.096-7.91-2.97l-3.628 2.751C3.393 22.533 7.392 25 12 25c3.045 0 5.782-1.096 7.91-2.97l-3.452-3.242z" />
              <path fill="#4A90E2" d="M21.91 12.09c0-.69-.062-1.356-.182-2H12v4.364h5.545c-.618 1.909-2.182 3.273-4.182 3.273-1.636 0-3.091-.818-3.955-2.091l-3.628 2.751C7.393 20.533 9.545 22 12 22c3.045 0 5.782-1.096 7.91-2.97l3.452-3.242c.545-.909.818-2.091.818-3.273z" />
              <path fill="#FBBC05" d="M5.266 9.765 1.638 7.014C1.038 8.091.667 9.273.667 10.636c0 1.364.371 2.545 1.01 3.622l3.628-2.751-.039-.742z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Google Rating</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(googleRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-900">{googleRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({googleTotalReviews} reviews)</span>
          </div>
        </div>
      )}
    </div>
  )
}