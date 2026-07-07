 // app/[state]/[city]/[slug]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { db } from '@/lib/db'
import { contractors, cities, states, reviews } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RatingStars } from '@/components/directory/RatingStars'
import { ContractorCard } from '@/components/directory/ContractorCard'
import Map from '@/components/directory/Map'
import { Phone, MapPin, Clock, Star, Users, Shield, FileCheck, CreditCard, Calendar, Award, ExternalLink } from 'lucide-react'
import { RelatedContent } from '@/components/directory/RelatedContent'

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

  // Get reviews (Google reviews from the reviews table)
  const contractorReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.contractorId, contractor.id))
    .orderBy(desc(reviews.publishedAt))
    .limit(10)

  const contractorLocation = contractor as {
    latitude?: string | null
    longitude?: string | null
  }

  // Helper to safely get latitude/longitude
  const getLatitude = () => {
    if (contractorLocation.latitude) return contractorLocation.latitude
    if (cityInfo?.latitude) return cityInfo.latitude
    return null
  }

  const getLongitude = () => {
    if (contractorLocation.longitude) return contractorLocation.longitude
    if (cityInfo?.longitude) return cityInfo.longitude
    return null
  }

  const latitude = getLatitude()
  const longitude = getLongitude()

 // Helper to format opening hours for display - Multi-format support
const formatOpeningHours = (hours: any) => {
  if (!hours) return null
  
  // If it's a string, try to parse it
  if (typeof hours === 'string') {
    try {
      hours = JSON.parse(hours)
    } catch (e) {
      // Try to parse as a simple format
      return parseSimpleHoursString(hours)
    }
  }
  
  // If it's an array, process directly
  if (Array.isArray(hours)) {
    return parseArrayHours(hours)
  }
  
  // If it's an object, process as key-value pairs
  if (typeof hours === 'object' && hours !== null) {
    return parseObjectHours(hours)
  }
  
  return null
}

function parseSimpleHoursString(str: string) {
  const dayMap: Record<string, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
  }
  
  const result: { day: string; open: string; close: string }[] = []
  const parts = str.split(',').map(p => p.trim())
  
  for (const part of parts) {
    const rangeMatch = part.match(/([A-Za-z]+)\s*-\s*([A-Za-z]+)/)
    if (rangeMatch) {
      const startDay = rangeMatch[1].toLowerCase().substring(0, 3)
      const endDay = rangeMatch[2].toLowerCase().substring(0, 3)
      const times = part.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/)
      
      if (times) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        const startIdx = days.findIndex(d => d.startsWith(startDay))
        const endIdx = days.findIndex(d => d.startsWith(endDay))
        
        if (startIdx >= 0 && endIdx >= 0) {
          for (let i = startIdx; i <= endIdx; i++) {
            const dayKey = days[i].substring(0, 3)
            result.push({
              day: dayMap[dayKey] || days[i],
              open: times[1].trim(),
              close: times[2].trim()
            })
          }
        }
      }
    } else {
      const dayMatch = part.match(/([A-Za-z]+)/)
      const times = part.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/)
      
      if (dayMatch && times) {
        const day = dayMatch[1].toLowerCase().substring(0, 3)
        if (dayMap[day]) {
          result.push({
            day: dayMap[day],
            open: times[1].trim(),
            close: times[2].trim()
          })
        }
      }
    }
  }
  
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  result.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
  
  return result.length > 0 ? result : null
}

function parseArrayHours(hours: any[]) {
  const result: { day: string; open: string; close: string }[] = []
  
  for (const item of hours) {
    if (typeof item === 'object' && item !== null) {
      const day = item.day || item.Day || item.name || ''
      const open = item.open || item.Open || item.start || ''
      const close = item.close || item.Close || item.end || ''
      
      if (day && open && close) {
        result.push({ day, open, close })
      }
    }
  }
  
  return result.length > 0 ? result : null
}

function parseObjectHours(hours: any) {
  const dayMap: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }
  
  const result: { day: string; open: string; close: string }[] = []
  
  for (const [key, value] of Object.entries(hours)) {
    if (value && typeof value === 'object') {
      const open = (value as any).open || (value as any).Open || (value as any).start
      const close = (value as any).close || (value as any).Close || (value as any).end
      
      if (open && close) {
        const day = dayMap[key.toLowerCase()] || key
        result.push({ day, open, close })
      }
    } else if (typeof value === 'string' && value.includes('-')) {
      const [open, close] = value.split('-').map(s => s.trim())
      const day = dayMap[key.toLowerCase()] || key
      result.push({ day, open, close })
    }
  }
  
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  result.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
  
  return result.length > 0 ? result : null
}

// Then use it:
const openingHours = formatOpeningHours(contractor.openingHours)

  // Calculate total reviews count
  const totalReviews = contractor.reviewCount || contractorReviews.length || 0
  const avgRating = contractor.rating != null
    ? Number(contractor.rating)
    : contractorReviews.length > 0
      ? contractorReviews.reduce((sum, r) => sum + r.rating, 0) / contractorReviews.length
      : 0

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

          {/* Opening Hours - Added here for better visibility */}
          {openingHours && openingHours.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Opening Hours
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {openingHours.map((item) => (
                  <div key={item.day} className="flex justify-between py-2 px-3 border-b border-gray-50 last:border-0">
                    <span className="font-medium text-gray-700">{item.day}</span>
                    <span className="text-gray-600 text-sm">
                      {item.open === '24/7' ? '🕐 24/7' : `${item.open} - ${item.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <RelatedContent
            city={cityInfo?.name || ''}
            state={stateInfo?.name || ''}
            service="Roof Leak Repair"
            relatedContractors={[]}
            nearbyCities={[]}
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
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
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

          {/* Map */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Location
            </h3>
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