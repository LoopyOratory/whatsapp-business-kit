import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/terms")({ component: TermsPage })

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-sm text-gray-500">Last updated: May 2026</p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
        <p className="text-gray-600">
          By accessing or using WhatsApp Business Kit ("the Service"), you agree to be bound by these Terms of Service.
          If you do not agree, do not use the Service.
        </p>

        <h2 className="text-xl font-semibold">2. Service Description</h2>
        <p className="text-gray-600">
          WhatsApp Business Kit provides a SaaS platform enabling small businesses to manage catalog, orders, customers,
          broadcasts, and payments through WhatsApp. The Service integrates with third-party APIs including WhatsApp/WAHA and Paystack.
        </p>

        <h2 className="text-xl font-semibold">3. User Obligations</h2>
        <p className="text-gray-600">
          You agree to: (a) provide accurate registration information, (b) maintain the confidentiality of your account,
          (c) comply with all applicable laws, (d) not use the Service for spam, fraud, or illegal purposes.
          You are responsible for all activity under your account.
        </p>

        <h2 className="text-xl font-semibold">4. Payment Terms</h2>
        <p className="text-gray-600">
          Paid plans are billed monthly in advance. All payments are processed securely via Paystack.
          Refunds are provided within 14 days of purchase for annual plans. Monthly plans are non-refundable.
          Prices are in Ghanaian Cedis (GHS) and include applicable taxes.
        </p>

        <h2 className="text-xl font-semibold">5. Limitation of Liability</h2>
        <p className="text-gray-600">
          The Service is provided "as is" without warranties. We are not liable for indirect damages,
          loss of data, or business interruption. Our total liability is limited to the amount paid in the
          preceding 12 months.
        </p>

        <h2 className="text-xl font-semibold">6. Termination</h2>
        <p className="text-gray-600">
          Either party may terminate at any time. Upon termination, your access is revoked and data may be
          deleted after 30 days. We may terminate for breach of these terms with immediate effect.
        </p>

        <h2 className="text-xl font-semibold">7. Governing Law</h2>
        <p className="text-gray-600">
          These terms are governed by the laws of the Republic of Ghana. Any disputes shall be resolved
          in the courts of Accra, Ghana.
        </p>
      </section>
    </div>
  )
}
