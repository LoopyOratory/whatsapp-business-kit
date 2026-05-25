import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { apiFetch } from "@/lib/api"
import { Loader2, CheckCircle } from "lucide-react"

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage })

const STEPS = ["Business Info", "WhatsApp Number", "First Product"]

function OnboardingPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1 state
  const [businessName, setBusinessName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  // Step 2 state
  const [whatsappNumber, setWhatsappNumber] = useState("")

  // Step 3 state
  const [productName, setProductName] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productCategory, setProductCategory] = useState("")

  // Prefill from auth session if available
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setBusinessName(session.user.name)
      if (session.user.email) setEmail(session.user.email)
    }
  }, [session])

  function canProceed(): boolean {
    if (step === 0) return businessName.trim().length > 0
    if (step === 1) return whatsappNumber.trim().length > 0
    if (step === 2) {
      // Product is optional - user can skip
      if (!productName.trim() && !productPrice.trim() && !productCategory.trim()) return true
      return productName.trim().length > 0 && productPrice.trim().length > 0
    }
    return true
  }

  async function handleComplete() {
    setLoading(true)
    setError("")
    try {
      // Step 1: Update business info via PUT /api/businesses
      const businessPayload: Record<string, string> = {
        name: businessName,
        phone: phone || whatsappNumber,
        email: email,
      }
      if (whatsappNumber) {
        businessPayload.phone = whatsappNumber
      }

      try {
        await apiFetch("/businesses", {
          method: "PUT",
          body: JSON.stringify(businessPayload),
        })
      } catch {
        // If PUT fails (business might not exist yet), try POST /api/businesses/onboard
        await apiFetch("/businesses/onboard", {
          method: "POST",
          body: JSON.stringify(businessPayload),
        })
      }

      // Step 2 (optional): Add first product via POST /api/catalog
      if (productName.trim()) {
        await apiFetch("/catalog", {
          method: "POST",
          body: JSON.stringify({
            name: productName,
            price: Number.parseFloat(productPrice),
            category: productCategory.trim() || undefined,
          }),
        })
      }

      navigate({ to: "/dashboard" })
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    navigate({ to: "/dashboard" })
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      setError("")
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1)
      setError("")
    }
  }

  function isLastStep() {
    return step === STEPS.length - 1
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set Up Your Business</CardTitle>
          <CardDescription>Complete these steps to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    i === step
                      ? "bg-teal-600 text-white"
                      : i < step
                        ? "bg-teal-100 text-teal-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-10 transition-colors ${
                      i < step ? "bg-teal-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-xs text-gray-500">
            {STEPS.map((label, i) => (
              <span
                key={i}
                className={`text-center ${i === step ? "font-medium text-teal-600" : ""}`}
                style={{ width: `${100 / STEPS.length}%` }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Step 1: Business Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Your Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+233 XX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: WhatsApp Number */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Phone Number</Label>
                <Input
                  id="whatsapp"
                  placeholder="+233 XX XXX XXXX"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  This is the number customers will use to reach you on WhatsApp.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: First Product */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  placeholder="e.g. Jollof Rice"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productPrice">Price (GHS)</Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 25.00"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productCategory">Category</Label>
                <Input
                  id="productCategory"
                  placeholder="e.g. Food & Drinks"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Leave the fields empty to skip adding a product for now.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="flex w-full gap-3">
            {step > 0 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
            ) : (
              <div className="flex-1" />
            )}
            {isLastStep() ? (
              <Button
                onClick={handleComplete}
                disabled={loading || !canProceed()}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={loading || !canProceed()}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                Next
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
