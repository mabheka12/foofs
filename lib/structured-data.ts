// lib/structured-data.ts
import { WithContext, LocalBusiness, BreadcrumbList, FAQPage } from 'schema-dts'

export function generateLocalBusinessSchema(contractor: any): WithContext<LocalBusiness> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: contractor.businessName || contractor.name,
    description: contractor.description,
    image: contractor.logo || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contractor.address,
      addressLocality: contractor.city?.name,
      addressRegion: contractor.state?.abbreviation,
      postalCode: contractor.zipCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: contractor.city?.latitude,
      longitude: contractor.city?.longitude,
    },
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${contractor.state?.slug}/${contractor.city?.slug}/${contractor.slug}`,
    telephone: contractor.phone,
    email: contractor.email,
    priceRange: '$$',
    aggregateRating: contractor.rating ? {
      '@type': 'AggregateRating',
      ratingValue: contractor.rating,
      reviewCount: contractor.reviewCount || 0,
    } : undefined,
    openingHours: contractor.openingHours || undefined,
    paymentAccepted: 'Cash, Credit Card, Check',
    areaServed: contractor.serviceAreas?.map((area: string) => ({
      '@type': 'City',
      name: area,
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Roofing Services',
      itemListElement: contractor.servicesOffered?.map((service: string) => ({
        '@type': 'Offer',
        name: service,
        description: `${service} services in ${contractor.city?.name}, ${contractor.state?.abbreviation}`,
      })),
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL}${item.item}`,
    })),
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}