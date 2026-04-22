"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Spinner } from "@/components/ui/spinner"
import { dashboardAPI, salesAPI, DashboardStats, Sale } from "@/lib/api"
import { getActivatedSalesThisMonth, calculateTotalCommission, getCommissionPerSale, getCommissionTier } from "@/lib/commissions"
import {
  ShoppingCart,
  DollarSign,
  Plus,
  CheckCircle,
  TrendingUp,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [mySales, setMySales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const [statsRes, salesRes] = await Promise.all([
          dashboardAPI.getStats(token),
          salesAPI.getMySales(token),
        ])
        setStats(statsRes)
        setMySales(salesRes.sales)
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

  // Filtrar ventas del mes actual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const salesThisMonth = mySales.filter(sale => {
    const saleDate = new Date(sale.createdAt)
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
  })

  // Contar por estado
  const installedSales = salesThisMonth.filter(s => s.status === "completed")
  const cancelledSales = salesThisMonth.filter(s => s.status === "cancelled")
  const appointedSales = salesThisMonth.filter(s => s.status === "appointed")
  const observedSales = salesThisMonth.filter(s => s.status === "pending_appointment")
  const loadedSales = salesThisMonth.filter(s => s.status === "pending")
  
  // Calcular comision total basada en la cantidad de ventas activadas
  const activatedCount = installedSales.length
  const commissionPerSale = getCommissionPerSale(activatedCount)
  const totalCommission = calculateTotalCommission(activatedCount)

  // Mock chart data - in production this would come from the API
  const chartData = [
    { name: "Lun", ventas: 2 },
    { name: "Mar", ventas: 4 },
    { name: "Mie", ventas: 3 },
    { name: "Jue", ventas: 5 },
    { name: "Vie", ventas: 6 },
    { name: "Sab", ventas: 4 },
    { name: "Dom", ventas: 2 },
  ]

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="seller">
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="seller">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Dashboard</h1>
            <p className="text-muted-foreground">
              Resumen de tu actividad de ventas
            </p>
          </div>
          <Link href="/seller/new-sale">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </Link>
        </div>

        {/* Stats Grid - Estado de Ventas */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            title="Instaladas"
            value={installedSales.length}
            icon={CheckCircle}
            className="border-green-500/30"
          />
          <StatCard
            title="Canceladas"
            value={cancelledSales.length}
            icon={XCircle}
            className="border-red-500/30"
          />
          <StatCard
            title="Turnadas"
            value={appointedSales.length}
            icon={Calendar}
            className="border-blue-500/30"
          />
          <StatCard
            title="Observadas"
            value={observedSales.length}
            icon={AlertTriangle}
            className="border-yellow-500/30"
          />
          <StatCard
            title="Cargadas"
            value={loadedSales.length}
            icon={Clock}
            className="border-orange-500/30"
          />
          <StatCard
            title="Mi Comision"
            value={formatCurrency(totalCommission)}
            icon={DollarSign}
            description={activatedCount > 0 ? `${activatedCount} x ${formatCurrency(commissionPerSale)}` : "Sin ventas"}
          />
        </div>

        {/* Charts and Commission Info */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales Chart */}
          <Card className="lg:col-span-2 border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Ventas de la Semana</CardTitle>
              <CardDescription>Tu actividad de los ultimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ventas"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorVentas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Commission Summary */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Mi Comision</CardTitle>
              <CardDescription>Resumen de tus ganancias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <p className="text-4xl font-bold text-primary">{formatCurrency(totalCommission)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {activatedCount > 0 
                    ? `${activatedCount} ventas x ${formatCurrency(commissionPerSale)}` 
                    : "Sin ventas activadas"}
                </p>
              </div>
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total ventas:</span>
                  <span className="font-semibold text-foreground">{mySales.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Activadas:</span>
                  <span className="font-semibold text-foreground">{installedSales.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pendientes:</span>
                  <span className="font-semibold text-foreground">{mySales.filter(s => s.status === "pending" || s.status === "pending_appointment" || s.status === "appointed").length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mis Ventas Recientes</CardTitle>
              <CardDescription>Tus ultimas ventas registradas</CardDescription>
            </div>
            <Link href="/seller/sales">
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {mySales.slice(0, 5).map((sale) => (
                    <tr key={sale._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{sale.customerInfo.name}</p>
                          <p className="text-sm text-muted-foreground">{sale.customerInfo.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{sale.planName}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sale.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                      </td>
                    </tr>
                  ))}
                  {mySales.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No tienes ventas registradas aun
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


