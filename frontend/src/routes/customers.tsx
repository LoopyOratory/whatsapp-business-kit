import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"
import { Users, Search, Plus, Loader2, Eye } from "lucide-react"

export const Route = createFileRoute("/customers")({ component: CustomersPage })

function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  async function loadCustomers() {
    try { const d = await apiFetch("/customers"); setCustomers(Array.isArray(d) ? d : []) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { loadCustomers() }, [])

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  async function viewCustomer(c: any) {
    setSelected(c)
    try {
      const d = await apiFetch(`/customers/${c.id}/orders`)
      setOrders(Array.isArray(d) ? d : [])
    } catch (e) { setOrders([]) }
    setOpen(true)
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input placeholder="Search by name or phone..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No customers yet.</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name || "Unnamed"}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.totalOrders || 0}</TableCell>
                  <TableCell>GHS {c.totalSpent || 0}</TableCell>
                  <TableCell className="text-sm text-gray-500">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => viewCustomer(c)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.name || "Customer"} — {selected?.phone}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{selected?.totalOrders || 0}</div><div className="text-sm text-gray-500">Orders</div></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">GHS {selected?.totalSpent || 0}</div><div className="text-sm text-gray-500">Spent</div></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{selected?.email || "-"}</div><div className="text-sm text-gray-500">Email</div></CardContent></Card>
            </div>
            {orders.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold">Order History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id?.slice(0, 8)}...</TableCell>
                        <TableCell><Badge>{o.status}</Badge></TableCell>
                        <TableCell>GHS {o.totalAmount}</TableCell>
                        <TableCell className="text-sm">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
