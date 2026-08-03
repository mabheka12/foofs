// lib/notifications/templates.ts

interface ClaimData {
  id: string;
  contractorName: string;
  adminNotes?: string;
}

interface ReviewData {
  contractorName: string;
  contractorSlug: string;
  rating: number;
  title?: string;
  content?: string;
  adminNotes?: string;
}

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  subject: string;
  message: string;
}

export const EmailTemplates = {
  // Claim Templates
  claimApproved: (data: ClaimData) => ({
    subject: `🎉 Your Business Claim for "${data.contractorName}" Has Been Approved!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
          <h1 style="color: #1a1a2e; margin: 0;">Claim Approved!</h1>
        </div>
        
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;">✅ Your claim for <strong>${data.contractorName}</strong> has been approved.</p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6;">You can now:</p>
        <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
          <li>Manage your business listing</li>
          <li>Respond to customer reviews</li>
          <li>Update your business information</li>
          <li>Access your business dashboard</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/claim/${data.id}" 
             style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Go to Dashboard
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
          If you have questions, contact us at <a href="mailto:support@roofleakrepaird.com" style="color: #2563eb;">support@roofleakrepaird.com</a>
        </p>
      </div>
    `
  }),

  claimRejected: (data: ClaimData) => ({
    subject: `Business Claim Update - ${data.contractorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
          <h1 style="color: #1a1a2e; margin: 0;">Claim Status Update</h1>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;">Your claim for <strong>${data.contractorName}</strong> has been reviewed.</p>
          <p style="margin: 8px 0 0 0; color: #991b1b; font-weight: 600;">Status: Rejected</p>
        </div>
        
        ${data.adminNotes ? `
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #374151; font-weight: 600;">Admin Notes:</p>
            <p style="margin: 8px 0 0 0; color: #4b5563;">${data.adminNotes}</p>
          </div>
        ` : ''}
        
        <p style="color: #4b5563; line-height: 1.6;">If you have questions or need to appeal this decision, please contact our support team.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" 
             style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Contact Support
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
          You can also reply to this email for assistance.
        </p>
      </div>
    `
  }),

  // Review Templates
  reviewApproved: (data: ReviewData) => ({
    subject: `✅ Your Review for "${data.contractorName}" Has Been Published!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">⭐</div>
          <h1 style="color: #1a1a2e; margin: 0;">Review Published!</h1>
        </div>
        
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;">✅ Your review for <strong>${data.contractorName}</strong> is now live.</p>
        </div>
        
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: 600;">Rating: ${'⭐'.repeat(data.rating)}</p>
          ${data.title ? `<p style="margin: 8px 0 0 0; font-weight: 600;">${data.title}</p>` : ''}
          ${data.content ? `<p style="margin: 8px 0 0 0; color: #4b5563;">${data.content}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contractors/${data.contractorSlug}" 
             style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Your Review
          </a>
        </div>
      </div>
    `
  }),

  reviewRejected: (data: ReviewData) => ({
    subject: `Review Update - ${data.contractorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
          <h1 style="color: #1a1a2e; margin: 0;">Review Update</h1>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;">Your review for <strong>${data.contractorName}</strong> has been reviewed.</p>
          <p style="margin: 8px 0 0 0; color: #991b1b; font-weight: 600;">Status: Rejected</p>
        </div>
        
        ${data.adminNotes ? `
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #374151; font-weight: 600;">Admin Notes:</p>
            <p style="margin: 8px 0 0 0; color: #4b5563;">${data.adminNotes}</p>
          </div>
        ` : ''}
        
        <p style="color: #4b5563; line-height: 1.6;">Please ensure your review follows our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/guidelines" style="color: #2563eb;">community guidelines</a>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" 
             style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Contact Support
          </a>
        </div>
      </div>
    `
  }),

  // Contact Form Templates
  contactConfirmation: (data: ContactData) => ({
    subject: `Thank You for Contacting Us - ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">📩</div>
          <h1 style="color: #1a1a2e; margin: 0;">Thank You for Contacting Us!</h1>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6;">Hi <strong>${data.name}</strong>,</p>
        
        <p style="color: #4b5563; line-height: 1.6;">We have received your inquiry about <strong>"${data.subject}"</strong> and will get back to you within 24-48 hours.</p>
        
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: 600;">Your Message:</p>
          <p style="margin: 8px 0 0 0; color: #4b5563;">${data.message}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
          If you need immediate assistance, please call us at (800) 555-1234
        </p>
      </div>
    `
  }),

  contactNotification: (data: ContactData) => ({
    subject: `New Contact Form Submission: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px;">
        <h2 style="color: #1a1a2e;">📬 New Contact Form Submission</h2>
        
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Name:</strong> ${data.name}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${data.phone}</p>` : ''}
          ${data.city ? `<p style="margin: 4px 0;"><strong>City:</strong> ${data.city}</p>` : ''}
          <p style="margin: 4px 0;"><strong>Subject:</strong> ${data.subject}</p>
        </div>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: 600;">Message:</p>
          <p style="margin: 8px 0 0 0; color: #4b5563;">${data.message}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${data.email}" 
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Reply to ${data.name}
          </a>
        </div>
      </div>
    `
  }),

  // Welcome Email
  welcome: (data: { name: string; email: string }) => ({
    subject: `Welcome to Roof Leak Repair Directory!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">🏠</div>
          <h1 style="color: #1a1a2e; margin: 0;">Welcome to Roof Leak Repair Directory!</h1>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6;">Hi <strong>${data.name}</strong>,</p>
        
        <p style="color: #4b5563; line-height: 1.6;">Thank you for joining the Roof Leak Repair Directory! We're excited to help you find the best roofing professionals in your area.</p>
        
        <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">🚀 Here's what you can do next:</p>
          <ul style="color: #1e40af; line-height: 1.8; margin: 8px 0 0 0; padding-left: 20px;">
            <li>Search for contractors in your area</li>
            <li>Read reviews from other homeowners</li>
            <li>List your business if you're a contractor</li>
            <li>Save your favorite contractors</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/search" 
             style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Find a Contractor Now
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
          Need help? Contact us at <a href="mailto:support@roofleakrepaird.com" style="color: #2563eb;">support@roofleakrepaird.com</a>
        </p>
      </div>
    `
  }),
}