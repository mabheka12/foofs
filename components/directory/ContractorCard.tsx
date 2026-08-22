// components/directory/ContractorCard.tsx
'use client'

import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  MapPin,
  Phone,
  Shield,
} from 'lucide-react'
import { getUsefulContractorDescription } from '@/lib/contractorContent'
import { RatingStars } from './RatingStars'

interface ContractorCardProps {
  contractor: any
  stateSlug: string
  citySlug?: string
  variant?: 'summary' | 'detailed'
}

export function ContractorCard({
  contractor,
  stateSlug,
  variant = 'summary',
}: ContractorCardProps) {
  const isSummary = variant === 'summary'

  const contractorName =
    contractor.businessName || contractor.name || 'Roofing Contractor'

  const usefulDescription = getUsefulContractorDescription(
    contractor.description
  )

  // This matches app/[state]/[slug]/page.tsx.
  const contractorUrl = `/${stateSlug}/${contractor.slug}`

  const getGoogleMapsUrl = () => {
    if (contractor.latitude && contractor.longitude) {
      const coordinates = `${contractor.latitude},${contractor.longitude}`

      return `https://www.google.com/maps?q=${encodeURIComponent(
        coordinates
      )}`
    }

    if (contractor.address) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        contractor.address
      )}`
    }

    return null
  }

  const mapsUrl = getGoogleMapsUrl()

  const location = [
    typeof contractor.city === 'string'
      ? contractor.city
      : contractor.city?.name,
    contractor.stateAbbrev ||
      contractor.state_abbrev ||
      contractor.state?.abbreviation ||
      (typeof contractor.state === 'string' ? contractor.state : null),
  ]
    .filter(Boolean)
    .join(', ')

  const services = Array.isArray(contractor.servicesOffered)
    ? contractor.servicesOffered
    : []

  if (isSummary) {
    return (
      <article className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <div className="p-5 pb-3">
          <Link href={contractorUrl}>
            <h3 className="line-clamp-2 text-xl font-bold text-gray-900 transition-colors hover:text-blue-600">
              {contractorName}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-3">
            <RatingStars rating={Number(contractor.rating) || 0} />

            <span className="text-sm text-gray-500">
              ({Number(contractor.reviewCount) || 0} Google reviews)
            </span>
          </div>

          {usefulDescription && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
              {usefulDescription}
            </p>
          )}

          {(contractor.address || location) && (
            <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />

              <span className="line-clamp-2">
                {contractor.address || location}
              </span>
            </div>
          )}

          {contractor.phone && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 flex-shrink-0 text-blue-500" />

              <a
                href={`tel:${contractor.phone}`}
                className="hover:text-blue-600"
                onClick={(event) => event.stopPropagation()}
              >
                {contractor.phone}
              </a>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {contractor.verified && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-800">
                <CheckCircle className="h-3 w-3" />
                Verified
              </span>
            )}

            {contractor.emergencyService && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-800">
                <AlertCircle className="h-3 w-3" />
                Emergency service
              </span>
            )}

            {contractor.insuranceVerified && (
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-800">
                <Shield className="h-3 w-3" />
                Insurance verified
              </span>
            )}
          </div>

          {services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {services.slice(0, 3).map((service: string) => (
                <span
                  key={service}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                >
                  {service}
                </span>
              ))}

              {services.length > 3 && (
                <span className="px-1 py-1 text-xs text-gray-500">
                  +{services.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <Link
            href={contractorUrl}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            View details
          </Link>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
              title="Open in Google Maps"
              aria-label={`Open location for ${contractorName} in Google Maps`}
            >
              <MapPin className="h-4 w-4 text-blue-500" />
            </a>
          )}

          {contractor.phone && (
            <a
              href={`tel:${contractor.phone}`}
              className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
              title="Call contractor"
              aria-label={`Call ${contractorName}`}
            >
              <Phone className="h-4 w-4 text-green-500" />
            </a>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-lg">
      <div className="p-6">
        <h1 className="mb-2 text-3xl font-bold">{contractorName}</h1>

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <RatingStars rating={Number(contractor.rating) || 0} />

          <span className="text-gray-600">
            ({Number(contractor.reviewCount) || 0} Google reviews)
          </span>

          {contractor.verified && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <CheckCircle className="h-4 w-4" />
              Verified
            </span>
          )}

          {contractor.emergencyService && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
              <AlertCircle className="h-4 w-4" />
              Emergency service
            </span>
          )}
        </div>

        {usefulDescription && (
          <section className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">
              About {contractorName}
            </h2>

            <p className="whitespace-pre-line leading-relaxed text-gray-700">
              {usefulDescription}
            </p>
          </section>
        )}

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Contact information</h2>

            {contractor.address && (
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                <span>{contractor.address}</span>
              </div>
            )}

            {contractor.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-5 w-5 flex-shrink-0 text-blue-500" />

                <a
                  href={`tel:${contractor.phone}`}
                  className="hover:text-blue-600"
                >
                  {contractor.phone}
                </a>
              </div>
            )}

            {contractor.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="h-5 w-5 flex-shrink-0 text-blue-500" />

                <a
                  href={contractor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-blue-600"
                >
                  {contractor.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Business details</h2>

            {contractor.yearsInBusiness && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5 flex-shrink-0 text-blue-500" />

                <span>
                  {contractor.yearsInBusiness} years in business
                </span>
              </div>
            )}

            {contractor.licenseNumber && (
              <div className="flex items-start gap-2 text-gray-600">
                <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />

                <span className="break-all">
                  License: {contractor.licenseNumber}
                </span>
              </div>
            )}

            {contractor.insuranceVerified && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Insurance verified</span>
              </div>
            )}

            {contractor.freeEstimates && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Free estimates</span>
              </div>
            )}

            {contractor.financingAvailable && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Financing available</span>
              </div>
            )}

            {contractor.warrantyOffered && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Warranty offered</span>
              </div>
            )}
          </section>
        </div>

        {services.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 text-xl font-semibold">
              Services offered
            </h2>

            <div className="flex flex-wrap gap-2">
              {services.map((service: string) => (
                <span
                  key={service}
                  className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800"
                >
                  {service}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-4">
          {contractor.phone && (
            <a
              href={`tel:${contractor.phone}`}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white transition hover:bg-green-700"
            >
              <Phone className="h-5 w-5" />
              Call now
            </a>
          )}

          {contractor.website && (
            <a
              href={contractor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-gray-800 transition hover:bg-gray-200"
            >
              <Globe className="h-5 w-5" />
              Visit website
            </a>
          )}

          {mapsUrl && (
            <a
              href={
                contractor.latitude && contractor.longitude
                  ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${contractor.latitude},${contractor.longitude}`
                    )}`
                  : mapsUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
            >
              <MapPin className="h-5 w-5" />
              Get directions
            </a>
          )}
        </div>
      </div>
    </article>
  )
}