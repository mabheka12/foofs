// components/business/SubmitBusinessForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building, Mail, User, MapPin, Phone, Globe, FileText, Send, CheckCircle } from 'lucide-react'

export default function SubmitBusinessForm() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    city: '',
    state: '',
    stateAbbrev: '',
    zipCode: '',
    phone: '',
    website: '',
    email: '',
    description: '',
    servicesOffered: [] as string[],
    latitude: '',
    longitude: '',
    submittedByEmail: '',
    submittedByName: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serviceInput, setServiceInput] = useState('')

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setFormData(prev => ({
          ...prev,
          submittedByEmail: user.email || '',
          submittedByName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        }))
      }
    }
    getUser()
  }, [ ])

  const handleAddService = () => {
    if (serviceInput.trim()) {
      setFormData({
        ...formData,
        servicesOffered: [...formData.servicesOffered, serviceInput.trim()]
      })
      setServiceInput('')
    }
  }

  const handleRemoveService = (index: number) => {
    setFormData({
      ...formData,
      servicesOffered: formData.servicesOffered.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit business')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-green-800 mb-2">Business Submitted!</h2>
        <p className="text-green-600">Your business has been submitted for review. We'll notify you once it's approved.</p>
        <p className="text-sm text-green-500 mt-2">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <h2 className="text-2xl font-bold">Add Your Business</h2>
      <p className="text-gray-600">Submit your roofing business to be listed in our directory.</p>

      {/* ... rest of the form stays the same ... */}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? 'Submitting...' : (
          <>
            <Send className="w-4 h-4" />
            Submit Business
          </>
        )}
      </button>
    </form>
  )
}