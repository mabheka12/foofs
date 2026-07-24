// app/api/contact/route.ts
//
// Handles the plain HTML <form action="/api/contact" method="POST">
// submission from app/contact/page.tsx. Stores every valid lead in
// Supabase (source of truth), best-effort emails a notification via
// Resend, and redirects back to /contact with a ?status= flag so the
// page can show a banner -- no client-side JS required on the form.

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { contactSubmissions } from '@/lib/db/schema'

export const runtime = 'nodejs'

const VALID_SUBJECTS = new Set(['contractor', 'list', 'support', 'partnership', 'general'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MESSAGE_LEN = 5000

// Best-effort in-memory rate limit: 5 submissions per IP per hour.
// NOTE: this resets on every cold start / new serverless instance, so it
// only helps against a burst hitting the *same* warm instance -- it is
// NOT a substitute for real rate limiting. If spam becomes a problem,
// swap this for Upstash Redis (a few lines with @upstash/ratelimit) or
// put the route behind Vercel's built-in Attack Challenge Mode / a
// Cloudflare Turnstile widget on the form itself.
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000
const recentSubmissions = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (recentSubmissions.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  timestamps.push(now)
  recentSubmissions.set(ip, timestamps)
  return timestamps.length > RATE_LIMIT
}

function redirectWithStatus(request: NextRequest, status: string, extra?: Record<string, string>) {
  const url = new URL('/contact', request.url)
  url.searchParams.set('status', status)
  if (extra) for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v)
  // 303: correct status for redirecting a POST to a GET.
  return NextResponse.redirect(url, 303)
}

export async function POST(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return redirectWithStatus(request, 'error', { reason: 'bad_request' })
  }

  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const subject = String(formData.get('subject') || '').trim()
  const message = String(formData.get('message') || '').trim()
  // Honeypot: a hidden field real users never fill in. Bots that
  // auto-fill every input on the form will trip it. Add
  // <input type="text" name="company_website" className="hidden" tabIndex={-1} autoComplete="off" />
  // to the form -- see CONTACT_PAGE_CHANGES.md.
  const honeypot = String(formData.get('company_website') || '').trim()

  if (honeypot) {
    // Silently "succeed" so the bot doesn't learn its submission was rejected.
    return redirectWithStatus(request, 'success')
  }

  if (!name || !email || !subject || !message) {
    return redirectWithStatus(request, 'error', { reason: 'missing_fields' })
  }
  if (!EMAIL_RE.test(email)) {
    return redirectWithStatus(request, 'error', { reason: 'invalid_email' })
  }
  if (!VALID_SUBJECTS.has(subject)) {
    return redirectWithStatus(request, 'error', { reason: 'invalid_subject' })
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return redirectWithStatus(request, 'error', { reason: 'message_too_long' })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return redirectWithStatus(request, 'error', { reason: 'rate_limited' })
  }

  const userAgent = request.headers.get('user-agent') || undefined

  // Store the lead first -- this must succeed for the request to count as
  // successful. Email notification below is best-effort on top of it.
  try {
    const db = getDb()
    await db.insert(contactSubmissions).values({
      name,
      email,
      subject,
      message,
      ipAddress: ip,
      userAgent,
    })
  } catch (err) {
    console.error('contact_submissions insert failed:', err)
    return redirectWithStatus(request, 'error', { reason: 'server_error' })
  }

  // Best-effort email notification. Failure here does NOT fail the
  // request -- the lead is already saved above.
  if (process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFY_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || 'RoofNet <notifications@roofernet.com>',
          to: process.env.CONTACT_NOTIFY_EMAIL,
          reply_to: email,
          subject: `New contact form submission: ${subject}`,
          text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}\n\n---\nIP: ${ip}`,
        }),
      })
    } catch (err) {
      // Log only -- the submission is already safely stored in the DB
      // even if the email notification fails.
      console.error('contact notification email failed:', err)
    }
  }

  return redirectWithStatus(request, 'success')
}