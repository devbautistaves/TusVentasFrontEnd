"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
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
        setRecentSales(salesRes.sales.slice(0, 5))
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

  const pieChartData = stats
    ? Object.entries(stats.stats.salesByStatus || {}).map(([name, value]) => ({
        name: name === "pending" ? "Cargadas" : name === "completed" ? "Activadas" : name === "cancelled" ? "Canceladas" : name === "appointed" ? "Turnadas" : name === "pending_appointment" ? "Observadas" : name,
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
            Bienvenido al panel de administracion
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Ventas Totales"
            value={stats?.stats.totalSales || 0}
            icon={ShoppingCart}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(stats?.stats.totalRevenue || 0)}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Comisiones Pagadas"
            value={formatCurrency(stats?.stats.totalCommissions || 0)}
            icon={TrendingUp}
          />
          <StatCard
            title="Vendedores Activos"
            value={stats?.stats.totalUsers || 0}
            icon={Users}
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
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
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
              <CardDescription>Rendimiento de los mejores vendedores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellersData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <StatusCard
            title="Cargadas"
            count={stats?.stats.salesByStatus?.pending || 0}
            icon={Clock}
            color="text-yellow-400"
            bgColor="bg-yellow-500/10"
          />
          <StatusCard
            title="Observadas"
            count={stats?.stats.salesByStatus?.pending_appointment || 0}
            icon={Calendar}
            color="text-orange-400"
            bgColor="bg-orange-500/10"
          />
          <StatusCard
            title="Turnadas"
            count={stats?.stats.salesByStatus?.appointed || 0}
            icon={Calendar}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
          />
          <StatusCard
            title="Activadas"
            count={stats?.stats.salesByStatus?.completed || 0}
            icon={CheckCircle}
            color="text-green-400"
            bgColor="bg-green-500/10"
          />
          <StatusCard
            title="Canceladas"
            count={stats?.stats.salesByStatus?.cancelled || 0}
            icon={XCircle}
            color="text-red-400"
            bgColor="bg-red-500/10"
          />
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vendedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{sale.customerInfo.name}</p>
                          <p className="text-sm text-muted-foreground">{sale.customerInfo.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{sale.sellerName}</td>
                      <td className="py-3 px-4 text-foreground">{sale.planName}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sale.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                      </td>
                    </tr>
                  ))}
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
}: {
  title: string
  count: number
  icon: any
  color: string
  bgColor: string
}) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
