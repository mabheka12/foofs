// app/advertise/success/page.tsx
//
// Paystack's callback_url receives ?reference=... (sometimes also
// &trxref=... with the same value) after the advertiser completes or
// abandons payment. This page calls activateAdOrder(), which verifies the
// payment server-to-server against Paystack's API before granting
// anything -- so visiting this URL with a made-up reference does nothing,
// since verification will fail and there's no matching 'pending' order.

import Link from 'next/link'
import { activateAdOrder } from '@/lib/activateAdOrder'

export default async function AdvertiseSuccessPage({
  searchParams,
}: {
  searchParams: { reference?: string; trxref?: string }
}) {
  const reference = searchParams.reference || searchParams.trxref
  const result = reference ? await activateAdOrder(reference) : { ok: false as const, reason: 'missing_reference' }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      {result.ok ? (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">You're all set</h1>
          <p className="text-gray-600 mb-8">
            Payment received — your featured placement is now active and should appear
            on the site within a few minutes.
          </p>
        </>
      ) : (
        <>
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">We couldn't confirm that payment</h1>
          <p className="text-gray-600 mb-8">
            {result.reason === 'missing_reference'
              ? "We didn't receive a payment reference back from Paystack. If you completed a payment, it may still be processing."
              : "Something didn't go through as expected. If you were charged, contact us and we'll sort it out right away."}
          </p>
        </>
      )}
      <div className="flex gap-4 justify-center">
        <Link href="/" className="text-blue-600 hover:underline">Back to homepage</Link>
        <Link href="/contact" className="text-blue-600 hover:underline">Contact support</Link>
      </div>
    </div>
  )
}