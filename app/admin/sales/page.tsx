"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, getStatusOptions } from "@/components/ui/status-badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { salesAPI, Sale } from "@/lib/api"
import { Search, Filter, Eye, Edit2, Calendar, User, Phone, MapPin, Mail, CreditCard, UserPlus, FileText } from "lucide-react"

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusNotes, setStatusNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSales()
  }, [])

  useEffect(() => {
    filterSales()
  }, [sales, searchQuery, statusFilter])

  const fetchSales = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await salesAPI.getAdminSales(token)
      setSales(response.sales)
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterSales = () => {
    let filtered = [...sales]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (sale) =>
          sale.customerInfo.name.toLowerCase().includes(query) ||
          sale.customerInfo.dni.toLowerCase().includes(query) ||
          sale.sellerName.toLowerCase().includes(query) ||
          sale.planName.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.status === statusFilter)
    }

    setFilteredSales(filtered)
  }

  const handleUpdateStatus = async () => {
    if (!selectedSale || !newStatus) return

    setIsUpdating(true)
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await salesAPI.updateStatus(token, selectedSale._id, newStatus, statusNotes)
      toast({
        title: "Estado actualizado",
        description: "El estado de la venta se ha actualizado correctamente",
      })
      setIsStatusDialogOpen(false)
      setStatusNotes("")
      fetchSales()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const statusOptions = getStatusOptions()

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
          <h1 className="text-3xl font-bold text-foreground">Gestion de Ventas</h1>
          <p className="text-muted-foreground">
            Administra todas las ventas del sistema
          </p>
        </div>

        {/* Filters */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, DNI, vendedor o plan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-secondary/50">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Ventas ({filteredSales.length})</CardTitle>
            <CardDescription>Lista completa de ventas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">DNI</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vendedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale._id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{sale.customerInfo.name}</p>
                          <p className="text-sm text-muted-foreground">{sale.customerInfo.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{sale.customerInfo.dni}</td>
                      <td className="py-3 px-4 text-foreground">{sale.sellerName}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{sale.planName}</p>
                          <p className="text-sm text-primary">{formatCurrency(sale.planPrice)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sale.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedSale(sale)
                              setIsDetailOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedSale(sale)
                              setNewStatus(sale.status)
                              setIsStatusDialogOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No se encontraron ventas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Sale Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de Venta</DialogTitle>
              <DialogDescription>
                Informacion completa de la venta
              </DialogDescription>
            </DialogHeader>
            {selectedSale && (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Header con estado y fecha */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <StatusBadge status={selectedSale.status} />
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedSale.createdAt).toLocaleString("es-AR")}
                  </span>
                </div>

                {/* Datos del Cliente */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <User className="h-4 w-4 text-primary" />
                    Datos del Cliente
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Nombre Completo</p>
                      <p className="font-medium text-foreground">{selectedSale.customerInfo.name}</p>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">DNI</p>
                      <p className="font-medium text-foreground">{selectedSale.customerInfo.dni}</p>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {selectedSale.customerInfo.email}
                      </p>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Telefono</p>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {selectedSale.customerInfo.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direccion */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Direccion de Instalacion
                  </h4>
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <p className="font-medium text-foreground">
                      {selectedSale.customerInfo.address.street} {selectedSale.customerInfo.address.number}
                      {selectedSale.customerInfo.address.floor && `, Piso ${selectedSale.customerInfo.address.floor}`}
                      {selectedSale.customerInfo.address.apartment && ` Dpto ${selectedSale.customerInfo.address.apartment}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSale.customerInfo.address.city}, {selectedSale.customerInfo.address.province}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CP: {selectedSale.customerInfo.address.postalCode}
                    </p>
                  </div>
                </div>

                {/* Contacto de Emergencia */}
                {selectedSale.customerInfo.emergencyContact && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                      <UserPlus className="h-4 w-4 text-primary" />
                      Contacto de Emergencia
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="bg-secondary/20 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Nombre</p>
                        <p className="font-medium text-foreground">{selectedSale.customerInfo.emergencyContact.name}</p>
                      </div>
                      <div className="bg-secondary/20 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Telefono</p>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {selectedSale.customerInfo.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan y Vendedor */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Plan Contratado
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="font-semibold text-foreground">{selectedSale.planName}</p>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Vendedor</p>
                      <p className="font-semibold text-foreground">{selectedSale.sellerName}</p>
                    </div>
                  </div>
                  {selectedSale.planDetail && (
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Detalle del Plan</p>
                      <p className="text-sm text-foreground">{selectedSale.planDetail}</p>
                    </div>
                  )}
                </div>

                {/* Metodo de Pago */}
                {selectedSale.paymentInfo && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Metodo de Pago
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="bg-secondary/20 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Pago del Abono</p>
                        <p className="font-medium text-foreground">
                          {selectedSale.paymentInfo.paymentMethodAbono === "credit_card" 
                            ? `Tarjeta de Credito (${selectedSale.paymentInfo.cardBrand?.toUpperCase() || ""})`
                            : "Debito Automatico CBU"}
                        </p>
                        {selectedSale.paymentInfo.cbuNumber && (
                          <p className="text-xs text-muted-foreground mt-1">
                            CBU: {selectedSale.paymentInfo.cbuNumber}
                          </p>
                        )}
                      </div>
                      <div className="bg-secondary/20 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Pago de Instalacion</p>
                        <p className="font-medium text-foreground">
                          {selectedSale.paymentInfo.paymentMethodInstallation === "transfer" 
                            ? "Transferencia Bancaria"
                            : "Mercado Pago"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observaciones */}
                {selectedSale.description && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground border-b border-border pb-2">
                      Observaciones
                    </h4>
                    <pre className="text-foreground text-sm whitespace-pre-wrap bg-secondary/20 p-3 rounded-lg">
                      {selectedSale.description}
                    </pre>
                  </div>
                )}

                {/* Historial de Estados */}
                {selectedSale.statusHistory && selectedSale.statusHistory.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Historial de Estados
                    </h4>
                    <div className="space-y-2">
                      {selectedSale.statusHistory.map((history, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/20">
                          <StatusBadge status={history.status} />
                          <span className="text-muted-foreground">
                            {new Date(history.changedAt).toLocaleString("es-AR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Estado</DialogTitle>
              <DialogDescription>
                Actualiza el estado de la venta de {selectedSale?.customerInfo.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nuevo Estado</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notas (opcional)</label>
                <Textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Agregar notas sobre el cambio de estado..."
                  className="bg-secondary/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="bg-primary text-primary-foreground"
              >
                {isUpdating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Estado"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
