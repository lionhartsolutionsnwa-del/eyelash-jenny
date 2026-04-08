import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for Jenny Professional Eyelash. Review our booking policies, cancellation terms, and SMS consent requirements.',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20 bg-offwhite">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-navy tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="font-body text-sm text-gray mb-10">
            Last updated: April 7, 2026
          </p>

          <div className="space-y-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                Acceptance of Terms
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                By accessing or using the website of Jenny Professional Eyelash (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) at{' '}
                <a href="https://eyelash-jenny.vercel.app" className="text-gold-dark hover:text-navy transition-colors underline underline-offset-2">
                  eyelash-jenny.vercel.app
                </a>{' '}
                and booking any services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                We reserve the right to modify these terms at any time. Continued use of our website after any changes constitutes acceptance of the updated terms.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Age Requirement:</strong> You must be at least 18 years of age to use our website and book services. By booking an appointment, you confirm that you are 18 years of age or older.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                Services Description
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                Jenny Professional Eyelash provides professional eyelash extension services, including classic lash extensions, hybrid lash extensions, volume lash extensions, wispy lash extensions, and related fills and removal services. All services are performed by trained professionals in a clean, professional environment.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                Service descriptions, pricing, and durations are displayed on our website and are subject to change without notice. All prices are listed in US Dollars.
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                Booking &amp; Cancellations
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                When you book an appointment through our website, you agree to provide accurate and complete information. Appointments are confirmed upon receipt of any required information and are subject to availability.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Cancellation Policy:</strong> We require at least 24 hours notice for any cancellation or rescheduling of appointments. Failure to provide adequate notice may result in a cancellation fee of up to 50% of the scheduled service price. No-shows may be charged the full service price.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                We reserve the right to cancel or reschedule any appointment due to unforeseen circumstances. In such cases, we will contact you promptly to arrange an alternative time.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                SMS Consent
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                By providing your phone number and checking the SMS opt-in box during the booking process, you expressly consent to receive appointment reminders, confirmations, and marketing communications via SMS and text messages from Jenny Professional Eyelash.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Message Frequency:</strong> Message frequency varies. Depending on your booking schedule and any marketing preferences you have selected, you may receive a varying number of messages per week. Standard message and data rates apply as determined by your mobile carrier.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Opt-Out:</strong> You may opt out of SMS communications at any time by replying STOP to any message you receive. You will receive a confirmation reply confirming your opt-out, after which no further SMS messages will be sent.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Help:</strong> For assistance, reply HELP to any SMS message you receive, or contact us directly at 479-329-7979 or via email at info@jennyprofessionallash.com.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                For full details on how we handle your personal information, including SMS data, please review our{' '}
                <a href="/privacy-policy" className="text-gold-dark hover:text-navy transition-colors underline underline-offset-2">
                  Privacy Policy
                </a>
                .
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                Your SMS consent is collected solely for communication from Jenny Professional Eyelash and may only be shared with our SMS service provider(s) to deliver messages to you.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Mobile Carrier Liability:</strong> Jenny Professional Eyelash is not responsible for delays or failures in message delivery caused by mobile network operators, cellular service providers, or other third-party carriers. Message delivery is dependent on the availability and functionality of the recipient's mobile device and service plan.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                Limitation of Liability
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                To the fullest extent permitted by applicable law, Jenny Professional Eyelash and its owners, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising out of or related to your use of our website or services.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                Our total liability for any claim arising from your use of our services shall not exceed the amount you paid for the specific service giving rise to the claim.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                You agree to indemnify and hold harmless Jenny Professional Eyelash from any claims, damages, or expenses arising from your violation of these Terms or your misuse of our services.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Mobile Carrier Liability:</strong> Jenny Professional Eyelash is not responsible for delays or failures in message delivery caused by mobile network operators, cellular service providers, or other third-party carriers. Message delivery is dependent on the availability and functionality of the recipient's mobile device and service plan.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                Contact Us
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-5 bg-white rounded-xl border border-gray-light">
                <p className="font-display text-base font-semibold text-navy">Jenny Professional Eyelash</p>
                <p className="font-body text-sm text-navy-light mt-1">
                  5400 S Pinnacle Hills Pkwy<br />
                  Rogers, AR 72756
                </p>
                <p className="font-body text-sm text-navy-light mt-2">
                  Phone: <a href="tel:4793297979" className="text-gold-dark hover:text-navy transition-colors">479-329-7979</a>
                </p>
                <p className="font-body text-sm text-navy-light mt-1">
                  Email: <a href="mailto:info@jennyprofessionallash.com" className="text-gold-dark hover:text-navy transition-colors">info@jennyprofessionallash.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
