// app/[state]/[city]/page.tsx
import { generateMetadata as seoGenerateMetadata } from '@/lib/seo'
import { db } from '@/lib/db'
import { states, cities, contractors } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ContractorCard } from '@/components/directory/ContractorCard'
interface CityPageProps {
  params: Promise<{
    state: string
    city: string
  }>
}

export async function generateMetadata({ params }: CityPageProps) {
  const { state, city } = await params
  
  const stateData = await db
    .select()
    .from(states)
    .where(eq(states.slug, state))
    .limit(1)

  const cityData = await db
    .select()
    .from(cities)
    .where(eq(cities.slug, city))
    .limit(1)

  if (!stateData.length || !cityData.length) return {}

  return seoGenerateMetadata({
    title: `Roof Leak Repair in ${cityData[0].name}, ${stateData[0].abbreviation}`,
    description: `Find the best roof leak repair contractors in ${cityData[0].name}, ${stateData[0].abbreviation}. Get free estimates, read reviews, and find emergency roof repair services.`,
    keywords: [`roof leak repair ${cityData[0].name}`, `roofing contractors ${cityData[0].name}`],
    canonical: `/${stateData[0].slug}/${cityData[0].slug}`,
  })
}

export default async function CityPage({ params }: CityPageProps) {
  const { state, city } = await params
  
  const stateData = await db
    .select()
    .from(states)
    .where(eq(states.slug, state))
    .limit(1)

  const cityData = await db
    .select()
    .from(cities)
    .where(eq(cities.slug, city))
    .limit(1)

  if (!stateData.length || !cityData.length) notFound()

  const stateInfo = stateData[0]
  const cityInfo = cityData[0]

  const contractorList = await db
    .select({
      contractor: contractors,
      city: cities,
      state: states,
    })
    .from(contractors)
    .leftJoin(cities, eq(cities.id, contractors.cityId))
    .leftJoin(states, eq(states.id, contractors.stateId))
    .where(
      and(
        eq(contractors.cityId, cityInfo.id),
        eq(contractors.stateId, stateInfo.id),
        eq(contractors.published, true)
      )
    )
    .orderBy(
      sql`${contractors.rating} DESC NULLS LAST`,
      sql`${contractors.verified} DESC`
    )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${stateInfo.slug}`} className="hover:text-blue-600">
          {stateInfo.name}
        </Link>
        <span className="mx-2">/</span>
        <span>{cityInfo.name}</span>
      </nav>

      <h1 className="text-4xl font-bold mb-2">
        Roof Leak Repair in {cityInfo.name}, {stateInfo.abbreviation}
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Find trusted roof leak repair contractors in {cityInfo.name}.
      </p>

      {/* Summary Grid */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          {contractorList.length} contractors found
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractorList.map(({ contractor, city, state }) => {
          const citySlug = city?.slug || cityInfo.slug
          const stateSlug = state?.slug || stateInfo.slug
          
          return (
            <ContractorCard
              key={contractor.id}
              contractor={{
                ...contractor,
                city: city || cityInfo,
                state: state || stateInfo,
              }}
              stateSlug={stateSlug}
              citySlug={citySlug}
              variant="summary"
            />
          )
        })}
      </div>
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Popular Services in {cityInfo.name}</h2>
        <div className="flex flex-wrap gap-3">
          {['Emergency Repair', 'Roof Inspection', 'Roof Leak Repair', 'Roof Replacement', 'Maintenance'].map((service) => (
            <Link
              key={service}
              href={`/services/${service.toLowerCase().replace(/\s+/g, '-')}/${cityInfo.slug}`}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition"
            >
              {service}
            </Link>
          ))}
        </div>
</section>
    </div>
  )
}