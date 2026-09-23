'use client'

import Link from 'next/link'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

import {
  Building,
  FileEdit,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Star,
  Users,
} from 'lucide-react'

import {
  createClient,
} from '@/lib/supabase/client'


export function AdminNav() {
  const pathname =
    usePathname()

  const router =
    useRouter()

  const supabase =
    createClient()

  const links = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },

    {
      href: '/admin/claims',
      label: 'Claims',
      icon: Users,
    },

    {
      href: '/admin/updates',
      label: 'Profile Updates',
      icon: FileEdit,
    },

    {
      href: '/admin/submissions',
      label: 'Submissions',
      icon: Building,
    },

    {
      href: '/admin/reviews',
      label: 'Reviews',
      icon: Star,
    },

    {
      href: '/admin/ads',
      label: 'Ads',
      icon: Megaphone,
    },
  ]


  async function handleLogout() {
    await supabase.auth.signOut()

    router.push('/')

    router.refresh()
  }


  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">

        <div className="flex min-h-16 items-center justify-between gap-4">

          <div className="flex min-w-0 items-center gap-6">

            <Link
              href="/admin"
              className="shrink-0 text-xl font-bold text-blue-600"
            >
              Admin Panel
            </Link>

            <div className="flex gap-1 overflow-x-auto">

              {links.map(
                (link) => {
                  const Icon =
                    link.icon

                  const active =
                    pathname ===
                      link.href ||
                    (
                      link.href !==
                        '/admin' &&
                      pathname.startsWith(
                        `${link.href}/`
                      )
                    )

                  return (
                    <Link
                      key={
                        link.href
                      }
                      href={
                        link.href
                      }
                      className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />

                      {
                        link.label
                      }
                    </Link>
                  )
                }
              )}
            </div>
          </div>

          <button
            onClick={
              handleLogout
            }
            className="flex shrink-0 items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}