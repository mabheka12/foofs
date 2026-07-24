// components/business/BusinessActions.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClaimBusinessButton } from './ClaimBusinessButton'
import { AddBusinessButton } from './AddBusinessButton'
import { Building, User, LogOut } from 'lucide-react'
import Link from 'next/link'

interface BusinessActionsProps {
  variant?: 'navbar' | 'footer' | 'dropdown'
  contractorId?: number
  contractorName?: string
  className?: string
}

export function BusinessActions({ 
  variant = 'navbar',
  contractorId,
  contractorName,
  className = '',
}: BusinessActionsProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) return null

  if (variant === 'navbar') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {user ? (
          <>
            <ClaimBusinessButton 
              contractorId={contractorId}
              contractorName={contractorName}
              variant="link"
              className="text-sm"
            />
            <span className="text-gray-300">|</span>
            <AddBusinessButton 
              variant="link"
              className="text-sm"
            />
            <span className="text-gray-300">|</span>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-blue-600 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              For Contractors
            </Link>
          </>
        )}
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={`space-y-2 ${className}`}>
        <ClaimBusinessButton 
          contractorId={contractorId}
          contractorName={contractorName}
          variant="link"
          className="text-sm text-gray-400 hover:text-white transition"
        />
        <AddBusinessButton 
          variant="link"
          className="text-sm text-gray-400 hover:text-white transition"
        />
        {user && (
          <Link
            href="/dashboard"
            className="block text-sm text-gray-400 hover:text-white transition"
          >
            Dashboard
          </Link>
        )}
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={`py-1 ${className}`}>
        {user ? (
          <>
            <ClaimBusinessButton 
              contractorId={contractorId}
              contractorName={contractorName}
              variant="dropdown"
            />
            <AddBusinessButton variant="dropdown" />
            <hr className="my-1 border-gray-100" />
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 transition font-medium"
            >
              For Contractors
            </Link>
          </>
        )}
      </div>
    )
  }

  return null
}