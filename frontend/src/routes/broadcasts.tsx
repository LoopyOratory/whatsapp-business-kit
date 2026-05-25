import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"
import { Megaphone, Plus, Send, Loader2 } from "lucide-react"

export const Route = createFileRoute("/broadcasts")({ component: BroadcastsPage })

function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState<string | null>(null)

  async function loadBroadcasts() {
    try { const d = await apiFetch("/broadcasts"); setBroadcasts(Array.isArray(d) ? d : []) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { loadBroadcasts() }, [])

  async function createBroadcast(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiFetch("/broadcasts", {
        method: "POST",
        body: JSON.stringify({ title, content: { text: content } }),
      })
      setOpen(false)
      setTitle("")
      setContent("")
      loadBroadcasts()
    } catch (e) { console.error(e) }
  }

  async function sendBroadcast(id: string) {
    setSending(id)
    try { await apiFetch(`/broadcasts/${id}/send`, { method: "POST" }); loadBroadcasts() }
    catch (e) { console.error(e) }
    finally { setSending(null) }
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sending: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Broadcasts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700"><Plus className="mr-2 h-4 w-4" /> Create Broadcast</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Broadcast</DialogTitle></DialogHeader>
            <form onSubmit={createBroadcast} className="space-y-4">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div><Label>Message</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Type your broadcast message..." required /></div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Create Broadcast</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {broadcasts.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No broadcasts yet.</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {broadcasts.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell><Badge className={statusColors[b.status]}>{b.status}</Badge></TableCell>
                  <TableCell>{b.sentCount || 0}</TableCell>
                  <TableCell>{b.failedCount || 0}</TableCell>
                  <TableCell className="text-sm text-gray-500">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    {b.status === "draft" && (
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => sendBroadcast(b.id)} disabled={sending === b.id}>
                        {sending === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                        Send Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
