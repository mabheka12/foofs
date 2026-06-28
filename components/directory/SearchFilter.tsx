// Example: components/directory/SearchFilter.tsx (Using toast)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Use-Toast'

export function SearchFilter() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) {
      toast({
        title: 'Please enter a location',
        description: 'Enter a city or zip code to find contractors near you.',
        variant: 'warning',
      })
      return
    }

    setIsLoading(true)
    
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('q', searchTerm)
      if (serviceType) params.set('service', serviceType)
      
      await router.push(`/search?${params.toString()}`)
    } catch (error) {
      toast({
        title: 'Search failed',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
      <input
        type="text"
        placeholder="Enter city or zip code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        disabled={isLoading}
      />
      <select
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value)}
        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        disabled={isLoading}
      >
        <option value="">All Services</option>
        <option value="emergency">Emergency Repair</option>
        <option value="inspection">Roof Inspection</option>
        <option value="repair">General Repair</option>
        <option value="replacement">Roof Replacement</option>
        <option value="maintenance">Maintenance</option>
      </select>
      <button
        type="submit"
        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}