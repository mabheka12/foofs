// app/[state]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { states, cities, contractors } from '@/lib/db/schema'
import { eq, sql, and, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Building, ChevronRight, Home, Wrench, Clock } from 'lucide-react'

interface StatePageProps {
  params: Promise<{
    state: string
  }>
}

export async function generateMetadata({ params }: StatePageProps) {
  const { state } = await params
  const db = getDb()
  
  const stateData = await db
    .select()
    .from(states)
    .where(eq(states.slug, state))
    .limit(1)

  if (!stateData.length) return {}

  return generateSeoMetadata({
    title: `Roof Leak Repair Contractors in ${stateData[0].name}`,
    description: `Find the best roof leak repair contractors in ${stateData[0].name}. Browse cities, compare reviews, and get free estimates from trusted roofing professionals.`,
    keywords: [`roof leak repair ${stateData[0].name}`, `roofing contractors ${stateData[0].name}`, `roof repair ${stateData[0].name}`],
    canonical: `/${stateData[0].slug}`,
  })
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params
  const db = getDb()

  // Get state info
  const stateData = await db
    .select()
    .from(states)
    .where(eq(states.slug, state))
    .limit(1)

  if (!stateData.length) notFound()

  const stateInfo = stateData[0]

  // Get cities with contractor counts - optimized query
  const citiesWithCounts = await db
    .select({
      id: cities.id,
      name: cities.name,
      slug: cities.slug,
      contractorCount: sql<number>`COUNT(DISTINCT ${contractors.id})`.as('contractor_count'),
    })
    .from(cities)
    .leftJoin(contractors, 
      and(
        eq(contractors.cityId, cities.id),
        eq(contractors.published, true)
      )
    )
    .where(eq(cities.stateId, stateInfo.id))
    .groupBy(cities.id, cities.name, cities.slug)
    .orderBy(sql`contractor_count DESC`, cities.name)

  // Get top 3 featured/rated contractors for this state
  const featuredContractors = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      businessName: contractors.businessName,
      slug: contractors.slug,
      rating: contractors.rating,
      reviewCount: contractors.reviewCount,
      cityName: cities.name,
      citySlug: cities.slug,
      emergencyService: contractors.emergencyService,
      verified: contractors.verified,
    })
    .from(contractors)
    .leftJoin(cities, eq(contractors.cityId, cities.id))
    .where(
      and(
        eq(contractors.stateId, stateInfo.id),
        eq(contractors.published, true),
        eq(contractors.featured, true)
      )
    )
    .orderBy(desc(contractors.rating))
    .limit(3)

  // If no featured, get top rated
  const topRated = featuredContractors.length === 0 ? await db
    .select({
      id: contractors.id,
      name: contractors.name,
      businessName: contractors.businessName,
      slug: contractors.slug,
      rating: contractors.rating,
      reviewCount: contractors.reviewCount,
      cityName: cities.name,
      citySlug: cities.slug,
      emergencyService: contractors.emergencyService,
      verified: contractors.verified,
    })
    .from(contractors)
    .leftJoin(cities, eq(contractors.cityId, cities.id))
    .where(
      and(
        eq(contractors.stateId, stateInfo.id),
        eq(contractors.published, true)
      )
    )
    .orderBy(desc(contractors.rating))
    .limit(3) : []

  const displayContractors = featuredContractors.length > 0 ? featuredContractors : topRated

  // Calculate totals
  const totalContractors = citiesWithCounts.reduce((sum, city) => sum + (Number(city.contractorCount) || 0), 0)
  const activeCities = citiesWithCounts.filter(c => Number(c.contractorCount) > 0).length

  // Get service types available in this state
  const serviceTypes = await db
    .select({
      service: sql<string>`DISTINCT jsonb_array_elements_text(${contractors.servicesOffered})`,
    })
    .from(contractors)
    .where(
      and(
        eq(contractors.stateId, stateInfo.id),
        eq(contractors.published, true),
        sql`jsonb_array_length(${contractors.servicesOffered}) > 0`
      )
    )
    .limit(8)

  const availableServices = serviceTypes.map(s => s.service).filter(Boolean)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
          <Home className="w-4 h-4" />
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-800 font-medium">{stateInfo.name}</span>
      </nav>

      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Roof Leak Repair in {stateInfo.name}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Find trusted roof leak repair contractors in cities across {stateInfo.name}. 
          {totalContractors > 0 && ` ${totalContractors} contractors available.`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-blue-600">{citiesWithCounts.length}</div>
          <div className="text-sm text-gray-600 font-medium">Cities Covered</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-green-600">{totalContractors}</div>
          <div className="text-sm text-gray-600 font-medium">Total Contractors</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-purple-600">{activeCities}</div>
          <div className="text-sm text-gray-600 font-medium">Active Cities</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-orange-600">24/7</div>
          <div className="text-sm text-gray-600 font-medium">Emergency Service</div>
        </div>
      </div>

      {/* Featured Contractors */}
      {displayContractors.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>⭐</span>
              Featured Contractors
            </h2>
            <Link 
              href={`/${stateInfo.slug}/contractors`} 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayContractors.map((contractor) => (
              <Link
                key={contractor.id}
                href={`/${stateInfo.slug}/${contractor.citySlug}/${contractor.slug}`}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:border-blue-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-lg">
                      {contractor.businessName || contractor.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{contractor.cityName}</p>
                  </div>
                  {contractor.verified && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>
                {contractor.rating && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-yellow-500 text-lg">⭐</span>
                    <span className="font-semibold">{contractor.rating}</span>
                    <span className="text-gray-400 text-sm">({contractor.reviewCount || 0} reviews)</span>
                  </div>
                )}
                {contractor.emergencyService && (
                  <span className="inline-block mt-3 bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                    🚨 24/7 Emergency
                  </span>
                )}
                <div className="mt-4 text-blue-600 group-hover:translate-x-1 transition flex items-center gap-1 text-sm font-medium">
                  View Profile →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Services Available */}
      {availableServices.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Services Available in {stateInfo.name}</h2>
          <div className="flex flex-wrap gap-3">
            {availableServices.map((service) => (
              <span
                key={service}
                className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cities Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Find Roofers in Cities Across {stateInfo.name}
          </h2>
          <span className="text-sm text-gray-500">
            {activeCities} cities with contractors
          </span>
        </div>
        
        {citiesWithCounts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No cities found in {stateInfo.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {citiesWithCounts.map((city) => {
              const count = Number(city.contractorCount) || 0
              const hasContractors = count > 0
              return (
                <Link
                  key={city.id}
                  href={`/${stateInfo.slug}/${city.slug}`}
                  className={`group bg-white border rounded-xl p-5 hover:shadow-lg transition-all ${
                    hasContractors 
                      ? 'border-gray-200 hover:border-blue-300' 
                      : 'border-gray-100 opacity-60 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold text-lg ${
                        hasContractors 
                          ? 'text-gray-900 group-hover:text-blue-600 transition' 
                          : 'text-gray-400'
                      }`}>
                        {city.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${hasContractors ? 'text-gray-600' : 'text-gray-400'}`}>
                          {count} {count === 1 ? 'contractor' : 'contractors'}
                        </span>
                      </div>
                    </div>
                    {hasContractors && (
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                    )}
                  </div>
                  {hasContractors && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 rounded-full h-1.5 transition-all duration-500"
                        style={{ 
                          width: `${Math.min((count / (citiesWithCounts[0]?.contractorCount || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  )}
                  {!hasContractors && (
                    <p className="text-xs text-gray-400 mt-2">No contractors yet</p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions About Roofing in {stateInfo.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              How do I find a contractor in my city?
            </h3>
            <p className="text-gray-600 text-sm">
              Click on your city from the list above to see all available 
              contractors in that area. You can then view their full profiles and contact them directly.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              What services are available in {stateInfo.name}?
            </h3>
            <p className="text-gray-600 text-sm">
              Services include emergency repairs, roof inspections, leak repairs, 
              roof replacement, and regular maintenance across all cities in {stateInfo.name}.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              How do I get an emergency roof repair?
            </h3>
            <p className="text-gray-600 text-sm">
              Look for contractors with the "Emergency Service" badge. Click on 
              their profile and call the emergency number for immediate assistance.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-500" />
              Are all contractors verified?
            </h3>
            <p className="text-gray-600 text-sm">
              We verify all contractors on our platform. Look for the "Verified" 
              badge on contractor profiles for added peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}