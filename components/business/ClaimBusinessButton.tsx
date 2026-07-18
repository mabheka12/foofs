// components/business/ClaimBusinessButton.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building, Shield, CheckCircle } from 'lucide-react'

interface ClaimBusinessButtonProps {
  contractorId?: number
  contractorName?: string
  variant?: 'button' | 'link' | 'dropdown'
  className?: string
  showIcon?: boolean
  onClaim?: () => void
}

export function ClaimBusinessButton({ 
  contractorId,
  contractorName,
  variant = 'button',
  className = '',
  showIcon = true,
  onClaim,
}: ClaimBusinessButtonProps) {
  const [isClaimed, setIsClaimed] = useState(false)

  const handleClaim = () => {
    setIsClaimed(true)
    onClaim?.()
  }

  if (isClaimed) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Claim submitted!</span>
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <Link
        href={contractorId ? `/claim-business?id=${contractorId}` : '/claim-business'}
        className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition ${className}`}
        onClick={() => setIsClaimed(true)}
      >
        {showIcon && <Building className="w-4 h-4" />}
        Claim Your Business
      </Link>
    )
  }

  if (variant === 'link') {
    return (
      <Link
        href={contractorId ? `/claim-business?id=${contractorId}` : '/claim-business'}
        className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition ${className}`}
      >
        {showIcon && <Building className="w-4 h-4" />}
        {contractorName ? `Claim ${contractorName}` : 'Claim Your Business'}
      </Link>
    )
  }

  return (
    <Link
      href={contractorId ? `/claim-business?id=${contractorId}` : '/claim-business'}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${className}`}
    >
      {showIcon && <Shield className="w-4 h-4" />}
      {contractorName ? `Claim ${contractorName}` : 'Claim Your Business'}
    </Link>
  )
}