// app/api/admin/ad-orders/[id]/extend/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'
import { adOrders, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    const { id } = await params;
    return NextResponse.redirect(new URL('/auth/login', request.url), 303)
  }

  const { id } = await params
  const orderId = Number(id)
  if (!Number.isInteger(orderId)) {
    return NextResponse.redirect(new URL('/admin/ads', request.url), 303)
  }

  const db = getDb()
  const rows = await db
    .select({ id: adOrders.id, contractorId: adOrders.contractorId, status: adOrders.status, featuredUntil: adOrders.featuredUntil })
    .from(adOrders)
    .where(eq(adOrders.id, orderId))
    .limit(1)

  const order = rows[0]
  if (order && order.status === 'paid') {
    const base = order.featuredUntil && new Date(order.featuredUntil) > new Date() ? new Date(order.featuredUntil) : new Date()
    const newFeaturedUntil = new Date(base)
    newFeaturedUntil.setMonth(newFeaturedUntil.getMonth() + 1)

    await db.update(adOrders).set({ featuredUntil: newFeaturedUntil }).where(eq(adOrders.id, orderId))
    await db
      .update(contractors)
      .set({ featured: true, featuredUntil: newFeaturedUntil })
      .where(eq(contractors.id, order.contractorId))
  }

  return NextResponse.redirect(new URL('/admin/ads', request.url), 303)
}