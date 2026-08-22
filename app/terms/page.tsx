// app/terms/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import Link from 'next/link'
import {
  AlertCircle,
  Building,
  CheckCircle,
  CreditCard,
  FileText,
  Mail,
  Megaphone,
  Scale,
  Shield,
  Users,
} from 'lucide-react'

const LAST_UPDATED = 'August 22, 2026'

export const metadata = generateSeoMetadata({
  title: 'Terms of Service',
  description:
    'Read the terms governing your use of the RooferNet roofing contractor directory.',
  keywords: [
    'RooferNet terms',
    'terms of service',
    'contractor directory terms',
    'legal',
  ],
  canonical: '/terms',
})

export default function TermsPage() {
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
        <span className="text-gray-800">Terms of Service</span>
      </nav>

      <article className="rounded-xl bg-white p-6 shadow-lg md:p-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Terms of Service
        </h1>

        <p className="mb-8 text-sm text-gray-600">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-8">
          <section>
            <SectionHeading
              icon={CheckCircle}
              iconClassName="text-green-600"
              title="Acceptance of These Terms"
            />

            <p className="leading-relaxed text-gray-600">
              These terms govern your use of RooferNet. By accessing or using
              the website, creating an account, submitting content, claiming a
              listing, or purchasing promotional services, you agree to these
              terms and our{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              If you do not agree to these terms, do not use RooferNet.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={Building}
              title="RooferNet’s Directory Role"
            />

            <p className="leading-relaxed text-gray-600">
              RooferNet is an informational directory and advertising
              platform. We display information about independent roofing
              businesses and help users discover and contact them.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              RooferNet is not a roofing contractor, employer, agent, partner,
              insurer, or representative of any listed business. We do not
              enter into roofing contracts on behalf of users or contractors,
              supervise roofing work, set project prices, or guarantee project
              outcomes.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={Shield}
              title="Listings, Verification, and User Research"
            />

            <p className="leading-relaxed text-gray-600">
              Listing information may come from public sources, third-party
              sources, users, or businesses. Although we may review or update
              information, we cannot guarantee that every business name,
              address, phone number, website, rating, license, insurance
              detail, service description, or operating hour is complete,
              current, or accurate.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              A listing appearing on RooferNet is not an endorsement.
              &quot;Verified,&quot; &quot;claimed,&quot; or similar labels, if
              displayed, describe a particular check or account status and do
              not guarantee workmanship, licensing, insurance, availability,
              pricing, safety, or legal compliance.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              Before hiring a contractor, users should independently verify
              identity, references, licensing, insurance, permits, written
              estimates, warranties, and contract terms with the appropriate
              business and authorities.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={Megaphone}
              title="Featured Listings and Advertising"
            />

            <p className="leading-relaxed text-gray-600">
              RooferNet may display advertisements, affiliate links, sponsored
              content, or featured contractor listings. A business may receive
              more prominent placement because it purchased promotional
              services.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              Paid placement does not constitute a guarantee or endorsement of
              the advertiser, its services, or its claims. Users remain
              responsible for evaluating any advertised business or product.
            </p>
          </section>

          <section>
            <SectionHeading icon={Users} title="Accounts and Listing Claims" />

            <ul className="ml-5 list-disc space-y-2 text-gray-600">
              <li>
                You must provide accurate information when creating an account
                or claiming a business listing.
              </li>
              <li>
                You may claim or manage a listing only if you are authorized to
                act for that business.
              </li>
              <li>
                You are responsible for protecting your login credentials and
                activity performed through your account.
              </li>
              <li>
                You must promptly correct information that becomes inaccurate.
              </li>
              <li>
                We may request reasonable evidence of identity, authorization,
                or business ownership.
              </li>
            </ul>
          </section>

          <section>
            <SectionHeading
              icon={FileText}
              title="Reviews and Other User Content"
            />

            <p className="leading-relaxed text-gray-600">
              You retain ownership of content you submit. By submitting content
              to RooferNet, you grant us a non-exclusive, worldwide,
              royalty-free license to host, store, reproduce, format, display,
              and distribute that content for operating, promoting, and
              improving RooferNet.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              You represent that you have the right to submit the content and
              that it is based on genuine experience where applicable.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              You may not submit content that:
            </p>

            <ul className="ml-5 mt-3 list-disc space-y-2 text-gray-600">
              <li>Is false, deceptive, fraudulent, or impersonates another person.</li>
              <li>Contains threats, harassment, spam, or unlawful material.</li>
              <li>Infringes privacy, copyright, trademark, or other rights.</li>
              <li>
                Includes private or sensitive information without permission.
              </li>
              <li>
                Was submitted in exchange for undisclosed compensation or to
                manipulate ratings.
              </li>
            </ul>

            <p className="mt-3 leading-relaxed text-gray-600">
              We may moderate, reject, remove, or restrict content, but we are
              not required to review every submission before it appears.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={AlertCircle}
              iconClassName="text-yellow-500"
              title="Acceptable Use"
            />

            <p className="leading-relaxed text-gray-600">
              You may not use RooferNet to:
            </p>

            <ul className="ml-5 mt-3 list-disc space-y-2 text-gray-600">
              <li>Violate applicable laws or the rights of another party.</li>
              <li>Access accounts or systems without authorization.</li>
              <li>Introduce malware or interfere with site operation.</li>
              <li>
                Scrape, copy, or systematically extract directory content
                except where permitted by law or written authorization.
              </li>
              <li>
                Send spam or use listing information for unlawful or abusive
                marketing.
              </li>
              <li>
                Manipulate search results, ratings, reviews, or listing
                prominence.
              </li>
              <li>
                Misrepresent your identity, affiliation, qualifications, or
                authorization.
              </li>
            </ul>
          </section>

          <section>
            <SectionHeading
              icon={CreditCard}
              title="Payments and Promotional Services"
            />

            <p className="leading-relaxed text-gray-600">
              Paid services may include featured placement, advertising, or
              other promotional options. The price, duration, scope, renewal
              terms, and any refund conditions shown during purchase form part
              of these terms.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              Payments may be processed by third-party payment providers.
              Their terms and privacy policies also apply to their services.
              Except where required by law or expressly stated during
              purchase, purchasing promotion does not guarantee leads,
              contacts, traffic, ranking, or revenue.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={FileText}
              title="Intellectual Property"
            />

            <p className="leading-relaxed text-gray-600">
              RooferNet and its original website design, software, branding,
              and editorial content are protected by applicable intellectual
              property laws. These terms do not transfer ownership of
              RooferNet intellectual property to you.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              Business names, logos, images, and other third-party materials
              remain the property of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Third-Party Websites and Services
            </h2>

            <p className="leading-relaxed text-gray-600">
              RooferNet may link to contractor websites, payment providers,
              advertisers, product sellers, and other third-party services. We
              do not control those services and are not responsible for their
              content, availability, security, policies, products, or actions.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={Scale}
              title="Disclaimer of Warranties"
            />

            <p className="leading-relaxed text-gray-600">
              To the fullest extent permitted by applicable law, RooferNet is
              provided on an &quot;as is&quot; and &quot;as available&quot;
              basis. We do not warrant that the website will always be
              available, error-free, secure, or that listing information will
              always be accurate or complete.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              We do not guarantee the quality, legality, safety, availability,
              pricing, licensing, insurance, or performance of any contractor,
              advertiser, service, or product displayed on RooferNet.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={Shield}
              title="Limitation of Liability"
            />

            <p className="leading-relaxed text-gray-600">
              To the fullest extent permitted by applicable law, RooferNet and
              its operators will not be liable for indirect, incidental,
              special, consequential, or punitive damages arising from use of
              the website, reliance on listing information, communications
              with contractors, or work performed by a contractor.
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              Nothing in these terms excludes or limits liability that cannot
              legally be excluded or limited.
            </p>
          </section>

          <section>
            <SectionHeading
              icon={AlertCircle}
              iconClassName="text-red-500"
              title="Suspension and Termination"
            />

            <p className="leading-relaxed text-gray-600">
              We may suspend or terminate access, remove content, or restrict a
              listing when reasonably necessary to enforce these terms,
              protect users, investigate misuse, comply with law, or preserve
              the security and operation of RooferNet.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Changes to These Terms
            </h2>

            <p className="leading-relaxed text-gray-600">
              We may update these terms as RooferNet changes. Updated terms
              will be posted on this page with a revised effective date.
              Continued use of RooferNet after updated terms take effect means
              you accept the revised terms.
            </p>
          </section>

          <section className="rounded-xl bg-blue-50 p-6">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Contact Us
            </h2>

            <p className="leading-relaxed text-gray-600">
              For questions about these terms, contact:
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
  iconClassName?: string
  title: string
}

function SectionHeading({
  icon: Icon,
  iconClassName = 'text-blue-600',
  title,
}: SectionHeadingProps) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-gray-900">
      <Icon className={`h-5 w-5 ${iconClassName}`} />
      {title}
    </h2>
  )
}