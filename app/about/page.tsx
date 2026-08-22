// app/about/page.tsx
import Link from 'next/link'
import {
  ArrowRight,
  Building,
  Database,
  RefreshCw,
  Scale,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react'

import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { DirectoryDisclosure } from '@/components/directory/DirectoryDisclosure'

export const metadata = generateSeoMetadata({
  title: 'About RooferNet',

  description:
    'Learn how RooferNet organizes roofing contractor listings, presents available business information and helps visitors browse providers by location.',

  keywords: [
    'about RooferNet',
    'roofing contractor directory',
    'roofing business listings',
    'roofing directory',
  ],

  canonical: '/about',
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About RooferNet',
  description:
    'Information about RooferNet and its roofing contractor directory.',
  url: 'https://www.roofernet.com/about',
  mainEntity: {
    '@type': 'Organization',
    name: 'RooferNet',
    url: 'https://www.roofernet.com',
    email: 'info@roofernet.com',
  },
}

export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-8 text-sm text-gray-600">
        <Link
          href="/"
          className="hover:text-blue-600"
        >
          Home
        </Link>

        <span className="mx-2">/</span>

        <span className="text-gray-800">
          About RooferNet
        </span>
      </nav>

      <header className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          <Building className="h-4 w-4" />
          Roofing contractor directory
        </div>

        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
          About{' '}
          <span className="text-blue-600">
            RooferNet
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-xl leading-relaxed text-gray-600">
          RooferNet organizes roofing contractor information by state
          and location, making it easier to browse available business
          details from one directory.
        </p>
      </header>

      <section className="mb-12 rounded-2xl bg-blue-50 p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <SearchCheck className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Our Purpose
            </h2>

            <p className="mt-4 leading-relaxed text-gray-700">
              Finding roofing businesses across many separate websites
              and location results can be time-consuming. RooferNet
              provides a browsable directory where visitors can compare
              available ratings, contact details, locations and other
              business information.
            </p>

            <p className="mt-4 leading-relaxed text-gray-700">
              RooferNet is not a roofing contractor and does not perform
              repairs, provide project estimates or enter into contracts
              on behalf of listed businesses. Visitors contact
              contractors directly and remain responsible for their
              hiring decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          How to Use RooferNet
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              1
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Browse
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Browse published contractor listings by state or use the
              search page to narrow results by business name and
              location.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              2
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Compare
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Review available ratings, review counts, locations,
              contact details and other information displayed on each
              listing.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              3
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Confirm
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Contact businesses directly and confirm credentials,
              service availability, project scope, materials, warranties
              and payment terms.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Our Directory Principles
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-600" />

              <h3 className="font-semibold text-gray-900">
                Factual Information
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">
              We aim to display available business information without
              inventing services, credentials, availability or other
              claims that are not present in a listing’s data.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-blue-600" />

              <h3 className="font-semibold text-gray-900">
                Clear Labels
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">
              Verified, featured, insurance and other labels appear only
              when the relevant listing field is present. Featured
              placement is advertising, not an endorsement.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-blue-600" />

              <h3 className="font-semibold text-gray-900">
                Corrections
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">
              Business owners and visitors can report inaccurate or
              outdated information. Material corrections may require
              supporting information before they are applied.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <Scale className="h-6 w-6 text-blue-600" />

              <h3 className="font-semibold text-gray-900">
                Independent Decisions
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">
              Directory ordering, ratings and promotional placement do
              not guarantee workmanship or suitability. Visitors should
              perform their own checks before hiring.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <DirectoryDisclosure />
      </section>

      <section className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Learn More About Our Listings
        </h2>

        <p className="mt-3 max-w-3xl leading-relaxed text-gray-600">
          Our methodology page explains ordinary result ordering,
          featured placement, listing labels, corrections and what
          visitors should verify before hiring.
        </p>

        <Link
          href="/how-roofernet-works"
          className="mt-5 inline-flex items-center gap-2 font-medium text-blue-600 hover:underline"
        >
          Read how RooferNet works
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">
          Contact RooferNet
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-blue-100">
          Contact us to report incorrect directory information, ask
          about a listing or discuss business advertising.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-lg bg-white px-6 py-3 font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Contact Us
          </Link>

          <Link
            href="/states"
            className="rounded-lg border border-white/50 px-6 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Browse Directory
          </Link>
        </div>
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