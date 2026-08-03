// components/directory/FeaturedContractors.tsx
import Link from 'next/link'
import { getFeaturedContractors, getRemainingFeaturedSlots, MAX_FEATURED_NATIONAL, MAX_FEATURED_PER_STATE } from '@/lib/queries/getFeaturedContractors'

type Props = {
  limit?: number
  stateAbbrev?: string
  title?: string
  showAdvertiseCta?: boolean
}

export async function FeaturedContractors({
  limit = 8,
  stateAbbrev,
  title = 'Featured Contractors',
  showAdvertiseCta = true,
}: Props) {
  const contractors = await getFeaturedContractors(limit, stateAbbrev)

  // Only happens if the published contractor pool itself is empty for this
  // scope (e.g. a brand-new state page with zero listings yet) -- in that
  // case, skip rendering the section entirely rather than showing an
  // apologetic empty state.
  if (contractors.length === 0) return null

  // Check if there's capacity for more featured listings
  const remainingSlots = await getRemainingFeaturedSlots(stateAbbrev)
  const showCta = showAdvertiseCta && remainingSlots > 0

  // Calculate how many contractor cards to show (leave space for CTA if needed)
  const showCtaInGrid = showCta && contractors.length < limit
  const displayLimit = showCtaInGrid ? limit - 1 : limit
  const displayContractors = contractors.slice(0, displayLimit)

  const maxAllowed = stateAbbrev ? MAX_FEATURED_PER_STATE : MAX_FEATURED_NATIONAL
  const currentCount = contractors.filter(c => c.isSponsored).length

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          <div className="text-sm text-gray-500">
            {currentCount > 0 && (
              <span>
                {currentCount} featured{stateAbbrev ? ` in ${stateAbbrev.toUpperCase()}` : ''}
                {remainingSlots > 0 && ` · ${remainingSlots} slots available`}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayContractors.map((contractor) => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}

          {/* Show "Advertise Here" CTA in the last slot if there's capacity */}
          {showCtaInGrid && (
            <AdvertiseCta stateAbbrev={stateAbbrev} remainingSlots={remainingSlots} maxAllowed={maxAllowed} />
          )}
        </div>
      </div>
    </section>
  )
}

function ContractorCard({ contractor }: { contractor: Awaited<ReturnType<typeof getFeaturedContractors>>[number] }) {
  const location = [contractor.city, contractor.stateAbbrev].filter(Boolean).join(', ')

  return (
    <Link
      href={`/${contractor.state?.toLowerCase().replace(/\s+/g, '-')}/${contractor.slug}`}
      className="relative block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      {contractor.isSponsored && (
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wide font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          Featured Partner
        </span>
      )}
      <h3 className="font-semibold text-gray-900 pr-20">{contractor.name}</h3>
      {location && <p className="text-sm text-gray-500 mt-1">{location}</p>}
      <div className="flex items-center gap-2 mt-3">
        {contractor.rating != null && (
          <span className="text-sm font-medium text-amber-500">
            ★ {Number(contractor.rating).toFixed(1)}
          </span>
        )}
        {contractor.reviewCount != null && contractor.reviewCount > 0 && (
          <span className="text-xs text-gray-400">({contractor.reviewCount} reviews)</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 mt-3">
        {contractor.verified && (
          <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
        )}
        {contractor.emergencyService && (
          <span className="text-[11px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">24/7 Emergency</span>
        )}
      </div>
    </Link>
  )
}

function AdvertiseCta({ stateAbbrev, remainingSlots, maxAllowed }: { 
  stateAbbrev?: string; 
  remainingSlots: number;
  maxAllowed: number;
}) {
  const locationText = stateAbbrev 
    ? `in ${stateAbbrev.toUpperCase()}` 
    : 'nationally'

  return (
    <Link
      href="/advertise"
      className="flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:bg-blue-50/40 transition-colors min-h-[200px]"
    >
      <span className="text-3xl mb-2">📢</span>
      <span className="font-semibold text-gray-700">Advertise Here</span>
      <span className="text-sm text-gray-500 mt-1">
        {remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'} available {locationText}
      </span>
      <span className="text-xs text-gray-400 mt-2">
        Max {maxAllowed} featured per {stateAbbrev ? 'state' : 'national'}
      </span>
      <span className="text-sm text-blue-600 font-medium mt-3 hover:underline">
        Learn more →
      </span>
    </Link>
  )
}