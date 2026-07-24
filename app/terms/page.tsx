// app/terms/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import Link from 'next/link'
import { FileText, Shield, AlertCircle, CheckCircle, Scale, Users, Building, Mail} from 'lucide-react'

export const metadata = generateSeoMetadata({
  title: 'Terms of Service - Roof Leak Repair Directory',
  description: 'Read our terms of service to understand the rules and guidelines for using Roof Leak Repair Directory.',
  keywords: ['terms of service', 'terms', 'conditions', 'legal'],
  canonical: '/terms',
})

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Terms of Service</span>
      </nav>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-gray-600 text-sm mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-8">
          {/* Acceptance */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Acceptance of Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              By using Roof Leak Repair Directory ("we", "our", "us"), you agree to these terms of service. 
              If you do not agree, please do not use our website or services.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Description of Service
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Roof Leak Repair Directory provides a platform connecting homeowners with roof leak repair 
              contractors. We do not perform roofing services ourselves but facilitate connections 
              between users and independent contractors.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              User Accounts
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
            </ul>
          </section>

          {/* Contractor Listings */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Contractor Listings
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Contractors listed on our directory are independent businesses. We verify information 
              to the best of our ability but cannot guarantee the accuracy of all listings. 
              Users should conduct their own research before hiring any contractor.
            </p>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              User Conduct
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to use our services responsibly and not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Post false or misleading information</li>
              <li>Harass or intimidate other users</li>
              <li>Engage in fraudulent activities</li>
              <li>Violate any applicable laws</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              Disclaimer of Warranties
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are provided "as is" without warranties of any kind. We do not guarantee 
              the quality, reliability, or availability of any contractor listed on our directory. 
              Your use of our services is at your own risk.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We are not liable for any damages arising from your use of our services or interactions 
              with contractors. We do not guarantee the results of any work performed by contractors 
              found through our directory.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Termination
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to terminate or suspend your access to our services at any time, 
              without notice, for conduct that we believe violates these terms or is harmful to 
              other users or our business.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these terms from time to time. We will notify you of significant changes 
              by posting a notice on our website. Your continued use of our services after changes 
              constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these terms, please contact us:
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <a href="mailto:legal@roofleakrepaird.com" className="text-blue-600 hover:underline">
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