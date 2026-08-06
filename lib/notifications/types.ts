// lib/notifications/types.ts
export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export interface NotificationPayload {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

export interface ClaimData {
  id: number
  contractorName: string  // Required, not nullable
  contractorId: number
  businessName?: string
  email?: string
  userEmail?: string
  adminNotes?: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface ReviewData {
  id: number
  contractorName: string  // Required, not nullable
  contractorSlug: string
  rating: number
  title?: string
  content?: string
  adminNotes?: string
  email?: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface ContactData {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  city?: string
}

export interface ContractorClaimData {
  contractorName: string
  businessName: string
  email: string
  phone: string
  website?: string
  address?: string
}