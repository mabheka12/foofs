// lib/queries/getFeaturedContractors.ts
//
// Returns up to `limit` contractors for a "Featured" section:
//   1. Paid, currently-active sponsored placements (featured=true AND
//      featured_until in the future), highest rating first. Which rows
//      qualify depends on scope:
//        - Homepage call (no stateAbbrev arg): only featured_scope='national'
//          purchases show as sponsored. A state-only purchase shouldn't
//          hog a homepage slot it wasn't paid for.
//        - State-page call (stateAbbrev arg given): only featured_scope='state'
//          purchases FOR THAT STATE show as sponsored. A national purchase
//          is homepage-only, not "sponsored on every state page" -- that'd
//          show an out-of-state contractor as sponsored somewhere unrelated
//          to their business, which would look broken to visitors.
//   2. Backfilled with the best organic contractors, ranked by rating
//      weighted by review volume -- so a 5.0 with 3 reviews doesn't
//      outrank a 4.8 with 200.
//
// Never returns an empty array unless the published contractor pool
// itself is empty, so the UI never has to show "no contractors available".

import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { and, desc, eq, gt, isNotNull, notInArray, sql } from 'drizzle-orm'

export type FeaturedContractor = {
  id: number
  name: string
  slug: string
  city: string | null
  state: string | null
  stateAbbrev: string | null
  rating: number | null
  reviewCount: number | null
  verified: boolean | null
  emergencyService: boolean | null
  isSponsored: boolean
}

const SELECT_FIELDS = {
  id: contractors.id,
  name: contractors.name,
  slug: contractors.slug,
  city: contractors.city,
  state: contractors.state,
  stateAbbrev: contractors.state_abbrev,
  rating: contractors.rating,
  reviewCount: contractors.reviewCount,
  verified: contractors.verified,
  emergencyService: contractors.emergencyService,
} as const

/**
 * @param limit    total cards to return (sponsored + backfill combined)
 * @param stateAbbrev  optional -- pass to scope this to one state (e.g. for
 *                     a state-page "Featured in Texas" section). Omit for
 *                     a nationwide/homepage section.
 */
export async function getFeaturedContractors(
  limit = 8,
  stateAbbrev?: string
): Promise<FeaturedContractor[]> {
  const db = getDb()
  const now = new Date()

  const locationFilter = stateAbbrev ? eq(contractors.state_abbrev, stateAbbrev) : undefined

  // Legacy rows with featured=true but no featured_scope set (from before
  // this column existed) are treated as national, so nothing that was
  // already featured silently disappears from the homepage.
  const sponsoredScopeFilter = stateAbbrev
    ? and(eq(contractors.featuredScope, 'state'), eq(contractors.state_abbrev, stateAbbrev))
    : sql`(${contractors.featuredScope} = 'national' OR ${contractors.featuredScope} IS NULL)`

  // --- 1. Paid, currently-active sponsored placements ---------------------
  const sponsored = await db
    .select(SELECT_FIELDS)
    .from(contractors)
    .where(
      and(
        eq(contractors.published, true),
        eq(contractors.featured, true),
        isNotNull(contractors.featuredUntil),
        gt(contractors.featuredUntil, now),
        sponsoredScopeFilter
      )
    )
    .orderBy(desc(contractors.rating))
    .limit(limit)

  const remaining = limit - sponsored.length
  if (remaining <= 0) {
    return sponsored.map((c: (typeof sponsored)[number]) => ({
      ...c,
      rating: c.rating === null ? null : Number(c.rating),
      isSponsored: true,
    }))
  }

  // --- 2. Algorithmic backfill ---------------------------------------------
  // rating * ln(reviewCount + 1): rewards genuinely well-reviewed
  // contractors over a handful of 5-star ratings with no real volume behind them.
  // Backfill is scoped by location only (not featured_scope) -- it's just
  // "best contractors in this location", regardless of anyone's ad purchase.
  const score = sql<number>`COALESCE(${contractors.rating}, 0) * LN(COALESCE(${contractors.reviewCount}, 0) + 1)`
  const sponsoredIds = sponsored.map((c: (typeof sponsored)[number]) => c.id)

  const filler = await db
    .select(SELECT_FIELDS)
    .from(contractors)
    .where(
      and(
        eq(contractors.published, true),
        isNotNull(contractors.rating),
        sponsoredIds.length > 0 ? notInArray(contractors.id, sponsoredIds) : undefined,
        locationFilter
      )
    )
    .orderBy(desc(score))
    .limit(remaining)

  return [
    ...sponsored.map((c: (typeof sponsored)[number]) => ({
      ...c,
      rating: c.rating === null ? null : Number(c.rating),
      isSponsored: true,
    })),
    ...filler.map((c: (typeof filler)[number]) => ({
      ...c,
      rating: c.rating === null ? null : Number(c.rating),
      isSponsored: false,
    })),
  ]
}
