// app/privacy/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import Link from 'next/link'
import {
  BarChart3,
  Cookie,
  CreditCard,
  Database,
  ExternalLink,
  Eye,
  Lock,
  Mail,
  Megaphone,
  Shield,
  UserCheck,
} from 'lucide-react'

const LAST_UPDATED = 'August 22, 2026'

export const metadata = generateSeoMetadata({
  title: 'Privacy Policy',
  description:
    'Learn how RooferNet collects, uses, shares, and protects information when you use our roofing contractor directory.',
  keywords: [
    'RooferNet privacy policy',
    'privacy',
    'cookies',
    'data protection',
  ],
  canonical: '/privacy',
})

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-sm text-gray-600"
      >
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Privacy Policy</span>
      </nav>

      <article className="rounded-xl bg-white p-6 shadow-lg md:p-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Privacy Policy
        </h1>

        <p className="mb-8 text-sm text-gray-600">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-8">
          <section>
            <SectionHeading icon={Shield} title="Introduction" />

            <p className="leading-relaxed text-gray-600">
              RooferNet (&quot;RooferNet,&quot; &quot;we,&quot;
              &quot;our,&quot; or &quot;us&quot;) operates an online directory
              that helps users discover and compare roofing businesses.
              This policy explains the information we may collect when you use
              RooferNet, why we use it, and the choices available to you.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              RooferNet is a directory and advertising platform. Roofing
              contractors listed on the site are independent businesses and
              have their own privacy practices.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={Database}
              title="Information We Collect"
            />

            <h3 className="mb-2 font-semibold text-gray-900">
              Information you provide
            </h3>

            <ul className="ml-5 list-disc space-y-2 text-gray-600">
              <li>
                Your name, email address, phone number, and messages when you
                contact us.
              </li>
              <li>
                Account and authentication information when you create or use
                an account.
              </li>
              <li>
                Business details submitted when you add, claim, correct, or
                promote a contractor listing.
              </li>
              <li>
                Ratings, reviews, feedback, and other content you choose to
                submit.
              </li>
              <li>
                Transaction-related information when purchasing advertising or
                promotional services.
              </li>
            </ul>

            <h3 className="mb-2 mt-5 font-semibold text-gray-900">
              Information collected automatically
            </h3>

            <p className="leading-relaxed text-gray-600">
              When you visit RooferNet, we and our service providers may
              automatically receive information such as your IP address,
              browser type, device information, referring page, pages visited,
              approximate location derived from your IP address, and
              interactions with the site.
            </p>

            <h3 className="mb-2 mt-5 font-semibold text-gray-900">
              Public business information
            </h3>

            <p className="leading-relaxed text-gray-600">
              Contractor profiles may contain publicly available or
              business-supplied information, including business names,
              addresses, phone numbers, websites, service areas, operating
              hours, ratings, and reviews. Business listing information is
              intended to be displayed publicly.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={UserCheck}
              title="How We Use Information"
            />

            <p className="mb-3 leading-relaxed text-gray-600">
              We may use information to:
            </p>

            <ul className="ml-5 list-disc space-y-2 text-gray-600">
              <li>Operate, maintain, and improve the RooferNet directory.</li>
              <li>Provide search results and relevant contractor listings.</li>
              <li>Manage accounts, listing claims, corrections, and reviews.</li>
              <li>Respond to questions, support requests, and complaints.</li>
              <li>Process advertising and promotional-service purchases.</li>
              <li>Measure site performance and understand site usage.</li>
              <li>Detect spam, fraud, security incidents, and misuse.</li>
              <li>Comply with applicable laws and enforce our terms.</li>
            </ul>
          </section>

          <section>
            <SectionHeading icon={Cookie} title="Cookies and Similar Tools" />

            <p className="leading-relaxed text-gray-600">
              RooferNet and its service providers may use cookies, local
              storage, pixels, and similar technologies to keep the site
              working, remember preferences, measure traffic, and deliver or
              measure advertising.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              You can remove or block cookies through your browser settings.
              Blocking certain cookies may affect how some parts of the site
              work.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={BarChart3}
              title="Analytics and Performance"
            />

            <p className="leading-relaxed text-gray-600">
              We use services including Google Analytics, Vercel Analytics,
              and Vercel Speed Insights to understand site traffic,
              performance, and general usage patterns. These providers may
              receive device, browser, IP address, page-view, and interaction
              information according to their own policies.
            </p>

            <div className="mt-4 flex flex-col items-start gap-2">
              <ExternalLinkItem href="https://policies.google.com/technologies/partner-sites">
                How Google uses information from sites that use its services
              </ExternalLinkItem>

              <ExternalLinkItem href="https://tools.google.com/dlpage/gaoptout">
                Google Analytics opt-out browser add-on
              </ExternalLinkItem>

              <ExternalLinkItem href="https://vercel.com/legal/privacy-policy">
                Vercel Privacy Policy
              </ExternalLinkItem>
            </div>
          </section>

          <section>
            <SectionHeading icon={Megaphone} title="Advertising" />

            <p className="leading-relaxed text-gray-600">
              RooferNet displays advertising through Google AdSense. Google
              and other advertising vendors may use cookies or similar
              technologies to serve, personalize, and measure advertisements
              based on visits to RooferNet and other websites. Whether
              personalized advertising is used may depend on your location,
              consent choices, browser settings, and Google settings.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              You can review or change Google advertising preferences through
              Google&apos;s advertising settings.
            </p>

            <div className="mt-4">
              <ExternalLinkItem href="https://adssettings.google.com">
                Google Ads Settings
              </ExternalLinkItem>
            </div>

            <p className="mt-4 leading-relaxed text-gray-600">
              Some contractor listings may be featured or promoted because the
              business purchased advertising. Sponsored placement does not
              mean that RooferNet guarantees or endorses that contractor.
            </p>
          </section>

          <section>
            <SectionHeading icon={CreditCard} title="Payments" />

            <p className="leading-relaxed text-gray-600">
              Payments for advertising or promotional services may be handled
              by third-party payment providers such as PayPal or Paystack.
              Those providers process payment information under their own
              privacy policies. RooferNet does not receive or store your full
              payment-card number.
            </p>
          </section>

          <section>
            <SectionHeading icon={Eye} title="How Information May Be Shared" />

            <p className="mb-3 leading-relaxed text-gray-600">
              Information may be shared with:
            </p>

            <ul className="ml-5 list-disc space-y-2 text-gray-600">
              <li>
                Hosting, database, authentication, analytics, advertising,
                email, security, and payment service providers.
              </li>
              <li>
                Contractors or businesses when you intentionally contact them
                or request a connection.
              </li>
              <li>
                Authorities or other parties when reasonably necessary to
                comply with law, protect rights, prevent harm, or investigate
                misuse.
              </li>
              <li>
                A successor organization as part of a merger, acquisition,
                financing, or transfer of business assets.
              </li>
            </ul>

            <p className="mt-3 leading-relaxed text-gray-600">
              Reviews and information submitted for a public contractor
              listing may be displayed publicly.
            </p>
          </section>

          <section>
            <SectionHeading icon={Lock} title="Data Retention and Security" />

            <p className="leading-relaxed text-gray-600">
              We retain information for as long as reasonably necessary to
              provide the site, maintain business and legal records, resolve
              disputes, prevent abuse, and comply with applicable obligations.
              Retention periods may vary depending on the type of information.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              We use reasonable administrative and technical measures intended
              to protect information. No website, database, or transmission
              method can be guaranteed to be completely secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Your Choices and Privacy Rights
            </h2>

            <p className="leading-relaxed text-gray-600">
              Depending on where you live, you may have rights to request
              access to, correction of, or deletion of certain personal
              information. You may also be able to object to or restrict
              certain processing and withdraw consent where processing is
              based on consent.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              You can manage advertising cookies through your browser and
              advertising-provider settings. You can unsubscribe from
              promotional email using the unsubscribe option in the message,
              where provided.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              To submit a privacy request, contact us using the address below.
              We may need to verify your identity before completing a request.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Children&apos;s Privacy
            </h2>

            <p className="leading-relaxed text-gray-600">
              RooferNet is a general-audience business directory and is not
              directed to children under 13. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              External Websites
            </h2>

            <p className="leading-relaxed text-gray-600">
              Contractor profiles and advertisements may link to third-party
              websites. RooferNet does not control the privacy or security
              practices of those websites. Review their policies before
              providing personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Changes to This Policy
            </h2>

            <p className="leading-relaxed text-gray-600">
              We may update this privacy policy as RooferNet changes. The
              revised policy will be posted on this page with an updated
              effective date.
            </p>
          </section>

          <section className="rounded-xl bg-blue-50 p-6">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Contact Us
            </h2>

            <p className="leading-relaxed text-gray-600">
              For privacy questions or requests, contact:
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <a
                href="mailto:info@roofernet.com"
                className="text-blue-600 hover:underline"
              >
                info@roofernet.com
              </a>
            </div>
          </section>
        </div>
      </article>
    </div>
  )
}

interface SectionHeadingProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
}

function SectionHeading({ icon: Icon, title }: SectionHeadingProps) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-gray-900">
      <Icon className="h-5 w-5 text-blue-600" />
      {title}
    </h2>
  )
}

interface ExternalLinkItemProps {
  href: string
  children: React.ReactNode
}

function ExternalLinkItem({ href, children }: ExternalLinkItemProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  )
}