"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Spinner } from "@/components/ui/spinner"
import { dashboardAPI, salesAPI, AdminStats, Sale } from "@/lib/api"
import {
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
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
  pending_appointment: "#f97316",
  appointed: "#3b82f6",
  completed: "#22c55e",
  installed: "#10b981",
  cancelled: "#ef4444",
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [allSales, setAllSales] = useState<Sale[]>([])
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const [statsRes, salesRes] = await Promise.all([
          dashboardAPI.getAdminStats(token),
          salesAPI.getAdminSales(token),
        ])
        setStats(statsRes)
        setAllSales(salesRes.sales || [])
        setRecentSales(salesRes.sales?.slice(0, 5) || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Calcular estadisticas desde las ventas reales
  const totalSales = allSales.length
  const totalRevenue = allSales.reduce((acc, sale) => acc + (sale.planPrice || 0), 0)
  const totalCommissions = allSales.reduce((acc, sale) => acc + (sale.commission || 0), 0)
  const activatedSales = allSales.filter(s => s.status === "completed" || s.status === "installed").length
  const pendingSales = allSales.filter(s => s.status === "pending" || s.status === "pending_appointment" || s.status === "appointed").length

  const pieChartData = stats
    ? Object.entries(stats.stats.salesByStatus || {}).map(([name, value]) => ({
        name: name === "pending" ? "Cargadas" : name === "completed" ? "Activadas" : name === "cancelled" ? "Canceladas" : name === "appointed" ? "Turnadas" : name === "pending_appointment" ? "Observadas" : name === "installed" ? "Instaladas" : name,
        value,
        color: STATUS_COLORS[name] || "#6b7280",
      }))
    : []

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del negocio
          </p>
        </div>

        {/* Main Stats - Hero Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Total Ventas */}
          <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ventas Totales</p>
                  <p className="text-5xl font-bold text-foreground">{totalSales}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="inline-flex items-center gap-1 text-sm text-green-400">
                      <ArrowUpRight className="h-4 w-4" />
                      {activatedSales} activadas
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-sm text-yellow-400">{pendingSales} pendientes</span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingresos Totales */}
          <Card className="border-border/50 bg-gradient-to-br from-green-500/10 via-card to-card overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                  <p className="text-4xl md:text-5xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      Valor total de planes vendidos
                    </span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Comisiones Totales</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalCommissions)}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalRevenue - totalCommissions)}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendedores Activos</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats?.stats.totalUsers || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards Row */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <StatusCard
            title="Cargadas"
            count={stats?.stats.salesByStatus?.pending || 0}
            icon={Clock}
            color="text-yellow-400"
            bgColor="bg-yellow-500/10"
            borderColor="border-yellow-500/30"
          />
          <StatusCard
            title="Observadas"
            count={stats?.stats.salesByStatus?.pending_appointment || 0}
            icon={Calendar}
            color="text-orange-400"
            bgColor="bg-orange-500/10"
            borderColor="border-orange-500/30"
          />
          <StatusCard
            title="Turnadas"
            count={stats?.stats.salesByStatus?.appointed || 0}
            icon={Calendar}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
            borderColor="border-blue-500/30"
          />
          <StatusCard
            title="Activadas"
            count={(stats?.stats.salesByStatus?.completed || 0) + (stats?.stats.salesByStatus?.installed || 0)}
            icon={CheckCircle}
            color="text-green-400"
            bgColor="bg-green-500/10"
            borderColor="border-green-500/30"
          />
          <StatusCard
            title="Canceladas"
            count={stats?.stats.salesByStatus?.cancelled || 0}
            icon={XCircle}
            color="text-red-400"
            bgColor="bg-red-500/10"
            borderColor="border-red-500/30"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status Distribution */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Distribucion por Estado</CardTitle>
              <CardDescription>Ventas agrupadas por estado actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
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
              </div>
            </CardContent>
          </Card>

          {/* Top Sellers */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Top Vendedores</CardTitle>
              <CardDescription>Ranking por cantidad de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Ultimas ventas registradas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Vendedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{sale.customerInfo.name}</p>
                          <p className="text-sm text-muted-foreground hidden sm:block">{sale.customerInfo.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground hidden md:table-cell">{sale.sellerName}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-foreground">{sale.planName}</p>
                          <p className="text-sm text-primary font-medium">{formatCurrency(sale.planPrice)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sale.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                        {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                      </td>
                    </tr>
                  ))}
                  {recentSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No hay ventas registradas
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
