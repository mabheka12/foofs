// app/advertise/page.tsx
import Link from 'next/link'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { AdvertiseForm } from '@/components/advertise/AdvertiseForm'

export const metadata = generateSeoMetadata({
  title: 'Advertise Your Roofing Business - Featured Placements',
  description: 'Get your roofing business featured on the homepage or your state page. More visibility, more leads.',
  keywords: ['advertise roofing business', 'featured roofing contractor', 'roofing leads'],
  canonical: '/advertise',
})

export default function AdvertisePage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Advertise</span>
      </nav>

      {searchParams.status === 'cancelled' && (
        <div className="mb-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3">
          Checkout was cancelled — no charge was made. You can pick up right where you left off below.
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get Featured</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Stand out at the top of the page. Featured listings get priority placement
          on the homepage or your state's page, ahead of the regular directory results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">National</h2>
          <p className="text-sm text-gray-600">
            Featured on the homepage, seen by every visitor regardless of which state they're browsing.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Single State</h2>
          <p className="text-sm text-gray-600">
            Featured on your state's page — lower cost, still puts you ahead of the
            competition for homeowners actually searching in your area.
          </p>
        </div>
      </div>

      <AdvertiseForm />

      <p className="text-xs text-gray-400 text-center mt-6">
        Payments are processed securely by Paypal. Cards are never stored on our servers.
      </p>
    </div>
  )
}