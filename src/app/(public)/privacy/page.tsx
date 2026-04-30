import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Lighthouse Care collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-white py-16 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10 border-b border-gray-200 pb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-600 mb-2">
            Lighthouse Care
          </p>
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-3 text-gray-500 text-sm">
            Last updated: April 2025
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700 leading-relaxed">

          <section>
            <p>
              Lighthouse Care (ABN 87 637 110 948) is an ACNC-registered not-for-profit charity based in
              Logan, South East Queensland. We are committed to protecting the privacy of our volunteers,
              donors, and community members. This policy explains how we collect, use, store, and share
              your personal information, and what rights you have in relation to that information.
            </p>
            <p className="mt-3">
              By using our volunteer portal or submitting a volunteer application, you agree to the
              practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. What personal information we collect</h2>
            <p>We may collect the following types of personal information:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-gray-700">
              <li>Full name and preferred name</li>
              <li>Email address and mobile phone number</li>
              <li>Date of birth</li>
              <li>Home address</li>
              <li>Emergency contact name, phone number, and relationship</li>
              <li>Medical notes and accessibility needs (where voluntarily provided)</li>
              <li>Blue Card status and number (where applicable)</li>
              <li>Volunteering preferences, availability, and areas of interest</li>
              <li>Shift attendance and volunteering history</li>
              <li>Induction completion status</li>
              <li>Communications preferences (email and SMS consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Why we collect it</h2>
            <p>We collect this information to:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-gray-700">
              <li>Register and manage volunteer applications</li>
              <li>Coordinate volunteer rosters and shift assignments</li>
              <li>Ensure the safety of volunteers, staff, and the people we serve</li>
              <li>Comply with Queensland workplace health and safety obligations</li>
              <li>Meet our obligations as an ACNC-registered charity</li>
              <li>Communicate with volunteers about shifts, news, and updates</li>
              <li>Report on volunteer program activities internally</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How we use your information</h2>
            <p>Your information is used for:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-gray-700">
              <li>Creating and maintaining your volunteer profile</li>
              <li>Rostering you for shifts based on your preferences and availability</li>
              <li>Sending shift confirmations, reminders, and updates</li>
              <li>Issuing newsletters and volunteer program communications (where consented)</li>
              <li>Internal reporting and program evaluation</li>
              <li>Emergency contact purposes where needed</li>
            </ul>
            <p className="mt-3">
              We will not use your information for any purpose that is inconsistent with the reason it
              was collected unless we have your consent to do so.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Who we share your information with</h2>
            <p>
              Lighthouse Care does not sell, rent, or trade your personal information to any third party.
            </p>
            <p className="mt-3">We may share your information with:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-gray-700">
              <li>
                Relevant government or emergency authorities if we are required by law, or if there is a
                serious safety risk to you or another person
              </li>
              <li>
                Trusted technology service providers (e.g. email delivery services) who assist us in
                operating our volunteer portal — these providers are required to keep your information
                confidential
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. How we store and protect your information</h2>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-gray-700">
              <li>Your information is stored on secure, Australian-hosted servers</li>
              <li>Passwords are encrypted and never stored in plain text</li>
              <li>Access to volunteer records is restricted to authorised Lighthouse Care staff only</li>
              <li>We use industry-standard security measures to protect against unauthorised access,
                disclosure, alteration, or destruction of your information</li>
            </ul>
            <p className="mt-3">
              While we take all reasonable precautions, no method of electronic storage or transmission
              is 100% secure. We encourage you to use a strong, unique password for your volunteer
              account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. How long we keep your information</h2>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-gray-700">
              <li>
                <strong>Active volunteers:</strong> We retain your information for as long as you
                remain an active volunteer with Lighthouse Care.
              </li>
              <li>
                <strong>Departed volunteers:</strong> We retain records for a minimum of 7 years
                following the end of your volunteering, in line with Queensland compliance and record-
                keeping requirements.
              </li>
            </ul>
            <p className="mt-3">
              After the retention period, records are securely destroyed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your rights</h2>
            <p>You have the right to:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-gray-700">
              <li>
                <strong>Access</strong> the personal information we hold about you
              </li>
              <li>
                <strong>Correct</strong> any information that is inaccurate or out of date — you can
                update most details directly through your volunteer profile
              </li>
              <li>
                <strong>Request deletion</strong> of your personal information, subject to our legal
                retention obligations
              </li>
              <li>
                <strong>Withdraw consent</strong> for communications at any time
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cookies and analytics</h2>
            <p>
              Our volunteer portal uses only essential session cookies required for login and security.
              We do not use advertising cookies or share data with advertising platforms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact us</h2>
            <p>
              If you have any questions about this privacy policy or how we handle your personal
              information, please contact us:
            </p>
            <div className="mt-4 rounded-xl bg-teal-50 border border-teal-100 p-5 text-sm text-teal-900">
              <p className="font-semibold">Lighthouse Care</p>
              <p>Logan, South East Queensland</p>
              <p className="mt-1">ABN 87 637 110 948</p>
              <p>ACNC Registered Charity</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Changes to this policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be posted on this
              page with a revised &ldquo;last updated&rdquo; date. We encourage you to review this policy
              periodically.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
