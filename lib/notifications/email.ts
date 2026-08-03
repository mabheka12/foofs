// lib/notifications/email.ts
import { Resend } from 'resend'
import { EmailOptions, ClaimData, ReviewData, ContactData } from './types'
import { EmailTemplates } from './templates'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@roofleakrepaird.com'
const ADMIN_EMAIL = process.env.RESEND_TO_EMAIL || 'admin@roofleakrepaird.com'

export async function sendEmail({ to, subject, html, from, replyTo }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not set. Email not sent.')
    console.log(`📧 Would have sent email to: ${to}`)
    console.log(`Subject: ${subject}`)
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || FROM_EMAIL,
      to: [to],
      subject,
      html,
      replyTo: replyTo || undefined,
    })

    if (error) {
      console.error('❌ Email send error:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Email sent to ${to} with ID: ${data?.id}`)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Email service error:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Send claim approved notification
export async function sendClaimApprovedEmail(claim: ClaimData) {
  // Ensure id is a string for the email template
  const template = EmailTemplates.claimApproved({ ...claim, id: String((claim as any).id) })
  return sendEmail({
    to: (claim as any).email || ADMIN_EMAIL,
    subject: template.subject,
    html: template.html,
  })
}

// Send claim rejected notification
export async function sendClaimRejectedEmail(claim: ClaimData) {
  // Ensure id is a string for the email template
  const template = EmailTemplates.claimRejected({ ...claim, id: String((claim as any).id) })
  return sendEmail({
    to: (claim as any).email || ADMIN_EMAIL,
    subject: template.subject,
    html: template.html,
  })
}

// Send review approved notification
export async function sendReviewApprovedEmail(review: ReviewData, userEmail: string) {
  const template = EmailTemplates.reviewApproved(review)
  return sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
  })
}

// Send review rejected notification
export async function sendReviewRejectedEmail(review: ReviewData, userEmail: string) {
  const template = EmailTemplates.reviewRejected(review)
  return sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
  })
}

// Send contact confirmation to user
export async function sendContactConfirmationEmail(data: ContactData) {
  const template = EmailTemplates.contactConfirmation(data)
  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    replyTo: ADMIN_EMAIL,
  })
}

// Send contact notification to admin
export async function sendContactNotificationEmail(data: ContactData) {
  const template = EmailTemplates.contactNotification(data)
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: template.subject,
    html: template.html,
    replyTo: data.email,
  })
}

// Send welcome email
export async function sendWelcomeEmail(name: string, email: string) {
  const template = EmailTemplates.welcome({ name, email })
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  })
}

// Send both contact emails (to user and admin)
export async function sendContactEmails(data: ContactData) {
  const [userResult, adminResult] = await Promise.all([
    sendContactConfirmationEmail(data),
    sendContactNotificationEmail(data),
  ])

  return {
    user: userResult,
    admin: adminResult,
  }
}