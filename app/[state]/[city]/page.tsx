// app/[state]/[city]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getCurrentWeather, getClimateData } from '@/lib/services/weather'
import { getDb } from '@/lib/db'
import { states, cities, contractors } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ContractorCard } from '@/components/directory/ContractorCard'
import { SearchFilter } from '@/components/directory/SearchFilter'
import { WeatherWidget } from '@/components/directory/WeatherWidget'

interface CityPageProps {
  params: Promise<{
    state: string
    city: string
  }>
}

export async function generateMetadata({ params }: CityPageProps) {
  const { state, city } = await params
  const db = getDb()
  
  const stateData = await db
    .select()
    .from(states)
    .where(eq(states.slug, state))
    .limit(1)

  if (!stateData.length) return {}

  const cityData = await db
    .select()
    .from(cities)
    .where(
      and(
        eq(cities.slug, city),
        eq(cities.stateId, stateData[0].id)
      )
    )
    .limit(1)

  if (!cityData.length) return {}

  return generateSeoMetadata({
    title: `Roof Leak Repair in ${cityData[0].name}, ${stateData[0].abbreviation}`,
    description: `Find the best roof leak repair contractors in ${cityData[0].name}, ${stateData[0].abbreviation}. Get free estimates, read reviews, and find emergency roof repair services.`,
    keywords: [`roof leak repair ${cityData[0].name}`, `roofing contractors ${cityData[0].name}`],
    canonical: `/${stateData[0].slug}/${cityData[0].slug}`,
  })
}

export default async function CityPage({ params }: CityPageProps) {
  const { state, city } = await params
  const db = getDb()
  
  // Get state info
  const stateData = await db
    .select()
    .from(states)
    .where(eq(states.slug, state))
    .limit(1)

  if (!stateData.length) notFound()

  const stateInfo = stateData[0]

  // Get city with state filter
  const cityData = await db
    .select()
    .from(cities)
    .where(
      and(
        eq(cities.slug, city),
        eq(cities.stateId, stateInfo.id)
      )
    )
    .limit(1)

  if (!cityData.length) notFound()

  const cityInfo = cityData[0]

  // Get contractors for this specific city
  const contractorList = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      businessName: contractors.businessName,
      slug: contractors.slug,
      description: contractors.description,
      address: contractors.address,
      phone: contractors.phone,
      website: contractors.website,
      rating: contractors.rating,
      reviewCount: contractors.reviewCount,
      emergencyService: contractors.emergencyService,
      verified: contractors.verified,
      freeEstimates: contractors.freeEstimates,
      yearsInBusiness: contractors.yearsInBusiness,
      servicesOffered: contractors.servicesOffered,
      openingHours: contractors.openingHours,
      cityName: cities.name,
      citySlug: cities.slug,
      stateName: states.name,
      stateSlug: states.slug,
      stateAbbr: states.abbreviation,
    })
    .from(contractors)
    .innerJoin(cities, eq(contractors.cityId, cities.id))
    .innerJoin(states, eq(contractors.stateId, states.id))
    .where(
      and(
        eq(contractors.cityId, cityInfo.id),
        eq(contractors.stateId, stateInfo.id),
        eq(contractors.published, true)
      )
    )
    .orderBy(
      sql`${contractors.rating} DESC NULLS LAST`,
      sql`${contractors.verified} DESC`
    )

  console.log(`🔍 City: ${cityInfo.name} (ID: ${cityInfo.id}, State: ${stateInfo.name})`)
  console.log(`📊 Contractors found: ${contractorList.length}`)

  const totalCount = contractorList.length

  const weatherData = await getCurrentWeather(cityInfo.name, stateInfo.name)
  const climateData = getClimateData(cityInfo.name, stateInfo.name)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="text-gray-400">/</span>
        <Link href={`/${stateInfo.slug}`} className="hover:text-blue-600">{stateInfo.name}</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-800 font-medium">{cityInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Roof Leak Repair Contractors in {cityInfo.name}, {stateInfo.abbreviation}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Find trusted roof leak repair professionals serving {cityInfo.name} and the surrounding area.
        </p>
      </div>

      {/* Search Filter */}
      <div className="mb-8">
        <SearchFilter />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2">
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              {totalCount} {totalCount === 1 ? 'contractor' : 'contractors'} found
            </p>
          </div>

          {/* Contractor Grid */}
          {totalCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contractorList.map((contractor) => (
                <ContractorCard
                  key={contractor.id}
                  contractor={contractor}
                  stateSlug={stateInfo.slug}
                  citySlug={cityInfo.slug}
                  variant="summary"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Contractors Found in {cityInfo.name}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find any contractors in {cityInfo.name}. Try searching in nearby cities or check back later.
              </p>
              <Link
                href={`/${stateInfo.slug}`}
                className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View All Cities in {stateInfo.name}
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <WeatherWidget
            city={cityInfo.name}
            state={stateInfo.name}
            weatherData={weatherData}
            climateData={climateData}
          />

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Contractors</span>
                <span className="font-bold text-blue-600">{totalCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Verified</span>
                <span className="font-bold text-green-600">
                  {contractorList.filter(c => c.verified).length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Emergency Services</span>
                <span className="font-bold text-red-600">
                  {contractorList.filter(c => c.emergencyService).length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Avg Rating</span>
                <span className="font-bold text-yellow-600">
                  {contractorList.length > 0 
                    ? (contractorList.reduce((sum, c) => sum + Number(c.rating || 0), 0) / contractorList.length).toFixed(1)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Popular Services in this city */}
          {contractorList.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Services</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    contractorList
                      .flatMap(c => c.servicesOffered || [])
                      .filter(Boolean)
                  )
                ).slice(0, 8).map((service) => (
                  <span
                    key={service}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}