// app/api/admin/ad-orders/[id]/refund/route.ts
//
// Records that a refund happened (issued separately in Paystack) and
// un-features the contractor. Does NOT call Paystack's refund API --
// deliberately manual so a refund always involves a conscious look at
// the Paystack dashboard, not a single click moving real money.

import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'
import { adOrders, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.redirect(new URL('/auth/login', request.url), 303)
  }

  const orderId = Number(params.id)
  if (!Number.isInteger(orderId)) {
    return NextResponse.redirect(new URL('/admin/ads', request.url), 303)
  }

  const db = getDb()
  const rows = await db
    .select({ id: adOrders.id, contractorId: adOrders.contractorId, status: adOrders.status })
    .from(adOrders)
    .where(eq(adOrders.id, orderId))
    .limit(1)

  const order = rows[0]
  if (order && order.status === 'paid') {
    await db.update(adOrders).set({ status: 'refunded' }).where(eq(adOrders.id, orderId))
    await db.update(contractors).set({ featured: false }).where(eq(contractors.id, order.contractorId))
  }

  return NextResponse.redirect(new URL('/admin/ads', request.url), 303)
}