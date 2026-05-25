import { createRootRoute, Link, Outlet, useLocation } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Megaphone,
  MessageCircle,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  MessageCircleWarning,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Catalog", href: "/catalog", icon: <Package className="h-5 w-5" /> },
  { label: "Orders", href: "/orders", icon: <ShoppingCart className="h-5 w-5" /> },
  { label: "Customers", href: "/customers", icon: <Users className="h-5 w-5" /> },
  { label: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
  { label: "Broadcasts", href: "/broadcasts", icon: <Megaphone className="h-5 w-5" /> },
  { label: "WhatsApp", href: "/whatsapp", icon: <MessageCircle className="h-5 w-5" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
]

const publicNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Login", href: "/login", icon: <MessageCircle className="h-5 w-5" /> },
]

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation()
  const { data: session } = authClient.useSession()
  const items = session?.session ? navItems : publicNavItems

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-14 items-center border-b px-4", collapsed && "justify-center")}>
        <Link to="/" className="flex items-center gap-2 font-bold text-primary no-underline">
          <MessageCircleWarning className="h-6 w-6 text-primary" />
          {!collapsed && <span className="text-lg">WBKit</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", collapsed && "ml-0")}
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-foreground",
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
      {session?.session && (
        <div className={cn("border-t p-4", collapsed && "p-2 flex justify-center")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session.user?.email}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

function MobileNav() {
  const location = useLocation()
  const { data: session } = authClient.useSession()
  const items = session?.session ? navItems : publicNavItems

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-14 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary no-underline">
            <MessageCircleWarning className="h-6 w-6" />
            <span className="text-lg">WBKit</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {items.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [dark])

  return (
    <Button variant="ghost" size="icon" onClick={() => setDark(!dark)}>
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const { data: session } = authClient.useSession()

  const isLanding = location.pathname === "/" || location.pathname === "/login"

  return (
    <div className="flex min-h-screen">
      {!isLanding && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}
      <div className="flex flex-1 flex-col">
        {!isLanding && (
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <MobileNav />
            <div className="flex-1" />
            <ThemeToggle />
            {session?.session && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => authClient.signOut()}
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </header>
        )}
        <main className={cn("flex-1", !isLanding && "p-4 lg:p-6")}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
