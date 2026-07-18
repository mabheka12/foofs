// app/auth/verify-email/page.tsx
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <Mail className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check Your Email
        </h2>
        <p className="text-gray-600 mb-6">
          We've sent you a verification link. Please check your email to confirm your account.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}