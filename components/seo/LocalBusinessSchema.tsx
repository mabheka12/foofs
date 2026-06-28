// components/seo/LocalBusinessSchema.tsx
'use client'

import { WithContext, LocalBusiness } from 'schema-dts'
import Script from 'next/script'

interface LocalBusinessSchemaProps {
  schema: WithContext<LocalBusiness>
}

export function LocalBusinessSchema({ schema }: LocalBusinessSchemaProps) {
  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

// Helper function to generate LocalBusiness schema
export function createLocalBusinessSchema(data: {
  name: string
  description?: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  url: string
  telephone?: string
  email?: string
  priceRange?: string
  rating?: {
    ratingValue: number
    reviewCount: number
  }
  openingHours?: string[]
  image?: string
  services?: string[]
  areaServed?: string[]
}): WithContext<LocalBusiness> {
  const schema: WithContext<LocalBusiness> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    description: data.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry,
    },
    url: data.url,
    image: data.image,
    priceRange: data.priceRange || '$$',
  }

  if (data.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: data.geo.latitude,
      longitude: data.geo.longitude,
    }
  }

  if (data.telephone) {
    schema.telephone = data.telephone
  }

  if (data.email) {
    schema.email = data.email
  }

  if (data.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.rating.ratingValue,
      reviewCount: data.rating.reviewCount,
    }
  }

  if (data.openingHours) {
    schema.openingHours = data.openingHours
  }

  if (data.services && data.services.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: data.services.map((service) => ({
        '@type': 'Offer',
        name: service,
        description: `${service} services`,
      })),
    }
  }

  if (data.areaServed && data.areaServed.length > 0) {
    schema.areaServed = data.areaServed.map((area) => ({
      '@type': 'City',
      name: area,
    }))
  }

  return schema
}