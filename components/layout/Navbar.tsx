// components/layout/Navbar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, Phone, MapPin, ChevronDown } from 'lucide-react'

interface NavbarProps {
  states?: { name: string; slug: string }[]
}

export default function Navbar({ states = [] }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isStatesOpen, setIsStatesOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setIsStatesOpen(false)
  }, [pathname])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Check if route is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  // Handle mouse enter with clear timeout
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsStatesOpen(true)
  }

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsStatesOpen(false)
    }, 200) // 200ms delay to allow moving to dropdown
  }

  // Handle state link click
  const handleStateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLAnchorElement
    const href = target.getAttribute('href')
    if (href) {
      setIsStatesOpen(false)
      window.location.href = href
    }
  }

  // Top states for dropdown
  const topStates = states.slice(0, 12)

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg'
          : 'bg-white/95 backdrop-blur-sm shadow-sm'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Home">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-700 transition">
              R
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                RoofLeak
              </span>
              <span className="text-sm text-gray-500 block -mt-1">Repair Directory</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                isActive('/') && pathname === '/'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>

            {/* States Dropdown - Fixed */}
            <div 
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 text-sm font-medium transition ${
                  isActive('/states')
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                aria-expanded={isStatesOpen}
                aria-haspopup="true"
              >
                States
                <ChevronDown className={`w-4 h-4 transition-transform ${isStatesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
                  role="menu"
                >
                  <div className="max-h-96 overflow-y-auto">
                    {topStates.map((state) => (
                      <Link
                        key={state.slug}
                        href={`/${state.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        role="menuitem"
                        onClick={() => setIsStatesOpen(false)}
                      >
                        {state.name}
                      </Link>
                    ))}
                    {states.length > 12 && (
                      <Link
                        href="/states"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-100 mt-1 pt-2"
                        role="menuitem"
                        onClick={() => setIsStatesOpen(false)}
                      >
                        View All 50 States →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/services"
              className={`text-sm font-medium transition ${
                isActive('/services')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Services
            </Link>

            <Link
              href="/blog"
              className={`text-sm font-medium transition ${
                isActive('/blog')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Blog
            </Link>

            <Link
              href="/about"
              className={`text-sm font-medium transition ${
                isActive('/about')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>  
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <Link
              href="/"
              className={`block py-2 text-sm font-medium transition ${
                isActive('/') && pathname === '/'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-700 py-1">States</div>
              <div className="grid grid-cols-2 gap-1 pl-2">
                {topStates.slice(0, 8).map((state) => (
                  <Link
                    key={state.slug}
                    href={`/${state.slug}`}
                    className="py-1.5 text-sm text-gray-600 hover:text-blue-600 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    {state.name}
                  </Link>
                ))}
              </div>
              {states.length > 8 && (
                <Link
                  href="/states"
                  className="block py-1.5 text-sm text-blue-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View All States →
                </Link>
              )}
            </div>

            <Link
              href="/services"
              className={`block py-2 text-sm font-medium transition ${
                isActive('/services')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>

            <Link
              href="/blog"
              className={`block py-2 text-sm font-medium transition ${
                isActive('/blog')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>

            <Link
              href="/about"
              className={`block py-2 text-sm font-medium transition ${
                isActive('/about')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                <MapPin className="w-4 h-4" />
                <span>Serving all 50 states</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}