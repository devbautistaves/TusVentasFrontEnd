"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Spinner } from "@/components/ui/spinner"
import { salesAPI, Sale } from "@/lib/api"
import {
  ShoppingCart,
  DollarSign,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
} from "lucide-react"

// Constantes de comision supervisor
const SUPERVISOR_BASE_COMMISSION = 720000 // $720.000 por venta
const ADMIN_COST = 35000 // $35.000 costo administrativo fijo
const SUPERVISOR_PERCENTAGE = 0.40 // 40%

export default function SupervisorDashboardPage() {
  const [mySales, setMySales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const salesRes = await salesAPI.getMySales(token)
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

  // Calcular comisiones del supervisor
  const calculateSupervisorCommission = () => {
    // Solo ventas instaladas (completed) del mes
    const completedSalesThisMonth = installedSales

    let totalBeforePercentage = 0

    completedSalesThisMonth.forEach(sale => {
      const baseCommission = SUPERVISOR_BASE_COMMISSION
      const installationCost = sale.installationCost || 0
      const adCost = sale.adCost || 0
      const sellerCommission = sale.sellerCommissionPaid || 0
      
      const netCommission = baseCommission - installationCost - ADMIN_COST - adCost - sellerCommission
      totalBeforePercentage += netCommission
    })

    // Descontar instalaciones pagadas de ventas canceladas
    cancelledSales.forEach(sale => {
      if (sale.installationCost && sale.installationCost > 0) {
        totalBeforePercentage -= sale.installationCost
      }
    })

    // Aplicar el 40%
    return Math.max(0, totalBeforePercentage * SUPERVISOR_PERCENTAGE)
  }

  const totalCommission = calculateSupervisorCommission()

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="supervisor">
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="supervisor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Dashboard</h1>
            <p className="text-muted-foreground">
              Resumen de tu actividad como Supervisor
            </p>
          </div>
          <Link href="/supervisor/new-sale">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </Link>
        </div>

        {/* Stats Grid - Estado de Ventas */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <StatCard
            title="Ventas Instaladas"
            value={installedSales.length}
            icon={CheckCircle}
            className="border-green-500/30"
          />
          <StatCard
            title="Ventas Canceladas"
            value={cancelledSales.length}
            icon={XCircle}
            className="border-red-500/30"
          />
          <StatCard
            title="Ventas Turnadas"
            value={appointedSales.length}
            icon={Calendar}
            className="border-blue-500/30"
          />
          <StatCard
            title="Ventas Observadas"
            value={observedSales.length}
            icon={AlertTriangle}
            className="border-yellow-500/30"
          />
          <StatCard
            title="Ventas Cargadas"
            value={loadedSales.length}
            icon={Clock}
            className="border-orange-500/30"
          />
        </div>

        {/* Commission Summary */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Mi Comision del Mes</CardTitle>
              <CardDescription>Calculo basado en ventas instaladas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <p className="text-4xl font-bold text-primary">{formatCurrency(totalCommission)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  40% sobre {installedSales.length} ventas instaladas
                </p>
              </div>
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Comision base por venta:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(SUPERVISOR_BASE_COMMISSION)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Costo administrativo:</span>
                  <span className="font-semibold text-red-400">-{formatCurrency(ADMIN_COST)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Porcentaje aplicado:</span>
                  <span className="font-semibold text-foreground">40%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Resumen del Mes</CardTitle>
              <CardDescription>Total de ventas y estados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-foreground">Instaladas</span>
                  </div>
                  <span className="font-bold text-green-400">{installedSales.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <span className="text-foreground">Canceladas</span>
                  </div>
                  <span className="font-bold text-red-400">{cancelledSales.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <span className="text-foreground">Turnadas</span>
                  </div>
                  <span className="font-bold text-blue-400">{appointedSales.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <span className="text-foreground">Observadas</span>
                  </div>
                  <span className="font-bold text-yellow-400">{observedSales.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-400" />
                    <span className="text-foreground">Cargadas (Pendientes)</span>
                  </div>
                  <span className="font-bold text-orange-400">{loadedSales.length}</span>
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
            <Link href="/supervisor/sales">
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
