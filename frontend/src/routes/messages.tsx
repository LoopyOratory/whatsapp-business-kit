import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiFetch } from "@/lib/api"
import { MessageSquare, Plus, Send, Loader2 } from "lucide-react"

export const Route = createFileRoute("/messages")({ component: MessagesPage })

function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState("")
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)

  async function loadData() {
    try {
      const [msgData, custData] = await Promise.all([
        apiFetch("/messages"),
        apiFetch("/customers"),
      ])
      setMessages(Array.isArray(msgData) ? msgData : [])
      setCustomers(Array.isArray(custData) ? custData : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      await apiFetch("/messages/send", { method: "POST", body: JSON.stringify({ to: phone, text }) })
      setOpen(false)
      setPhone("")
      setText("")
      loadData()
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700"><Plus className="mr-2 h-4 w-4" /> Send Message</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Send WhatsApp Message</DialogTitle></DialogHeader>
            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <Label>Customer</Label>
                <Select onValueChange={(v) => setPhone(v)}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.phone}>{c.name || c.phone} — {c.phone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Message</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." rows={4} required /></div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={sending}>
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {sending ? "Sending..." : "Send"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {messages.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No messages yet. Send your first one!</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>To</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.customerId?.slice(0, 8)}...</TableCell>
                  <TableCell><Badge variant="outline">{m.messageType}</Badge></TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{typeof m.content === "object" ? m.content?.text || JSON.stringify(m.content) : m.content}</TableCell>
                  <TableCell><Badge className={m.status === "sent" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>{m.status}</Badge></TableCell>
                  <TableCell className="text-sm text-gray-500">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
