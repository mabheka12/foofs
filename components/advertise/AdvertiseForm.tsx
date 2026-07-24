// components/advertise/AdvertiseForm.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { DURATION_LABEL, SCOPE_LABEL, formatUsd, priceFor, type Duration, type Scope } from '@/lib/pricing'

type SearchResult = { id: number; name: string; city: string | null; stateAbbrev: string | null; slug: string }

export function AdvertiseForm() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [scope, setScope] = useState<Scope>('state')
  const [duration, setDuration] = useState<Duration>(1)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/contractors/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch {
        setResults([])
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function selectContractor(c: SearchResult) {
    setSelected(c)
    setResults([])
    setQuery(`${c.name} — ${c.city}, ${c.stateAbbrev}`)
  }

  async function handleCheckout() {
    if (!selected) {
      setError('Search for and select your listing first.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email — your receipt and placement confirmation go there.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorId: selected.id,
          scope,
          duration,
          stateAbbrev: scope === 'state' ? selected.stateAbbrev : undefined,
          email,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || 'Something went wrong starting checkout.')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Something went wrong starting checkout.')
      setLoading(false)
    }
  }

  const price = priceFor(scope, duration)

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
      {/* Step 1: find the listing */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">1. Find your listing</h3>
        <p className="text-sm text-gray-500 mb-3">Search by business name or city.</p>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(null)
            }}
            placeholder="e.g. Alabama Roof RX, or Pelham"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {results.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => selectContractor(r)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-sm text-gray-500">{r.city}, {r.stateAbbrev}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {selected && (
          <p className="text-sm text-green-700 mt-2">
            Selected: <strong>{selected.name}</strong> ({selected.city}, {selected.stateAbbrev})
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Don't see your business?{' '}
          <a href="/contact" className="text-blue-600 hover:underline">Contact us</a> to get listed first.
        </p>
      </div>

      {/* Step 2: scope */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">2. Choose where you're featured</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(['state', 'national'] as Scope[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                scope === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900 capitalize">{s === 'national' ? 'National' : 'Single State'}</div>
              <div className="text-xs text-gray-500 mt-1">{SCOPE_LABEL[s]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: duration */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">3. Choose duration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {([1, 3, 12] as Duration[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                duration === d ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{DURATION_LABEL[d]}</div>
              <div className="text-sm text-gray-600 mt-1">{formatUsd(priceFor(scope, d))}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 4: email (required by Paystack to initialize a transaction) */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">4. Your email</h3>
        <p className="text-sm text-gray-500 mb-3">Your receipt and placement confirmation go here.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Summary + checkout */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Total</span>
          <span className="text-2xl font-bold text-gray-900">{formatUsd(price)}</span>
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || !selected}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Redirecting to payment…' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  )
}