// app/[state]/page.tsx
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { db } from '@/lib/db'
import { states, cities, contractors } from '@/lib/db/schema'
import { eq, and, sql, } from 'drizzle-orm'//leftjoin removed
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ContractorCard } from '@/components/directory/ContractorCard'

interface StatePageProps {
  params: Promise<{
    state: string
  }>
}

export async function generateMetadata({ params }: StatePageProps) {
  // Await the params
  const { state } = await params
  
  const stateData = await db
    .select()
    .from(states)
    .where(eq(states.slug, state))
    .limit(1)

  if (!stateData.length) return {}

  return generateSEOMetadata({
    title: `Roof Leak Repair Contractors in ${stateData[0].name}`,
    description: `Find the best roof leak repair contractors in ${stateData[0].name}. Compare reviews, get free estimates, and find emergency roof repair services.`,
    keywords: [`roof leak repair ${stateData[0].name}`, `roofing contractors ${stateData[0].name}`],
    canonical: `/${stateData[0].slug}`,
  })
}

export default async function StatePage({ params }: StatePageProps) {
  // Await the params
  const { state } = await params
  
  const stateData = await db
    .select()
    .from(states)
    .where(eq(states.slug, state))
    .limit(1)

  if (!stateData.length) notFound()

  const stateInfo = stateData[0]

  const cityList = await db
    .select()
    .from(cities)
    .where(eq(cities.stateId, stateInfo.id))
    .orderBy(cities.name)

  const topContractors = await db
    .select({ contractor: contractors, citySlug: cities.slug })
    .from(contractors)
    .leftJoin(cities, eq(cities.id, contractors.cityId))
    .where(
      and(
        eq(contractors.stateId, stateInfo.id),
        eq(contractors.published, true),
        sql`${contractors.rating} IS NOT NULL`
      )
    )
    .orderBy(sql`${contractors.rating} DESC`)
    .limit(6)

    return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span>{stateInfo.name}</span>
      </nav>

      <h1 className="text-4xl font-bold mb-4">
        Roof Leak Repair in {stateInfo.name}
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Find trusted roof leak repair contractors in cities across {stateInfo.name}.
      </p>

      {/* Featured Contractors */}
      {topContractors.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Top-Rated Contractors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topContractors.map(({ contractor, citySlug }) => (
              <ContractorCard
                key={contractor.id}
                contractor={contractor}
                stateSlug={stateInfo.slug}
                citySlug={citySlug || 'city'}
                variant="detailed"
              />
            ))}
          </div>
        </section>
      )}

      {/* Cities */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Find Roofers in Cities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cityList.map((city) => (
            <Link
              key={city.id}
              href={`/${stateInfo.slug}/${city.slug}`}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100 text-center"
            >
              <h3 className="font-semibold text-gray-800">{city.name}</h3>
              <p className="text-sm text-gray-500">Roof Leak Repair</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}