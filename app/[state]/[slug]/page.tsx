// app/[state]/[slug]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { contractors, reviews } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RatingStars } from '@/components/directory/RatingStars'
import { ContractorCard } from '@/components/directory/ContractorCard'
import Map from '@/components/directory/Map'
import { Phone, MapPin, Clock, Star, Shield, FileCheck, CreditCard, Calendar, Award, ExternalLink } from 'lucide-react'
import { RelatedContent } from '@/components/directory/RelatedContent'
import { ReviewList } from '@/components/reviews/ReviewList'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { RatingSummary } from '@/components/reviews/RatingSummary'
import { ClaimBusinessButton } from '@/components/business/ClaimBusinessButton'

interface ContractorPageProps {
  params: Promise<{
    state: string
    slug: string
  }>
}

export async function generateMetadata({ params }: ContractorPageProps) {
  const { state, slug } = await params
  
  const db = getDb()
  
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

  if (!result.length) return {}

  const contractor = result[0]
  const stateName = state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return generateSeoMetadata({
    title: `${contractor.name} - Roof Leak Repair in ${contractor.city || stateName}`,
    description: contractor.description || `Professional roof leak repair services from ${contractor.name}.`,
    keywords: [contractor.name, 'roof leak repair', 'roofing contractor'],
    canonical: `/${state}/${contractor.slug}`,
    
  })
}

export default async function ContractorPage({ params }: ContractorPageProps) {
  const { state, slug } = await params
  
  const db = getDb()
  const stateSlug = state
  const stateName = state.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  // Get contractor by slug
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

  if (!result.length) notFound()

  const contractor = result[0]

  // Get reviews
  const contractorReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.contractorId, contractor.id))
    .orderBy(desc(reviews.publishedAt))
    .limit(10)

  // Helper to safely get latitude/longitude
  const latitude = contractor.latitude || null
  const longitude = contractor.longitude || null

  // Calculate total reviews count
  const totalReviews = contractor.reviewCount || contractorReviews.length || 0
  const avgRating = contractor.rating != null
    ? Number(contractor.rating)
    : contractorReviews.length > 0
      ? contractorReviews.reduce((sum, r) => sum + r.rating, 0) / contractorReviews.length
      : 0

  // ✅ Parse opening hours from TEXT column
  const parseOpeningHours = (hoursText: string | null) => {
    if (!hoursText) return null
    
    // Try to parse as JSON first (in case it's stored as JSON)
    try {
      const parsed = JSON.parse(hoursText)
      if (Array.isArray(parsed)) {
        return parsed
      }
      if (typeof parsed === 'object') {
        return Object.entries(parsed).map(([day, times]: [string, any]) => ({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          open: times.open || times.Open || '',
          close: times.close || times.Close || ''
        }))
      }
    } catch (e) {
      // Not JSON, parse as text
    }
    
    // Parse as plain text format: "Monday: 8:00 AM – 5:00 PM"
    const lines = hoursText.split('\n').filter(line => line.trim())
    const result: { day: string; open: string; close: string }[] = []
    
    for (const line of lines) {
      // Match "Day: Open – Close" or "Day: Open - Close"
      const match = line.match(/^([^:]+):\s*([^-–]+)\s*[–-]\s*(.+)$/)
      if (match) {
        const [, day, open, close] = match
        result.push({
          day: day.trim(),
          open: open.trim(),
          close: close.trim()
        })
      } else {
        // Fallback: just store the raw line
        const dayMatch = line.match(/^([^:]+):/)
        if (dayMatch) {
          result.push({
            day: dayMatch[1].trim(),
            open: line.replace(/^[^:]+:\s*/, '').trim(),
            close: ''
          })
        }
      }
    }
    
    return result.length > 0 ? result : null
  }

  const relatedContractors = await db
  .select({
    id: contractors.id,
    name: contractors.name,
    slug: contractors.slug,
    city: contractors.city,
    state: contractors.state,
    rating: contractors.rating,
  })
  .from(contractors)
  .where(
    and(
      eq(contractors.published, true),
      sql`${contractors.citySlug} = ${contractor.citySlug}`,
      sql`${contractors.stateSlug} = ${contractor.stateSlug}`,
      sql`${contractors.id} != ${contractor.id}` // Exclude current contractor
    )
  )
  .orderBy(desc(contractors.rating))
  .limit(4)

// Get nearby cities (other cities in the same state)
const nearbyCities = await db
  .select({
    city: contractors.city,
    citySlug: contractors.citySlug,
    count: sql<number>`COUNT(*)`.as('count'),
  })
  .from(contractors)
  .where(
    and(
      eq(contractors.published, true),
      sql`${contractors.stateSlug} = ${contractor.stateSlug}`,
      sql`${contractors.citySlug} != ${contractor.citySlug}` // Exclude current city
    )
  )
  .groupBy(contractors.city, contractors.citySlug)
  .orderBy(sql`count DESC`)
  .limit(6)

  const openingHours = parseOpeningHours(contractor.openingHours as string | null)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${stateSlug}`} className="hover:text-blue-600">
          {contractor.state || stateName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{contractor.name}</span>
      </nav>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2">
          {/* Contractor Card */}
          <ContractorCard
            contractor={{
              ...contractor,
              city: contractor.city || '',
              state: contractor.state || stateName,
            }}
            stateSlug={stateSlug}
            citySlug=""
            variant="detailed"
          />

          {/* Reviews */}
          {contractorReviews.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                Google Reviews ({contractorReviews.length})
              </h2>
              <div className="space-y-4">
                {contractorReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <RatingStars rating={review.rating} />
                      <span className="font-semibold text-gray-900">
                        {review.authorName || 'Anonymous'}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {review.googleReviewId && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Google
                        </span>
                      )}
                    </div>
                    {review.content && (
                      <p className="text-gray-700 leading-relaxed">{review.content}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <RatingSummary
              averageRating={avgRating}
              totalReviews={totalReviews}
              ratingDistribution={{
                5: contractorReviews.filter(r => r.rating === 5).length,
                4: contractorReviews.filter(r => r.rating === 4).length,
                3: contractorReviews.filter(r => r.rating === 3).length,
                2: contractorReviews.filter(r => r.rating === 2).length,
                1: contractorReviews.filter(r => r.rating === 1).length,
              }}
              className="mt-6"
            />

            {/* Claim Business Button */}
            <div className="mt-4">
              <ClaimBusinessButton 
                contractorId={contractor.id}
                contractorName={contractor.name}
                variant="button"
              />
            </div>

            {/* Review List */}
            <ReviewList contractorId={contractor.id} className="mt-6" />

            {/* Review Form */}
            <ReviewForm contractorId={contractor.id} className="mt-6" />
          </div>

            {/* Related Content */}
        <RelatedContent
            city={contractor.city || ''}
            state={contractor.state || stateName}
            service="Roof Leak Repair"
            relatedContractors={relatedContractors}
            nearbyCities={nearbyCities}
            />

        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Rating & Review Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              Rating & Reviews
            </h3>
            <div className="flex items-center gap-4 mb-2">
              <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
              <div>
                <RatingStars rating={avgRating} />
                <div className="text-sm text-gray-500 mt-1">
                  Based on {totalReviews} {totalReviews === 1 ? 'Google review' : 'Google reviews'} 
                </div>
              </div>
            </div>
            {contractor.verified && (
              <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
                <Shield className="w-4 h-4" />
                Verified Contractor
              </div>
            )}
            {contractor.featured && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm">
                <Award className="w-4 h-4" />
                Featured Listing
              </div>
            )}
          </div>

          {/* ✅ Opening Hours in Sidebar */}
          {openingHours && openingHours.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Hours of Operation
              </h3>
              <div className="space-y-1 text-sm">
                {openingHours.slice(0, 7).map((item) => (
                  <div key={item.day} className="flex justify-between py-1">
                    <span className="text-gray-600">{item.day}</span>
                    <span className="font-medium text-gray-800">
                      {item.open === '24/7' || item.close === '24/7' ? '24/7' : 
                       item.open && item.close ? `${item.open} – ${item.close}` :
                       item.open || 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Location
            </h3>
            <Map
              businessName={ contractor.name}
              address={contractor.address || undefined}
              city={contractor.city || ''}
              state={contractor.state || stateName}
              latitude={latitude ? parseFloat(latitude as string) : undefined}
              longitude={longitude ? parseFloat(longitude as string) : undefined}
            />
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Quick Info
            </h3>
            <div className="space-y-3 text-sm">
              {contractor.yearsInBusiness && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-600">Years in Business</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {contractor.yearsInBusiness}
                  </span>
                </div>
              )}
              {contractor.licenseNumber && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-600">License</span>
                  <span className="font-medium text-sm">{contractor.licenseNumber}</span>
                </div>
              )}
              {contractor.insuranceVerified && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-600">Insurance</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <FileCheck className="w-4 h-4" />
                    Verified
                  </span>
                </div>
              )}
              {contractor.freeEstimates && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-600">Free Estimates</span>
                  <span className="text-green-600 font-medium">✓ Yes</span>
                </div>
              )}
              {contractor.financingAvailable && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-600">Financing</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    Available
                  </span>
                </div>
              )}
              {contractor.warrantyOffered && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Warranty</span>
                  <span className="text-green-600 font-medium">✓ Offered</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-500" />
              Contact
            </h3>
            <div className="space-y-3">
              {contractor.phone && (
                <a
                  href={`tel:${contractor.phone}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition p-3 hover:bg-blue-50 rounded-lg"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium">{contractor.phone}</span>
                </a>
              )}
              {contractor.website && (
                <a
                  href={contractor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition p-3 hover:bg-purple-50 rounded-lg truncate"
                >
                  <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🌐</span>
                  </div>
                  <span className="truncate font-medium">{contractor.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {contractor.address && (
                <div className="flex items-start gap-3 text-gray-700 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm">{contractor.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}