// app/api/contractors/[slug]/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const db = getDb()

    const result = await db
      .select({
        id: contractors.id,
        name: contractors.name,
        slug: contractors.slug,
        businessName: contractors.name,
        address: contractors.address,
        city: contractors.city,
        citySlug: contractors.citySlug,
        state: contractors.state,
        stateSlug: contractors.stateSlug,
        stateAbbrev: contractors.state_abbrev,
        phone: contractors.phone,
        website: contractors.website,
        rating: contractors.rating,
        reviewCount: contractors.reviewCount,
        description: contractors.description,
        servicesOffered: contractors.servicesOffered,
        serviceAreas: contractors.serviceAreas,
        openingHours: contractors.openingHours,
        latitude: contractors.latitude,
        longitude: contractors.longitude,
        verified: contractors.verified,
        emergencyService: contractors.emergencyService,
        freeEstimates: contractors.freeEstimates,
        financingAvailable: contractors.financingAvailable,
        warrantyOffered: contractors.warrantyOffered,
        featured: contractors.featured,
        yearsInBusiness: contractors.yearsInBusiness,
        licenseNumber: contractors.licenseNumber,
        insuranceVerified: contractors.insuranceVerified,
        metaTitle: contractors.metaTitle,
        metaDescription: contractors.metaDescription,
        createdAt: contractors.createdAt,
        updatedAt: contractors.updatedAt,
      })
      .from(contractors)
      .where(
        and(
          eq(contractors.slug, slug),
          eq(contractors.published, true)
        )
      )
      .limit(1)

    if (!result.length) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error fetching contractor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractor' },
      { status: 500 }
    )
  }
}