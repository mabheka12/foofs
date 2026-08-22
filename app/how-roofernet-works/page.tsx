// app/how-roofernet-works/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BadgeCheck,
  Building,
  CircleDollarSign,
  ListOrdered,
  MessageSquareWarning,
  SearchCheck,
  ShieldCheck,
  Star,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'How RooferNet Works',
  description:
    'Learn how RooferNet displays roofing contractors, ratings, verified and featured listings, and how to report incorrect information.',
  alternates: {
    canonical: '/how-roofernet-works',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'How RooferNet Works',
  description:
    'Information about RooferNet listing data, result ordering, advertising, verification labels and correction procedures.',
  url: 'https://www.roofernet.com/how-roofernet-works',
  mainEntity: {
    '@type': 'Organization',
    name: 'RooferNet',
    url: 'https://www.roofernet.com',
    email: 'info@roofernet.com',
  },
}

export default function HowRooferNetWorksPage() {
  return (
    <main className="bg-gray-50">
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <SearchCheck className="h-4 w-4" />
              Directory transparency
            </div>

            <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
              How RooferNet Works
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              RooferNet helps visitors discover and compare roofing
              contractors. This page explains how listings are displayed,
              what our labels mean and what visitors should verify before
              hiring a contractor.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl space-y-8 px-4 py-12">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <Building className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Our purpose
              </h2>

              <p className="mt-3 leading-relaxed text-gray-700">
                RooferNet is an independent roofing-contractor directory.
                We organize available business information by state and
                location so visitors can compare providers and reach
                businesses directly.
              </p>

              <p className="mt-3 leading-relaxed text-gray-700">
                RooferNet does not perform roofing work, provide project
                estimates or enter into contracts on behalf of listed
                businesses. Any agreement is between the visitor and the
                contractor they choose.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-purple-100 p-3 text-purple-700">
              <ListOrdered className="h-6 w-6" />
            </div>

            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900">
                Listing information
              </h2>

              <p className="mt-3 leading-relaxed text-gray-700">
                Listing information may include publicly available
                business details, information supplied by a business and
                updates submitted through RooferNet. Depending on what is
                available, a listing may contain:
              </p>

              <ul className="mt-4 grid gap-3 text-gray-700 sm:grid-cols-2">
                <li className="rounded-lg bg-gray-50 px-4 py-3">
                  Business name and location
                </li>
                <li className="rounded-lg bg-gray-50 px-4 py-3">
                  Telephone number and website
                </li>
                <li className="rounded-lg bg-gray-50 px-4 py-3">
                  Opening hours
                </li>
                <li className="rounded-lg bg-gray-50 px-4 py-3">
                  Listed roofing services
                </li>
                <li className="rounded-lg bg-gray-50 px-4 py-3">
                  Ratings and review counts
                </li>
                <li className="rounded-lg bg-gray-50 px-4 py-3">
                  Available business credentials
                </li>
              </ul>

              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                Business information can change. Visitors should confirm
                important details directly with the contractor before
                making a hiring decision.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-green-100 p-3 text-green-700">
              <ListOrdered className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                How ordinary results are ordered
              </h2>

              <p className="mt-3 leading-relaxed text-gray-700">
                Ordinary directory results may be ordered using available
                rating information, review counts and business names.
                Results can also be narrowed using location filters.
              </p>

              <p className="mt-3 leading-relaxed text-gray-700">
                Position in an ordinary results list should not be treated
                as a guarantee of workmanship, availability, licensing or
                suitability for a particular project.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            What RooferNet labels mean
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2 font-semibold text-green-900">
                <BadgeCheck className="h-5 w-5" />
                Verified
              </div>

              <p className="mt-2 text-sm leading-relaxed text-green-900">
                A verified label indicates that the listing has completed
                the verification process used by RooferNet for that record.
                It does not guarantee the quality of future work or replace
                the visitor’s own credential checks.
              </p>
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
              <div className="flex items-center gap-2 font-semibold text-yellow-900">
                <CircleDollarSign className="h-5 w-5" />
                Featured
              </div>

              <p className="mt-2 text-sm leading-relaxed text-yellow-900">
                Featured placement is promotional visibility that may be
                purchased by or for a business. It is advertising and
                should not be interpreted as an editorial endorsement or
                guarantee.
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-2 font-semibold text-blue-900">
                <ShieldCheck className="h-5 w-5" />
                Insurance or licence information
              </div>

              <p className="mt-2 text-sm leading-relaxed text-blue-900">
                When insurance or licence information appears, visitors
                should confirm its current status with the relevant
                insurer, licensing authority or contractor before hiring.
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
              <div className="flex items-center gap-2 font-semibold text-purple-900">
                <Star className="h-5 w-5" />
                Ratings and reviews
              </div>

              <p className="mt-2 text-sm leading-relaxed text-purple-900">
                Ratings and review counts may originate from the identified
                review source or from reviews submitted through RooferNet.
                Review totals and averages can change over time.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-100 p-3 text-red-700">
              <MessageSquareWarning className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Corrections and reports
              </h2>

              <p className="mt-3 leading-relaxed text-gray-700">
                Business owners can claim their listings and request
                corrections. Visitors can also report outdated,
                inaccurate or inappropriate information.
              </p>

              <p className="mt-3 leading-relaxed text-gray-700">
                Correction requests may require supporting information
                before a material listing change is made.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                >
                  Report incorrect information
                </Link>

                <Link
                  href="/about"
                  className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  About RooferNet
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Before hiring a contractor
          </h2>

          <p className="mt-3 leading-relaxed text-gray-700">
            RooferNet provides directory information, but the final hiring
            decision belongs to the visitor. Before signing an agreement,
            consider taking the following steps:
          </p>

          <ul className="mt-5 space-y-3 text-gray-700">
            <li>
              Confirm the business identity and current contact details.
            </li>
            <li>
              Check applicable licensing and insurance requirements.
            </li>
            <li>
              Request a written scope of work and itemized estimate.
            </li>
            <li>
              Compare materials, warranties and payment terms.
            </li>
            <li>
              Read recent reviews from more than one source.
            </li>
            <li>
              Keep copies of estimates, agreements and correspondence.
            </li>
          </ul>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </main>
  )
}