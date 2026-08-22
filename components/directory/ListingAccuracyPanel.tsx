// components/directory/ListingAccuracyPanel.tsx
import Link from 'next/link'
import { CalendarClock, Flag, Info } from 'lucide-react'

interface ListingAccuracyPanelProps {
  contractorName: string
  updatedAt?: Date | string | null
  verified?: boolean | null
}

function formatUpdatedDate(updatedAt?: Date | string | null) {
  if (!updatedAt) return null

  const date = new Date(updatedAt)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function ListingAccuracyPanel({
  contractorName,
  updatedAt,
  verified,
}: ListingAccuracyPanelProps) {
  const formattedDate = formatUpdatedDate(updatedAt)

  const correctionUrl = `/contact?subject=listing-correction&business=${encodeURIComponent(
    contractorName
  )}`

  return (
    <aside className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-900">
            Listing information
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Business details can change. Confirm availability, service
            areas, licensing, insurance and project terms directly with
            {` ${contractorName}`} before hiring.
          </p>

          <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center">
            {formattedDate && (
              <span className="inline-flex items-center gap-2 text-gray-600">
                <CalendarClock className="h-4 w-4 text-gray-500" />
                Last updated {formattedDate}
              </span>
            )}

            {verified && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Listing marked as verified
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href={correctionUrl}
              className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:underline"
            >
              <Flag className="h-4 w-4" />
              Report incorrect information
            </Link>

            <Link
              href="/how-roofernet-works"
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              How RooferNet listings work →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}