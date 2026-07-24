// app/page.tsx
import { Suspense } from 'react'
import { generateMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { desc, sql, eq, and } from 'drizzle-orm'
import Link from 'next/link'
import { SearchFilter } from '@/components/directory/SearchFilter'
import { ContractorGrid } from '@/components/directory/ContractorGrid'
import { FeaturedContractors } from '@/components/directory/FeaturedContractors'
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

// Main home content
function HomeContent({  
  stateList,
  totalContractors,
  totalStates 
}: {  
  stateList: any[],
  totalContractors: number,
  totalStates: number 
}) {
  return (
    <>
      <FAQSchema faqs={faqs} />
   
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Find Trusted Roof Leak Repair Contractors Near You
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl">
            Compare top-rated contractors, read reviews, and get free estimates for roof leak repair services in your area.
          </p>
          <Suspense fallback={<div className="h-12 bg-white/10 rounded-lg animate-pulse"></div>}>
            <SearchFilter />
          </Suspense>
        </div>
        <div className="absolute inset-0 z-0">
         <Image
          src="/hero.webp" // Use WebP format
          alt="Professional roofing contractor repairing a roof"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={80}
          placeholder="blur"
          blurDataURL="data:image/webp;base64,..."
        />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{totalContractors.toLocaleString()}+</div>
              <div className="text-gray-600">Contractors Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{totalStates}</div>
              <div className="text-gray-600">States Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">Emergency Service</div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedContractors />

 
      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                1
              </div>
              <h3 className="font-semibold">Search</h3>
              <p className="text-sm text-gray-600">Find contractors by state, city, or service</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                2
              </div>
              <h3 className="font-semibold">Compare</h3>
              <p className="text-sm text-gray-600">Read reviews and compare ratings</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                3
              </div>
              <h3 className="font-semibold">Contact</h3>
              <p className="text-sm text-gray-600">Get free estimates and hire the best</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular States - Now using states with contractors */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Find Contractors by State</h2>
          {stateList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stateList.slice(0, 24).map((state) => (
                <Link
                  key={state.slug || state.state}
                  href={`/${state.slug || state.state?.toLowerCase().replace(/\s+/g, '-')}`}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center group"
                >
                  <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                    {state.name || state.state}
                  </span>
                  {state.contractorCount && (
                    <span className="block text-xs text-gray-500 mt-1">
                      {state.contractorCount} contractor{state.contractorCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No states with contractors available.</p>
          )}
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
  const db = getDb()

  // Get featured contractors
  const featuredContractors = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      slug: contractors.slug,
      address: contractors.address,
      phone: contractors.phone,
      website: contractors.website,
      rating: contractors.rating,
      reviewCount: contractors.reviewCount,
      city: contractors.city,
      state: contractors.state,
      stateAbbrev: contractors.state_abbrev,
      description: contractors.description,
      servicesOffered: contractors.servicesOffered,
      openingHours: contractors.openingHours,
      latitude: contractors.latitude,
      longitude: contractors.longitude,
      verified: contractors.verified,
      emergencyService: contractors.emergencyService,
      featured: contractors.featured,
      published: contractors.published,
    })
    .from(contractors)
    .where(
      and(
        eq(contractors.featured, true),
        eq(contractors.published, true)
      )
    )
    .orderBy(desc(contractors.rating))
    .limit(12)

  // Get states with contractor counts (FROM contractors table directly)
  const statesWithCounts = await db
    .select({
      state: contractors.state,
      stateAbbrev: contractors.state_abbrev,
      contractorCount: sql<number>`COUNT(*)`.as('contractor_count'),
    })
    .from(contractors)
    .where(eq(contractors.published, true))
    .groupBy(contractors.state, contractors.state_abbrev)
    .orderBy(sql`contractor_count DESC`)

  // Format state list for display
  const stateList = statesWithCounts.map((item) => ({
    name: item.state,
    slug: item.state?.toLowerCase().replace(/\s+/g, '-'),
    abbreviation: item.stateAbbrev,
    contractorCount: Number(item.contractorCount),
  }))

  // Get total contractor count
  const totalContractorsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(contractors)
    .where(eq(contractors.published, true))
  
  const totalContractors = totalContractorsResult[0]?.count || 0

  // Total states with contractors
  const totalStates = stateList.length

  return (
    <HomeContent 
      stateList={stateList}
      totalContractors={totalContractors}
      totalStates={totalStates}
    />
  )
}