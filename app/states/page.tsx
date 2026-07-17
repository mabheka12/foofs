// app/states/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import Link from 'next/link'
import { MapPin, Building, Users, TrendingUp } from 'lucide-react'

export async function generateMetadata() {
  return generateSeoMetadata({
    title: 'Roof Leak Repair Contractors by State',
    description: 'Find trusted roof leak repair contractors in all 50 states. Compare reviews, get free estimates, and find emergency roof repair services near you.',
    keywords: ['roof leak repair by state', 'roofing contractors', 'emergency roof repair', 'all states'],
    canonical: '/states',
  })
}

export default async function StatesPage() {
  const db = getDb()

  // Get all states with contractor counts from contractors table
  const statesWithCounts = await db
    .select({
      state: contractors.state,
      stateAbbrev: contractors.state_abbrev,
      contractorCount: sql<number>`COUNT(*)`.as('contractor_count'),
      cityCount: sql<number>`COUNT(DISTINCT ${contractors.city})`.as('city_count'),
    })
    .from(contractors)
    .where(eq(contractors.published, true))
    .groupBy(contractors.state, contractors.state_abbrev)
    .orderBy(sql`contractor_count DESC`)

  // Format states with slugs and handle null values
  const formattedStates = statesWithCounts
    .filter(item => item.state) // Remove null/undefined states
    .map((item) => ({
      name: item.state || 'Unknown',
      slug: item.state?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
      abbreviation: item.stateAbbrev || '',
      contractorCount: Number(item.contractorCount) || 0,
      cityCount: Number(item.cityCount) || 0,
    }))

  // Get top 5 states with most contractors
  const topStates = formattedStates.slice(0, 5)

  // Get total stats
  const totalContractors = formattedStates.reduce((sum, s) => sum + s.contractorCount, 0)
  const totalStates = formattedStates.length
  const statesWithContractors = formattedStates.filter(s => s.contractorCount > 0).length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">States</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Roof Leak Repair Contractors by State
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Find trusted roof leak repair professionals in all 50 states. 
          Browse contractors by state to find the best local experts near you.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{totalStates}</div>
          <div className="text-sm text-gray-600">Total States</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{totalContractors.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Contractors</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{statesWithContractors}</div>
          <div className="text-sm text-gray-600">States with Contractors</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">24/7</div>
          <div className="text-sm text-gray-600">Emergency Service</div>
        </div>
      </div>

      {/* Top States Section */}
      {topStates.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            Top States with Most Contractors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {topStates.map((state) => (
              <Link
                key={state.name}
                href={`/${state.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:border-blue-300 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition">
                    {state.name}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    {state.abbreviation}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4 text-blue-500" />
                    {state.contractorCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {state.cityCount}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 rounded-full h-1.5 transition-all duration-500"
                    style={{ 
                      width: `${Math.min((state.contractorCount / (topStates[0]?.contractorCount || 1)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All States Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">All States</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {formattedStates.map((state) => (
            <Link
              key={state.name}
              href={`/${state.slug}`}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-blue-300 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {state.name}
                </span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {state.abbreviation}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  {state.contractorCount}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {state.cityCount}
                </span>
              </div>
              {state.contractorCount > 0 && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {state.contractorCount} contractors available
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How do I find a contractor in my state?
            </h3>
            <p className="text-gray-600 text-sm">
              Click on your state from the list above to see all available 
              contractors in your area. You can then filter by city or service type.
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
              What services are available?
            </h3>
            <p className="text-gray-600 text-sm">
              Services include emergency repairs, roof inspections, leak repairs, 
              roof replacement, and regular maintenance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How current is the contractor information?
            </h3>
            <p className="text-gray-600 text-sm">
              We regularly update our listings to ensure you have the most 
              current information about contractors in your area.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}