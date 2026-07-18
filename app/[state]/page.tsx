// app/[state]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Phone, Star, Building, Clock, CheckCircle, X } from 'lucide-react'

interface StatePageProps {
  params: Promise<{
    state: string
  }>
  searchParams: Promise<{
    city?: string
  }>
}

export async function generateMetadata({ params }: StatePageProps) {
  const { state } = await params
  
  if (!state) {
    return generateSeoMetadata({
      title: 'State Not Found',
      description: 'The state you are looking for could not be found.',
       canonical: `/${state}`,
    alternates: {
      canonical: `/${state}`,
    },
    })
  }

  const db = getDb()
  const stateName = state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  // Check if there are contractors for this state
  const stateExists = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(contractors)
    .where(
      and(
        eq(contractors.published, true),
        eq(contractors.stateSlug, state)
      )
    )
    .limit(1)

  if (!stateExists[0]?.count) {
    return generateSeoMetadata({
      title: 'State Not Found',
      description: 'The state you are looking for could not be found.',
    })
  }

  return generateSeoMetadata({
    title: `Roof Leak Repair Contractors in ${stateName}`,
    description: `Find trusted roof leak repair contractors in ${stateName}. Compare reviews, get free estimates, and find emergency roof repair services near you.`,
    keywords: [`roof leak repair ${stateName}`, `roofing contractors ${stateName}`, `emergency roof repair ${stateName}`],
    canonical: `/${state}`,
  })
}

export default async function StatePage({ params, searchParams }: StatePageProps) {
  const { state } = await params
  const { city: selectedCity } = await searchParams
  
  if (!state) {
    notFound()
  }

  const db = getDb()
  const stateSlug = state
  const stateName = state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  // Build the where clause for contractors
  let whereClause = and(
    eq(contractors.published, true),
    eq(contractors.stateSlug, stateSlug)
  )

  // If a city is selected, filter by city
  if (selectedCity) {
    whereClause = and(
      whereClause,
      eq(contractors.citySlug, selectedCity)
    )
  }

  // Get contractors for this state (with optional city filter)
  const contractorsList = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      slug: contractors.slug,
      address: contractors.address,
      phone: contractors.phone,
      website: contractors.website,
      rating: contractors.rating,
      reviewCount: contractors.reviewCount,
      city: contractors.city,
      citySlug: contractors.citySlug,
      state: contractors.state,
      stateAbbrev: contractors.state_abbrev,
      description: contractors.description,
      servicesOffered: contractors.servicesOffered,
      openingHours: contractors.openingHours,
      latitude: contractors.latitude,
      longitude: contractors.longitude,
      verified: contractors.verified,
      emergencyService: contractors.emergencyService,
      featured: contractors.featured,
    })
    .from(contractors)
    .where(whereClause)
    .orderBy(desc(contractors.rating), contractors.name)

  // If no contractors found, show 404
  if (contractorsList.length === 0) {
    notFound()
  }

  // Get cities with contractor counts for this state
  const citiesWithCounts = await db
    .select({
      city: contractors.city,
      citySlug: contractors.citySlug,
      count: sql<number>`COUNT(${contractors.id})`.as('count'),
    })
    .from(contractors)
    .where(
      and(
        eq(contractors.published, true),
        eq(contractors.stateSlug, stateSlug)
      )
    )
    .groupBy(contractors.city, contractors.citySlug)
    .orderBy(sql`count DESC`)

  const totalContractors = contractorsList.length
  const selectedCityName = selectedCity ? selectedCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null

  // Calculate average rating
  const avgRating = contractorsList.reduce((acc, c) => acc + (Number(c.rating) || 0), 0) / (contractorsList.filter(c => c.rating).length || 1)

  // Count emergency service providers
  const emergencyCount = contractorsList.filter(c => c.emergencyService).length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/states" className="hover:text-blue-600">States</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{stateName}</span>
        {selectedCityName && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{selectedCityName}</span>
          </>
        )}
      </nav>

      {/* State Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {selectedCityName ? (
            <>Roof Leak Repair Contractors in {selectedCityName}, {stateName}</>
          ) : (
            <>Roof Leak Repair Contractors in {stateName}</>
          )}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          {selectedCityName ? (
            <>Find the best roof leak repair professionals in {selectedCityName}, {stateName}. Compare reviews, get free estimates, and find emergency roof repair services near you.</>
          ) : (
            <>Find the best roof leak repair professionals in {stateName}. Compare reviews, get free estimates, and find emergency roof repair services near you.</>
          )}
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{totalContractors}</div>
          <div className="text-sm text-gray-600">
            {selectedCityName ? 'Contractors in City' : 'Total Contractors'}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{citiesWithCounts.length}</div>
          <div className="text-sm text-gray-600">Cities with Contractors</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{emergencyCount}</div>
          <div className="text-sm text-gray-600">24/7 Emergency Service</div>
        </div>
      </div>

      {/* City Filter Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Cities in {stateName}</h2>
          {selectedCity && (
            <Link
              href={`/${stateSlug}`}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear filter
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {citiesWithCounts.map((city) => {
            if (!city.citySlug) return null
            const isActive = selectedCity === city.citySlug
            return (
              <Link
                key={city.citySlug}
                href={`/${stateSlug}?city=${city.citySlug}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {city.city}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {Number(city.count)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Contractors List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="w-6 h-6" />
            {selectedCityName ? `Contractors in ${selectedCityName}` : `All Contractors in ${stateName}`}
          </h2>
          <span className="text-sm text-gray-500">{totalContractors} contractors found</span>
        </div>

        {contractorsList.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">No contractors found in {selectedCityName || stateName}.</p>
            {selectedCity && (
              <Link 
                href={`/${stateSlug}`}
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                View all contractors in {stateName}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contractorsList.map((contractor) => (
              <Link
                key={contractor.id}
                href={`/${stateSlug}/${contractor.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow hover:border-blue-300 group flex flex-col"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                    {contractor.name}
                  </h3>
                  {contractor.rating && (
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded flex-shrink-0 ml-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-sm">{Number(contractor.rating).toFixed(1)}</span>
                      {contractor.reviewCount && (
                        <span className="text-xs text-gray-500">({contractor.reviewCount})</span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                  {contractor.description || 'Professional roof leak repair services.'}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  {contractor.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {contractor.city}, {contractor.stateAbbrev}
                    </span>
                  )}
                  {contractor.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {contractor.phone}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {contractor.emergencyService && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Emergency 24/7
                    </span>
                  )}
                  {contractor.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  {contractor.featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      ★ Featured
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}