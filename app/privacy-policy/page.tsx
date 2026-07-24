// app/privacy/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import Link from 'next/link'
import { Shield, Eye, Lock, Database, UserCheck, Cookie,Phone,Mail } from 'lucide-react'

export const metadata = generateSeoMetadata({
  title: 'Privacy Policy - Roof Leak Repair Directory',
  description: 'Read our privacy policy to understand how Roof Leak Repair Directory collects, uses, and protects your personal information.',
  keywords: ['privacy policy', 'data protection', 'privacy', 'security'],
  canonical: '/privacy',
})

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Privacy Policy</span>
      </nav>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 text-sm mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Roof Leak Repair Directory ("we", "our", "us") respects your privacy and is committed to 
              protecting your personal data. This privacy policy explains how we collect, use, and 
              protect your information when you use our website and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Information We Collect
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Name and contact information (email address, phone number)</li>
              <li>Location data (city, state, zip code)</li>
              <li>Communications and messages you send to us</li>
              <li>Feedback and reviews you submit about contractors</li>
              <li>Information you provide when listing your business</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Connect you with trusted roof leak repair contractors</li>
              <li>Provide and improve our directory services</li>
              <li>Send you relevant contractor recommendations</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send you important updates and notifications</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-blue-600" />
              Cookies
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies to enhance your experience on our website. Cookies help us understand 
              how you use our site and improve our services. You can control cookie preferences 
              through your browser settings.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Data Security
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate security measures to protect your personal information from 
              unauthorized access, alteration, disclosure, or destruction. We use industry-standard 
              encryption and security protocols.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Third-Party Services
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may use third-party services to help us deliver our services. These third parties 
              have access to your information only to perform specific tasks on our behalf and are 
              obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <a href="mailto:info@roofernet.com" className="text-blue-600 hover:underline">
                  info@roofernet.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}