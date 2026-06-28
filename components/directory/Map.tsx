// components/directory/Map.tsx
'use client'

import { Navigation, MapPin, AlertCircle, MapIcon } from 'lucide-react'
import { useState } from 'react'

interface MapProps {
  businessName: string
  address?: string
  city?: string
  state?: string
  latitude?: number | string | null
  longitude?: number | string | null
  className?: string
}

export default function Map({ 
  businessName, 
  address, 
  city, 
  state, 
  latitude,
  longitude,
  className = ''
}: MapProps) {
  const [mapError, setMapError] = useState(false)

  // Build the map query - prefer lat/lng for precision
  const getMapQuery = () => {
    if (latitude && longitude) {
      return `${latitude},${longitude}`
    }
    
    // Fallback to address
    const parts = []
    if (address) parts.push(address)
    if (city) parts.push(city)
    if (state) parts.push(state)
    return parts.join(', ')
  }

  const mapQuery = getMapQuery()
  const encodedQuery = encodeURIComponent(mapQuery)
  
  // Google Maps embed URL (no API key needed)
  const googleMapsUrl = `https://www.google.com/maps?q=${encodedQuery}&output=embed`
  
  // Directions URL
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`
  
  // Google Maps link
  const googleMapsLink = `https://www.google.com/maps?q=${encodedQuery}`

  const handleGetDirections = () => {
    window.open(directionsUrl, '_blank')
  }

  const handleOpenMaps = () => {
    window.open(googleMapsLink, '_blank')
  }

  // Check if we have location data
  const hasLocation = mapQuery && mapQuery.length > 0

  if (!hasLocation) {
    return (
      <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No location information available</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Map */}
      <div className="relative h-64 bg-gray-100">
        {!mapError ? (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={googleMapsUrl}
            title={`Map of ${businessName}`}
            onError={() => setMapError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-gray-600 text-sm">Unable to load map</p>
            <button
              onClick={handleOpenMaps}
              className="mt-2 text-blue-600 text-sm hover:underline"
            >
              Open in Google Maps
            </button>
          </div>
        )}
        
        {/* Location badge */}
        {!mapError && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs text-gray-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span className="max-w-[200px] truncate">
              {address || city || 'Location'}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <button 
          onClick={handleGetDirections}
          className="bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Navigation size={18} />
          Directions
        </button>
        <button 
          onClick={handleOpenMaps}
          className="bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium"
        >
          <MapPin size={18} />
          Open Maps
        </button>
      </div>

      {/* Address */}
      {(address || city || state) && (
        <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
          <span className="font-medium"><MapIcon /></span>{' '}
          {address && <span>{address}</span>}
          {city && <span>, {city}</span>}
          {state && <span>, {state}</span>}
        </div>
      )}
    </div>
  )
}