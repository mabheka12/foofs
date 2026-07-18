// app/admin/submissions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'
import { CheckCircle, XCircle, Clock, Building, User, Mail, Phone, MapPin, ChevronDown, ChevronUp, Search } from 'lucide-react'

interface Submission {
  id: number
  businessName: string
  address: string
  city: string
  state: string
  stateAbbrev: string
  zipCode: string
  phone: string
  website: string
  email: string
  description: string
  servicesOffered: string[]
  submittedByEmail: string
  submittedByName: string
  status: string
  adminNotes: string
  createdAt: string
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })

  useEffect(() => {
    fetchSubmissions()
  }, [filter])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/submissions?status=${filter}`)
      const data = await res.json()
      const allSubmissions = data.submissions || []
      setSubmissions(allSubmissions)
      setStats({
        pending: allSubmissions.filter((s: Submission) => s.status === 'pending').length,
        approved: allSubmissions.filter((s: Submission) => s.status === 'approved').length,
        rejected: allSubmissions.filter((s: Submission) => s.status === 'rejected').length,
      })
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this submission?`)) return

    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        await fetchSubmissions()
      }
    } catch (error) {
      console.error('Error updating submission:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; text: string; className: string }> = {
      pending: { icon: Clock, text: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      approved: { icon: CheckCircle, text: 'Approved', className: 'bg-green-100 text-green-700' },
      rejected: { icon: XCircle, text: 'Rejected', className: 'bg-red-100 text-red-700' },
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

  const filteredSubmissions = submissions.filter(sub =>
    sub.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.submittedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.submittedByEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">New Business Submissions</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-500">Rejected</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
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
                ({submissions.filter(s => s.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No submissions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {submission.businessName}
                        </span>
                        {submission.city && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {submission.city}, {submission.stateAbbrev}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {submission.submittedByName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {submission.submittedByEmail}
                        </span>
                        {submission.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {submission.phone}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(submission.status)}
                      <button
                        onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedId === submission.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedId === submission.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                      {submission.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {submission.description}
                          </p>
                        </div>
                      )}

                      {submission.servicesOffered && submission.servicesOffered.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Services</h4>
                          <div className="flex flex-wrap gap-2">
                            {submission.servicesOffered.map((service, i) => (
                              <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {submission.address && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Address</h4>
                          <p className="text-sm text-gray-600">{submission.address}</p>
                        </div>
                      )}

                      {submission.website && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Website</h4>
                          <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {submission.website}
                          </a>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        {submission.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(submission.id, 'approved')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve & Publish
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
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