// lib/pricing.ts
//
// Single source of truth for ad pricing. The checkout route recomputes the
// price from this file server-side using only (scope, durationMonths) --
// it NEVER trusts a price sent from the client. Adjust these numbers to
// whatever your market will bear; nothing else needs to change.

export type Scope = 'national' | 'state'
export type Duration = 1 | 3 | 12

export const PRICING: Record<Scope, Record<Duration, number>> = {
  // cents
  national: { 1: 19900, 3: 49900, 12: 149900 }, // $199 / $166mo / $125mo
  state: { 1: 7900, 3: 19900, 12: 59900 },       // $79 / $66mo / $50mo
}

export const SCOPE_LABEL: Record<Scope, string> = {
  national: 'National — featured on the homepage',
  state: 'Single state — featured on that state\'s page',
}

export const DURATION_LABEL: Record<Duration, string> = {
  1: '1 month',
  3: '3 months (save ~17%)',
  12: '12 months (save ~37%)',
}

export function priceFor(scope: Scope, duration: Duration): number {
  return PRICING[scope][duration]
}

export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function isValidScope(v: unknown): v is Scope {
  return v === 'national' || v === 'state'
}

export function isValidDuration(v: unknown): v is Duration {
  return v === 1 || v === 3 || v === 12
}