import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { apiFetch } from "@/lib/api"
import { Settings, Save, Loader2 } from "lucide-react"

export const Route = createFileRoute("/settings")({ component: SettingsPage })

function SettingsPage() {
  const [business, setBusiness] = useState({ name: "", phone: "", email: "" })
  const [paystack, setPaystack] = useState({ secretKey: "", publicKey: "" })
  const [waha, setWaha] = useState({ apiUrl: "", apiKey: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const biz = await apiFetch("/businesses")
        if (biz) setBusiness({ name: biz.name || "", phone: biz.phone || "", email: biz.email || "" })
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  async function saveBusiness(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await apiFetch("/businesses", { method: "PUT", body: JSON.stringify(business) })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Business Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveBusiness} className="space-y-4">
            <div><Label>Business Name</Label><Input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} /></div>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Paystack Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Secret Key</Label><Input type="password" placeholder="sk_test_..." value={paystack.secretKey} onChange={(e) => setPaystack({ ...paystack, secretKey: e.target.value })} /></div>
          <div><Label>Public Key</Label><Input placeholder="pk_test_..." value={paystack.publicKey} onChange={(e) => setPaystack({ ...paystack, publicKey: e.target.value })} /></div>
          <Button className="bg-teal-600 hover:bg-teal-700"><Save className="mr-2 h-4 w-4" /> Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>WAHA Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>API URL</Label><Input placeholder="http://localhost:3001" value={waha.apiUrl} onChange={(e) => setWaha({ ...waha, apiUrl: e.target.value })} /></div>
          <div><Label>API Key</Label><Input type="password" placeholder="Your WAHA API key" value={waha.apiKey} onChange={(e) => setWaha({ ...waha, apiKey: e.target.value })} /></div>
          <Button className="bg-teal-600 hover:bg-teal-700"><Save className="mr-2 h-4 w-4" /> Save</Button>
        </CardContent>
      </Card>
    </div>
  )
}
