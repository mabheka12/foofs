// app/services/[service]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { serviceTypes, contractors } from '@/lib/db/schema'
import { and, eq, sql, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Star, Building, ArrowLeft } from 'lucide-react'

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

  return generateSeoMetadata({
    title: `${serviceData[0].name} Contractors - Roof Leak Repair Services`,
    description: serviceData[0].description || `Find professional ${serviceData[0].name} contractors. Compare reviews, get free estimates, and hire the best experts.`,
    keywords: [serviceData[0].name, 'roof repair', 'contractors'],
    canonical: `/services/${service}`,
  })
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { service } = await params
  const db = getDb()

  // Get service type
  const serviceData = await db
    .select()
    .from(serviceTypes)
    .where(eq(serviceTypes.slug, service))
    .limit(1)

  if (!serviceData.length) notFound()

  const serviceType = serviceData[0]

  // Get contractors offering this service
  const contractorsList = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      slug: contractors.slug,
      city: contractors.city,
      state: contractors.state,
      stateAbbrev: contractors.state_abbrev,
      stateSlug: contractors.stateSlug,
      rating: contractors.rating,
      reviewCount: contractors.reviewCount,
      phone: contractors.phone,
      description: contractors.description,
      emergencyService: contractors.emergencyService,
      verified: contractors.verified,
      featured: contractors.featured,
    })
    .from(contractors)
    .where(
      and(
        eq(contractors.published, true),
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${contractors.servicesOffered}) AS s 
          WHERE s = ${serviceType.name}
        )`
      )
    )
    .orderBy(desc(contractors.rating))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/services" className="hover:text-blue-600">Services</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{serviceType.name}</span>
      </nav>

      {/* Back Button */}
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {serviceType.name} Contractors
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          {serviceType.description || `Find professional ${serviceType.name.toLowerCase()} contractors in your area.`}
        </p>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 rounded-lg p-4 mb-8">
        <p className="text-sm text-gray-700">
          <span className="font-bold">{contractorsList.length}</span> contractors found offering {serviceType.name}
        </p>
      </div>

      {/* Contractors List */}
      {contractorsList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No contractors found for {serviceType.name}.</p>
          <Link 
            href="/services"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Browse other services
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contractorsList.map((contractor) => (
            <Link
              key={contractor.id}
              href={`/${contractor.stateSlug}/${contractor.slug}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow hover:border-blue-300 group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {contractor.name}
                </h3>
                {contractor.rating && (
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-sm">{Number(contractor.rating).toFixed(1)}</span>
                    {contractor.reviewCount && (
                      <span className="text-xs text-gray-500">({contractor.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {contractor.description || `Professional ${serviceType.name} services.`}
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
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Emergency 24/7
                  </span>
                )}
                {contractor.verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ✓ Verified
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
  )
}