// app/api/webhooks/paystack/route.ts
//
// Safety net only -- the primary activation path is the success page
// verifying the transaction directly when the advertiser returns from
// Paystack. This exists for the case where that never happens (browser
// closed, network dropped, etc.).
//
// NOTE per our conversation: if you already have a shared Paystack
// webhook endpoint elsewhere (routing by metadata.project, matching the
// pattern in your other project's api/paystack/route.ts), you may not
// need this file at all -- just make sure that shared handler checks for
// metadata.project === 'roofernet' and calls activateAdOrder() from this
// project (or an equivalent) when it sees that. This file is here as a
// self-contained fallback in case this project doesn't share that endpoint.
//
// Configure in the Paystack dashboard (Settings -> API Keys & Webhooks):
// webhook URL = https://yourdomain.com/api/webhooks/paystack

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activateAdOrder } from '@/lib/activateAdOrder'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Paystack not configured.' }, { status: 500 })
  }

  const signature = request.headers.get('x-paystack-signature')
  const rawBody = await request.text()

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  }

  const expectedSignature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expectedSignature)
  const verified = sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)

  if (!verified) {
    console.error('Paystack webhook: signature verification failed')
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)

  // Only act on events for this project -- relevant if you do end up
  // pointing a shared Paystack account's webhook at multiple apps.
  if (event.data?.metadata?.project && event.data.metadata.project !== 'roofernet') {
    return NextResponse.json({ received: true })
  }

  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true })
  }

  const reference = event.data?.reference
  if (!reference) {
    console.error('Paystack webhook: charge.success event missing reference')
    return NextResponse.json({ received: true, warning: 'no_reference' })
  }

  const result = await activateAdOrder(reference)
  if (!result.ok) {
    console.error('Paystack webhook: activation failed for', reference, result.reason)
    if (result.reason === 'unknown_order') {
      // Will never succeed on retry -- acknowledge so Paystack stops resending.
      return NextResponse.json({ received: true, warning: result.reason })
    }
    return NextResponse.json({ error: result.reason }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}