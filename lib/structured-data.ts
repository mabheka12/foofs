// lib/structured-data.ts
import type {
  BreadcrumbList,
  FAQPage,
  LocalBusiness,
  Organization,
  WebPage,
  WithContext,
} from 'schema-dts'

const DEFAULT_BASE_URL =
  'https://www.roofernet.com'

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    DEFAULT_BASE_URL
  ).replace(/\/+$/, '')
}

function getAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`

  return `${getBaseUrl()}${normalizedPath}`
}

function hasText(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0
  )
}

function toFiniteNumber(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : null
}

function getValidServices(
  services: unknown
): string[] {
  if (Array.isArray(services)) {
    return services.filter(hasText)
  }

  if (hasText(services)) {
    try {
      const parsed = JSON.parse(services)

      if (Array.isArray(parsed)) {
        return parsed.filter(hasText)
      }
    } catch {
      return []
    }
  }

  return []
}

function getContractorUrl(contractor: any) {
  const stateSlug =
    contractor.stateSlug ||
    contractor.state_slug

  if (!hasText(stateSlug) || !hasText(contractor.slug)) {
    return undefined
  }

  return getAbsoluteUrl(
    `/${stateSlug}/${contractor.slug}`
  )
}

function getValidReviews(reviews: unknown) {
  if (!Array.isArray(reviews)) {
    return []
  }

  return reviews
    .map((review) => {
      const rating = toFiniteNumber(review.rating)

      const authorName =
        review.authorName ||
        review.userName ||
        review.author

      if (
        rating === null ||
        rating < 1 ||
        rating > 5 ||
        !hasText(authorName)
      ) {
        return null
      }

      return {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: authorName,
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody:
          hasText(review.content)
            ? review.content
            : undefined,

        datePublished:
          review.publishedAt ||
          review.createdAt ||
          undefined,
      }
    })
    .filter(Boolean)
}

export function generateOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RooferNet',
    description:
      'A directory for browsing roofing contractors by state and location.',
    url: getBaseUrl(),
    email: 'info@roofernet.com',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'directory support',
      email: 'info@roofernet.com',
    },
  }
}

export function generateLocalBusinessSchema(
  contractor: any
): WithContext<LocalBusiness> {
  const contractorName =
    contractor.businessName ||
    contractor.name

  const contractorUrl =
    getContractorUrl(contractor)

  const latitude =
    toFiniteNumber(contractor.latitude)

  const longitude =
    toFiniteNumber(contractor.longitude)

  const rating =
    toFiniteNumber(contractor.rating)

  const reviewCount =
    toFiniteNumber(
      contractor.reviewCount ??
        contractor.review_count
    )

  const services =
    getValidServices(
      contractor.servicesOffered ??
        contractor.services_offered
    )

  const reviews =
    getValidReviews(contractor.reviews)

  const openingHours =
    parseOpeningHours(
      contractor.openingHours ??
        contractor.opening_hours
    )

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',

    name: contractorName,

    url: contractorUrl,

    description:
      hasText(contractor.description)
        ? contractor.description.trim()
        : undefined,

    image:
      contractor.logo ||
      contractor.googleImageUrl ||
      contractor.google_image_url ||
      undefined,

    telephone:
      hasText(contractor.phone)
        ? contractor.phone
        : undefined,

    email:
      hasText(contractor.email)
        ? contractor.email
        : undefined,

    address:
      contractor.address ||
      contractor.city ||
      contractor.state
        ? {
            '@type': 'PostalAddress',

            streetAddress:
              hasText(contractor.address)
                ? contractor.address
                : undefined,

            addressLocality:
              hasText(contractor.city)
                ? contractor.city
                : undefined,

            addressRegion:
              contractor.stateAbbrev ||
              contractor.state_abbrev ||
              contractor.state ||
              undefined,

            postalCode:
              contractor.zipCode ||
              contractor.zip_code ||
              undefined,

            addressCountry: 'US',
          }
        : undefined,

    geo:
      latitude !== null &&
      longitude !== null &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
        ? {
            '@type': 'GeoCoordinates',
            latitude,
            longitude,
          }
        : undefined,

    openingHours:
      openingHours?.length
        ? openingHours
        : undefined,

    sameAs:
      hasText(contractor.website)
        ? [contractor.website]
        : undefined,

    aggregateRating:
      rating !== null &&
      rating >= 1 &&
      rating <= 5 &&
      reviewCount !== null &&
      reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,

    review:
      reviews.length > 0
        ? reviews
        : undefined,
  }

  /*
   * Add services only when the database contains real service data.
   * Never generate fallback services.
   */
  if (services.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Listed roofing services',
      itemListElement: services.map(
        (service) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service,
          },
        })
      ),
    }
  }

  return schema
}

function parseOpeningHours(
  hours: unknown
): string[] | undefined {
  if (!hours) return undefined

  let parsedHours: unknown = hours

  if (typeof hours === 'string') {
    try {
      parsedHours = JSON.parse(hours)
    } catch {
      return parseTextHours(hours)
    }
  }

  if (Array.isArray(parsedHours)) {
    const result = parsedHours
      .map((item: any) => {
        if (!item || typeof item !== 'object') {
          return null
        }

        const day =
          item.day || item.Day || ''

        const open =
          item.open || item.Open || ''

        const close =
          item.close || item.Close || ''

        if (!day || !open) {
          return null
        }

        if (
          open === '24/7' ||
          close === '24/7'
        ) {
          return `${String(day).substring(0, 2)} 00:00-23:59`
        }

        if (!close) {
          return null
        }

        return `${String(day).substring(
          0,
          2
        )} ${open}-${close}`
      })
      .filter(
        (value): value is string =>
          Boolean(value)
      )

    return result.length > 0
      ? result
      : undefined
  }

  if (
    parsedHours &&
    typeof parsedHours === 'object'
  ) {
    const dayMap: Record<string, string> = {
      monday: 'Mo',
      tuesday: 'Tu',
      wednesday: 'We',
      thursday: 'Th',
      friday: 'Fr',
      saturday: 'Sa',
      sunday: 'Su',
    }

    const result: string[] = []

    for (const [key, value] of Object.entries(
      parsedHours
    )) {
      if (!value || typeof value !== 'object') {
        continue
      }

      const typedValue =
        value as Record<string, unknown>

      const open =
        typedValue.open ||
        typedValue.Open

      const close =
        typedValue.close ||
        typedValue.Close

      const day =
        dayMap[key.toLowerCase()] ||
        key.substring(0, 2)

      if (
        open === '24/7' ||
        close === '24/7'
      ) {
        result.push(`${day} 00:00-23:59`)
        continue
      }

      if (
        hasText(open) &&
        hasText(close)
      ) {
        result.push(
          `${day} ${open}-${close}`
        )
      }
    }

    return result.length > 0
      ? result
      : undefined
  }

  return undefined
}

function parseTextHours(
  hours: string
): string[] | undefined {
  const lines = hours
    .split('\n')
    .filter((line) => line.trim())

  const dayMap: Record<string, string> = {
    mon: 'Mo',
    tue: 'Tu',
    wed: 'We',
    thu: 'Th',
    fri: 'Fr',
    sat: 'Sa',
    sun: 'Su',
  }

  const result: string[] = []

  for (const line of lines) {
    const match = line.match(
      /^([^:]+):\s*([^-–]+)\s*[–-]\s*(.+)$/
    )

    if (!match) continue

    const [, day, open, close] = match

    const dayKey = day
      .trim()
      .toLowerCase()
      .substring(0, 3)

    const dayAbbr =
      dayMap[dayKey] ||
      dayKey.substring(0, 2)

    result.push(
      `${dayAbbr} ${open.trim()}-${close.trim()}`
    )
  }

  return result.length > 0
    ? result
    : undefined
}

export function generateBreadcrumbSchema(
  items: {
    name: string
    item: string
  }[]
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',

    itemListElement: items.map(
      (item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: getAbsoluteUrl(item.item),
      })
    ),
  }
}

export function generateFAQSchema(
  faqs: {
    question: string
    answer: string
  }[]
): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',

    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,

      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

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
    description,
    url: getAbsoluteUrl(url),

    datePublished:
      datePublished || undefined,

    dateModified:
      dateModified || undefined,
  }
}

export function generateContractorPageSchema(
  contractor: any,
  breadcrumbItems: {
    name: string
    item: string
  }[],
  faqs?: {
    question: string
    answer: string
  }[]
): any[] {
  const schemas: any[] = [
    generateLocalBusinessSchema(contractor),
    generateBreadcrumbSchema(
      breadcrumbItems
    ),
  ]

  if (faqs?.length) {
    schemas.push(
      generateFAQSchema(faqs)
    )
  }

  return schemas
}

export function generateStatePageSchema(
  stateName: string,
  stateSlug: string,
  contractorCount: number,
  cityCount: number
): WithContext<WebPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',

    name:
      `Roofing Contractors in ${stateName}`,

    description:
      `Browse ${contractorCount} published roofing contractor listings across ${cityCount} locations in ${stateName}.`,

    url:
      getAbsoluteUrl(`/${stateSlug}`),

    about: {
      '@type': 'State',
      name: stateName,
    },

    numberOfItems: contractorCount,
  } as WithContext<WebPage>
}

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

    name:
      `Roofing Contractors in ${cityName}, ${stateName}`,

    description:
      `Browse ${contractorCount} published roofing contractor listings in ${cityName}, ${stateName}.`,

    url: getAbsoluteUrl(
      `/${stateSlug}?city=${encodeURIComponent(
        citySlug
      )}`
    ),

    about: {
      '@type': 'City',
      name: cityName,

      containedInPlace: {
        '@type': 'State',
        name: stateName,
      },
    },

    numberOfItems: contractorCount,
  } as WithContext<WebPage>
}

export function generateServicePageSchema(
  serviceName: string,
  serviceSlug: string,
  description: string
): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',

    headline:
      `${serviceName} Guide`,

    description,

    url: getAbsoluteUrl(
      `/services/${serviceSlug}`
    ),

    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getAbsoluteUrl(
        `/services/${serviceSlug}`
      ),
    },

    author: {
      '@type': 'Organization',
      name: 'RooferNet',
      url: getBaseUrl(),
    },

    publisher: {
      '@type': 'Organization',
      name: 'RooferNet',
      url: getBaseUrl(),
    },
  }
}