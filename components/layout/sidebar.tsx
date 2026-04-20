"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  Folder,
  DollarSign,
  MessageSquare,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  role: "admin" | "seller"
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/sales", label: "Ventas", icon: ShoppingCart },
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/plans", label: "Planes", icon: Package },
    { href: "/admin/commissions", label: "Comisiones", icon: DollarSign },
    { href: "/admin/announcements", label: "Anuncios", icon: Megaphone },
    { href: "/admin/notifications", label: "Notificaciones", icon: Bell },
    { href: "/admin/chat", label: "Chat", icon: MessageSquare },
  ]

  const sellerLinks = [
    { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
    { href: "/seller/sales", label: "Mis Ventas", icon: ShoppingCart },
    { href: "/seller/new-sale", label: "Nueva Venta", icon: TrendingUp },
    { href: "/seller/notifications", label: "Notificaciones", icon: Bell },
    { href: "/seller/marketing", label: "Marketing", icon: Folder },
    { href: "/seller/chat", label: "Chat", icon: MessageSquare },
  ]

  const links = role === "admin" ? adminLinks : sellerLinks

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">TusVentas</span>
        </div>

        {/* User info */}
        <div className="border-b border-border px-6 py-4">
          <p className="text-sm font-medium text-foreground truncate">{userName}</p>
          <p className="text-xs text-muted-foreground capitalize">{role === "admin" ? "Administrador" : "Vendedor"}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2">
          <Link
            href={role === "admin" ? "/admin/settings" : "/seller/settings"}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Settings className="h-5 w-5" />
            Configuracion
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesion
          </Button>
        </div>
      </div>
    </aside>
  )
}
