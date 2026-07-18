// lib/structured-data.ts
import { WithContext, LocalBusiness, BreadcrumbList, FAQPage, WebPage, Organization, Review } from 'schema-dts'

// ✅ Get base URL safely
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://roofleakrepaird.com'
}

// ✅ Organization Schema (for homepage)
export function generateOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Roof Leak Repair Directory',
    description: 'Find trusted roof leak repair contractors in all 50 states.',
    url: getBaseUrl(),
    logo: `${getBaseUrl()}/logo.png`,
    sameAs: [
      // Add your social media URLs here
      // 'https://facebook.com/yourpage',
      // 'https://twitter.com/yourhandle',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@roofleakrepaird.com',
    },
  }
}

// ✅ LocalBusiness Schema (fixed)
export function generateLocalBusinessSchema(contractor: any): WithContext<LocalBusiness> {
  const baseUrl = getBaseUrl()
  
  // Build address safely
  const addressParts = []
  if (contractor.address) addressParts.push(contractor.address)
  if (contractor.city) addressParts.push(contractor.city)
  if (contractor.state) addressParts.push(contractor.state)
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: contractor.businessName || contractor.name,
    description: contractor.description || `Professional roof leak repair services in ${contractor.city || ''}${contractor.city && contractor.state ? ', ' : ''}${contractor.state || ''}.`,
    image: contractor.logo || contractor.googleImageUrl || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contractor.address || undefined,
      addressLocality: contractor.city || undefined,
      addressRegion: contractor.stateAbbrev || contractor.state || undefined,
      postalCode: contractor.zipCode || undefined,
      addressCountry: 'US',
    },
    geo: (contractor.latitude && contractor.longitude) ? {
      '@type': 'GeoCoordinates',
      latitude: parseFloat(contractor.latitude),
      longitude: parseFloat(contractor.longitude),
    } : undefined,
    url: `${baseUrl}/${contractor.stateSlug || contractor.state?.toLowerCase().replace(/\s+/g, '-')}/${contractor.slug}`,
    telephone: contractor.phone || undefined,
    email: contractor.email || undefined,
    priceRange: '$$',
    openingHours: contractor.openingHours ? parseOpeningHours(contractor.openingHours) : undefined,
    paymentAccepted: 'Cash, Credit Card, Check, Financing Available',
    areaServed: contractor.serviceAreas || [contractor.city || contractor.state || 'United States'],
    // ✅ Add services offered
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Roofing Services',
      itemListElement: (contractor.servicesOffered || ['Roof Leak Repair', 'Roof Inspection', 'Emergency Roof Repair']).map((service: string) => ({
        '@type': 'Offer',
        name: service,
        description: `${service} services in ${contractor.city || 'your area'}.`,
      })),
    },
    // ✅ Add reviews if available
    review: contractor.reviews?.map((review: any) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.userName || 'Anonymous',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.content,
      datePublished: review.createdAt,
    })),
  }
}

// ✅ Helper: Parse opening hours
function parseOpeningHours(hours: any): string[] | undefined {
  if (!hours) return undefined
  
  let parsedHours: any = hours
  
  // If string, try to parse JSON
  if (typeof hours === 'string') {
    try {
      parsedHours = JSON.parse(hours)
    } catch {
      // If not JSON, try to parse text format
      return parseTextHours(hours)
    }
  }
  
  // If array or object, convert to schema format
  if (Array.isArray(parsedHours)) {
    return parsedHours.map((item: any) => {
      const day = item.day || item.Day || ''
      const open = item.open || item.Open || ''
      const close = item.close || item.Close || ''
      return `${day.substring(0, 2)} ${open}-${close}`
    })
  }
  
  if (typeof parsedHours === 'object') {
    const dayMap: Record<string, string> = {
      monday: 'Mo', tuesday: 'Tu', wednesday: 'We',
      thursday: 'Th', friday: 'Fr', saturday: 'Sa', sunday: 'Su'
    }
    const result: string[] = []
    for (const [key, value] of Object.entries(parsedHours)) {
      if (value && typeof value === 'object') {
        const open = (value as any).open || (value as any).Open || ''
        const close = (value as any).close || (value as any).Close || ''
        const day = dayMap[key.toLowerCase()] || key.substring(0, 2)
        if (open && close) {
          result.push(`${day} ${open}-${close}`)
        }
      }
    }
    return result.length > 0 ? result : undefined
  }
  
  return undefined
}

// ✅ Helper: Parse text hours
function parseTextHours(hours: string): string[] | undefined {
  const lines = hours.split('\n').filter(line => line.trim())
  const dayMap: Record<string, string> = {
    'mon': 'Mo', 'tue': 'Tu', 'wed': 'We',
    'thu': 'Th', 'fri': 'Fr', 'sat': 'Sa', 'sun': 'Su'
  }
  
  const result: string[] = []
  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*([^-–]+)\s*[–-]\s*(.+)$/)
    if (match) {
      const [, day, open, close] = match
      const dayKey = day.trim().toLowerCase().substring(0, 3)
      const dayAbbr = dayMap[dayKey] || dayKey.substring(0, 2)
      result.push(`${dayAbbr} ${open.trim()}-${close.trim()}`)
    }
  }
  return result.length > 0 ? result : undefined
}

// ✅ Breadcrumb Schema (fixed)
export function generateBreadcrumbSchema(items: { name: string; item: string }[]): WithContext<BreadcrumbList> {
  const baseUrl = getBaseUrl()
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.item}`,
    })),
  }
}

// ✅ FAQ Schema (fixed)
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

// ✅ WebPage Schema
export function generateWebPageSchema(
  title: string,
  description: string,
  url: string,
  datePublished?: string,
  dateModified?: string
): WithContext<WebPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: `${getBaseUrl()}${url}`,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
  }
}

// ✅ Combined Schema for Contractor Page
export function generateContractorPageSchema(
  contractor: any,
  breadcrumbItems: { name: string; item: string }[],
  faqs?: { question: string; answer: string }[]
): any[] {
  // use a loose any[] to allow mixing different schema types (LocalBusiness, BreadcrumbList, FAQPage, etc.)
  const schemas: any[] = [
    generateLocalBusinessSchema(contractor),
    generateBreadcrumbSchema(breadcrumbItems),
  ]

  if (faqs && faqs.length > 0) {
    schemas.push(generateFAQSchema(faqs))
  }

  return schemas
}

// ✅ State Page Schema
export function generateStatePageSchema(
  stateName: string,
  stateSlug: string,
  contractorCount: number,
  cityCount: number
): WithContext<WebPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Roof Leak Repair Contractors in ${stateName}`,
    description: `Find ${contractorCount} trusted roof leak repair contractors in ${stateName}. Compare reviews and get free estimates.`,
    url: `${getBaseUrl()}/${stateSlug}`,
    about: {
      '@type': 'State',
      name: stateName,
    },
    numberOfItems: contractorCount,
  } as any
}

// ✅ City Page Schema
export function generateCityPageSchema(
  cityName: string,
  stateName: string,
  stateSlug: string,
  citySlug: string,
  contractorCount: number
): WithContext<WebPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Roof Leak Repair Contractors in ${cityName}, ${stateName}`,
    description: `Find ${contractorCount} trusted roof leak repair contractors in ${cityName}, ${stateName}. Compare reviews and get free estimates.`,
    url: `${getBaseUrl()}/${stateSlug}?city=${citySlug}`,
    about: {
      '@type': 'City',
      name: cityName,
      containedInPlace: {
        '@type': 'State',
        name: stateName,
      },
    },
    numberOfItems: contractorCount,
  } as any
}

// ✅ Service Page Schema
export function generateServicePageSchema(
  serviceName: string,
  serviceSlug: string,
  description: string
): WithContext<any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: description || `Professional ${serviceName} services.`,
    url: `${getBaseUrl()}/services/${serviceSlug}`,
    provider: {
      '@type': 'Organization',
      name: 'Roof Leak Repair Directory',
    },
    serviceType: serviceName,
  }
}