// app/[state]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { states, cities, contractors } from '@/lib/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Building, ChevronRight } from 'lucide-react'

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
    description: `Find the best roof leak repair contractors in ${stateData[0].name}. Browse cities and compare reviews.`,
    keywords: [`roof leak repair ${stateData[0].name}`, `roofing contractors ${stateData[0].name}`],
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

  // Get cities with contractor counts for this state
  const citiesWithCounts = await db
    .select({
      id: cities.id,
      name: cities.name,
      slug: cities.slug,
      contractorCount: sql<number>`COUNT(DISTINCT ${contractors.id})`.as('contractor_count'),
    })
    .from(cities)
    .leftJoin(contractors, and(
      eq(contractors.cityId, cities.id),
      eq(contractors.published, true)
    ))
    .where(eq(cities.stateId, stateInfo.id))
    .groupBy(cities.id, cities.name, cities.slug)
    .orderBy(sql`contractor_count DESC`, cities.name)

  // Get featured contractors for this state (top 3)
  const featuredContractors = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      businessName: contractors.businessName,
      slug: contractors.slug,
      rating: contractors.rating,
      cityName: cities.name,
      citySlug: cities.slug,
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
    .orderBy(sql`${contractors.rating} DESC`)
    .limit(3)

  // Total contractors in state
  const totalContractors = citiesWithCounts.reduce((sum, city) => sum + (Number(city.contractorCount) || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{stateInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Roof Leak Repair in {stateInfo.name}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Find trusted roof leak repair contractors in cities across {stateInfo.name}. 
          {totalContractors > 0 && ` ${totalContractors} contractors available.`}
        </p>
      </div>

      {/* State Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{citiesWithCounts.length}</div>
          <div className="text-sm text-gray-600">Cities Covered</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalContractors}</div>
          <div className="text-sm text-gray-600">Total Contractors</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {citiesWithCounts.filter(c => Number(c.contractorCount) > 0).length}
          </div>
          <div className="text-sm text-gray-600">Active Cities</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">24/7</div>
          <div className="text-sm text-gray-600">Emergency Service</div>
        </div>
      </div>

      {/* Featured Contractors (optional - shows top rated) */}
      {featuredContractors.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>⭐</span>
            Featured Contractors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredContractors.map((contractor) => (
              <Link
                key={contractor.id}
                href={`/${stateInfo.slug}/${contractor.citySlug}/${contractor.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:border-blue-300 group"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {contractor.businessName || contractor.name}
                </h3>
                <p className="text-sm text-gray-600">{contractor.cityName}</p>
                {contractor.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium">{contractor.rating}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cities Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Find Roofers in Cities Across {stateInfo.name}
        </h2>
        
        {citiesWithCounts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No cities found in {stateInfo.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {citiesWithCounts.map((city) => {
              const count = Number(city.contractorCount) || 0
              return (
                <Link
                  key={city.id}
                  href={`/${stateInfo.slug}/${city.slug}`}
                  className="group bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow hover:border-blue-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {city.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {count} {count === 1 ? 'contractor' : 'contractors'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                  </div>
                  {count > 0 && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 rounded-full h-1.5 transition-all duration-500"
                        style={{ 
                          width: `${Math.min((count / (citiesWithCounts[0]?.contractorCount || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  )}
                  {count === 0 && (
                    <p className="text-xs text-gray-400 mt-2">No contractors yet</p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How do I find a contractor in my city?
            </h3>
            <p className="text-gray-600 text-sm">
              Click on your city from the list above to see all available 
              contractors in that area. You can then view their full profiles.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Are all contractors verified?
            </h3>
            <p className="text-gray-600 text-sm">
              We verify all contractors on our platform. Look for the "Verified" 
              badge on contractor profiles for added peace of mind.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What services are available in {stateInfo.name}?
            </h3>
            <p className="text-gray-600 text-sm">
              Services include emergency repairs, roof inspections, leak repairs, 
              roof replacement, and regular maintenance across all cities.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How do I get an emergency roof repair?
            </h3>
            <p className="text-gray-600 text-sm">
              Look for contractors with the "Emergency Service" badge. Click on 
              their profile and call the emergency number for immediate assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}