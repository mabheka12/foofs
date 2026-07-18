// app/claim-business/page.tsx
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq, ilike } from 'drizzle-orm'
import { ClaimBusinessForm } from '@/components/business/ClaimBusinessForm'
import Link from 'next/link'
import { Building, Search, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface ClaimBusinessPageProps {
  searchParams: Promise<{
    id?: string
    name?: string
  }>
}

export default async function ClaimBusinessPage({ searchParams }: ClaimBusinessPageProps) {
  const { id, name } = await searchParams
  
  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login?redirect=/claim-business')
  }

  const db = getDb()

  let contractor = null
  let searchResults: any[] = []

  if (id) {
    const result = await db
      .select()
      .from(contractors)
      .where(eq(contractors.id, parseInt(id)))
      .limit(1)
    contractor = result[0] || null
  } else if (name) {
    searchResults = await db
      .select({
        id: contractors.id,
        name: contractors.name,
        city: contractors.city,
        state: contractors.state,
        stateAbbrev: contractors.state_abbrev,
      })
      .from(contractors)
      .where(ilike(contractors.name, `%${name}%`))
      .limit(20)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold">Claim Your Business</h1>
        <p className="text-gray-600">Claim ownership of your business listing to manage your profile and respond to reviews.</p>
      </div>

      {!id && !name && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Search for Your Business
          </h2>
          <form className="flex gap-3">
            <input
              type="text"
              name="name"
              placeholder="Enter your business name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-2">
            Can't find your business?{' '}
            <Link href="/submit-business" className="text-blue-600 hover:underline">
              Submit it here
            </Link>
          </p>
        </div>
      )}

      {name && !id && searchResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Select Your Business</h2>
          <div className="space-y-3">
            {searchResults.map((result) => (
              <Link
                key={result.id}
                href={`/claim-business?id=${result.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition group"
              >
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-600">
                    {result.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {result.city}, {result.state_abbrev}
                  </p>
                </div>
                <span className="text-sm text-blue-600">Claim →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {name && !id && searchResults.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No Business Found</h3>
          <p className="text-gray-600">We couldn't find a business matching "{name}".</p>
          <Link
            href="/submit-business"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            Submit your business →
          </Link>
        </div>
      )}

     {id && contractor && (
  <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
    <div className="mb-6">
      <h2 className="text-xl font-semibold">{contractor.name}</h2>
      <p className="text-gray-500">
        {contractor.city}, {contractor.state}
      </p>
    </div>
    <ClaimBusinessForm
      contractorId={contractor.id}
      contractorName={contractor.name}
    />
  </div>
)}
    </div>
  )
}