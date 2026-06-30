// app/services/[service]/[city]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { contractors, cities, states, serviceTypes } from '@/lib/db/schema'
import { eq, and, ilike, sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ContractorCard } from '@/components/directory/ContractorCard'
import { SearchFilter } from '@/components/directory/SearchFilter'
import { MapPin, Building, Phone } from 'lucide-react'

interface ServiceCityPageProps {
  params: Promise<{
    service: string
    city: string
  }>
}

export async function generateMetadata({ params }: ServiceCityPageProps) {
  const { service, city } = await params
  
  const db = getDb()
  
  // Get city info
  const cityData = await db
    .select()
    .from(cities)
    .where(eq(cities.slug, city))
    .limit(1)
    .leftJoin(states, eq(cities.stateId, states.id))
  
  if (!cityData.length) return {}
  
  const serviceName = service.replace(/-/g, ' ')
  
  return generateSeoMetadata({
    title: `${serviceName} in ${cityData[0].cities.name}, ${cityData[0].states?.abbreviation} | Roof Leak Repair`,
    description: `Find professional ${serviceName} contractors in ${cityData[0].cities.name}. Compare reviews, get free estimates, and hire the best roofing experts.`,
    keywords: [`${serviceName} ${cityData[0].cities.name}`, `roofing contractors ${cityData[0].cities.name}`, `roof repair ${cityData[0].cities.name}`],
    canonical: `/services/${service}/${city}`,
  })
}

export default async function ServiceCityPage({ params }: ServiceCityPageProps) {
  const { service, city } = await params
  const db = getDb()
  
  // Get city info
  const cityData = await db
    .select()
    .from(cities)
    .where(eq(cities.slug, city))
    .limit(1)
    .leftJoin(states, eq(cities.stateId, states.id))
  
  if (!cityData.length) notFound()
  
  const cityInfo = cityData[0].cities
  const stateInfo = cityData[0].states
  const serviceName = service.replace(/-/g, ' ')
  
  // Get contractors offering this service in this city
  const contractorsList = await db
    .select()
    .from(contractors)
    .where(
      and(
        eq(contractors.cityId, cityInfo.id),
        eq(contractors.published, true),
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${contractors.servicesOffered}) AS service
          WHERE service ILIKE ${`%${serviceName}%`}
        )`
      )
    )
    .orderBy(sql`${contractors.rating} DESC NULLS LAST`)
    .limit(30)
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(contractors)
    .where(
      and(
        eq(contractors.cityId, cityInfo.id),
        eq(contractors.published, true),
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${contractors.servicesOffered}) AS service
          WHERE service ILIKE ${`%${serviceName}%`}
        )`
      )
    )
  
  const totalCount = countResult[0]?.count || 0
  
  // Get related services for this city
  const relatedServices = await db
    .select({
      service: sql<string>`DISTINCT jsonb_array_elements_text(${contractors.servicesOffered})`,
    })
    .from(contractors)
    .where(
      and(
        eq(contractors.cityId, cityInfo.id),
        eq(contractors.published, true),
        sql`jsonb_array_length(${contractors.servicesOffered}) > 0`
      )
    )
    .limit(10)

  // Get nearby cities
  const nearbyCities = await db
    .select({
      id: cities.id,
      name: cities.name,
      slug: cities.slug,
      stateSlug: states.slug,
      stateAbbr: states.abbreviation,
    })
    .from(cities)
    .leftJoin(states, eq(cities.stateId, states.id))
    .where(
      and(
        eq(cities.stateId, cityInfo.stateId),
        sql`${cities.id} != ${cityInfo.id}`
      )
    )
    .limit(10)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/services" className="hover:text-blue-600">Services</Link>
        <span className="mx-2">/</span>
        <Link href={`/services/${service}`} className="hover:text-blue-600">
          {serviceName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{cityInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {serviceName} in {cityInfo.name}, {stateInfo?.abbreviation}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Find trusted {serviceName} contractors serving {cityInfo.name} and surrounding areas.
          {totalCount > 0 && ` ${totalCount} contractors available.`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
          <div className="text-sm text-gray-600">Contractors</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">4.8</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">24/7</div>
          <div className="text-sm text-gray-600">Emergency Service</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">✓</div>
          <div className="text-sm text-gray-600">Free Estimates</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <SearchFilter />
      </div>

      {/* Description Section */}
      <div className="prose max-w-none mb-8 bg-white rounded-lg shadow p-6">
        <h2>Professional {serviceName} Services in {cityInfo.name}</h2>
        <p>
          Looking for reliable {serviceName} in {cityInfo.name}? Our directory 
          features {totalCount} qualified contractors ready to help with your 
          roofing needs. From emergency repairs to complete replacements, 
          find the right professional for your project.
        </p>
        <h3>What to Look for in a {serviceName} Contractor</h3>
        <ul>
          <li><strong>Experience:</strong> Look for contractors with proven experience in {serviceName}</li>
          <li><strong>Reviews:</strong> Check customer reviews and ratings</li>
          <li><strong>Licensing:</strong> Ensure proper licensing and insurance</li>
          <li><strong>Estimates:</strong> Get multiple free estimates before deciding</li>
        </ul>
      </div>

      {/* Results */}
      {contractorsList.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contractorsList.map((contractor) => {
              const citySlug = cityInfo.slug
              const stateSlug = stateInfo?.slug || ''
              
              const contractorWithLocation = {
                ...contractor,
                city: cityInfo,
                state: stateInfo,
              }
              
              return (
                <ContractorCard
                  key={contractor.id}
                  contractor={contractorWithLocation}
                  stateSlug={stateSlug}
                  citySlug={citySlug}
                  variant="summary"
                />
              )
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No {serviceName} Contractors Found in {cityInfo.name}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any {serviceName} contractors in {cityInfo.name}. 
            Try searching for other services or nearby cities.
          </p>
        </div>
      )}

      {/* Related Content */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Other Services in {cityInfo.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedServices.map((item) => (
                item.service && (
                  <Link
                    key={item.service}
                    href={`/services/${item.service.toLowerCase().replace(/\s+/g, '-')}/${cityInfo.slug}`}
                    className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition text-sm"
                  >
                    {item.service}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}

        {/* Nearby Cities */}
        {nearbyCities.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Nearby Cities with {serviceName}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {nearbyCities.map((city) => (
                <Link
                  key={city.id}
                  href={`/services/${service}/${city.slug}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition text-sm"
                >
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700 hover:text-blue-600">
                    {city.name}, {city.stateAbbr}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}