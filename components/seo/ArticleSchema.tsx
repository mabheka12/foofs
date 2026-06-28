// components/seo/ArticleSchema.tsx
'use client'

import { WithContext, Article } from 'schema-dts'
import Script from 'next/script'

interface ArticleSchemaProps {
  article: {
    headline: string
    description?: string
    image?: string
    author: string
    datePublished: string
    dateModified?: string
    url: string
    keywords?: string[]
  }
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
  const schema: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    url: article.url,
    keywords: article.keywords?.join(', '),
    publisher: {
      '@type': 'Organization',
      name: 'Roof Leak Repair Directory',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}