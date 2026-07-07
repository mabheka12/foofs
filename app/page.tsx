// app/page.tsx
import { generateMetadata } from '@/lib/seo'
import { db } from '@/lib/db'
import { states, contractors } from '@/lib/db/schema'
import { desc, sql } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import { SearchFilter } from '@/components/directory/SearchFilter'
import { ContractorGrid } from '@/components/directory/ContractorGrid'
import { FAQSchema } from '@/components/seo/FAQSchema'
import { Shield, Star, Clock, MapPin } from 'lucide-react'

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
    <>
      <FAQSchema faqs={faqs} />
      
      {/* Hero Section with Image */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
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

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-400/30">
              <Shield className="w-4 h-4" />
              Trusted Directory 
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Find Trusted{' '}
              <span className="text-blue-400">Roof Leak Repair</span>
              <br />
              Contractors Near You
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl">
              Compare top-rated contractors and get free estimates 
              for roof leak repair services in your area.
            </p>

            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <SearchFilter />
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-8 text-white/80">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>4.8/5 Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>24/7 Emergency Services</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-400" />
                <span>50 States Covered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="relative">
              <div className="text-3xl font-bold text-blue-600">5,000+</div>
              <div className="text-gray-600">Contractors Listed</div>
            </div>
            <div className="relative">
              <div className="text-3xl font-bold text-blue-600">50</div>
              <div className="text-gray-600">States Covered</div>
            </div>
            <div className="relative">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">Emergency Services</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Contractors */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Contractors</h2>
            <Link 
              href="/contractors" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All →
            </Link>
          </div>
          <ContractorGrid contractors={featuredContractors} />
        </div>
      </section>

      {/* Popular States */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Find Contractors by State</h2>
            <Link 
              href="/states" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All 50 States →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stateList.slice(0, 24).map((state) => (
              <Link
                key={state.id}
                href={`/${state.slug}`}
                className="group p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all hover:shadow-md text-center border border-transparent hover:border-blue-200"
              >
                <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                  {state.name}
                </span>
                <span className="block text-xs text-gray-400 group-hover:text-blue-400 transition">
                  {state.abbreviation}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Why Choose Our Directory?</h2>
            <p className="text-blue-100 mt-2 max-w-2xl mx-auto">
              We make it easy to find the right contractor for your roof repair needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white border border-white/10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Emergency</h3>
              <p className="text-blue-100 text-sm">
                Find emergency roof repair services available around the clock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find a Contractor?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found the right roof repair professional through our directory.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/search"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Search Contractors
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}