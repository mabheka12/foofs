// app/submit-business/page.tsx
import SubmitBusinessForm from '@/components/business/SubmitBusinessForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SubmitBusinessPage() {
  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login?redirect=/submit-business')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold">Add Your Business</h1>
        <p className="text-gray-600">
          Submit your roofing business to be listed in our directory.
          <Link href="/claim-business" className="ml-2 text-blue-600 hover:underline">
            Already listed? Claim it instead →
          </Link>
        </p>
      </div>

      <SubmitBusinessForm />
    </div>
  )
}