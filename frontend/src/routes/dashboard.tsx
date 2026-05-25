import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"
import { ShoppingCart, Package, Users, DollarSign, Loader2 } from "lucide-react"

export const Route = createFileRoute("/dashboard")({ component: DashboardPage })

function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsData, ordersData] = await Promise.all([
          apiFetch("/orders/stats"),
          apiFetch("/orders?limit=5"),
        ])
        setStats(statsData)
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      } catch (err) {
        console.error("Dashboard load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  const statCards = [
    { label: "Total Orders", value: stats?.total ?? 0, icon: <ShoppingCart className="h-5 w-5" />, color: "text-blue-600 bg-blue-100" },
    { label: "Pending", value: stats?.pending ?? 0, icon: <Package className="h-5 w-5" />, color: "text-amber-600 bg-amber-100" },
    { label: "Completed", value: stats?.completed ?? 0, icon: <Users className="h-5 w-5" />, color: "text-green-600 bg-green-100" },
    { label: "Revenue (GHS)", value: stats?.revenue ?? 0, icon: <DollarSign className="h-5 w-5" />, color: "text-teal-600 bg-teal-100" },
  ]

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{s.label}</CardTitle>
              <div className={`rounded-lg p-2 ${s.color}`}>{s.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id?.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge className={statusColors[o.status] || ""}>{o.status}</Badge>
                    </TableCell>
                    <TableCell>GHS {o.totalAmount}</TableCell>
                    <TableCell>
                      <Badge className={o.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {o.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
