import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Package, ShoppingCart, Users, Megaphone, CreditCard, ArrowRight, CheckCircle } from "lucide-react"

const features = [
  { icon: <Package className="h-6 w-6" />, title: "Catalog", desc: "Showcase products with images, prices, and categories. Update instantly." },
  { icon: <ShoppingCart className="h-6 w-6" />, title: "Orders", desc: "Track orders from WhatsApp through to delivery. Manage status updates." },
  { icon: <Users className="h-6 w-6" />, title: "Customers", desc: "Build customer profiles with order history and spending insights." },
  { icon: <Megaphone className="h-6 w-6" />, title: "Broadcasts", desc: "Send bulk WhatsApp messages to your customers in one click." },
  { icon: <CreditCard className="h-6 w-6" />, title: "Payments", desc: "Accept payments via Paystack. Mobile Money and card support." },
]

const steps = [
  { step: "01", title: "Connect WhatsApp", desc: "Link your business WhatsApp number using WAHA. One QR scan and you're in." },
  { step: "02", title: "Set Up Your Catalog", desc: "Add products, set prices, organize categories. Your store goes live." },
  { step: "03", title: "Start Selling", desc: "Customers browse, order, and pay through WhatsApp. You fulfill and grow." },
]

export const Route = createFileRoute("/")({ component: LandingPage })

function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Run Your Business on{" "}
            <span className="text-amber-400">WhatsApp</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-teal-100">
            The all-in-one platform for Ghanaian SMEs. Manage catalog, orders, customers, and payments — all through WhatsApp.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-600 px-8 text-base">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 text-base">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-4 py-16 dark:bg-gray-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">Everything you need</h2>
          <p className="mt-3 text-center text-gray-500 dark:text-gray-400">
            Tools designed for how Ghanaian businesses actually operate.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-0 bg-gray-50 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
          <div className="mt-12 space-y-8">
            {steps.map((s, i) => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">{s.desc}</p>
                </div>
                {i < steps.length - 1 && <div className="ml-5 mt-10 hidden h-8 w-0.5 bg-teal-200 md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-600 px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-white">Ready to digitise your business?</h2>
          <p className="mt-3 text-teal-100">Join thousands of Ghanaian SMEs running on WhatsApp Business Kit.</p>
          <Link to="/signup">
            <Button size="lg" className="mt-8 bg-amber-500 text-white hover:bg-amber-600 px-8 text-base">
              Start Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-8 dark:border-gray-800 dark:bg-gray-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
          <span>WhatsApp Business Kit &mdash; Built for Ghanaian SMEs</span>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
