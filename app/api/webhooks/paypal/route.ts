// app/api/webhooks/paypal/route.ts
//
// Safety net only. The primary activation path is the success page
// capturing the order directly when the user returns from PayPal. This
// webhook exists for the case where that never happens (browser closed,
// network dropped, etc.) -- PayPal will still tell us the payment went
// through via CHECKOUT.ORDER.APPROVED or PAYMENT.CAPTURE.COMPLETED.
//
// Configure in the PayPal developer dashboard: webhook endpoint pointing
// at https://yourdomain.com/api/webhooks/paypal, subscribed to at least
// CHECKOUT.ORDER.APPROVED. Copy the Webhook ID into PAYPAL_WEBHOOK_ID.

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paypal'
import { activateAdOrder } from '@/lib/activateAdOrder'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  let verified = false
  try {
    verified = await verifyWebhookSignature(request.headers, rawBody)
  } catch (err) {
    console.error('PayPal webhook verification error:', err)
  }

  if (!verified) {
    return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)

  if (event.event_type !== 'CHECKOUT.ORDER.APPROVED' && event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
    return NextResponse.json({ received: true })
  }

  // Both event types carry the order id, just at slightly different paths.
  const orderId: string | undefined = event.resource?.id
    ? event.event_type === 'CHECKOUT.ORDER.APPROVED'
      ? event.resource.id
      : event.resource?.supplementary_data?.related_ids?.order_id
    : undefined

  if (!orderId) {
    console.error('PayPal webhook: could not extract order id from event', event.event_type)
    return NextResponse.json({ received: true, warning: 'no_order_id' })
  }

  const result = await activateAdOrder(orderId)
  if (!result.ok) {
    console.error('PayPal webhook: activation failed for order', orderId, result.reason)
    // Acknowledge anyway for reasons that will never succeed on retry;
    // let PayPal retry for transient ones.
    if (result.reason === 'unknown_order' || result.reason === 'malformed_metadata') {
      return NextResponse.json({ received: true, warning: result.reason })
    }
    return NextResponse.json({ error: result.reason }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}