import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Jenny Professional Eyelash. Learn how we collect, use, and protect your personal information, including our SMS consent practices.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20 bg-offwhite">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-navy tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="font-body text-sm text-gray mb-10">
            Last updated: April 7, 2026
          </p>

          <div className="space-y-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                Information We Collect
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                Jenny Professional Eyelash (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) collects information you provide directly to us, such as when you book an appointment, fill out a form, or communicate with us. This may include your name, phone number, email address, and any other information you choose to provide.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                We also collect usage data automatically when you visit our website, including your IP address, browser type, pages visited, and other diagnostic data, to improve the functionality of our site.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                How We Use Your Information
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="mt-3 space-y-2 list-disc list-inside font-body text-navy-light">
                <li>To schedule and manage your appointments</li>
                <li>To send appointment reminders and confirmations via SMS or email</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To send promotional communications, only with your express consent</li>
                <li>To improve our website and services</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                SMS Consent
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                By providing your phone number and opting into SMS communications, you consent to receive appointment reminders, confirmations, and marketing messages from Jenny Professional Eyelash at the phone number you provide.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Message Frequency:</strong> Message frequency varies depending on your appointment schedule and any marketing messages you have opted into. Standard message and data rates may apply.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Opt-Out:</strong> You can opt out of SMS communications at any time by replying STOP to any message you receive. Upon opting out, you will no longer receive SMS messages from us.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                <strong>Help:</strong> If you need assistance, you can text HELP to the same number you receive messages from, or contact us directly at the phone number or email address listed in this policy.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                We will never share your phone number with third parties for their marketing purposes without your explicit consent.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                Data Retention
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When your information is no longer needed, we will securely delete or anonymize it.
              </p>
              <p className="font-body text-navy-light leading-relaxed mt-3">
                SMS consent records and communication preferences are retained for as long as you remain opted in, plus a reasonable period following opt-out, for regulatory compliance purposes.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy mb-3">
                Contact Us
              </h2>
              <p className="font-body text-navy-light leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
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
