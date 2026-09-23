'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  CheckCircle,
  FileEdit,
  Image as ImageIcon,
  RefreshCw,
  XCircle,
} from 'lucide-react'

import {
  AdminNav,
} from '@/components/admin/AdminNav'


interface UpdateRequest {
  id: number
  contractorId: number
  changes:
    Record<string, unknown>
  previousValues:
    Record<string, unknown> | null
  status: string
  contractorName: string
  city: string | null
  state: string | null
  userEmail: string | null
  createdAt: string
}

interface MediaRequest {
  id: number
  contractorId: number
  contractorName: string
  city: string | null
  state: string | null
  mediaType: string | null
  altText: string | null
  caption: string | null
  signedUrl: string | null
  status: string
  createdAt: string
}


function displayValue(
  value: unknown
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—'
  }

  if (
    typeof value ===
    'boolean'
  ) {
    return value
      ? 'Yes'
      : 'No'
  }

  if (
    Array.isArray(value)
  ) {
    return value.join(', ')
  }

  return String(value)
}


function prettyKey(
  key: string
) {
  return key
    .replace(
      /([A-Z])/g,
      ' $1'
    )
    .replace(
      /^./,
      (character) =>
        character.toUpperCase()
    )
}


export default function AdminUpdatesPage() {
  const [
    updates,
    setUpdates,
  ] =
    useState<
      UpdateRequest[]
    >([])

  const [
    media,
    setMedia,
  ] =
    useState<
      MediaRequest[]
    >([])

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  const load =
    useCallback(
      async () => {
        setLoading(true)

        setError(null)

        try {
          const [
            updateResponse,
            mediaResponse,
          ] =
            await Promise.all([
              fetch(
                '/api/admin/contractor-updates?status=pending'
              ),

              fetch(
                '/api/admin/contractor-media?status=pending'
              ),
            ])

          const [
            updateData,
            mediaData,
          ] =
            await Promise.all([
              updateResponse.json(),
              mediaResponse.json(),
            ])

          if (
            !updateResponse.ok
          ) {
            throw new Error(
              updateData.error ||
                'Failed to load profile updates'
            )
          }

          if (
            !mediaResponse.ok
          ) {
            throw new Error(
              mediaData.error ||
                'Failed to load media'
            )
          }

          setUpdates(
            updateData.updates ||
              []
          )

          setMedia(
            mediaData.media ||
              []
          )
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load moderation queue'
          )
        } finally {
          setLoading(false)
        }
      },
      []
    )

  useEffect(() => {
    load()
  }, [load])


  async function reviewUpdate(
    id: number,
    status:
      | 'approved'
      | 'rejected',
    force = false
  ) {
    const adminNotes =
      status === 'rejected'
        ? prompt(
            'Optional reason for rejection:'
          ) || ''
        : ''

    const response =
      await fetch(
        `/api/admin/contractor-updates/${id}`,
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
              force,
            }),
        }
      )

    const data =
      await response.json()

    if (
      response.status ===
        409 &&
      data.conflicts &&
      !force
    ) {
      const proceed =
        confirm(
          `This profile changed after the request was submitted.\n\nConflicting fields: ${data.conflicts.join(', ')}\n\nApprove anyway?`
        )

      if (proceed) {
        return reviewUpdate(
          id,
          status,
          true
        )
      }

      return
    }

    if (!response.ok) {
      alert(
        data.error ||
          'Action failed'
      )
      return
    }

    setUpdates(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    )
  }


  async function reviewMedia(
    id: number,
    status:
      | 'approved'
      | 'rejected'
  ) {
    const adminNotes =
      status === 'rejected'
        ? prompt(
            'Optional reason for rejection:'
          ) || ''
        : ''

    const response =
      await fetch(
        `/api/admin/contractor-media/${id}`,
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
      alert(
        data.error ||
          'Action failed'
      )
      return
    }

    setMedia(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    )
  }


  return (
    <>
      <AdminNav />

      <main className="container mx-auto max-w-7xl px-4 py-8">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Profile Updates
            </h1>

            <p className="mt-1 text-gray-500">
              Review owner-submitted
              business information and
              photos.
            </p>
          </div>

          <button
            onClick={load}
            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>


        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading moderation
            queue...
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <FileEdit className="h-5 w-5 text-blue-600" />

                Profile changes

                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                  {updates.length}
                </span>
              </h2>

              {updates.length === 0 ? (
                <EmptyState text="No pending profile updates." />
              ) : (
                <div className="space-y-4">

                  {updates.map(
                    (update) => (
                      <article
                        key={update.id}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <h3 className="font-semibold">
                          {
                            update.contractorName
                          }
                        </h3>

                        <p className="mb-4 text-sm text-gray-500">
                          {[
                            update.city,
                            update.state,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              ', '
                            )}

                          {update.userEmail &&
                            ` • ${update.userEmail}`}
                        </p>

                        <div className="space-y-3">

                          {Object.entries(
                            update.changes
                          ).map(
                            ([
                              key,
                              value,
                            ]) => (
                              <div
                                key={key}
                                className="rounded-lg bg-gray-50 p-3"
                              >
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  {
                                    prettyKey(
                                      key
                                    )
                                  }
                                </p>

                                <div className="grid gap-2 text-sm md:grid-cols-2">

                                  <div>
                                    <span className="text-xs text-gray-400">
                                      Before
                                    </span>

                                    <p className="break-words text-gray-600">
                                      {displayValue(
                                        update
                                          .previousValues?.[
                                          key
                                        ]
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <span className="text-xs text-gray-400">
                                      Proposed
                                    </span>

                                    <p className="break-words font-medium text-gray-900">
                                      {displayValue(
                                        value
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        <div className="mt-5 flex gap-2">

                          <button
                            onClick={() =>
                              reviewUpdate(
                                update.id,
                                'approved'
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              reviewUpdate(
                                update.id,
                                'rejected'
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>


            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <ImageIcon className="h-5 w-5 text-purple-600" />

                Photos

                <span className="rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-600">
                  {media.length}
                </span>
              </h2>

              {media.length === 0 ? (
                <EmptyState text="No pending business photos." />
              ) : (
                <div className="space-y-4">

                  {media.map(
                    (item) => (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                      >
                        {item.signedUrl && (
                          <img
                            src={
                              item.signedUrl
                            }
                            alt={
                              item.altText ||
                              item.contractorName
                            }
                            className="h-64 w-full object-cover"
                          />
                        )}

                        <div className="p-5">
                          <h3 className="font-semibold">
                            {
                              item.contractorName
                            }
                          </h3>

                          <p className="text-sm text-gray-500">
                            {item.mediaType ||
                              'gallery'}

                            {' • '}

                            {[
                              item.city,
                              item.state,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                ', '
                              )}
                          </p>

                          {item.altText && (
                            <p className="mt-3 text-sm">
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

                          <div className="mt-5 flex gap-2">

                            <button
                              onClick={() =>
                                reviewMedia(
                                  item.id,
                                  'approved'
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                reviewMedia(
                                  item.id,
                                  'rejected'
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  )
}


function EmptyState({
  text,
}: {
  text: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
      {text}
    </div>
  )
}