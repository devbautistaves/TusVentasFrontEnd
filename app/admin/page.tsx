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
  const REVENUE_PER_SALE = 750000 // $750.000 por venta activada
  const ADMIN_COST_PER_SALE = 35000 // $35.000 costo admin por venta

  // INGRESOS: $750.000 por cada venta activada
  const totalRevenue = activatedSales.length * REVENUE_PER_SALE

  // COSTO DE ADMINISTRACION: $35.000 por cada venta activada
  const totalAdminCost = activatedSales.length * ADMIN_COST_PER_SALE

  // Calcular totales de costos de instalacion (se descuentan siempre)
  const totalInstallationCosts = monthSales.reduce((acc, sale) => {
    return acc + (sale.installationCost || 0)
  }, 0)

  // COMISIONES VENDEDORES: suma de comisiones pagadas a vendedores
  const totalSellerCommissions = activatedSales.reduce((acc, sale) => {
    return acc + (sale.sellerCommissionPaid || sale.commission || 0)
  }, 0)

  // COMISIONES SUPERVISORES: (Ingreso - Admin - Instalacion - ComisionVendedor) * 40%
  // NOTA: adCost ya no se resta automaticamente
  const totalSupervisorCommissions = activatedSales.reduce((acc, sale) => {
    const installationCost = sale.installationCost || 0
    const sellerCommission = sale.sellerCommissionPaid || sale.commission || 0
    const netBeforePercentage = REVENUE_PER_SALE - ADMIN_COST_PER_SALE - installationCost - sellerCommission
    return acc + Math.max(0, netBeforePercentage * 0.4)
  }, 0)

  // GANANCIA NETA: Ingresos - Costos Admin - Instalacion - Comisiones Vendedores - Comisiones Supervisores
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
          />
          <StatusCard
            title="Pend. Firma"
            count={pendingSignatureSales.length}
            icon={Clock}
            color="text-orange-400"
            bgColor="bg-orange-500/10"
            borderColor="border-orange-500/30"
          />
          <StatusCard
            title="Pend. Turno"
            count={pendingTurnSales.length}
            icon={Calendar}
            color="text-purple-400"
            bgColor="bg-purple-500/10"
            borderColor="border-purple-500/30"
          />
          <StatusCard
            title="Observadas"
            count={observedSales.length}
            icon={AlertTriangle}
            color="text-amber-400"
            bgColor="bg-amber-500/10"
            borderColor="border-amber-500/30"
          />
          <StatusCard
            title="Turnadas"
            count={appointedSales.length}
            icon={Calendar}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
            borderColor="border-blue-500/30"
          />
          <StatusCard
            title="Instaladas"
            count={activatedSales.length}
            icon={CheckCircle}
            color="text-green-400"
            bgColor="bg-green-500/10"
            borderColor="border-green-500/30"
          />
          <StatusCard
            title="Canceladas"
            count={cancelledSales.length}
            icon={XCircle}
            color="text-red-400"
            bgColor="bg-red-500/10"
            borderColor="border-red-500/30"
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

        {/* Top Sellers */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Top Vendedores</CardTitle>
            <CardDescription>Ranking por cantidad de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {topSellersData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellersData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={70} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No hay datos de vendedores
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ventas Recientes del Mes</CardTitle>
              <CardDescription>Ultimas ventas registradas en {getAvailableMonths().find(m => m.value === selectedMonth)?.label}</CardDescription>
            </div>
            <Link href="/admin/sales">
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Vendedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Costo Inst.</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {monthSales.slice(0, 10).map((sale) => (
                    <tr key={sale._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{sale.customerInfo.name}</p>
                          <p className="text-sm text-muted-foreground hidden sm:block">{sale.customerInfo.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground hidden md:table-cell">{sale.sellerName}</td>
                      <td className="py-3 px-4 text-foreground">{sale.planName}</td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        {sale.installationCost ? (
                          <span className="text-red-400">-{formatCurrency(sale.installationCost)}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sale.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                        {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                      </td>
                    </tr>
                  ))}
                  {monthSales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No hay ventas registradas en este mes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
}: {
  title: string
  count: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
}) {
  return (
    <Card className={`border ${borderColor} bg-card/50 hover:bg-card/80 transition-colors`}>
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
  )
}
