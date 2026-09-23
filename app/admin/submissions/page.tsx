// app/admin/submissions/page.tsx

'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  BadgeDollarSign,
  Building,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
  XCircle,
} from 'lucide-react'

import {
  AdminNav,
} from '@/components/admin/AdminNav'


// ============================================================
// TYPES
// ============================================================

interface Submission {
  id: number

  businessName: string

  address: string | null
  city: string | null
  state: string | null
  stateAbbrev: string | null
  zipCode: string | null

  phone: string | null
  email: string | null
  website: string | null

  description: string | null

  licenseNumber: string | null
  yearsInBusiness: number | null

  servicesOffered: string[] | null
  serviceAreas: string[] | null

  emergencyService: boolean | null
  freeEstimates: boolean | null
  financingAvailable: boolean | null
  warrantyOffered: boolean | null

  openingHours: string | null

  priceRange: string | null
  pricingNotes: string | null
  minimumJobPrice: string | null
  priceCurrency: string | null

  submittedByEmail: string
  submittedByName: string

  userId?: string | null

  approvedContractorId?: number | null

  status: string | null

  adminNotes: string | null

  createdAt: string
  updatedAt: string

  reviewedAt?: string | null
}

interface SubmissionMedia {
  id: number

  submissionId: number

  storagePath: string

  mediaType: string | null

  altText: string | null

  caption: string | null

  createdAt: string | null

  signedUrl: string | null
}

interface SubmissionDetail {
  submission: Submission

  media: SubmissionMedia[]
}


// ============================================================
// MAIN PAGE
// ============================================================

export default function AdminSubmissionsPage() {
  const [
    submissions,
    setSubmissions,
  ] =
    useState<
      Submission[]
    >([])

  const [
    details,
    setDetails,
  ] =
    useState<
      Record<
        number,
        SubmissionDetail
      >
    >({})

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    detailLoading,
    setDetailLoading,
  ] =
    useState<number | null>(
      null
    )

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<number | null>(
      null
    )

  const [
    expandedId,
    setExpandedId,
  ] =
    useState<number | null>(
      null
    )

  const [
    filter,
    setFilter,
  ] =
    useState('pending')

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState('')

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  const [
    toast,
    setToast,
  ] =
    useState<{
      message: string
      type:
        | 'success'
        | 'error'
    } | null>(
      null
    )


  // ==========================================================
  // LOAD LIST
  // ==========================================================

  const fetchSubmissions =
    useCallback(
      async () => {
        setLoading(true)

        setError(null)

        try {
          const response =
            await fetch(
              '/api/submissions?status=all&limit=100',
              {
                cache:
                  'no-store',
              }
            )

          const data =
            await response.json()

          if (!response.ok) {
            throw new Error(
              data.error ||
                'Failed to fetch submissions'
            )
          }

          setSubmissions(
            data.submissions ||
              []
          )
        } catch (error) {
          console.error(
            'Error fetching submissions:',
            error
          )

          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load submissions'
          )
        } finally {
          setLoading(false)
        }
      },
      []
    )


  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])


  // ==========================================================
  // LOAD FULL SUBMISSION WHEN EXPANDED
  // ==========================================================

  async function fetchDetail(
    id: number,
    force = false
  ) {
    if (
      details[id] &&
      !force
    ) {
      return
    }

    setDetailLoading(id)

    try {
      const response =
        await fetch(
          `/api/submissions/${id}`,
          {
            cache:
              'no-store',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to load submission details'
        )
      }

      setDetails(
        (current) => ({
          ...current,

          [id]: data,
        })
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to load submission',
        'error'
      )
    } finally {
      setDetailLoading(null)
    }
  }


  async function toggleExpanded(
    id: number
  ) {
    if (
      expandedId === id
    ) {
      setExpandedId(null)
      return
    }

    setExpandedId(id)

    await fetchDetail(id)
  }


  // ==========================================================
  // STATUS UPDATE
  // ==========================================================

  async function handleStatusUpdate(
    id: number,
    status:
      | 'approved'
      | 'rejected'
      | 'pending'
  ) {
    const action =
      status === 'approved'
        ? 'approve and publish'
        : status ===
            'rejected'
          ? 'reject'
          : 'reopen'

    if (
      !confirm(
        `Are you sure you want to ${action} this submission?`
      )
    ) {
      return
    }

    let adminNotes = ''

    if (
      status === 'rejected'
    ) {
      adminNotes =
        prompt(
          'Reason for rejection (optional):'
        ) || ''
    }

    setActionLoading(id)

    try {
      const response =
        await fetch(
          `/api/submissions/${id}`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                status,
                adminNotes,
              }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to update submission'
        )
      }

      showToast(
        status === 'approved'
          ? `Business published successfully. Contractor #${data.contractorId}.`
          : status ===
              'rejected'
            ? 'Submission rejected.'
            : 'Submission reopened.',
        'success'
      )

      setDetails(
        (current) => {
          const next = {
            ...current,
          }

          delete next[id]

          return next
        }
      )

      setExpandedId(null)

      await fetchSubmissions()
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to update submission',
        'error'
      )
    } finally {
      setActionLoading(null)
    }
  }


  function showToast(
    message: string,
    type:
      | 'success'
      | 'error'
  ) {
    setToast({
      message,
      type,
    })

    setTimeout(
      () =>
        setToast(null),
      4000
    )
  }


  // ==========================================================
  // FILTERING / STATS
  // ==========================================================

  const stats = {
    pending:
      submissions.filter(
        (item) =>
          item.status ===
          'pending'
      ).length,

    approved:
      submissions.filter(
        (item) =>
          item.status ===
          'approved'
      ).length,

    rejected:
      submissions.filter(
        (item) =>
          item.status ===
          'rejected'
      ).length,
  }


  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase()

  const filteredSubmissions =
    submissions.filter(
      (submission) => {
        if (
          filter !== 'all' &&
          submission.status !==
            filter
        ) {
          return false
        }

        if (
          !normalizedSearch
        ) {
          return true
        }

        return [
          submission.businessName,
          submission.submittedByName,
          submission.submittedByEmail,
          submission.city,
          submission.state,
          submission.phone,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(
                normalizedSearch
              )
          )
      }
    )


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <>
        <AdminNav />

        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-1/4 rounded bg-gray-200" />

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="h-24 rounded-xl bg-gray-200"
                  />
                )
              )}
            </div>

            <div className="h-72 rounded-xl bg-gray-200" />
          </div>
        </div>
      </>
    )
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <AdminNav />

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex max-w-md items-center gap-2 rounded-lg px-5 py-3 text-white shadow-lg ${
            toast.type ===
            'success'
              ? 'bg-green-600'
              : 'bg-red-600'
          }`}
        >
          {toast.type ===
          'success' ? (
            <Check className="h-5 w-5 shrink-0" />
          ) : (
            <X className="h-5 w-5 shrink-0" />
          )}

          <span>
            {toast.message}
          </span>
        </div>
      )}

      <main className="container mx-auto max-w-7xl px-4 py-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Business Submissions
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review complete
              owner-submitted profiles
              before publishing them.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                fetchSubmissions
              }
              className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={
                  searchTerm
                }
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search submissions..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 sm:w-72"
              />
            </div>
          </div>
        </div>


        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}


        {/* STATS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Pending"
            value={
              stats.pending
            }
            className="border-yellow-200 bg-yellow-50 text-yellow-700"
          />

          <StatCard
            label="Approved"
            value={
              stats.approved
            }
            className="border-green-200 bg-green-50 text-green-700"
          />

          <StatCard
            label="Rejected"
            value={
              stats.rejected
            }
            className="border-red-200 bg-red-50 text-red-700"
          />
        </div>


        {/* FILTERS */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {[
            'pending',
            'approved',
            'rejected',
            'all',
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() =>
                setFilter(
                  status
                )
              }
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status
                .charAt(0)
                .toUpperCase() +
                status.slice(1)}

              {status !==
                'all' && (
                <span className="ml-1 opacity-75">
                  (
                  {
                    stats[
                      status as keyof typeof stats
                    ]
                  }
                  )
                </span>
              )}
            </button>
          ))}
        </div>


        {/* EMPTY */}
        {filteredSubmissions.length ===
        0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
            <Building className="mx-auto mb-3 h-12 w-12 text-gray-300" />

            <p className="font-medium text-gray-600">
              No submissions found
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {filteredSubmissions.map(
              (submission) => {
                const expanded =
                  expandedId ===
                  submission.id

                const detail =
                  details[
                    submission.id
                  ]

                return (
                  <article
                    key={
                      submission.id
                    }
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* SUMMARY */}
                    <div className="p-5 sm:p-6">

                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                        <div className="min-w-0 flex-1">

                          <div className="mb-2 flex flex-wrap items-center gap-2">

                            <Building className="h-5 w-5 text-gray-400" />

                            <h2 className="text-lg font-semibold text-gray-900">
                              {
                                submission.businessName
                              }
                            </h2>

                            <StatusBadge
                              status={
                                submission.status ||
                                'pending'
                              }
                            />
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">

                            {submission.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />

                                {
                                  submission.city
                                }
                                {submission.stateAbbrev &&
                                  `, ${submission.stateAbbrev}`}
                              </span>
                            )}

                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />

                              {
                                submission.submittedByName
                              }
                            </span>

                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />

                              {
                                submission.submittedByEmail
                              }
                            </span>

                            {submission.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />

                                {
                                  submission.phone
                                }
                              </span>
                            )}

                            <span className="text-gray-400">
                              {new Date(
                                submission.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            toggleExpanded(
                              submission.id
                            )
                          }
                          className="self-start rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
                        >
                          {expanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>


                      {/* FULL DETAILS */}
                      {expanded && (
                        <div className="mt-6 border-t border-gray-100 pt-6">

                          {detailLoading ===
                            submission.id &&
                          !detail ? (
                            <div className="flex items-center justify-center py-12 text-gray-500">
                              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                              Loading full submission...
                            </div>
                          ) : detail ? (
                            <SubmissionReview
                              detail={
                                detail
                              }
                            />
                          ) : (
                            <div className="py-8 text-center text-gray-500">
                              Unable to load details.

                              <button
                                type="button"
                                onClick={() =>
                                  fetchDetail(
                                    submission.id,
                                    true
                                  )
                                }
                                className="ml-2 text-blue-600 hover:underline"
                              >
                                Retry
                              </button>
                            </div>
                          )}


                          {/* ACTIONS */}
                          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">

                            {submission.status ===
                              'pending' && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    actionLoading ===
                                    submission.id
                                  }
                                  onClick={() =>
                                    handleStatusUpdate(
                                      submission.id,
                                      'approved'
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                  {actionLoading ===
                                  submission.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}

                                  Approve & Publish
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    actionLoading ===
                                    submission.id
                                  }
                                  onClick={() =>
                                    handleStatusUpdate(
                                      submission.id,
                                      'rejected'
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  <XCircle className="h-4 w-4" />

                                  Reject
                                </button>
                              </>
                            )}


                            {submission.status ===
                              'rejected' && (
                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  submission.id
                                }
                                onClick={() =>
                                  handleStatusUpdate(
                                    submission.id,
                                    'pending'
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                              >
                                <RefreshCw className="h-4 w-4" />

                                Reopen
                              </button>
                            )}


                            {submission.status ===
                              'approved' &&
                              submission.approvedContractorId && (
                                <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
                                  <ShieldCheck className="h-4 w-4" />

                                  Published as Contractor #
                                  {
                                    submission.approvedContractorId
                                  }
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                )
              }
            )}
          </div>
        )}
      </main>
    </>
  )
}


// ============================================================
// FULL REVIEW PANEL
// ============================================================

function SubmissionReview({
  detail,
}: {
  detail:
    SubmissionDetail
}) {
  const submission =
    detail.submission

  const media =
    detail.media || []

  return (
    <div className="space-y-7">

      {/* DESCRIPTION */}
      <ReviewSection title="Business Description">
        {submission.description ? (
          <p className="whitespace-pre-line leading-relaxed text-gray-700">
            {
              submission.description
            }
          </p>
        ) : (
          <EmptyValue />
        )}
      </ReviewSection>


      {/* CONTACT + LOCATION */}
      <ReviewSection title="Business & Contact Details">
        <InfoGrid>
          <Info
            label="Address"
            value={
              submission.address
            }
          />

          <Info
            label="City"
            value={
              submission.city
            }
          />

          <Info
            label="State"
            value={
              submission.state
            }
          />

          <Info
            label="ZIP Code"
            value={
              submission.zipCode
            }
          />

          <Info
            label="Phone"
            value={
              submission.phone
            }
          />

          <Info
            label="Business Email"
            value={
              submission.email
            }
          />
        </InfoGrid>

        {submission.website && (
          <a
            href={
              submission.website
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="h-4 w-4" />

            {
              submission.website
            }
          </a>
        )}
      </ReviewSection>


      {/* CREDENTIALS */}
      <ReviewSection title="Credentials">
        <InfoGrid>
          <Info
            label="License Number"
            value={
              submission.licenseNumber
            }
          />

          <Info
            label="Years in Business"
            value={
              submission.yearsInBusiness !=
              null
                ? String(
                    submission.yearsInBusiness
                  )
                : null
            }
          />
        </InfoGrid>
      </ReviewSection>


      {/* SERVICES */}
      <ReviewSection title="Services Offered">
        <TagList
          values={
            submission.servicesOffered ||
            []
          }
        />
      </ReviewSection>


      {/* SERVICE AREAS */}
      <ReviewSection title="Service Areas">
        <TagList
          values={
            submission.serviceAreas ||
            []
          }
        />
      </ReviewSection>


      {/* OPTIONS */}
      <ReviewSection title="Customer Options">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <BooleanCard
            label="Emergency Service"
            value={
              Boolean(
                submission.emergencyService
              )
            }
          />

          <BooleanCard
            label="Free Estimates"
            value={
              Boolean(
                submission.freeEstimates
              )
            }
          />

          <BooleanCard
            label="Financing Available"
            value={
              Boolean(
                submission.financingAvailable
              )
            }
          />

          <BooleanCard
            label="Warranty Offered"
            value={
              Boolean(
                submission.warrantyOffered
              )
            }
          />
        </div>
      </ReviewSection>


      {/* HOURS */}
      <ReviewSection title="Opening Hours">
        {submission.openingHours ? (
          <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            {
              submission.openingHours
            }
          </pre>
        ) : (
          <EmptyValue />
        )}
      </ReviewSection>


      {/* PRICING */}
      <ReviewSection
        title="Pricing Information"
        icon={
          <BadgeDollarSign className="h-5 w-5 text-green-600" />
        }
      >
        <InfoGrid>
          <Info
            label="Price Range"
            value={
              submission.priceRange
            }
          />

          <Info
            label="Minimum Job Price"
            value={
              submission.minimumJobPrice
                ? `${submission.priceCurrency || 'USD'} ${submission.minimumJobPrice}`
                : null
            }
          />

          <Info
            label="Currency"
            value={
              submission.priceCurrency
            }
          />
        </InfoGrid>

        {submission.pricingNotes && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {
              submission.pricingNotes
            }
          </p>
        )}
      </ReviewSection>


      {/* PHOTOS */}
      <ReviewSection
        title={`Submitted Photos (${media.length})`}
        icon={
          <ImageIcon className="h-5 w-5 text-purple-600" />
        }
      >
        {media.length ===
        0 ? (
          <EmptyValue text="No photos submitted." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {media.map(
              (item) => (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  {item.signedUrl ? (
                    <a
                      href={
                        item.signedUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={
                          item.signedUrl
                        }
                        alt={
                          item.altText ||
                          submission.businessName
                        }
                        className="h-52 w-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gray-100">
                      <ImageIcon className="h-10 w-10 text-gray-300" />
                    </div>
                  )}

                  <figcaption className="p-3">

                    <div className="mb-1 flex items-center justify-between gap-2">

                      <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-medium capitalize text-purple-700">
                        {item.mediaType ||
                          'gallery'}
                      </span>

                      {item.signedUrl && (
                        <a
                          href={
                            item.signedUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {item.altText && (
                      <p className="mt-2 text-xs text-gray-500">
                        <strong>
                          Alt:
                        </strong>{' '}
                        {
                          item.altText
                        }
                      </p>
                    )}

                    {item.caption && (
                      <p className="mt-1 text-sm text-gray-600">
                        {
                          item.caption
                        }
                      </p>
                    )}
                  </figcaption>
                </figure>
              )
            )}
          </div>
        )}
      </ReviewSection>


      {/* SUBMITTER */}
      <ReviewSection title="Submitted By">
        <InfoGrid>
          <Info
            label="Name"
            value={
              submission.submittedByName
            }
          />

          <Info
            label="Account Email"
            value={
              submission.submittedByEmail
            }
          />

          <Info
            label="Submitted"
            value={
              new Date(
                submission.createdAt
              ).toLocaleString()
            }
          />

          <Info
            label="User ID"
            value={
              submission.userId
            }
          />
        </InfoGrid>
      </ReviewSection>


      {submission.adminNotes && (
        <ReviewSection title="Admin Notes">
          <p className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            {
              submission.adminNotes
            }
          </p>
        </ReviewSection>
      )}
    </div>
  )
}


// ============================================================
// UI HELPERS
// ============================================================

function StatusBadge({
  status,
}: {
  status: string
}) {
  const config:
    Record<
      string,
      {
        text: string
        className: string
        icon:
          typeof Clock
      }
    > = {
    pending: {
      text: 'Pending',
      className:
        'bg-yellow-100 text-yellow-700',

      icon: Clock,
    },

    approved: {
      text: 'Approved',
      className:
        'bg-green-100 text-green-700',

      icon:
        CheckCircle,
    },

    rejected: {
      text: 'Rejected',
      className:
        'bg-red-100 text-red-700',

      icon:
        XCircle,
    },

    processing: {
      text: 'Processing',
      className:
        'bg-blue-100 text-blue-700',

      icon:
        RefreshCw,
    },
  }

  const item =
    config[status] ||
    config.pending

  const Icon =
    item.icon

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${item.className}`}
    >
      <Icon className="h-3 w-3" />

      {item.text}
    </span>
  )
}


function StatCard({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className: string
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
    >
      <p className="text-sm">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold">
        {value}
      </p>
    </div>
  )
}


function ReviewSection({
  title,
  icon,
  children,
}: {
  title: string

  icon?: React.ReactNode

  children:
    React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">

      <div className="mb-4 flex items-center gap-2">

        {icon}

        <h3 className="font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      {children}
    </section>
  )
}


function InfoGrid({
  children,
}: {
  children:
    React.ReactNode
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  )
}


function Info({
  label,
  value,
}: {
  label: string
  value:
    | string
    | null
    | undefined
}) {
  return (
    <div className="rounded-lg bg-white p-3">

      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-gray-800">
        {value || '—'}
      </p>
    </div>
  )
}


function TagList({
  values,
}: {
  values: string[]
}) {
  if (!values.length) {
    return <EmptyValue />
  }

  return (
    <div className="flex flex-wrap gap-2">

      {values.map(
        (value, index) => (
          <span
            key={`${value}-${index}`}
            className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
          >
            {value}
          </span>
        )
      )}
    </div>
  )
}


function BooleanCard({
  label,
  value,
}: {
  label: string
  value: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        value
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">

        {value ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-gray-400" />
        )}

        <span
          className={`text-sm font-medium ${
            value
              ? 'text-green-700'
              : 'text-gray-500'
          }`}
        >
          {label}
        </span>
      </div>

      <p className="mt-1 text-xs text-gray-400">
        {value
          ? 'Yes'
          : 'No'}
      </p>
    </div>
  )
}


function EmptyValue({
  text = 'Not provided',
}: {
  text?: string
}) {
  return (
    <p className="text-sm italic text-gray-400">
      {text}
    </p>
  )
}