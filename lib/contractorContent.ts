// lib/contractorContent.ts

export interface ContractorContent {
  name?: string | null
  description?: string | null
  address?: string | null
  phone?: string | null
  website?: string | null
  city?: string | null
  state?: string | null
  stateAbbrev?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  openingHours?: string | null
  servicesOffered?: unknown
  rating?: string | number | null
  reviewCount?: number | null
  verified?: boolean | null
  licenseNumber?: string | null
  insuranceVerified?: boolean | null
}

const GENERIC_DESCRIPTIONS = new Set([
  'professional roofing services',
  'professional roof leak repair services',
  'professional roof repair services',
  'roofing services',
  'roof repair services',
  'roofing contractor',
  'roofing contractors',
])

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeDescription(description: string) {
  return description
    .trim()
    .toLowerCase()
    .replace(/[.!]+$/g, '')
    .replace(/\s+/g, ' ')
}

function hasServices(services: unknown) {
  if (Array.isArray(services)) {
    return services.some((service) => hasText(service))
  }

  if (hasText(services)) {
    try {
      const parsed = JSON.parse(services)

      if (Array.isArray(parsed)) {
        return parsed.some((service) => hasText(service))
      }
    } catch {
      return services.trim().length > 2
    }
  }

  return false
}

function hasValidCoordinates(
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined
) {
  if (latitude === null || latitude === undefined) return false
  if (longitude === null || longitude === undefined) return false

  const parsedLatitude = Number(latitude)
  const parsedLongitude = Number(longitude)

  return (
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude) &&
    parsedLatitude >= -90 &&
    parsedLatitude <= 90 &&
    parsedLongitude >= -180 &&
    parsedLongitude <= 180
  )
}

function hasRatingEvidence(
  rating: string | number | null | undefined,
  reviewCount: number | null | undefined
) {
  const parsedRating = Number(rating)
  const parsedReviewCount = Number(reviewCount)

  return (
    Number.isFinite(parsedRating) &&
    parsedRating > 0 &&
    Number.isFinite(parsedReviewCount) &&
    parsedReviewCount > 0
  )
}

export function getUsefulContractorDescription(
  description?: string | null
): string | null {
  if (!hasText(description)) return null

  const cleaned = description.trim()
  const normalized = normalizeDescription(cleaned)

  if (cleaned.length < 40) return null
  if (GENERIC_DESCRIPTIONS.has(normalized)) return null

  return cleaned
}

export function getContractorQualityScore(
  contractor: ContractorContent
) {
  let score = 0

  /*
   * A meaningful first-party description receives two points because it adds
   * more page-specific value than a single contact field.
   */
  if (getUsefulContractorDescription(contractor.description)) {
    score += 2
  }

  if (hasText(contractor.address)) score += 1
  if (hasText(contractor.phone)) score += 1
  if (hasText(contractor.website)) score += 1
  if (hasText(contractor.openingHours)) score += 1
  if (hasServices(contractor.servicesOffered)) score += 1

  if (
    hasValidCoordinates(
      contractor.latitude,
      contractor.longitude
    )
  ) {
    score += 1
  }

  if (
    hasRatingEvidence(
      contractor.rating,
      contractor.reviewCount
    )
  ) {
    score += 1
  }

  if (
    contractor.verified ||
    contractor.insuranceVerified ||
    hasText(contractor.licenseNumber)
  ) {
    score += 1
  }

  return score
}

export function shouldIndexContractor(
  contractor: ContractorContent
) {
  return getContractorQualityScore(contractor) >= 4
}

export function getContractorMetaDescription(
  contractor: ContractorContent
): string {
  const usefulDescription = getUsefulContractorDescription(
    contractor.description
  )

  if (usefulDescription) {
    return usefulDescription.length > 155
      ? `${usefulDescription.slice(0, 152).trimEnd()}...`
      : usefulDescription
  }

  const location = [
    contractor.city,
    contractor.stateAbbrev || contractor.state,
  ]
    .filter(Boolean)
    .join(', ')

  if (location && contractor.name) {
    return `View contact details, ratings, location and available business information for ${contractor.name}, a roofing contractor serving ${location}.`
  }

  return contractor.name
    ? `View contact details, ratings and available business information for ${contractor.name} on RooferNet.`
    : 'View roofing contractor information on RooferNet.'
}