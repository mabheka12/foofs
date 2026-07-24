// app/admin/ads/page.tsx
//
// Uses your existing isAdmin() from lib/admin.ts -- this page enforces
// its own check rather than relying solely on middleware, matching the
// belt-and-suspenders approach worth using given the middleware gap
// flagged earlier (it currently only checks for *any* logged-in user).

import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { getDb } from '@/lib/db'
import { adOrders, contractors } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { formatUsd } from '@/lib/pricing'

async function getDashboardData() {
  const db = getDb()

  const orders = await db
    .select({
      id: adOrders.id,
      contractorId: adOrders.contractorId,
      contractorName: contractors.name,
      scope: adOrders.scope,
      stateAbbrev: adOrders.stateAbbrev,
      durationMonths: adOrders.durationMonths,
      amountUsdCents: adOrders.amountUsdCents,
      amountZarCents: adOrders.amountZarCents,
      status: adOrders.status,
      customerEmail: adOrders.customerEmail,
      featuredUntil: adOrders.featuredUntil,
      createdAt: adOrders.createdAt,
      paidAt: adOrders.paidAt,
    })
    .from(adOrders)
    .leftJoin(contractors, eq(adOrders.contractorId, contractors.id))
    .orderBy(desc(adOrders.createdAt))
    .limit(200)

  const revenueResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${adOrders.amountUsdCents}), 0)` })
    .from(adOrders)
    .where(eq(adOrders.status, 'paid'))

  const activeResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(contractors)
    .where(sql`${contractors.featured} = true AND ${contractors.featuredUntil} > now()`)

  const expiringResult = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      featuredUntil: contractors.featuredUntil,
      featuredScope: contractors.featuredScope,
      stateAbbrev: contractors.state_abbrev,
    })
    .from(contractors)
    .where(sql`${contractors.featured} = true AND ${contractors.featuredUntil} BETWEEN now() AND now() + interval '7 days'`)
    .orderBy(contractors.featuredUntil)

  return {
    orders,
    totalRevenueCents: Number(revenueResult[0]?.total || 0),
    activeCount: Number(activeResult[0]?.count || 0),
    expiringSoon: expiringResult,
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-50 text-green-700',
    pending: 'bg-amber-50 text-amber-700',
    failed: 'bg-red-50 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

export default async function AdminAdsPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/auth/login?redirect=/admin/ads')

  const { orders, totalRevenueCents, activeCount, expiringSoon } = await getDashboardData()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Ad Orders</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500">Total revenue (paid orders, USD)</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{formatUsd(totalRevenueCents)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500">Currently active placements</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500">Expiring in the next 7 days</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{expiringSoon.length}</div>
        </div>
      </div>

      {/* Expiring soon */}
      {expiringSoon.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Expiring soon</h2>
          <div className="bg-white rounded-xl shadow divide-y">
            {expiringSoon.map((c: (typeof expiringSoon)[number]) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    {c.featuredScope === 'national' ? 'National' : `State (${c.stateAbbrev})`} · expires{' '}
                    {c.featuredUntil ? new Date(c.featuredUntil).toLocaleDateString() : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders table */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">All orders</h2>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Contractor</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Amount (USD)</th>
              <th className="px-4 py-3">Charged (ZAR)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured until</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o: (typeof orders)[number]) => (
              <tr key={o.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{o.contractorName || `#${o.contractorId}`}</div>
                  {o.customerEmail && <div className="text-xs text-gray-400">{o.customerEmail}</div>}
                </td>
                <td className="px-4 py-3">{o.scope === 'national' ? 'National' : o.stateAbbrev}</td>
                <td className="px-4 py-3">{o.durationMonths}mo</td>
                <td className="px-4 py-3">{formatUsd(o.amountUsdCents)}</td>
                <td className="px-4 py-3 text-gray-500">R{(o.amountZarCents / 100).toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3">{o.featuredUntil ? new Date(o.featuredUntil).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {o.status === 'paid' && (
                    <div className="flex gap-3">
                      <form action={`/api/admin/ad-orders/${o.id}/extend`} method="POST">
                        <button type="submit" className="text-blue-600 hover:underline text-xs">+1mo</button>
                      </form>
                      <form action={`/api/admin/ad-orders/${o.id}/refund`} method="POST">
                        <button type="submit" className="text-red-600 hover:underline text-xs">Mark refunded</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        "Mark refunded" reflects a refund you've already issued in Paystack — it does not itself send money back.
        "+1mo" extends the featured_until date, useful for manual comps or goodwill extensions.
      </p>
    </div>
  )
}