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
  X,
  Target,
  CreditCard,
  UserCheck,
  Receipt,
  Wallet,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCompany } from "@/lib/company-context"

interface SidebarProps {
  role: "admin" | "seller" | "supervisor" | "support"
  userName: string
  onLinkClick?: () => void
}

export function Sidebar({ role, userName, onLinkClick }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentCompany } = useCompany()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Links base para Prosegur (Internet)
  const prosegurAdminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/sales", label: "Ventas", icon: ShoppingCart },
    { href: "/admin/new-sale", label: "Nueva Venta", icon: TrendingUp },
    { href: "/admin/leads", label: "Leads", icon: Target },
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/plans", label: "Planes", icon: Package },
    { href: "/admin/commissions", label: "Comisiones", icon: DollarSign },
    { href: "/admin/announcements", label: "Anuncios", icon: Megaphone },
    { href: "/admin/notifications", label: "Notificaciones", icon: Bell },
    { href: "/admin/chat", label: "Chat", icon: MessageSquare },
  ]

  // Links para TuPaginaYa (Webs)
  const tupaginayaAdminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/clients", label: "Clientes", icon: UserCheck },
    { href: "/admin/sales", label: "Ventas", icon: ShoppingCart },
    { href: "/admin/demos", label: "Demos", icon: Globe },
    { href: "/admin/collections", label: "Cobranzas", icon: CreditCard },
    { href: "/admin/transactions", label: "Ingresos/Egresos", icon: Receipt },
    { href: "/admin/leads", label: "Leads", icon: Target },
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/plans", label: "Planes", icon: Package },
    { href: "/admin/commissions", label: "Comisiones", icon: DollarSign },
    { href: "/admin/liquidations", label: "Liquidaciones", icon: Wallet },
    { href: "/admin/materials", label: "Material Grafico", icon: Folder },
    { href: "/admin/notifications", label: "Notificaciones", icon: Bell },
    { href: "/admin/chat", label: "Chat", icon: MessageSquare },
  ]

  const prosegurSellerLinks = [
    { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
    { href: "/seller/sales", label: "Mis Ventas", icon: ShoppingCart },
    { href: "/seller/new-sale", label: "Nueva Venta", icon: TrendingUp },
    { href: "/seller/leads", label: "Mis Leads", icon: Target },
    { href: "/seller/notifications", label: "Notificaciones", icon: Bell },
    { href: "/seller/marketing", label: "Marketing", icon: Folder },
    { href: "/seller/chat", label: "Chat", icon: MessageSquare },
  ]

  const tupaginayaSellerLinks = [
    { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
    { href: "/seller/clients", label: "Mis Clientes", icon: UserCheck },
    { href: "/seller/demos", label: "Demos", icon: Globe },
    { href: "/seller/leads", label: "Mis Leads", icon: Target },
    { href: "/seller/notifications", label: "Notificaciones", icon: Bell },
    { href: "/seller/marketing", label: "Marketing", icon: Folder },
    { href: "/seller/chat", label: "Chat", icon: MessageSquare },
  ]

  const tusventasSupervisorLinks = [
    { href: "/supervisor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/supervisor/sales", label: "Ventas", icon: ShoppingCart },
    { href: "/supervisor/new-sale", label: "Nueva Venta", icon: TrendingUp },
    { href: "/supervisor/leads", label: "Leads", icon: Target },
    { href: "/supervisor/commissions", label: "Comisiones", icon: DollarSign },
    { href: "/supervisor/notifications", label: "Notificaciones", icon: Bell },
    { href: "/supervisor/chat", label: "Chat", icon: MessageSquare },
  ]

  const tupaginayaSupervisorLinks = [
    { href: "/supervisor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/supervisor/clients", label: "Clientes", icon: UserCheck },
    { href: "/supervisor/sales", label: "Ventas", icon: ShoppingCart },
    { href: "/supervisor/demos", label: "Demos", icon: Globe },
    { href: "/supervisor/leads", label: "Leads", icon: Target },
    { href: "/supervisor/commissions", label: "Comisiones", icon: DollarSign },
    { href: "/supervisor/notifications", label: "Notificaciones", icon: Bell },
    { href: "/supervisor/marketing", label: "Marketing", icon: Folder },
    { href: "/supervisor/chat", label: "Chat", icon: MessageSquare },
  ]

  const supportLinks = [
    { href: "/support", label: "Dashboard", icon: LayoutDashboard },
    { href: "/support/sales", label: "Ventas", icon: ShoppingCart },
    { href: "/support/new-sale", label: "Nueva Venta", icon: TrendingUp },
  ]

  // Seleccionar links segun empresa y rol
  const isTuPaginaYa = currentCompany.id === "tupaginaya"

  const getLinks = () => {
    if (role === "admin") {
      return isTuPaginaYa ? tupaginayaAdminLinks : prosegurAdminLinks
    }
    if (role === "supervisor") {
      return isTuPaginaYa ? tupaginayaSupervisorLinks : tusventasSupervisorLinks
    }
    if (role === "support") {
      return supportLinks
    }
    return isTuPaginaYa ? tupaginayaSellerLinks : prosegurSellerLinks
  }

  const links = getLinks()

  return (
    <aside className="h-screen w-64 border-r border-[#0f2840] bg-[#1a3a5c] flex-shrink-0">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#2a5a7c] px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div 
              className="h-9 w-9 rounded-lg flex items-center justify-center bg-[#5eb3e4]"
            >
              {isTuPaginaYa ? (
                <Globe className="h-5 w-5 text-white" />
              ) : (
                <TrendingUp className="h-5 w-5 text-white" />
              )}
            </div>
            <span className="text-xl font-bold text-white">{currentCompany.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-[#2a5a7c]"
            onClick={onLinkClick}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User info */}
        <div className="border-b border-[#2a5a7c] px-6 py-4">
          <p className="text-sm font-medium text-white truncate">{userName}</p>
          <p className="text-xs text-blue-200 capitalize">{role === "admin" ? "Administrador" : role === "supervisor" ? "Supervisor" : role === "support" ? "Soporte" : "Vendedor"}</p>
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
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#5eb3e4] text-white"
                    : "text-blue-100 hover:bg-[#2a5a7c] hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#2a5a7c] p-4 space-y-2">
          {role !== "support" && (
            <Link
              href={role === "admin" ? "/admin/settings" : role === "supervisor" ? "/supervisor/settings" : "/seller/settings"}
              onClick={onLinkClick}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 hover:bg-[#2a5a7c] hover:text-white transition-colors"
            >
              <Settings className="h-5 w-5" />
              {role === "seller" ? "Cambiar Contraseña" : "Configuracion"}
            </Link>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-blue-100 hover:text-red-300 hover:bg-red-500/20"
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
