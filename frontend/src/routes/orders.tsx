import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiFetch } from "@/lib/api"
import { Loader2 } from "lucide-react"

export const Route = createFileRoute("/orders")({ component: OrdersPage })

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function loadOrders() {
    try {
      const data = await apiFetch("/orders")
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadOrders() }, [])

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter)

  async function updateStatus(id: string, status: string) {
    await apiFetch(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) })
    loadOrders()
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No orders found.</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <>
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                    <TableCell className="font-mono text-xs">{o.id?.slice(0, 8)}...</TableCell>
                    <TableCell><Badge className={statusColors[o.status]}>{o.status}</Badge></TableCell>
                    <TableCell>GHS {o.totalAmount}</TableCell>
                    <TableCell><Badge className={o.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>{o.paymentStatus}</Badge></TableCell>
                    <TableCell className="text-sm text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Select onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className="h-8 w-32"><SelectValue placeholder="Update" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Confirm</SelectItem>
                          <SelectItem value="processing">Process</SelectItem>
                          <SelectItem value="completed">Complete</SelectItem>
                          <SelectItem value="cancelled">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
