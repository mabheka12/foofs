// app/about/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import Link from 'next/link'
import { Shield, Users, Star, Clock, Award, MapPin, Phone, Mail, Building } from 'lucide-react'

export const metadata = generateSeoMetadata({
  title: 'About Us - Roof Leak Repair Directory',
  description: 'Learn about Roof Leak Repair Directory - our mission to connect homeowners with trusted roof leak repair contractors. Find verified professionals in your area.',
  keywords: ['about us', 'roof leak repair directory', 'trusted contractors', 'roofing professionals'],
  canonical: '/about',
})

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">About Us</span>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Connecting Homeowners with <span className="text-blue-600">Trusted Roofing Professionals</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We make it easy to find reliable roof leak repair contractors in your area. 
          Our mission is to connect you with verified professionals who deliver quality work.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-blue-50 rounded-2xl p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              We believe every homeowner deserves access to trustworthy roofing professionals. 
              Our platform eliminates the guesswork by connecting you with verified contractors 
              who have proven track records of excellence.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Verified Contractors</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Real Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">24/7 Emergency</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Quality Guaranteed</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600">5,000+</div>
              <div className="text-gray-600">Trusted Contractors</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15,000+</div>
                <div className="text-sm text-gray-500">Verified Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">50</div>
                <div className="text-sm text-gray-500">States Covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Search</h3>
            <p className="text-gray-600 text-sm">
              Enter your city or zip code to find contractors in your area.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Compare</h3>
            <p className="text-gray-600 text-sm">
              Read reviews, compare ratings, and find the right professional for your needs.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Connect</h3>
            <p className="text-gray-600 text-sm">
              Contact contractors directly and get free estimates for your project.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold">Trust & Transparency</h3>
            </div>
            <p className="text-gray-600 text-sm">
              We verify all contractors and display real reviews to help you make informed decisions.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold">Community First</h3>
            </div>
            <p className="text-gray-600 text-sm">
              We prioritize the needs of homeowners and contractors, building a community of trust.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="font-semibold">Quality Assurance</h3>
            </div>
            <p className="text-gray-600 text-sm">
              We only feature contractors with proven track records of quality workmanship.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold">24/7 Support</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Our team is always available to help you find emergency roof repair services.
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          We're here to help you find the right contractor for your roofing needs.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
          >
            Contact Us
          </Link>
          <a
            href="tel:+18005551234"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-400 transition font-medium"
          >
            Call (800) 555-1234
          </a>
        </div>
      </div>
    </div>
  )
}