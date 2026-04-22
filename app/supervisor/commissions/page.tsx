"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { salesAPI, Sale } from "@/lib/api"
import { DollarSign, TrendingUp, Download, Calendar, FileSpreadsheet, Edit2 } from "lucide-react"

// Constantes de comision supervisor
const SUPERVISOR_BASE_COMMISSION = 750000 // Importe base de comision
const SUPERVISOR_PERCENTAGE = 0.40

export default function SupervisorCommissionsPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isCostsDialogOpen, setIsCostsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [costForm, setCostForm] = useState({
    installationCost: 0,
    adminCost: 0,
    adCost: 0,
    sellerCommissionPaid: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await salesAPI.getMySales(token)
      setSales(response.sales)
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setIsLoading(false)
    }
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
    return sales.filter(sale => {
      const saleDate = new Date(sale.createdAt)
      return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year
    })
  }

  const monthSales = getMonthSales()
  const completedSales = monthSales.filter(s => s.status === "completed")
  const cancelledSales = monthSales.filter(s => s.status === "cancelled")

  // Calcular comision detallada
  // Base: $750,000 - Descontar: Instalacion, Administracion, Anuncio, Comision Vendedor
  const calculateDetailedCommission = () => {
    let details: Array<{
      sale: Sale
      baseCommission: number
      installationCost: number
      adminCost: number
      adCost: number
      sellerCommission: number
      netCommission: number
    }> = []

    let totalBeforePercentage = 0

    completedSales.forEach(sale => {
      const baseCommission = SUPERVISOR_BASE_COMMISSION // $750,000
      const installationCost = sale.installationCost || 0
      const adminCost = sale.adminCost || 0
      const adCost = sale.adCost || 0
      const sellerCommission = sale.sellerCommissionPaid || 0
      
      // Neto = Base - Instalacion - Admin - Anuncio - Comision Vendedor
      const netCommission = baseCommission - installationCost - adminCost - adCost - sellerCommission
      totalBeforePercentage += netCommission

      details.push({
        sale,
        baseCommission,
        installationCost,
        adminCost,
        adCost,
        sellerCommission,
        netCommission,
      })
    })

    // Descontar instalaciones de canceladas
    let cancelledInstallationCost = 0
    cancelledSales.forEach(sale => {
      if (sale.installationCost && sale.installationCost > 0) {
        cancelledInstallationCost += sale.installationCost
      }
    })

    totalBeforePercentage -= cancelledInstallationCost

    const finalCommission = Math.max(0, totalBeforePercentage * SUPERVISOR_PERCENTAGE)

    return {
      details,
      totalBeforePercentage,
      cancelledInstallationCost,
      finalCommission,
    }
  }

  const commission = calculateDetailedCommission()

  const handleOpenCostsDialog = (sale: Sale) => {
    setSelectedSale(sale)
    setCostForm({
      installationCost: sale.installationCost || 0,
      adminCost: sale.adminCost || 0,
      adCost: sale.adCost || 0,
      sellerCommissionPaid: sale.sellerCommissionPaid || 0,
    })
    setIsCostsDialogOpen(true)
  }

  const handleUpdateCosts = async () => {
    if (!selectedSale) return

    setIsUpdating(true)
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await salesAPI.updateCosts(token, selectedSale._id, costForm)
      toast({
        title: "Costos actualizados",
        description: "Los costos de la venta se han actualizado correctamente",
      })
      setIsCostsDialogOpen(false)
      fetchSales()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar los costos",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      "Cliente",
      "DNI",
      "Plan",
      "Estado",
      "Fecha",
      "Base",
      "Costo Instalacion",
      "Costo Admin",
      "Costo Anuncio",
      "Comision Vendedor",
      "Neto"
    ]

    const rows = commission.details.map(d => [
      d.sale.customerInfo.name,
      d.sale.customerInfo.dni,
      d.sale.planName,
      d.sale.status,
      new Date(d.sale.createdAt).toLocaleDateString("es-AR"),
      d.baseCommission,
      d.installationCost,
      d.adminCost,
      d.adCost,
      d.sellerCommission,
      d.netCommission,
    ])

    // Add summary
    rows.push([])
    rows.push(["RESUMEN"])
    rows.push(["Total antes de %", commission.totalBeforePercentage])
    rows.push(["Descuento canceladas", -commission.cancelledInstallationCost])
    rows.push(["Porcentaje", "40%"])
    rows.push(["COMISION FINAL", commission.finalCommission])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `comisiones-supervisor-${selectedMonth}.csv`
    link.click()

    toast({
      title: "Exportacion completada",
      description: "El archivo CSV se ha descargado correctamente",
    })
  }

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
            <h1 className="text-3xl font-bold text-foreground">Mis Comisiones</h1>
            <p className="text-muted-foreground">
              Detalle de comisiones del mes seleccionado
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
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Commission Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ventas Instaladas</p>
                  <p className="text-2xl font-bold text-foreground">{completedSales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Antes de %</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(commission.totalBeforePercentage)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Download className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Descuentos Canceladas</p>
                  <p className="text-2xl font-bold text-red-400">-{formatCurrency(commission.cancelledInstallationCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comision Final (40%)</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(commission.finalCommission)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Detalle de Comisiones</CardTitle>
            <CardDescription>Desglose por venta instalada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Base</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Instalacion</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Admin</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Anuncio</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Com. Vendedor</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Neto</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {commission.details.map((detail) => (
                    <tr
                      key={detail.sale._id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{detail.sale.customerInfo.name}</p>
                          <p className="text-sm text-muted-foreground">{detail.sale.customerInfo.dni}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{detail.sale.planName}</td>
                      <td className="py-3 px-4 text-right text-foreground">{formatCurrency(detail.baseCommission)}</td>
                      <td className="py-3 px-4 text-right text-red-400">-{formatCurrency(detail.installationCost)}</td>
                      <td className="py-3 px-4 text-right text-red-400">-{formatCurrency(detail.adminCost)}</td>
                      <td className="py-3 px-4 text-right text-red-400">-{formatCurrency(detail.adCost)}</td>
                      <td className="py-3 px-4 text-right text-red-400">-{formatCurrency(detail.sellerCommission)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-primary">{formatCurrency(detail.netCommission)}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenCostsDialog(detail.sale)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {commission.details.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        No hay ventas instaladas este mes
                      </td>
                    </tr>
                  )}
                </tbody>
                {commission.details.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-border bg-secondary/20">
                      <td colSpan={7} className="py-3 px-4 text-right font-semibold text-foreground">
                        Total antes del 40%:
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        {formatCurrency(commission.totalBeforePercentage)}
                      </td>
                      <td></td>
                    </tr>
                    {commission.cancelledInstallationCost > 0 && (
                      <tr className="bg-secondary/20">
                        <td colSpan={7} className="py-3 px-4 text-right font-semibold text-red-400">
                          Descuento por canceladas:
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-red-400">
                          -{formatCurrency(commission.cancelledInstallationCost)}
                        </td>
                        <td></td>
                      </tr>
                    )}
                    <tr className="bg-primary/10">
                      <td colSpan={7} className="py-3 px-4 text-right font-semibold text-primary">
                        COMISION FINAL (40%):
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-primary text-lg">
                        {formatCurrency(commission.finalCommission)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Cancelled Sales with Installation Cost */}
        {cancelledSales.filter(s => s.installationCost && s.installationCost > 0).length > 0 && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-400">Ventas Canceladas con Costo de Instalacion</CardTitle>
              <CardDescription>Estos montos se descuentan del total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Costo Instalacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancelledSales.filter(s => s.installationCost && s.installationCost > 0).map((sale) => (
                      <tr
                        key={sale._id}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-foreground">{sale.customerInfo.name}</p>
                            <p className="text-sm text-muted-foreground">{sale.customerInfo.dni}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{sale.planName}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={sale.status} />
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-red-400">
                          -{formatCurrency(sale.installationCost || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Costs Dialog */}
        <Dialog open={isCostsDialogOpen} onOpenChange={setIsCostsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Costos de Venta</DialogTitle>
              <DialogDescription>
                Ingresa los costos aplicables a esta venta
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="installationCost">Costo de Instalacion (pagado por JV)</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="installationCost"
                    type="number"
                    value={costForm.installationCost}
                    onChange={(e) => setCostForm(prev => ({ ...prev, installationCost: Number(e.target.value) }))}
                    className="bg-secondary/50 pl-8"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="adminCost">Costo de Administracion (JV)</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="adminCost"
                    type="number"
                    value={costForm.adminCost}
                    onChange={(e) => setCostForm(prev => ({ ...prev, adminCost: Number(e.target.value) }))}
                    className="bg-secondary/50 pl-8"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="adCost">Costo de Anuncio</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="adCost"
                    type="number"
                    value={costForm.adCost}
                    onChange={(e) => setCostForm(prev => ({ ...prev, adCost: Number(e.target.value) }))}
                    className="bg-secondary/50 pl-8"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="sellerCommissionPaid">Comision del Vendedor</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="sellerCommissionPaid"
                    type="number"
                    value={costForm.sellerCommissionPaid}
                    onChange={(e) => setCostForm(prev => ({ ...prev, sellerCommissionPaid: Number(e.target.value) }))}
                    className="bg-secondary/50 pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Este monto se descontara de tu comision total
                </p>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCostsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateCosts}
                disabled={isUpdating}
                className="bg-primary text-primary-foreground"
              >
                {isUpdating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Costos"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
