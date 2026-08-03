// app/api/contact/route.ts
import { NextResponse } from 'next/server'
import { sendContactEmails } from '@/lib/notifications/email'
import { ContactData } from '@/lib/notifications/types'

export async function POST(request: Request) {
  try {
    const data: ContactData = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send emails
    const result = await sendContactEmails(data)

    if (!result.user.success || !result.admin.success) {
      console.error('Email send errors:', result)
      // Still return success to the user, but log the error
      // You might want to handle this differently in production
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent. We will get back to you soon!',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}