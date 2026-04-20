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
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
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

  // Calculate commission based on sales count
  const calculateCommission = (salesCount: number) => {
    if (salesCount >= 26) return 400000
    if (salesCount >= 20) return 375000
    if (salesCount >= 10) return 350000
    if (salesCount >= 5) return 300000
    if (salesCount >= 1) return 200000
    return 0
  }

  const completedSales = mySales.filter(s => s.status === "completed" || s.status === "installed").length
  const monthlyCommission = calculateCommission(completedSales)

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

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Mis Ventas"
            value={stats?.stats.totalSales || mySales.length}
            icon={ShoppingCart}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Ventas Activadas"
            value={completedSales}
            icon={CheckCircle}
          />
          <StatCard
            title="Ventas Pendientes"
            value={stats?.stats.pendingSales || mySales.filter(s => s.status === "pending").length}
            icon={Clock}
          />
          <StatCard
            title="Comision del Mes"
            value={formatCurrency(monthlyCommission)}
            icon={DollarSign}
            description={`${completedSales} ventas activadas`}
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

          {/* Commission Scale */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Escala de Comisiones</CardTitle>
              <CardDescription>Tu progreso este mes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CommissionTier
                range="1-4 ventas"
                amount={200000}
                isActive={completedSales >= 1 && completedSales < 5}
                isCompleted={completedSales >= 5}
              />
              <CommissionTier
                range="5-9 ventas"
                amount={300000}
                isActive={completedSales >= 5 && completedSales < 10}
                isCompleted={completedSales >= 10}
              />
              <CommissionTier
                range="10-19 ventas"
                amount={350000}
                isActive={completedSales >= 10 && completedSales < 20}
                isCompleted={completedSales >= 20}
              />
              <CommissionTier
                range="20-25 ventas"
                amount={375000}
                isActive={completedSales >= 20 && completedSales < 26}
                isCompleted={completedSales >= 26}
              />
              <CommissionTier
                range="26+ ventas"
                amount={400000}
                isActive={completedSales >= 26}
                isCompleted={false}
              />
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tu comision actual:</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(monthlyCommission)}</span>
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

function CommissionTier({
  range,
  amount,
  isActive,
  isCompleted,
}: {
  range: string
  amount: number
  isActive: boolean
  isCompleted: boolean
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
        isActive
          ? "border-primary bg-primary/10"
          : isCompleted
          ? "border-green-500/30 bg-green-500/10"
          : "border-border/50 bg-secondary/30"
      }`}
    >
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-400" />
        ) : isActive ? (
          <TrendingUp className="h-5 w-5 text-primary" />
        ) : (
          <Clock className="h-5 w-5 text-muted-foreground" />
        )}
        <span className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {range}
        </span>
      </div>
      <span className={`font-semibold ${isActive ? "text-primary" : isCompleted ? "text-green-400" : "text-muted-foreground"}`}>
        {formatCurrency(amount)}
      </span>
    </div>
  )
}
