// app/api/search/route.ts
import { NextResponse } from 'next/server'
import {
  and,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from 'drizzle-orm'

import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 50

function parsePositiveInteger(
  value: string | null,
  fallback: number
) {
  const parsed = Number.parseInt(value || '', 10)

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseMinimumRating(value: string | null) {
  if (!value) return null

  const parsed = Number(value)

  if (
    !Number.isFinite(parsed) ||
    parsed < 0 ||
    parsed > 5
  ) {
    return null
  }

  return parsed
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const query =
      searchParams.get('q')?.trim().slice(0, 100) ||
      ''

    const city =
      searchParams
        .get('city')
        ?.trim()
        .slice(0, 100) || ''

    const state =
      searchParams
        .get('state')
        ?.trim()
        .slice(0, 100) || ''

    const minRating = parseMinimumRating(
      searchParams.get('minRating')
    )

    const page = parsePositiveInteger(
      searchParams.get('page'),
      1
    )

    const requestedLimit = parsePositiveInteger(
      searchParams.get('limit'),
      DEFAULT_LIMIT
    )

    const limit = Math.min(
      requestedLimit,
      MAX_LIMIT
    )

    const offset = (page - 1) * limit
    const db = getDb()

    const conditions: SQL[] = [
      eq(contractors.published, true),
    ]

    /*
     * General search:
     * business name, city, state, abbreviation, address and phone.
     *
     * Description is omitted because almost every description is NULL.
     */
    if (query) {
      const queryPattern = `%${query}%`
      const querySlug = normalizeSlug(query)

      const queryCondition = or(
        ilike(contractors.name, queryPattern),
        ilike(contractors.city, queryPattern),
        ilike(contractors.state, queryPattern),
        ilike(
          contractors.state_abbrev,
          queryPattern
        ),
        ilike(contractors.address, queryPattern),
        ilike(contractors.phone, queryPattern),

        querySlug
          ? eq(
              contractors.citySlug,
              querySlug
            )
          : undefined,

        querySlug
          ? eq(
              contractors.stateSlug,
              querySlug
            )
          : undefined
      )

      if (queryCondition) {
        conditions.push(queryCondition)
      }
    }

    /*
     * City filter accepts either a readable city name or a slug.
     */
    if (city) {
      const citySlug = normalizeSlug(city)

      const cityCondition = or(
        ilike(contractors.city, `%${city}%`),

        citySlug
          ? eq(
              contractors.citySlug,
              citySlug
            )
          : undefined
      )

      if (cityCondition) {
        conditions.push(cityCondition)
      }
    }

    /*
     * State filter accepts:
     * TX, Texas or texas.
     */
    if (state) {
      const normalizedState = state.toUpperCase()
      const stateSlug = normalizeSlug(state)

      const stateCondition = or(
        eq(
          contractors.state_abbrev,
          normalizedState
        ),
        ilike(contractors.state, state),
        stateSlug
          ? eq(
              contractors.stateSlug,
              stateSlug
            )
          : undefined
      )

      if (stateCondition) {
        conditions.push(stateCondition)
      }
    }

    if (minRating !== null && minRating > 0) {
      conditions.push(
        sql`${contractors.rating} >= ${minRating}`
      )
    }

    const whereClause = and(...conditions)

    const [results, countResult] =
      await Promise.all([
        db
          .select({
            id: contractors.id,
            name: contractors.name,
            slug: contractors.slug,
            description:
              contractors.description,
            address: contractors.address,
            phone: contractors.phone,
            website: contractors.website,
            rating: contractors.rating,
            reviewCount:
              contractors.reviewCount,
            city: contractors.city,
            citySlug: contractors.citySlug,
            state: contractors.state,
            stateSlug: contractors.stateSlug,
            stateAbbrev:
              contractors.state_abbrev,
            latitude: contractors.latitude,
            longitude: contractors.longitude,
            openingHours:
              contractors.openingHours,
            verified: contractors.verified,
            featured: contractors.featured,
            emergencyService:
              contractors.emergencyService,
            insuranceVerified:
              contractors.insuranceVerified,
            freeEstimates:
              contractors.freeEstimates,
            financingAvailable:
              contractors.financingAvailable,
            warrantyOffered:
              contractors.warrantyOffered,
          })
          .from(contractors)
          .where(whereClause)
          .orderBy(
            sql`${contractors.rating} DESC NULLS LAST`,
            sql`${contractors.reviewCount} DESC NULLS LAST`,
            contractors.name,
            contractors.id
          )
          .limit(limit)
          .offset(offset),

        db
          .select({
            total: sql<number>`COUNT(*)`,
          })
          .from(contractors)
          .where(whereClause),
      ])

    const total = Number(
      countResult[0]?.total || 0
    )

    const totalPages = Math.max(
      1,
      Math.ceil(total / limit)
    )

    return NextResponse.json(
      {
        results,
        total,
        page,
        limit,
        totalPages,
      },
      {
        headers: {
          'Cache-Control':
            'private, no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    console.error('Search API error:', error)

    return NextResponse.json(
      {
        results: [],
        total: 0,
        error:
          'Search could not be completed.',
      },
      {
        status: 500,
        headers: {
          'Cache-Control':
            'private, no-store, max-age=0',
        },
      }
    )
  }
}