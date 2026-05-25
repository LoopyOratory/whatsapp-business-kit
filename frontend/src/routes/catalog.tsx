import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"
import { Package, Plus, Search, Loader2, Pencil, Trash2 } from "lucide-react"

export const Route = createFileRoute("/catalog")({ component: CatalogPage })

function CatalogPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editItem, setEditItem] = useState<any>(null)
  const [open, setOpen] = useState(false)

  async function loadItems() {
    try {
      const data = await apiFetch("/catalog")
      setItems(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadItems() }, [])

  const filtered = items.filter((i) =>
    i.name?.toLowerCase().includes(search.toLowerCase())
  )

  async function saveItem(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = Object.fromEntries(new FormData(form))
    try {
      if (editItem) {
        await apiFetch(`/catalog/${editItem.id}`, { method: "PUT", body: JSON.stringify(data) })
      } else {
        await apiFetch("/catalog", { method: "POST", body: JSON.stringify({ ...data, price: Number(data.price) }) })
      }
      setOpen(false)
      setEditItem(null)
      loadItems()
    } catch (e) { console.error(e) }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return
    await apiFetch(`/catalog/${id}`, { method: "DELETE" })
    loadItems()
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catalog</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setEditItem(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Edit" : "Add"} Product</DialogTitle></DialogHeader>
            <form onSubmit={saveItem} className="space-y-4">
              <div><Label>Name</Label><Input name="name" defaultValue={editItem?.name} required /></div>
              <div><Label>Price (GHS)</Label><Input name="price" type="number" step="0.01" defaultValue={editItem?.price} required /></div>
              <div><Label>Category</Label><Input name="category" defaultValue={editItem?.category} /></div>
              <div><Label>Image URL</Label><Input name="imageUrl" defaultValue={editItem?.imageUrl} /></div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">{editItem ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input placeholder="Search products..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No products yet. Add your first one!</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600"><Package className="h-5 w-5" /></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditItem(item); setOpen(true) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="mt-3 font-semibold">{item.name}</h3>
                <p className="text-lg font-bold text-teal-600">GHS {item.price}</p>
                {item.category && <Badge variant="secondary">{item.category}</Badge>}
                <Badge className={item.isAvailable ? "ml-2 bg-green-100 text-green-700" : "ml-2 bg-red-100 text-red-700"}>
                  {item.isAvailable ? "Available" : "Hidden"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
