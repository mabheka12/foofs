// app/services/[service]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { serviceTypes, contractors, cities, states } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ContractorCard } from '@/components/directory/ContractorCard'
import { SearchFilter } from '@/components/directory/SearchFilter'
import { ArrowRight, MapPin, Building } from 'lucide-react'

interface ServicePageProps {
  params: Promise<{
    service: string
  }>
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { service } = await params
  const db = getDb()
  
  const serviceData = await db
    .select()
    .from(serviceTypes)
    .where(eq(serviceTypes.slug, service))
    .limit(1)

  if (!serviceData.length) return {}

  const serviceName = serviceData[0].name

  return generateSeoMetadata({
    title: `${serviceName} Contractors - Find Roofing Services Near You`,
    description: `Find professional ${serviceName} contractors. Compare reviews, get free estimates, and hire the best roofing experts in your area.`,
    keywords: [`${serviceName}`, `roofing contractors`, `${serviceName} near me`, 'roof repair'],
    canonical: `/services/${service}`,
  })
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { service } = await params
  const db = getDb()
  
  // Get service info
  const serviceData = await db
    .select()
    .from(serviceTypes)
    .where(eq(serviceTypes.slug, service))
    .limit(1)

  if (!serviceData.length) notFound()

  const serviceInfo = serviceData[0]
  const serviceName = serviceInfo.name

  // Get contractors offering this service
  const contractorsList = await db
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
      cityName: cities.name,
      citySlug: cities.slug,
      stateName: states.name,
      stateSlug: states.slug,
      stateAbbr: states.abbreviation,
      latitude: cities.latitude,
      longitude: cities.longitude,
    })
    .from(contractors)
    .leftJoin(cities, eq(contractors.cityId, cities.id))
    .leftJoin(states, eq(contractors.stateId, states.id))
    .where(
      sql`${contractors.published} = true AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(${contractors.servicesOffered}) AS s
        WHERE s = ${serviceName}
      )`
    )
    .orderBy(sql`${contractors.rating} DESC NULLS LAST`)
    .limit(50)

  // Get total count
  const countResult = await db.execute(
    sql`
      SELECT COUNT(*) as count 
      FROM contractors 
      WHERE published = true 
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(services_offered) AS s
        WHERE s = ${serviceName}
      )
    `
  )
  
  const totalCount = Number(countResult[0]?.count) || 0

  // Get cities with this service
  const citiesWithService = await db.execute(
    sql`
      SELECT DISTINCT 
        c.name as city_name,
        c.slug as city_slug,
        s.name as state_name,
        s.slug as state_slug,
        s.abbreviation as state_abbr
      FROM contractors ct
      LEFT JOIN cities c ON ct.city_id = c.id
      LEFT JOIN states s ON ct.state_id = s.id
      WHERE ct.published = true 
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(ct.services_offered) AS svc
        WHERE svc = ${serviceName}
      )
      LIMIT 20
    `
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/services" className="hover:text-blue-600">Services</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{serviceName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{serviceInfo.icon || '🔧'}</span>
          <h1 className="text-4xl font-bold text-gray-900">
            {serviceName} Contractors
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl">
          Find professional {serviceName.toLowerCase()} contractors in your area. 
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
          <div className="text-2xl font-bold text-green-600">{citiesWithService.length}</div>
          <div className="text-sm text-gray-600">Cities Covered</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">4.8</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">24/7</div>
          <div className="text-sm text-gray-600">Emergency Service</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <SearchFilter />
      </div>

      {/* Cities with this service */}
      {citiesWithService.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Find {serviceName} in Your City
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {citiesWithService.map((city: any) => (
              <Link
                key={`${city.city_slug}-${city.state_slug}`}
                href={`/services/${service}/${city.city_slug}`}
                className="bg-white rounded-lg p-3 hover:shadow-md transition border border-gray-100 hover:border-blue-200 text-center"
              >
                <div className="font-semibold text-gray-900 hover:text-blue-600 transition text-sm">
                  {city.city_name}
                </div>
                <div className="text-xs text-gray-500">{city.state_abbr}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Service Description */}
      {serviceInfo.description && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">About {serviceName}</h2>
          <p className="text-gray-600">{serviceInfo.description}</p>
        </div>
      )}

      {/* Contractors List */}
      {contractorsList.length > 0 ? (
        <>
          <h2 className="text-2xl font-bold mb-4">
            {serviceName} Contractors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contractorsList.map((contractor) => {
              const contractorWithLocation = {
                ...contractor,
                city: { name: contractor.cityName, slug: contractor.citySlug },
                state: { name: contractor.stateName, slug: contractor.stateSlug, abbreviation: contractor.stateAbbr },
                latitude: contractor.latitude,
                longitude: contractor.longitude,
              }
              
              return (
                <ContractorCard
                  key={contractor.id}
                  contractor={contractorWithLocation}
                  stateSlug={contractor.stateSlug || ''}
                  citySlug={contractor.citySlug || ''}
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
            No {serviceName} Contractors Found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any {serviceName} contractors yet. Check back soon 
            or browse other services.
          </p>
          <Link
            href="/services"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse All Services
          </Link>
        </div>
      )}
    </div>
  )
}