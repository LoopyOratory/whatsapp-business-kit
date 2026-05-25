import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"
import { MessageCircle, Loader2, Link2, Link2Off } from "lucide-react"

export const Route = createFileRoute("/whatsapp")({ component: WhatsAppPage })

function WhatsAppPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState("")
  const [connecting, setConnecting] = useState(false)

  async function checkStatus() {
    try {
      const d = await apiFetch("/whatsapp/status")
      setStatus(d)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { checkStatus() }, [])

  async function connect() {
    if (!phone) return
    setConnecting(true)
    try {
      await apiFetch("/whatsapp/webhook", { method: "POST", body: JSON.stringify({}) })
      setStatus({ connected: true, phone })
    } catch (e) { console.error(e) }
    finally { setConnecting(false) }
  }

  async function disconnect() {
    await checkStatus()
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">WhatsApp Connection</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Connection Status</CardTitle>
            <Badge className={status?.connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
              <span className={`mr-1 inline-block h-2 w-2 rounded-full ${status?.connected ? "bg-green-500" : "bg-red-500"}`} />
              {status?.connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.connected ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                Your WhatsApp is connected{status.phone ? ` as ${status.phone}` : ""}.
              </div>
              <Button variant="outline" className="text-red-500" onClick={disconnect}>
                <Link2Off className="mr-2 h-4 w-4" /> Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
                Connect your WhatsApp business number to start sending and receiving messages.
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input
                  placeholder="+233501234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={connect} disabled={connecting || !phone}>
                {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                {connecting ? "Connecting..." : "Connect"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Webhook URL</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gray-50 p-3 font-mono text-sm dark:bg-gray-900">
            {typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp/webhook` : "/api/whatsapp/webhook"}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Configure this URL in your WAHA dashboard to receive incoming messages.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
