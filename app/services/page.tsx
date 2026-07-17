// app/services/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { serviceTypes, contractors } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'
import Link from 'next/link'
import { MapPin, Building, ArrowRight, Wrench, Shield, Clock } from 'lucide-react'

export async function generateMetadata() {
  return generateSeoMetadata({
    title: 'Roofing Services Directory - Find Contractors by Service',
    description: 'Browse roofing services including emergency repair, inspection, leak repair, replacement, and maintenance. Find trusted contractors near you.',
    keywords: ['roofing services', 'roof repair', 'emergency roof repair', 'roof inspection', 'roof replacement'],
    canonical: '/services',
  })
}

export default async function ServicesPage() {
  const db = getDb()
  
  // Get all service types
  const servicesList = await db
    .select()
    .from(serviceTypes)
    .orderBy(serviceTypes.name)

  // Get contractor counts for each service using raw SQL
  const serviceCounts = await Promise.all(
    servicesList.map(async (service) => {
      const result = await db.execute(
        sql`
          SELECT COUNT(*) as count 
          FROM contractors 
          WHERE published = true 
          AND EXISTS (
            SELECT 1 
            FROM jsonb_array_elements_text(services_offered) AS s 
            WHERE s = ${service.name}
          )
        `
      )
      
      return {
        ...service,
        contractorCount: Number(result[0]?.count) || 0,
      }
    })
  )

  // ✅ Get top cities with most contractors (from contractors table directly)
  const topCities = await db
    .select({
      cityName: contractors.city,
      citySlug: contractors.citySlug,
      stateName: contractors.state,
      stateSlug: contractors.stateSlug,
      stateAbbr: contractors.state_abbrev,
      contractorCount: sql<number>`COUNT(*)`.as('contractor_count'),
    })
    .from(contractors)
    .where(eq(contractors.published, true))
    .groupBy(
      contractors.city, 
      contractors.citySlug, 
      contractors.state, 
      contractors.stateSlug, 
      contractors.state_abbrev
    )
    .orderBy(sql`contractor_count DESC`)
    .limit(12)

  // Get featured services with contractors
  const featuredServices = serviceCounts
    .filter(s => s.contractorCount > 0)
    .slice(0, 6)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Services</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Roofing Services Directory
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Find trusted roof leak repair contractors offering a wide range of 
          professional roofing services in your area. Compare reviews, get free 
          estimates, and hire the best experts for your needs.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{servicesList.length}</div>
          <div className="text-sm text-gray-600">Services Available</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {serviceCounts.reduce((sum, s) => sum + s.contractorCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Contractors</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {topCities.length}
          </div>
          <div className="text-sm text-gray-600">Cities Covered</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">24/7</div>
          <div className="text-sm text-gray-600">Emergency Service</div>
        </div>
      </div>

      {/* Services Grid */}
      <h2 className="text-2xl font-bold mb-6">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {serviceCounts.map((service) => (
          <Link
            key={service.id}
            href={`/services/${service.slug}`}
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
          >
            <div className="p-6">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {service.icon || '🔧'}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition mb-2">
                {service.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description || `Professional ${service.name.toLowerCase()} services for your roofing needs.`}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {service.contractorCount} {service.contractorCount === 1 ? 'contractor' : 'contractors'}
                </span>
                <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Top Cities Section - ✅ FIXED */}
      <h2 className="text-2xl font-bold mb-6">Top Cities with Roofing Contractors</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
        {topCities.map((city) => (
          <Link
            key={city.citySlug}
            href={`/${city.stateSlug}?city=${city.citySlug}`}
            className="bg-white rounded-lg p-4 hover:shadow-md transition border border-gray-100 hover:border-blue-200 text-center"
          >
            <div className="font-semibold text-gray-900 hover:text-blue-600 transition">
              {city.cityName}
            </div>
            <div className="text-sm text-gray-500">{city.stateAbbr}</div>
            <div className="text-xs text-gray-400 mt-1">
              {Number(city.contractorCount) || 0} contractors
            </div>
          </Link>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-blue-50 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Why Use Our Directory?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Verified Contractors</h3>
            <p className="text-sm text-gray-600">
              All contractors are vetted and verified for quality and reliability.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Trusted Services</h3>
            <p className="text-sm text-gray-600">
              Find professionals specializing in the exact services you need.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">24/7 Emergency</h3>
            <p className="text-sm text-gray-600">
              Get emergency roof repair services available around the clock.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What roofing services are available?
            </h3>
            <p className="text-gray-600 text-sm">
              We offer a comprehensive range of services including emergency 
              repairs, roof inspections, leak repairs, roof replacement, and 
              regular maintenance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How do I find a contractor for my specific service?
            </h3>
            <p className="text-gray-600 text-sm">
              Browse our services listed above, click on the service you need, 
              and find contractors specializing in that specific area.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How do I get an emergency roof repair?
            </h3>
            <p className="text-gray-600 text-sm">
              Look for contractors with the "Emergency Service" badge. They 
              offer 24/7 availability for urgent roof repairs.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Are the contractors verified?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes, all contractors in our directory are verified for quality, 
              licensing, and insurance coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}