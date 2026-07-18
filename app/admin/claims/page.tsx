// app/admin/claims/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminNav } from '@/components/admin/AdminNav'
import { 
  CheckCircle, XCircle, Clock, Building, User, Mail, Phone, 
  ChevronDown, ChevronUp, Search, FileText, Calendar,
  Shield, Check, X, RefreshCw
} from 'lucide-react'

interface Claim {
  id: number
  contractorId: number
  userEmail: string
  userName: string
  userPhone: string
  role: string
  proofDocuments: string[]
  message: string
  status: string
  adminNotes: string
  createdAt: string
  contractorName: string
  contractorSlug: string
  contractorCity: string
  contractorState: string
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('pending')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchClaims()
  }, [filter])

  const fetchClaims = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/claims?status=${filter}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to fetch claims')
        return
      }
      const data = await res.json()
      const allClaims = data.claims || []
      setClaims(allClaims)
      setStats({
        pending: allClaims.filter((c: Claim) => c.status === 'pending').length,
        approved: allClaims.filter((c: Claim) => c.status === 'approved').length,
        rejected: allClaims.filter((c: Claim) => c.status === 'rejected').length,
      })
    } catch (err) {
      setError('Failed to load claims. Please try again.')
      console.error('Error fetching claims:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this claim?`)) return

    setActionLoading(id)
    try {
      const res = await fetch(`/api/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          performedBy: 'admin'
        }),
      })
      
      if (res.ok) {
        setToast({ 
          message: `Claim ${status === 'approved' ? 'approved' : 'rejected'} successfully!`, 
          type: 'success' 
        })
        await fetchClaims()
        setTimeout(() => setToast(null), 3000)
      } else {
        const data = await res.json()
        setToast({ message: data.error || 'Failed to update claim', type: 'error' })
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

  const filteredClaims = claims.filter(claim => 
    claim.contractorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
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
            <h3 className="text-lg font-semibold text-red-700">Error Loading Claims</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchClaims}
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
            <h1 className="text-2xl font-bold">Business Claims</h1>
            <p className="text-sm text-gray-500">Review and manage business ownership claims</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchClaims}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              {status !== 'all' && (
                <span className="ml-1 text-xs opacity-75">
                  ({claims.filter(c => c.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredClaims.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No claims found</p>
            <p className="text-sm text-gray-400 mt-1">Claims will appear here once users submit them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <Building className="w-5 h-5 text-gray-400" />
                        <Link
                          href={`/${claim.contractorSlug}`}
                          target="_blank"
                          className="font-semibold text-gray-900 hover:text-blue-600 transition"
                        >
                          {claim.contractorName}
                        </Link>
                        {claim.contractorCity && (
                          <span className="text-sm text-gray-500">
                            {claim.contractorCity}, {claim.contractorState}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {claim.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {claim.userEmail}
                        </span>
                        {claim.userPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {claim.userPhone}
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {claim.role}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(claim.status)}
                      <button
                        onClick={() => setExpandedId(expandedId === claim.id ? null : claim.id)}
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        {expandedId === claim.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedId === claim.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                      {claim.message && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            Message
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {claim.message}
                          </p>
                        </div>
                      )}

                      {claim.proofDocuments && claim.proofDocuments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Proof Documents</h4>
                          <div className="flex gap-2">
                            {claim.proofDocuments.map((doc, i) => (
                              <a
                                key={i}
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <FileText className="w-4 h-4" />
                                Document {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 pt-2">
                        {claim.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(claim.id, 'approved')}
                              disabled={actionLoading === claim.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === claim.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(claim.id, 'rejected')}
                              disabled={actionLoading === claim.id}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === claim.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </>
                        )}
                        {claim.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'pending')}
                            disabled={actionLoading === claim.id}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading === claim.id ? (
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