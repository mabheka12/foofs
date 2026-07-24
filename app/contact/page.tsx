// app/contact/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import Link from 'next/link'
import { Mail, MapPin, Clock, Send, } from 'lucide-react'

export const metadata = generateSeoMetadata({
  title: 'Contact Us - Roof Leak Repair Directory',
  description: 'Contact Roof Leak Repair Directory for help finding trusted contractors, partnerships, or general inquiries.',
  keywords: ['contact us', 'roof leak repair', 'contractor directory', 'help'],
  canonical: '/contact',
})

export default function ContactPage({
  searchParams,
}: {
  searchParams: { status?: string; reason?: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Contact Us</span>
      </nav>

      {/* Status banner -- shown after the form redirects back here */}
      {searchParams.status === 'success' && (
        <div className="mb-8 rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3">
          Thanks for reaching out — we'll get back to you within 24-48 hours.
        </div>
      )}
      {searchParams.status === 'error' && (
        <div className="mb-8 rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {searchParams.reason === 'rate_limited'
            ? "You've submitted a few messages recently — please wait a bit before trying again."
            : searchParams.reason === 'invalid_email'
            ? 'That email address looks off — mind double-checking it?'
            : "Something didn't go through. Please check the form and try again."}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Have questions about finding a contractor or want to list your business? 
          We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">Email</div>
                  <a href="mailto:info@roofernet.com" className="text-gray-600 hover:text-blue-600">
                    info@roofernet.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">Hours</div>
                  <div className="text-gray-600 text-sm">Monday - Friday: 8:00 AM - 6:00 PM</div>
                  <div className="text-gray-600 text-sm">Saturday: 9:00 AM - 3:00 PM</div>
                  <div className="text-gray-600 text-sm">Sunday: Closed</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">Address</div>
                  <div className="text-gray-600 text-sm">Serving all 50 states</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
            <form action="/api/contact" method="POST" className="space-y-6">
              {/* Honeypot -- invisible to real users, bots that auto-fill
                  every field on the form will trip it. Do not give this
                  a visible label or remove it. */}
              <input
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute left-[-9999px] w-px h-px opacity-0"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="contractor">Finding a Contractor</option>
                  <option value="list">List My Business</option>
                  <option value="support">Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please describe how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center">
              We'll respond to your inquiry within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}