// components/reviews/SubmitReviewForm.tsx
'use client'

import { useState } from 'react'
import { Star, Send,CheckCircle } from 'lucide-react'

interface SubmitReviewFormProps {
  contractorId: number
  onSuccess?: () => void
}

export function SubmitReviewForm({ contractorId, onSuccess }: SubmitReviewFormProps) {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: '',
    pros: '',
    cons: '',
    userEmail: '',
    userName: '',
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.rating === 0) {
      setError('Please select a rating')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorId,
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
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-800">Review Submitted!</h3>
        <p className="text-green-600">Your review is pending approval and will appear shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
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
              className="p-1 focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition ${
                  star <= (hoveredRating || formData.rating)
                    ? 'text-yellow-400 fill-yellow-400 scale-110'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {formData.rating > 0 ? `${formData.rating} / 5` : 'Select rating'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.userEmail}
            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="you@example.com"
          />
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

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? 'Submitting...' : (
          <>
            <Send className="w-4 h-4" />
            Submit Review
          </>
        )}
      </button>
    </form>
  )
}