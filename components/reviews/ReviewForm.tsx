// components/reviews/ReviewForm.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Send, X } from 'lucide-react'

interface ReviewFormProps {
  contractorId: number
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function ReviewForm({ contractorId, onSuccess, onCancel, className = '' }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: '',
    pros: '',
    cons: '',
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.rating === 0) {
      setError('Please select a rating')
      return
    }

    setLoading(true)
    setError(null)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('Please sign in to leave a review')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorId,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
          ...formData,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        onSuccess?.()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit review')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Star className="w-6 h-6 text-green-600 fill-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800">Review Submitted!</h3>
        <p className="text-green-600 text-sm">Your review is pending approval and will appear shortly.</p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-3 text-sm text-green-700 hover:underline"
          >
            Close
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setFormData({ ...formData, rating: star })}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || formData.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {formData.rating > 0 ? `${formData.rating} / 5` : 'Select rating'}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Review Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Great service!"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your experience with this roofing contractor..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pros
          </label>
          <textarea
            value={formData.pros}
            onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What did you like?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cons
          </label>
          <textarea
            value={formData.cons}
            onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What could be improved?"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting...' : (
            <>
              <Send className="w-4 h-4" />
              Submit Review
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}