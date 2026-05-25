import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export const Route = createFileRoute("/verify")({ component: VerifyPage })

function VerifyPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")

    if (!token) {
      setStatus("error")
      setMessage("No verification token found. Please check your verification link.")
      return
    }

    authClient
      .verifyEmail({ token, callbackURL: "/login" })
      .then((res: any) => {
        if (res?.error) {
          setStatus("error")
          setMessage(res.error.message || "Verification failed. The link may be invalid or expired.")
        } else {
          setStatus("success")
          setMessage("Email verified!")
          setTimeout(() => {
            navigate({ to: "/login" })
          }, 3000)
        }
      })
      .catch((err: any) => {
        setStatus("error")
        setMessage(err?.message || "Something went wrong during verification.")
      })
  }, [])

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
              <p className="text-sm text-gray-500">{message}</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm text-gray-700">{message}</p>
              <p className="text-xs text-gray-400">Redirecting to login...</p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-sm text-red-600">{message}</p>
              <Button
                onClick={() => navigate({ to: "/login" })}
                className="mt-2 bg-teal-600 hover:bg-teal-700"
              >
                Go to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
