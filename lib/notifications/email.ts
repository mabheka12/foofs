// lib/notifications/email.ts

interface EmailOptions {
  to: string
  subject: string
  html: string
}

// Simple email notification - you can replace with SendGrid, Resend, etc.
export async function sendEmail({ to, subject, html }: EmailOptions) {
  // For now, just log the email
  console.log(`📧 Email to: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`HTML: ${html}`)
  
  // In production, use a service like:
  // - Resend (resend.com)
  // - SendGrid
  // - AWS SES
  // - Nodemailer
  
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'noreply@roofleakrepaird.com',
  //   to,
  //   subject,
  //   html,
  // })
}

export function getClaimApprovedEmail(claim: any) {
  return {
    subject: '🎉 Your Business Claim Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Congratulations! 🎉</h2>
        <p>Your claim for <strong>${claim.contractorName}</strong> has been approved.</p>
        <p>You can now manage your business listing and respond to reviews.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
          Go to Dashboard
        </a>
      </div>
    `
  }
}

export function getClaimRejectedEmail(claim: any) {
  return {
    subject: 'Business Claim Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Claim Status Update</h2>
        <p>Your claim for <strong>${claim.contractorName}</strong> has been reviewed.</p>
        <p>Status: <strong style="color: #dc2626;">Rejected</strong></p>
        ${claim.adminNotes ? `<p><strong>Admin Notes:</strong> ${claim.adminNotes}</p>` : ''}
        <p>If you have questions, please contact support.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" 
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
          Contact Support
        </a>
      </div>
    `
  }
}

export function getReviewApprovedEmail(review: any) {
  return {
    subject: 'Your Review Has Been Published',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Review Published ✅</h2>
        <p>Your review for <strong>${review.contractorName}</strong> has been approved and is now live.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Rating:</strong> ${'⭐'.repeat(review.rating)}</p>
          <p style="margin: 8px 0 0 0;"><strong>${review.title}</strong></p>
          <p style="margin: 8px 0 0 0; color: #4b5563;">${review.content}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contractors/${review.contractorSlug}" 
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
          View Your Review
        </a>
      </div>
    `
  }
}

export function getReviewRejectedEmail(review: any) {
  return {
    subject: 'Review Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Review Update</h2>
        <p>Your review for <strong>${review.contractorName}</strong> has been reviewed.</p>
        <p>Status: <strong style="color: #dc2626;">Rejected</strong></p>
        ${review.adminNotes ? `<p><strong>Admin Notes:</strong> ${review.adminNotes}</p>` : ''}
        <p>Please ensure your review follows our community guidelines.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" 
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
          Contact Support
        </a>
      </div>
    `
  }
}