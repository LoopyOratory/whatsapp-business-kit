import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/privacy")({ component: PrivacyPage })

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: May 2026</p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Data We Collect</h2>
        <p className="text-gray-600">
          We collect: account information (name, email, phone), business information (name, address, logo),
          customer data (phone, name, order history), message content sent through the platform,
          and usage analytics.
        </p>

        <h2 className="text-xl font-semibold">2. How We Use Data</h2>
        <p className="text-gray-600">
          Data is used solely to provide and improve the Service: processing orders, sending WhatsApp messages,
          generating analytics, communicating with you about your account, and complying with legal obligations.
        </p>

        <h2 className="text-xl font-semibold">3. Data Protection</h2>
        <p className="text-gray-600">
          We implement industry-standard security measures including encryption in transit (TLS),
          encrypted storage, and access controls. Your data is stored on secure servers in data centers
          compliant with international standards.
        </p>

        <h2 className="text-xl font-semibold">4. Third-Party Sharing</h2>
        <p className="text-gray-600">
          We share data only with essential service providers: Paystack (payment processing),
          WAHA/WhatsApp (message delivery), and Neon (database hosting). We never sell your data.
        </p>

        <h2 className="text-xl font-semibold">5. Data Retention</h2>
        <p className="text-gray-600">
          We retain your data for as long as your account is active. After account deletion,
          data is permanently deleted within 30 days. Analytics data may be retained longer in
          anonymized form.
        </p>

        <h2 className="text-xl font-semibold">6. Your Rights</h2>
        <p className="text-gray-600">
          You have the right to: access your data, correct inaccurate data, delete your data,
          export your data, and withdraw consent. Contact us at privacy@wbkit.com to exercise these rights.
        </p>

        <h2 className="text-xl font-semibold">7. Cookies</h2>
        <p className="text-gray-600">
          We use essential cookies for authentication and session management. We do not use tracking
          cookies or third-party analytics cookies. You can control cookies through your browser settings.
        </p>

        <h2 className="text-xl font-semibold">8. Contact</h2>
        <p className="text-gray-600">
          For privacy inquiries: privacy@wbkit.com. For support: support@wbkit.com.
          Physical address: Accra, Ghana.
        </p>
      </section>
    </div>
  )
}
