// app/api/checkout/route.ts
//
// Follows the same shape as your other project's api/paystack/route.ts
// (initialize -> redirect to authorization_url), adapted for this app's
// contractor/scope/duration model. Same validation posture as before:
// price is always recomputed server-side from lib/pricing.ts (in USD),
// then converted to ZAR right before calling Paystack -- the client never
// sends or sees a price it could tamper with.
//
// Paystack requires an email to initialize a transaction (PayPal didn't --
// it collects that during its own checkout), so this route now takes
// `email` in the request body. See AdvertiseForm.tsx for the added field.

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { contractors, adOrders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isValidDuration, isValidScope, priceFor } from '@/lib/pricing'
import { getUsdToZarRate } from '@/lib/currency'

export async function POST(request: NextRequest) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const contractorId = Number(body.contractorId)
  const scope = body.scope
  const duration = Number(body.duration)
  const stateAbbrev = typeof body.stateAbbrev === 'string' ? body.stateAbbrev.toUpperCase() : undefined
  const email = typeof body.email === 'string' ? body.email.trim() : ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }
  if (!Number.isInteger(contractorId) || contractorId <= 0) {
    return NextResponse.json({ error: 'Missing or invalid contractorId.' }, { status: 400 })
  }
  if (!isValidScope(scope)) {
    return NextResponse.json({ error: 'Invalid scope.' }, { status: 400 })
  }
  if (!isValidDuration(duration)) {
    return NextResponse.json({ error: 'Invalid duration.' }, { status: 400 })
  }
  if (scope === 'state' && (!stateAbbrev || stateAbbrev.length !== 2)) {
    return NextResponse.json({ error: 'A state is required for a state-scoped placement.' }, { status: 400 })
  }

  const db = getDb()
  const rows = await db
    .select({ id: contractors.id, name: contractors.name, stateAbbrev: contractors.state_abbrev, published: contractors.published })
    .from(contractors)
    .where(eq(contractors.id, contractorId))
    .limit(1)

  const contractor = rows[0]
  if (!contractor || !contractor.published) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }
  if (scope === 'state' && contractor.stateAbbrev !== stateAbbrev) {
    return NextResponse.json({ error: "That state doesn't match this listing." }, { status: 400 })
  }

  const amountUsdCents = priceFor(scope, duration as 1 | 3 | 12)
  const usdToZarRate = await getUsdToZarRate()
  const amountZarCents = Math.round((amountUsdCents / 100) * usdToZarRate * 100)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
  // Our own reference, generated up front, so we can record the pending
  // order before redirecting and match it back up on return/webhook.
  const reference = `ad_${contractor.id}_${Date.now()}`

  let paystackData: any
  try {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountZarCents, // Paystack wants the smallest currency unit
        currency: 'ZAR',
        reference,
        callback_url: `${siteUrl}/advertise/success`,
        metadata: {
          project: 'roofernet',
          contractorId: contractor.id,
          scope,
          stateAbbrev: scope === 'state' ? stateAbbrev : null,
          durationMonths: duration,
        },
      }),
    })
    paystackData = await res.json()
    if (!res.ok || !paystackData.status) {
      throw new Error(paystackData.message || `Paystack returned ${res.status}`)
    }
  } catch (err) {
    console.error('Paystack initialize failed:', err)
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 })
  }

  try {
    await db.insert(adOrders).values({
      contractorId: contractor.id,
      paystackReference: reference,
      customerEmail: email,
      scope,
      stateAbbrev: scope === 'state' ? stateAbbrev! : null,
      durationMonths: duration,
      amountUsdCents,
      amountZarCents,
      usdToZarRate: usdToZarRate.toString(),
      status: 'pending',
    })
  } catch (err) {
    console.error('Failed to record pending ad_order:', err)
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ url: paystackData.data.authorization_url })
}