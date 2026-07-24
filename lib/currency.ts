// lib/currency.ts
//
// Ported from your other project's utility, same pattern. Pricing in this
// app is always defined and DISPLAYED in USD (lib/pricing.ts) -- this is
// only used server-side, right before calling Paystack, to convert the
// USD charge amount into ZAR (since the Paystack account here settles in
// ZAR). The advertiser never sees a ZAR figure anywhere in the UI.

let cachedRate = 18
let lastFetch = 0

export async function getUsdToZarRate(): Promise<number> {
  const ONE_HOUR = 60 * 60 * 1000
  if (Date.now() - lastFetch < ONE_HOUR) {
    return cachedRate
  }
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=ZAR', { cache: 'no-store' })
    const data = await res.json()
    const rate = data?.rates?.ZAR
    if (!rate) throw new Error('No rate')
    cachedRate = rate
    lastFetch = Date.now()
    return rate
  } catch (err) {
    console.log('⚠️ fallback:', err)
    return cachedRate
  }
}

/**
 * Converts a USD amount (in cents) to ZAR (in cents/kobo-equivalent, i.e.
 * the smallest unit Paystack expects) using the current rate.
 */
export async function usdCentsToZarCents(usdCents: number): Promise<number> {
  const rate = await getUsdToZarRate()
  const usd = usdCents / 100
  const zar = usd * rate
  return Math.round(zar * 100)
}