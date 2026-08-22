// components/directory/StateFaqSection.tsx
import { StateFaq } from '@/lib/stateFaqs'

interface StateFaqSectionProps {
  faqs: StateFaq[]
}

export function StateFaqSection({ faqs }: StateFaqSectionProps) {
  if (!faqs || faqs.length === 0) return null

  const jsonLd = {
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
    <section className="mt-12 mb-8">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
              {faq.question}
              <span className="text-gray-400 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      {/* JSON-LD for FAQPage rich results */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  )
}