// components/seo/FAQSchema.tsx
'use client'

import { WithContext, FAQPage } from 'schema-dts'
import Script from 'next/script'

interface FAQSchemaProps {
  faqs: {
    question: string
    answer: string
  }[]
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema: WithContext<FAQPage> = {
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

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}