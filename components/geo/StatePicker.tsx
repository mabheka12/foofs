// components/geo/StatePicker.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { STATES } from '@/data/states'

export function StatePicker() {
  const router = useRouter()
  const [selectedState, setSelectedState] = useState('')

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value
    if (slug) {
      router.push(`/${slug}`)
    }
  }

  return (
    <select
      value={selectedState}
      onChange={handleStateChange}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
    >
      <option value="">Select a State</option>
      {STATES.map((state) => (
        <option key={state.slug} value={state.slug}>
          {state.name}
        </option>
      ))}
    </select>
  )
}