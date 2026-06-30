// components/layout/Footer.tsx
import Link from 'next/link'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Shield,
  Clock,
  Award,
  Users
} from 'lucide-react'

interface FooterProps {
  states?: { name: string; slug: string }[]
  cities?: { name: string; slug: string; stateSlug: string }[]
}

export default function Footer({ states = [], cities = [] }: FooterProps) {
  const currentYear = new Date().getFullYear()

  // Top states for footer
  const footerStates = states.slice(0, 12)
  const topCities = cities.slice(0, 8)

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                R
              </div>
              <div>
                <span className="text-xl font-bold text-white">RoofLeak</span>
                <span className="text-sm text-gray-400 block -mt-1">Repair Directory</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Find trusted roof leak repair contractors in your area. 
              Compare reviews, get free estimates, and find emergency 
              roof repair services 24/7.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition text-gray-400 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-400 transition text-gray-400 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-pink-600 transition text-gray-400 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-red-600 transition text-gray-400 hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-white transition">
                  List Your Business
                </Link>
              </li>
            </ul>
          </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Top States</h3>
          <div className="grid grid-cols-2 gap-1">
            {footerStates.map((state) => (
              <Link
                key={state.slug}
                href={`/${state.slug}`}
                className="text-sm hover:text-white transition py-0.5"
              >
                {state.name}
              </Link>
            ))}
            {states.length > 12 && (
              <Link
                href="/states"
                className="text-sm text-blue-400 hover:text-blue-300 transition py-0.5 font-medium"
              >
                View All 50 States →
              </Link>
            )}
          </div>
        </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Emergency</div>
                  <a href="tel:+18005551234" className="hover:text-white transition">
                    (800) 555-1234
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Email</div>
                  <a href="mailto:info@roofleakrepaird.com" className="hover:text-white transition">
                    info@roofleakrepaird.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Address</div>
                  <span>Serving All 50 States</span>
                </div>
              </li>
            </ul>

            {/* Trust Badges */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs bg-gray-800 px-3 py-2 rounded-lg">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Verified Contractors</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-gray-800 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-gray-800 px-3 py-2 rounded-lg">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>5,000+ Listed</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-gray-800 px-3 py-2 rounded-lg">
                <Users className="w-4 h-4 text-purple-400" />
                <span>15,000+ Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              &copy; {currentYear} RoofLeak Repair Directory. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="hover:text-white transition">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}