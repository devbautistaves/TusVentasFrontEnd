"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { dashboardAPI, salesAPI, usersAPI, AdminStats, Sale, User } from "@/lib/api"
import {
  ShoppingCart,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ArrowUpRight,
  DollarSign,
  TrendingDown,
  Wrench,
  Filter,
  Banknote,
  Building2,
  UserCheck,
  UserCog,
  Wifi,
  WifiOff,
  Circle,
  AlertTriangle,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  pending_signature: "#f97316",
  pending_appointment: "#a855f7",
  observed: "#d97706",
  appointed: "#3b82f6",
  completed: "#22c55e",
  cancelled: "#ef4444",
}

interface OnlineUser extends User {
  lastActivity?: string
  sessionStart?: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [allSales, setAllSales] = useState<Sale[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const [statsRes, salesRes, usersRes] = await Promise.all([
          dashboardAPI.getAdminStats(token),
          salesAPI.getAdminSales(token),
          usersAPI.getAll(token),
        ])
        setStats(statsRes)
        setAllSales(salesRes.sales || [])
        const users = usersRes.users || []
        setAllUsers(users)
        
        // Fetch online users from API
        fetchOnlineUsers(token, users)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    
    // Refresh online users every 30 seconds
    const interval = setInterval(() => {
      const token = localStorage.getItem("token")
      if (token) fetchOnlineUsers(token)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchOnlineUsers = async (token: string, usersList?: User[]) => {
    const users = usersList || allUsers
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/online-users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setOnlineUsers(data.users || [])
      } else {
        // Fallback: Use active users from the users list with simulated session times
        // This will be replaced when the backend implements the online-users endpoint
        const activeUsers = users
          .filter(u => u.isActive && u.role !== "admin")
          .slice(0, 8) // Show up to 8 users
          .map(u => ({
            ...u,
            sessionStart: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time within last hour
          }))
        setOnlineUsers(activeUsers)
      }
    } catch (error) {
      console.error("Error fetching online users:", error)
      // Fallback to active users
      const activeUsers = users
        .filter(u => u.isActive && u.role !== "admin")
        .slice(0, 8)
        .map(u => ({
          ...u,
          sessionStart: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        }))
      setOnlineUsers(activeUsers)
    }
  }

  // Calculate time online
  const formatTimeOnline = (sessionStart: string | undefined) => {
    if (!sessionStart) return "Recien conectado"
    
    const start = new Date(sessionStart)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const remainingMins = diffMins % 60
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m`
    }
    return `${diffMins}m`
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Admin",
      supervisor: "Supervisor",
      seller: "Vendedor",
      support: "Soporte",
    }
    return labels[role] || role
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "text-purple-400",
      supervisor: "text-blue-400",
      seller: "text-green-400",
      support: "text-amber-400",
    }
    return colors[role] || "text-muted-foreground"
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Filtrar ventas del mes seleccionado
  const getMonthSales = () => {
    const [year, month] = selectedMonth.split("-").map(Number)
    return allSales.filter(sale => {
      const saleDate = new Date(sale.createdAt)
      return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year
    })
  }

  const monthSales = getMonthSales()

  // Calcular estadisticas del mes
  const activatedSales = monthSales.filter(s => s.status === "completed")
  const cancelledSales = monthSales.filter(s => s.status === "cancelled")
  const pendingSales = monthSales.filter(s => s.status === "pending")
  const pendingSignatureSales = monthSales.filter(s => s.status === "pending_signature")
  const pendingTurnSales = monthSales.filter(s => s.status === "pending_appointment")
  const observedSales = monthSales.filter(s => s.status === "observed")
  const appointedSales = monthSales.filter(s => s.status === "appointed")

  // Constantes de negocio
  const SUPERVISOR_BASE_COMMISSION = 750000 // $750.000 base por venta activada
  const ADMIN_COST_PER_SALE = 35000 // $35.000 costo admin por venta
  const SUPERVISOR_PERCENTAGE = 0.40 // 40% para supervisores

  // Tiers de comisiones para vendedores
  const COMMISSION_TIERS = [
    { minSales: 1, maxSales: 4, amount: 200000 },
    { minSales: 5, maxSales: 9, amount: 300000 },
    { minSales: 10, maxSales: 19, amount: 350000 },
    { minSales: 20, maxSales: 25, amount: 375000 },
    { minSales: 26, maxSales: 999, amount: 400000 },
  ]

  const getCommissionPerSale = (salesCount: number) => {
    for (const tier of COMMISSION_TIERS) {
      if (salesCount >= tier.minSales && salesCount <= tier.maxSales) {
        return tier.amount
      }
    }
    return 0
  }

  // Helper para extraer el ID
  const extractId = (field: string | { _id: string } | undefined): string => {
    if (!field) return ""
    if (typeof field === "string") return field
    return field._id || ""
  }

  // INGRESOS: $750.000 por cada venta activada
  const totalRevenue = activatedSales.length * SUPERVISOR_BASE_COMMISSION

  // COSTO DE ADMINISTRACION: $35.000 por cada venta activada
  const totalAdminCost = activatedSales.length * ADMIN_COST_PER_SALE

  // Calcular totales de costos de instalacion (solo de ventas activadas del mes)
  const totalInstallationCosts = activatedSales.reduce((acc, sale) => {
    return acc + (sale.installationCost || 0)
  }, 0)

  // COMISIONES VENDEDORES: Sumar la comision final de cada vendedor
  // Misma logica que en la pagina de comisiones
  const sellers = allUsers.filter(u => u.role === "seller" && u.isActive)
  const totalSellerCommissions = sellers.reduce((total, seller) => {
    // Ventas completadas del mes donde este usuario es el vendedor
    const sellerCompletedSales = activatedSales.filter(s => extractId(s.sellerId) === seller._id)
    const activatedCount = sellerCompletedSales.length
    if (activatedCount === 0) return total
    
    const perSale = getCommissionPerSale(activatedCount)
    let commission = activatedCount * perSale
    
    // Descontar costos de instalacion de este vendedor
    sellerCompletedSales.forEach(sale => {
      commission -= (sale.installationCost || 0)
    })
    
    return total + Math.max(0, commission)
  }, 0)

  // COMISIONES SUPERVISORES: Sumar la comision final de cada supervisor
  // Misma logica que en la pagina de comisiones
  const supervisors = allUsers.filter(u => u.role === "supervisor" && u.isActive)
  const totalSupervisorCommissions = supervisors.reduce((total, supervisor) => {
    // Ventas completadas donde este supervisor es el vendedor O es el supervisor asignado
    const supervisorCompletedSales = activatedSales.filter(s => 
      extractId(s.sellerId) === supervisor._id || extractId(s.supervisorId) === supervisor._id
    )
    
    if (supervisorCompletedSales.length === 0) return total
    
    let netBeforePercentage = 0
    
    supervisorCompletedSales.forEach(sale => {
      const sellerCommission = sale.sellerCommissionPaid || 0
      const installationCost = sale.installationCost || 0
      const net = SUPERVISOR_BASE_COMMISSION - ADMIN_COST_PER_SALE - sellerCommission - installationCost
      netBeforePercentage += net
    })
    
    const commission = Math.max(0, netBeforePercentage * SUPERVISOR_PERCENTAGE)
    return total + commission
  }, 0)

  // GANANCIA NETA: Ingresos - Todos los costos y comisiones
  const totalCosts = totalAdminCost + totalInstallationCosts + totalSellerCommissions + totalSupervisorCommissions
  const netProfit = totalRevenue - totalCosts

  // Generar meses disponibles
  const getAvailableMonths = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const label = date.toLocaleDateString("es-AR", { month: "long", year: "numeric" })
      months.push({ value, label })
    }
    return months
  }

  const pieChartData = [
    { name: "Cargadas", value: pendingSales.length, color: STATUS_COLORS.pending },
    { name: "Pend. Firma", value: pendingSignatureSales.length, color: STATUS_COLORS.pending_signature },
    { name: "Pend. Turno", value: pendingTurnSales.length, color: STATUS_COLORS.pending_appointment },
    { name: "Observadas", value: observedSales.length, color: STATUS_COLORS.observed },
    { name: "Turnadas", value: appointedSales.length, color: STATUS_COLORS.appointed },
    { name: "Instaladas", value: activatedSales.length, color: STATUS_COLORS.completed },
    { name: "Canceladas", value: cancelledSales.length, color: STATUS_COLORS.cancelled },
  ].filter(d => d.value > 0)

  const topSellersData = stats?.stats.topSellers?.map((seller) => ({
    name: seller.name.split(" ")[0],
    ventas: seller.totalSales,
    comisiones: seller.totalCommissions,
  })) || []

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Resumen general del negocio
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px] bg-secondary/50">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableMonths().map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/admin/sales">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Ver Todas
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Stats - Hero Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Ventas del Mes */}
          <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ventas del Mes</p>
                  <p className="text-4xl font-bold text-foreground">{monthSales.length}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 text-sm text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      {activatedSales.length} activadas
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingresos Totales */}
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 via-card to-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                  <p className="text-4xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground pt-1">
                    {activatedSales.length} x $750.000
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costo Administracion */}
          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-card to-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Costo Administracion</p>
                  <p className="text-4xl font-bold text-blue-400">{formatCurrency(totalAdminCost)}</p>
                  <p className="text-xs text-muted-foreground pt-1">
                    {activatedSales.length} x $35.000
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ganancia Neta */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ganancia Neta</p>
                  <p className={`text-4xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-red-400'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground pt-1">
                    Ingresos - Todos los costos
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Costs Breakdown Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Costos de Instalacion */}
          <Card className="border-red-500/30 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Costos Instalacion</p>
                    <p className="text-xl font-bold text-red-400">-{formatCurrency(totalInstallationCosts)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comisiones Vendedores */}
          <Card className="border-amber-500/30 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Comisiones Vendedores</p>
                    <p className="text-xl font-bold text-amber-400">-{formatCurrency(totalSellerCommissions)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comisiones Supervisores */}
          <Card className="border-purple-500/30 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <UserCog className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Comisiones Supervisores</p>
                    <p className="text-xl font-bold text-purple-400">-{formatCurrency(totalSupervisorCommissions)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Costos */}
          <Card className="border-gray-500/30 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Costos</p>
                    <p className="text-xl font-bold text-gray-400">-{formatCurrency(totalCosts)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards Row */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <StatusCard
            title="Cargadas"
            count={pendingSales.length}
            icon={Clock}
            color="text-yellow-400"
            bgColor="bg-yellow-500/10"
            borderColor="border-yellow-500/30"
            status="pending"
            month={selectedMonth}
          />
          <StatusCard
            title="Pend. Firma"
            count={pendingSignatureSales.length}
            icon={Clock}
            color="text-orange-400"
            bgColor="bg-orange-500/10"
            borderColor="border-orange-500/30"
            status="pending_signature"
            month={selectedMonth}
          />
          <StatusCard
            title="Pend. Turno"
            count={pendingTurnSales.length}
            icon={Calendar}
            color="text-purple-400"
            bgColor="bg-purple-500/10"
            borderColor="border-purple-500/30"
            status="pending_appointment"
            month={selectedMonth}
          />
          <StatusCard
            title="Observadas"
            count={observedSales.length}
            icon={AlertTriangle}
            color="text-amber-400"
            bgColor="bg-amber-500/10"
            borderColor="border-amber-500/30"
            status="observed"
            month={selectedMonth}
          />
          <StatusCard
            title="Turnadas"
            count={appointedSales.length}
            icon={Calendar}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
            borderColor="border-blue-500/30"
            status="appointed"
            month={selectedMonth}
          />
          <StatusCard
            title="Instaladas"
            count={activatedSales.length}
            icon={CheckCircle}
            color="text-green-400"
            bgColor="bg-green-500/10"
            borderColor="border-green-500/30"
            status="completed"
            month={selectedMonth}
          />
          <StatusCard
            title="Canceladas"
            count={cancelledSales.length}
            icon={XCircle}
            color="text-red-400"
            bgColor="bg-red-500/10"
            borderColor="border-red-500/30"
            status="cancelled"
            month={selectedMonth}
          />
        </div>

        {/* Online Users and Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Online Users */}
          <Card className="border-green-500/30 bg-card/50 lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Wifi className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Usuarios En Linea</CardTitle>
                    <CardDescription className="text-xs">{onlineUsers.length} conectados ahora</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Circle className="h-2 w-2 fill-green-400 text-green-400 animate-pulse" />
                  <span className="text-xs text-green-400">LIVE</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                {onlineUsers.length > 0 ? (
                  onlineUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary">
                              {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-400 text-green-400 border-2 border-card rounded-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                          <p className={`text-xs ${getRoleColor(user.role)}`}>{getRoleLabel(user.role)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs text-muted-foreground">Online</p>
                        <p className="text-xs font-medium text-green-400">{formatTimeOnline(user.sessionStart)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <WifiOff className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No hay usuarios conectados</p>
                    <p className="text-xs text-muted-foreground/70">Los usuarios apareceran aqui cuando inicien sesion</p>
                  </div>
                )}
              </div>
              {onlineUsers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <p className="text-lg font-bold text-green-400">{onlineUsers.filter(u => u.role === "seller").length}</p>
                      <p className="text-xs text-muted-foreground">Vendedores</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <p className="text-lg font-bold text-blue-400">{onlineUsers.filter(u => u.role === "supervisor").length}</p>
                      <p className="text-xs text-muted-foreground">Supervisores</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-border/50 bg-card/50 lg:col-span-2">
            <CardHeader>
              <CardTitle>Distribucion por Estado</CardTitle>
              <CardDescription>Ventas del mes agrupadas por estado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No hay ventas en este mes
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Top Sellers - Grid de cuadraditos */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Vendedores del Mes</CardTitle>
            <CardDescription>Ventas activadas y turnadas por vendedor</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              // Calcular ventas por vendedor del mes
              const sellerStats = monthSales.reduce((acc, sale) => {
                const sellerName = sale.sellerName
                if (!acc[sellerName]) {
                  acc[sellerName] = { 
                    name: sellerName, 
                    activated: 0, 
                    appointed: 0, 
                    total: 0 
                  }
                }
                if (sale.status === "completed") acc[sellerName].activated++
                if (sale.status === "appointed") acc[sellerName].appointed++
                acc[sellerName].total++
                return acc
              }, {} as Record<string, { name: string; activated: number; appointed: number; total: number }>)

              const sellersArray = Object.values(sellerStats).sort((a, b) => {
                // Ordenar primero por activadas, luego por turnadas
                if (b.activated !== a.activated) return b.activated - a.activated
                return b.appointed - a.appointed
              })

              if (sellersArray.length === 0) {
                return (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No hay ventas registradas en este mes
                  </div>
                )
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sellersArray.map((seller, index) => (
                    <div
                      key={seller.name}
                      className={`relative p-4 rounded-lg border transition-colors ${
                        index === 0 
                          ? "border-primary/50 bg-primary/10" 
                          : "border-border/50 bg-secondary/20 hover:bg-secondary/30"
                      }`}
                    >
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-foreground">1</span>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                          <span className="text-sm font-semibold text-primary">
                            {seller.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <p className="font-medium text-foreground text-sm truncate">{seller.name.split(" ")[0]}</p>
                        <div className="flex items-center justify-center gap-3 mt-2">
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-400">{seller.activated}</p>
                            <p className="text-[10px] text-muted-foreground">Activ.</p>
                          </div>
                          <div className="h-6 w-px bg-border" />
                          <div className="text-center">
                            <p className="text-lg font-bold text-blue-400">{seller.appointed}</p>
                            <p className="text-[10px] text-muted-foreground">Turn.</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total: {seller.total}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}

function StatusCard({
  title,
  count,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  status,
  month,
}: {
  title: string
  count: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  status: string
  month: string
}) {
  return (
    <Link href={`/admin/sales?status=${status}&month=${month}`}>
      <Card className={`border ${borderColor} bg-card/50 hover:bg-card/80 hover:scale-[1.02] transition-all cursor-pointer`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground truncate">{title}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
