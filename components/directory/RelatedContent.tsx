// components/directory/RelatedContent.tsx
'use client'

import Link from 'next/link'
import { MapPin, Building, Clock } from 'lucide-react'

interface RelatedContentProps {
  city: string
  state: string
  service: string
  relatedContractors: any[]
  nearbyCities: any[]
}

export function RelatedContent({ 
  city, 
  state, 
  service, 
  relatedContractors, 
  nearbyCities 
}: RelatedContentProps) {
  return (
    <div className="space-y-8">
      {/* Related Contractors */}
      {relatedContractors.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Other {service} Contractors in {city}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedContractors.map((contractor) => (
              <Link
                key={contractor.id}
                href={`/${contractor.state?.slug}/${contractor.city?.slug}/${contractor.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {(contractor.businessName || contractor.name)[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 hover:text-blue-600">
                    {contractor.businessName || contractor.name}
                  </p>
                  <p className="text-sm text-gray-500">{contractor.city?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Cities */}
      {nearbyCities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Nearby Cities with {service} Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {nearbyCities.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.stateSlug}/${city.slug}`}
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
              >
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 hover:text-blue-600">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}