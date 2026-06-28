// app/[state]/[city]/[slug]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { db } from '@/lib/db'
import { contractors, cities, states, reviews } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RatingStars } from '@/components/directory/RatingStars'
import { ContractorCard } from '@/components/directory/ContractorCard' // Named export
import Map from '@/components/directory/Map'
import { Phone,MapIcon } from 'lucide-react'

interface ContractorPageProps {
  params: Promise<{
    state: string
    city: string
    slug: string
  }>
}

export async function generateMetadata({ params }: ContractorPageProps) {
  const { state, city, slug } = await params
  
  const result = await db
    .select()
    .from(contractors)
    .where(
      and(
        eq(contractors.slug, slug),
        eq(contractors.published, true)
      )
    )
    .limit(1)
    .leftJoin(cities, eq(contractors.cityId, cities.id))
    .leftJoin(states, eq(contractors.stateId, states.id))

  if (!result.length) return {}

  const data = result[0]
  const contractor = data.contractors

  return generateSeoMetadata({
    title: `${contractor.businessName || contractor.name} - Roof Leak Repair in ${data.cities?.name}, ${data.states?.abbreviation}`,
    description: contractor.description || `Professional roof leak repair services from ${contractor.businessName || contractor.name}.`,
    keywords: [contractor.businessName || contractor.name, 'roof leak repair', 'roofing contractor'],
    canonical: `/${data.states?.slug}/${data.cities?.slug}/${contractor.slug}`,
  })
}

export default async function ContractorPage({ params }: ContractorPageProps) {
  const { state, city, slug } = await params
  
  const result = await db
    .select()
    .from(contractors)
    .where(
      and(
        eq(contractors.slug, slug),
        eq(contractors.published, true)
      )
    )
    .limit(1)
    .leftJoin(cities, eq(contractors.cityId, cities.id))
    .leftJoin(states, eq(contractors.stateId, states.id))

  if (!result.length) notFound()

  const data = result[0]
  const contractor = data.contractors
  const cityInfo = data.cities
  const stateInfo = data.states

  const contractorReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.contractorId, contractor.id))
    .orderBy(reviews.publishedAt)
    .limit(10)

  // Helper to safely get latitude/longitude
  const getLatitude = () => {
    if (cityInfo?.latitude) return cityInfo.latitude
    return null
  }

  const getLongitude = () => {
    if (cityInfo?.longitude) return cityInfo.longitude
    return null
  }

  const latitude = getLatitude()
  const longitude = getLongitude()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${stateInfo!.slug}`} className="hover:text-blue-600">
          {stateInfo!.name}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${stateInfo!.slug}/${cityInfo!.slug}`} className="hover:text-blue-600">
          {cityInfo!.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{contractor.businessName || contractor.name}</span>
      </nav>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2">
          {/* Detailed View */}
          <ContractorCard
            contractor={{
              ...contractor,
              city: cityInfo,
              state: stateInfo,
            }}
            stateSlug={stateInfo!.slug}
            citySlug={cityInfo!.slug}
            variant="detailed"
          />

          {/* Reviews */}
          {contractorReviews.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-8">
              <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {contractorReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <RatingStars rating={review.rating} />
                      <span className="font-semibold">{review.authorName || 'Anonymous'}</span>
                    </div>
                    <p className="text-gray-700">{review.content}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(review.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Map */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3"><MapIcon /></h3>
            <Map
              businessName={contractor.businessName || contractor.name}
              address={contractor.address || undefined}
              city={cityInfo?.name || undefined}
              state={stateInfo?.name || undefined}
              latitude={latitude ? parseFloat(latitude as string) : undefined}
              longitude={longitude ? parseFloat(longitude as string) : undefined}
            />
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              {contractor.yearsInBusiness && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Years in Business</span>
                  <span className="font-medium">{contractor.yearsInBusiness}</span>
                </div>
              )}
              {contractor.licenseNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">License</span>
                  <span className="font-medium">{contractor.licenseNumber}</span>
                </div>
              )}
              {contractor.insuranceVerified && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance</span>
                  <span className="text-green-600 font-medium">✓ Verified</span>
                </div>
              )}
              {contractor.freeEstimates && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Free Estimates</span>
                  <span className="text-green-600 font-medium">✓</span>
                </div>
              )}
              {contractor.financingAvailable && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Financing</span>
                  <span className="text-green-600 font-medium">✓ Available</span>
                </div>
              )}
              {contractor.warrantyOffered && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Warranty</span>
                  <span className="text-green-600 font-medium">✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              {contractor.phone && (
                <a
                  href={`tel:${contractor.phone}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
                >
                  <span className="text-lg"><Phone/></span>
                  <span>{contractor.phone}</span>
                </a>
              )}
              {contractor.website && (
                <a
                  href={contractor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition truncate"
                >
                  <span className="text-lg">🌐</span>
                  <span className="truncate">{contractor.website}</span>
                </a>
              )}
              {contractor.address && (
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-lg"><MapIcon /></span>
                  <span>{contractor.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}