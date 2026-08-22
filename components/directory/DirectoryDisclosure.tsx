// components/directory/DirectoryDisclosure.tsx
import Link from 'next/link'
import { Info } from 'lucide-react'

export function DirectoryDisclosure() {
  return (
    <aside className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

        <div>
          <p className="font-semibold">
            About RooferNet listings
          </p>

          <p className="mt-1 leading-relaxed text-blue-900">
            Listing details can change. Confirm licensing, insurance,
            availability and project terms directly with the contractor
            before hiring.
          </p>

          <Link
            href="/how-roofernet-works"
            className="mt-2 inline-block font-medium text-blue-700 hover:underline"
          >
            Learn how listings and featured placements work →
          </Link>
        </div>
      </div>
    </aside>
  )
}