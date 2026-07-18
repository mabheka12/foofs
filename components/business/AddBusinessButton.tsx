// components/business/AddBusinessButton.tsx
'use client'

import Link from 'next/link'
import { Plus, Building } from 'lucide-react'

interface AddBusinessButtonProps {
  variant?: 'button' | 'link' | 'dropdown'
  className?: string
  showIcon?: boolean
  label?: string
}

export function AddBusinessButton({ 
  variant = 'button',
  className = '',
  showIcon = true,
  label = 'Add Your Business',
}: AddBusinessButtonProps) {
  if (variant === 'dropdown') {
    return (
      <Link
        href="/submit-business"
        className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition ${className}`}
      >
        {showIcon && <Plus className="w-4 h-4" />}
        {label}
      </Link>
    )
  }

  if (variant === 'link') {
    return (
      <Link
        href="/submit-business"
        className={`inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition ${className}`}
      >
        {showIcon && <Plus className="w-4 h-4" />}
        {label}
      </Link>
    )
  }

  return (
    <Link
      href="/submit-business"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition ${className}`}
    >
      {showIcon && <Building className="w-4 h-4" />}
      {label}
    </Link>
  )
}