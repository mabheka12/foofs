// components/directory/ContractorCard.tsx
'use client'

import Link from 'next/link'
import { RatingStars } from './RatingStars'
import { MapPin, Phone, Globe, Clock, Shield, CheckCircle, AlertCircle } from 'lucide-react'

interface ContractorCardProps {
  contractor: any
  stateSlug: string
  citySlug: string
  variant?: 'summary' | 'detailed'
}

export function ContractorCard({ 
  contractor, 
  stateSlug, 
  citySlug, 
  variant = 'summary'
}: ContractorCardProps) {
  const isSummary = variant === 'summary'

  // Generate Google Maps URL
  const getGoogleMapsUrl = () => {
    if (contractor.latitude && contractor.longitude) {
      return `https://www.google.com/maps?q=${contractor.latitude},${contractor.longitude}`
    }
    if (contractor.address) {
      return `https://www.google.com/maps?q=${encodeURIComponent(contractor.address)}`
    }
    return null
  }

  const mapsUrl = getGoogleMapsUrl()

  // Summary View (for city page)
  if (isSummary) {
    return (
      <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
        {/* Header with Business Name */}
        <div className="p-5 pb-3">
          <Link href={`/${stateSlug}/${citySlug}/${contractor.slug}`}>
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {contractor.businessName || contractor.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-2">
            <RatingStars rating={contractor.rating || 0} />
            <span className="text-sm text-gray-500">
              ({contractor.reviewCount || 0} Google reviews)
            </span>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-gray-600 text-sm mt-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
            <span className="line-clamp-1">
              {contractor.address || `${contractor.city?.name || citySlug}, ${contractor.state?.abbreviation || stateSlug}`}
            </span>
          </div>

          {/* Phone */}
          {contractor.phone && (
            <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
              <Phone className="w-4 h-4 flex-shrink-0 text-blue-500" />
              <a href={`tel:${contractor.phone}`} className="hover:text-blue-600">
                {contractor.phone}
              </a>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {contractor.verified && (
              <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
            {contractor.emergencyService && (
              <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Emergency
              </span>
            )}
            {contractor.insuranceVerified && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Insured
              </span>
            )}
          </div>

          {/* Services */}
       {contractor.servicesOffered && contractor.servicesOffered.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {contractor.servicesOffered.slice(0, 3).map((service: string) => (
              <Link
                key={service}
                href={`/services/${service.toLowerCase().replace(/\s+/g, '-')}/${contractor.city?.slug || citySlug}`}
                className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full hover:bg-blue-100 transition"
              >
                {service}
              </Link>
            ))}
            {contractor.servicesOffered.length > 3 && (
              <span className="text-xs text-gray-500">
                +{contractor.servicesOffered.length - 3} more
              </span>
            )}
          </div>
        )}
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-5 flex gap-3">
          <Link
            href={`/${stateSlug}/${citySlug}/${contractor.slug}`}
            className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              title="Open in Google Maps"
            >
              <MapPin className="w-4 h-4 text-blue-500" />
            </a>
          )}
          {contractor.phone && (
            <a
              href={`tel:${contractor.phone}`}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              title="Call now"
            >
              <Phone className="w-4 h-4 text-green-500" />
            </a>
          )}
        </div>
      </div>
    )
  }

  // Detailed View (for individual contractor page)
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Full detailed view - this will be used inside the contractor page */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">
          {contractor.name}
        </h1>
        
        {/* Rating */}
        <div className="flex items-center gap-4 mb-4">
          <RatingStars rating={contractor.rating || 0} />
          <span className="text-gray-600">
            ({contractor.reviewCount || 0} Google reviews)
          </span>
          {contractor.verified && (
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Verified
            </span>
          )}
          {contractor.emergencyService && (
            <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Emergency Service
            </span>
          )}
        </div>

        {/* Description */}
        {contractor.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700 whitespace-pre-line">{contractor.description}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            {contractor.address && (
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>{contractor.address}</span>
              </div>
            )}
            
            {contractor.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href={`tel:${contractor.phone}`} className="hover:text-blue-600">
                  {contractor.phone}
                </a>
              </div>
            )}
            
            {contractor.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a 
                  href={contractor.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-600 truncate"
                >
                  {contractor.website}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Business Details</h3>
            
            {contractor.yearsInBusiness && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>{contractor.yearsInBusiness} years in business</span>
              </div>
            )}
            
            {contractor.licenseNumber && (
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>License: {contractor.licenseNumber}</span>
              </div>
            )}
            
            {contractor.insuranceVerified && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Insurance Verified</span>
              </div>
            )}
            
            {contractor.freeEstimates && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Free Estimates</span>
              </div>
            )}
            
            {contractor.financingAvailable && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Financing Available</span>
              </div>
            )}
            
            {contractor.warrantyOffered && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Warranty Offered</span>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        {contractor.servicesOffered && contractor.servicesOffered.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Services Offered</h2>
            <div className="flex flex-wrap gap-2">
              {contractor.servicesOffered.map((service: string) => (
                <span
                  key={service}
                  className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location Map */}
        {(contractor.latitude && contractor.longitude) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Location</h2>
            <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${contractor.latitude},${contractor.longitude}&output=embed`}
                title={`Map of ${contractor.businessName || contractor.name}`}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {contractor.phone && (
            <a
              href={`tel:${contractor.phone}`}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          )}
          {contractor.website && (
            <a
              href={contractor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              <Globe className="w-5 h-5" />
              Visit Website
            </a>
          )}
          {contractor.latitude && contractor.longitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${contractor.latitude},${contractor.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Get Directions
            </a>
          )}
        </div>
      </div>
    </div>
  )
}