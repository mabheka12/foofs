// app/page.tsx
import { Suspense } from 'react'
import { generateMetadata } from '@/lib/seo'
import { db } from '@/lib/db'
import { states, contractors } from '@/lib/db/schema'
import { desc, sql } from 'drizzle-orm'
import Link from 'next/link'
import { SearchFilter } from '@/components/directory/SearchFilter'
import { ContractorGrid } from '@/components/directory/ContractorGrid'
import { FAQSchema } from '@/components/seo/FAQSchema'
import Image from 'next/image'

export const metadata = generateMetadata({
  title: 'Find Roof Leak Repair Contractors Near You',
  description: 'Compare top-rated roof leak repair contractors in your area. Get free estimates, read reviews, and find emergency roof repair services 24/7.',
  keywords: ['roof leak repair', 'emergency roof repair', 'roofing contractors', 'roof inspection', 'roof repair near me'],
})

const faqs = [
  {
    question: 'How much does roof leak repair cost?',
    answer: 'The cost of roof leak repair varies depending on the extent of damage, type of roof, and location. On average, homeowners pay between $300 and $1,500 for roof leak repairs. Minor repairs can cost as little as $150, while major repairs or partial replacements can exceed $2,000.',
  },
  {
    question: 'How do I find a reliable roof leak repair contractor?',
    answer: 'Look for licensed, insured contractors with good reviews. Check their experience with your specific roof type, ask for references, and get multiple quotes. Our directory only features verified contractors with proven track records.',
  },
  {
    question: 'What causes roof leaks?',
    answer: 'Common causes include damaged or missing shingles, cracked flashing, clogged gutters, ice dams, poor installation, and storm damage. Regular maintenance and inspections can help prevent leaks.',
  },
  {
    question: 'How long does roof leak repair take?',
    answer: 'Minor repairs typically take 2-6 hours, while more extensive repairs may take 1-3 days. Emergency repairs can often be completed the same day to prevent further damage.',
  },
]

// Loading component for Suspense fallback
function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main home content with SearchFilter wrapped in Suspense
function HomeContent({ featuredContractors, stateList }: { featuredContractors: any[], stateList: any[] }) {
  return (
    <>
      <FAQSchema faqs={faqs} />
   
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Find Trusted Roof Leak Repair Contractors Near You
          </h1>
            <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt="Professional roofing contractor repairing a roof"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
            {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
          </div>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl">
            Compare top-rated contractors, read reviews, and get free estimates for roof leak repair services in your area.
          </p>
          <Suspense fallback={<div className="h-12 bg-white/10 rounded-lg animate-pulse"></div>}>
            <SearchFilter />
          </Suspense>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">5,000+</div>
              <div className="text-gray-600">Contractors Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">15,000+</div>
              <div className="text-gray-600">Google Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">50</div>
              <div className="text-gray-600">States Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">Emergency Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Contractors */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Contractors</h2>
          <ContractorGrid contractors={featuredContractors} />
        </div>
      </section>

      {/* Popular States */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Find Contractors by State</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stateList.slice(0, 24).map((state) => (
              <Link
                key={state.id}
                href={`/${state.slug}`}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
              >
                <span className="font-semibold text-gray-800">{state.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default async function HomePage() {
  const featuredContractors = await db
    .select()
    .from(contractors)
    .where(sql`${contractors.featured} = true AND ${contractors.published} = true`)
    .orderBy(desc(contractors.rating))
    .limit(12)

  const stateList = await db
    .select()
    .from(states)
    .orderBy(states.name)

  return (
    <HomeContent 
      featuredContractors={featuredContractors} 
      stateList={stateList} 
    />
  )
}