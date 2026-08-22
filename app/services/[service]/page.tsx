// app/services/[service]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq, sql } from 'drizzle-orm'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ClipboardCheck,
  HelpCircle,
  MapPin,
} from 'lucide-react'

import { getDb } from '@/lib/db'
import { contractors, serviceTypes } from '@/lib/db/schema'
import {
  getServiceGuide,
  serviceGuides,
} from '@/lib/serviceGuides'
import { DirectoryDisclosure } from '@/components/directory/DirectoryDisclosure'

interface ServicePageProps {
  params: Promise<{
    service: string
  }>
}

export function generateStaticParams() {
  return Object.keys(serviceGuides).map((service) => ({
    service,
  }))
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { service } = await params
  const guide = getServiceGuide(service)

  if (!guide) {
    return {
      title: 'Roofing Service Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return {
    title: guide.title,
    description: guide.summary,
    alternates: {
      canonical: `/services/${service}`,
    },
  }
}

export default async function ServicePage({
  params,
}: ServicePageProps) {
  const { service } = await params
  const guide = getServiceGuide(service)

  if (!guide) {
    notFound()
  }

  const db = getDb()

  const [serviceResult, stateResults] = await Promise.all([
    db
      .select({
        id: serviceTypes.id,
        name: serviceTypes.name,
        slug: serviceTypes.slug,
        description: serviceTypes.description,
        icon: serviceTypes.icon,
      })
      .from(serviceTypes)
      .where(eq(serviceTypes.slug, service))
      .limit(1),

    db
      .select({
        state: contractors.state,
        stateSlug: contractors.stateSlug,
        stateAbbrev: contractors.state_abbrev,
        contractorCount: sql<number>`COUNT(*)`.as(
          'contractor_count'
        ),
      })
      .from(contractors)
      .where(eq(contractors.published, true))
      .groupBy(
        contractors.state,
        contractors.stateSlug,
        contractors.state_abbrev
      )
      .orderBy(sql`COUNT(*) DESC`)
      .limit(12),
  ])

  if (!serviceResult.length) {
    notFound()
  }

  const serviceType = serviceResult[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.summary,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.roofernet.com/services/${service}`,
    },
    author: {
      '@type': 'Organization',
      name: 'RooferNet',
      url: 'https://www.roofernet.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RooferNet',
      url: 'https://www.roofernet.com',
    },
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>

        <span className="mx-2">/</span>

        <Link href="/services" className="hover:text-blue-600">
          Roofing Services
        </Link>

        <span className="mx-2">/</span>

        <span className="text-gray-800">
          {serviceType.name}
        </span>
      </nav>

      <Link
        href="/services"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to roofing service guides
      </Link>

      <article>
        <header className="mb-10 rounded-2xl bg-gradient-to-br from-blue-50 to-white p-8 md:p-12">
          <div
            aria-hidden="true"
            className="mb-5 text-5xl"
          >
            {serviceType.icon || '🔧'}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            {guide.title}
          </h1>

          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-gray-600">
            {guide.summary}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-8">
            <section className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                What is {serviceType.name.toLowerCase()}?
              </h2>

              <p className="mt-4 leading-relaxed text-gray-700">
                {guide.introduction}
              </p>
            </section>

            <section className="rounded-xl border border-orange-200 bg-orange-50 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-700" />

                <h2 className="text-2xl font-bold text-gray-900">
                  Signs This Service May Be Needed
                </h2>
              </div>

              <ul className="mt-5 space-y-3">
                {guide.warningSigns.map((sign) => (
                  <li
                    key={sign}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />

                <h2 className="text-2xl font-bold text-gray-900">
                  What the Work May Include
                </h2>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                The precise scope depends on the roof and the conditions
                discovered during inspection. Confirm every included
                item in writing.
              </p>

              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {guide.typicalWork.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700"
                  >
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-blue-200 bg-blue-50 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-blue-700" />

                <h2 className="text-2xl font-bold text-gray-900">
                  Questions to Ask a Contractor
                </h2>
              </div>

              <ol className="mt-5 space-y-3">
                {guide.contractorQuestions.map((question, index) => (
                  <li
                    key={question}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {index + 1}
                    </span>

                    <span className="pt-0.5">{question}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Important Considerations
              </h2>

              <ul className="mt-5 space-y-3">
                {guide.considerations.map((consideration) => (
                  <li
                    key={consideration}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <span>{consideration}</span>
                  </li>
                ))}
              </ul>
            </section>

            <DirectoryDisclosure />
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl bg-gray-900 p-6 text-white lg:sticky lg:top-24">
              <h2 className="text-xl font-bold">
                Find Roofing Contractors
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                {guide.nextStep}
              </p>

              <Link
                href="/states"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Browse all states
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </article>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Browse Contractors by State
        </h2>

        <p className="mt-2 text-gray-600">
          These links show general roofing contractor listings. Confirm
          the required service directly with each business.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {stateResults.map((state) => {
            if (!state.state || !state.stateSlug) return null

            return (
              <Link
                key={state.stateSlug}
                href={`/${state.stateSlug}`}
                className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />

                  <div>
                    <div className="font-medium text-gray-900">
                      {state.state}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      {Number(
                        state.contractorCount
                      ).toLocaleString('en-US')}{' '}
                      listings
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <Link
          href="/states"
          className="mt-6 inline-flex items-center gap-2 font-medium text-blue-600 hover:underline"
        >
          View every state
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </main>
  )
}