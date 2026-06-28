// components/seo/BreadcrumbSchema.tsx
'use client'

import { WithContext, BreadcrumbList } from 'schema-dts'
import Script from 'next/script'

interface BreadcrumbSchemaProps {
  items: {
    name: string
    item: string
  }[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}${item.item}`,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

// Helper function to generate breadcrumb items from path
export function generateBreadcrumbItems(path: string): { name: string; item: string }[] {
  const segments = path.split('/').filter(Boolean)
  const items: { name: string; item: string }[] = [
    { name: 'Home', item: '/' },
  ]

  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    items.push({ name, item: currentPath })
  }

  return items
}