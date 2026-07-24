// lib/activateAdOrder.ts
//
// Single, idempotent function for turning a verified Paystack payment into
// an activated featured placement. Called from TWO places:
//   1. app/advertise/success/page.tsx -- runs when the advertiser lands
//      back on your site after paying (Paystack's callback_url).
//   2. app/api/webhooks/paystack/route.ts -- safety net in case the user
//      closes their browser before the success page finishes verifying.
//
// Both paths call verifyTransaction() (safe to call repeatedly -- it's a
// read-only check against Paystack) and then this function, which checks
// ad_orders.status before doing anything, so a placement is never granted
// twice for the same payment.

import { getDb } from '@/lib/db'
import { contractors, adOrders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type ActivationResult =
  | { ok: true; alreadyProcessed: boolean }
  | { ok: false; reason: string }

async function verifyTransaction(reference: string): Promise<{ status: string; customerEmail: string | null }> {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  })
  const data = await res.json()
  if (!res.ok || !data.status) {
    throw new Error(data.message || `Paystack verify returned ${res.status}`)
  }
  return {
    status: data.data.status, // 'success' | 'failed' | 'abandoned' etc.
    customerEmail: data.data.customer?.email || null,
  }
}

export async function activateAdOrder(reference: string): Promise<ActivationResult> {
  const db = getDb()

  const existing = await db
    .select({
      id: adOrders.id,
      status: adOrders.status,
      contractorId: adOrders.contractorId,
      scope: adOrders.scope,
      durationMonths: adOrders.durationMonths,
    })
    .from(adOrders)
    .where(eq(adOrders.paystackReference, reference))
    .limit(1)

  const order = existing[0]
  if (!order) {
    // Checkout should always insert a 'pending' row before redirecting to
    // Paystack -- a missing row means either an upstream bug or someone
    // hitting this with a made-up reference.
    return { ok: false, reason: 'unknown_order' }
  }
  if (order.status === 'paid') {
    return { ok: true, alreadyProcessed: true }
  }

  let verification
  try {
    verification = await verifyTransaction(reference)
  } catch (err) {
    console.error('activateAdOrder: verify failed for', reference, err)
    return { ok: false, reason: 'verify_failed' }
  }

  if (verification.status !== 'success') {
    return { ok: false, reason: `payment_status_${verification.status}` }
  }

  const featuredUntil = new Date()
  featuredUntil.setMonth(featuredUntil.getMonth() + order.durationMonths)

  try {
    await db
      .update(adOrders)
      .set({
        status: 'paid',
        customerEmail: verification.customerEmail || undefined,
        featuredUntil,
        paidAt: new Date(),
      })
      .where(eq(adOrders.paystackReference, reference))

    await db
      .update(contractors)
      .set({
        featured: true,
        featuredUntil,
        featuredScope: order.scope,
      })
      .where(eq(contractors.id, order.contractorId))
  } catch (err) {
    console.error('activateAdOrder: DB update failed for', reference, err)
    return { ok: false, reason: 'db_error' }
  }

  return { ok: true, alreadyProcessed: false }
}