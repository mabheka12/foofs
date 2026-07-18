// components/auth/AuthButton.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </div>
    )
  }

  const isAdmin = user.email?.includes('admin') || user.email === 'admin@roofleakrepaird.com'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
          {user.email?.[0].toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden md:inline">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition w-full border-t border-gray-100"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}