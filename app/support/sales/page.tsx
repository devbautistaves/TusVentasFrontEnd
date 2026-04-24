"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Sidebar } from "@/components/layout/sidebar"
import { useToast } from "@/hooks/use-toast"
import { Sale } from "@/lib/api"
import {
  Menu,
  Search,
  Eye,
  Edit2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  Package,
  FileText,
} from "lucide-react"

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "pending_appointment", label: "Observada" },
  { value: "appointed", label: "Turnada" },
  { value: "completed", label: "Activada" },
  { value: "cancelled", label: "Cancelada" },
]

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  pending_appointment: "Observada",
  appointed: "Turnada",
  completed: "Activada",
  cancelled: "Cancelada",
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  pending_appointment: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  appointed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || "bg-gray-500/20 text-gray-400"}`}>
      {statusLabels[status] || status}
    </span>
  )
}

interface Seller {
  _id: string
  name: string
  email: string
  role: string
}

function SupportSalesContent() {
  const [sales, setSales] = useState<Sale[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sellerFilter, setSellerFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Dialog states
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusNotes, setStatusNotes] = useState("")
  const [statusDate, setStatusDate] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    
    if (!token || !userStr) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userStr)
    if (user.role !== "support") {
      router.push("/login")
      return
    }

    setUserName(user.name)
    
    // Check URL params for initial filter
    const urlStatus = searchParams.get("status")
    if (urlStatus) {
      setStatusFilter(urlStatus)
    }
    
    fetchSales(token)
    fetchSellers(token)
  }, [router, searchParams])

  const fetchSales = async (token?: string) => {
    const authToken = token || localStorage.getItem("token")
    if (!authToken) return

    try {
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      params.append("limit", "20")
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      if (sellerFilter && sellerFilter !== "all") params.append("sellerId", sellerFilter)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/support/sales?${params.toString()}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      
      if (!response.ok) throw new Error("Failed to fetch sales")
      
      const data = await response.json()
      setSales(data.sales)
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error("Error fetching sales:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSellers = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/support/sellers`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (!response.ok) throw new Error("Failed to fetch sellers")
      
      const data = await response.json()
      setSellers(data.sellers)
    } catch (error) {
      console.error("Error fetching sellers:", error)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchSales(token)
    }
  }, [currentPage, statusFilter, sellerFilter])

  const handleUpdateStatus = async () => {
    if (!selectedSale || !newStatus) return
    
    if ((newStatus === "appointed" || newStatus === "completed") && !statusDate) {
      toast({
        title: "Fecha requerida",
        description: "Debes seleccionar una fecha para este estado",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/support/sales/${selectedSale._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            status: newStatus, 
            notes: statusNotes,
            statusDate: statusDate || undefined,
          }),
        }
      )

      if (!response.ok) throw new Error("Failed to update status")

      toast({
        title: "Estado actualizado",
        description: "El estado de la venta se ha actualizado correctamente",
      })
      
      setIsStatusDialogOpen(false)
      setStatusNotes("")
      setStatusDate("")
      fetchSales()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredSales = sales.filter((sale) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      sale.customerInfo.name.toLowerCase().includes(searchLower) ||
      sale.customerInfo.phone.includes(searchTerm) ||
      sale.customerInfo.dni.includes(searchTerm) ||
      sale.planName.toLowerCase().includes(searchLower)
    )
  })

  const getSellerName = (sale: Sale): string => {
    if (typeof sale.sellerId === "object" && sale.sellerId?.name) {
      return sale.sellerId.name
    }
    return sale.sellerName || "Desconocido"
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:z-0
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          role="support" 
          userName={userName} 
          onLinkClick={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Ventas</h1>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestion de Ventas</h1>
            <p className="text-muted-foreground mt-1">Administra el estado de las ventas</p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente, telefono, DNI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] bg-secondary/50">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sellerFilter} onValueChange={setSellerFilter}>
                    <SelectTrigger className="w-[180px] bg-secondary/50">
                      <User className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {sellers.map((seller) => (
                        <SelectItem key={seller._id} value={seller._id}>
                          {seller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ventas ({filteredSales.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vendedor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
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
                        <td className="py-3 px-4 text-foreground">{sale.planName}</td>
                        <td className="py-3 px-4 text-muted-foreground">{getSellerName(sale)}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <div className="text-sm">
                            <p>{new Date(sale.createdAt).toLocaleDateString("es-AR")}</p>
                            {sale.appointedDate && sale.status === "appointed" && (
                              <p className="text-xs text-blue-400">Turno: {new Date(sale.appointedDate).toLocaleDateString("es-AR")}</p>
                            )}
                            {sale.completedDate && sale.status === "completed" && (
                              <p className="text-xs text-green-400">Activ: {new Date(sale.completedDate).toLocaleDateString("es-AR")}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={sale.status} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedSale(sale)
                                setIsDetailDialogOpen(true)
                              }}
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedSale(sale)
                                setNewStatus(sale.status)
                                if (sale.status === "appointed" || sale.status === "completed") {
                                  const today = new Date().toISOString().split("T")[0]
                                  setStatusDate(today)
                                } else {
                                  setStatusDate("")
                                }
                                setIsStatusDialogOpen(true)
                              }}
                              title="Cambiar estado"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSales.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No se encontraron ventas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Pagina {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Venta</DialogTitle>
            <DialogDescription>
              Informacion completa de la venta
            </DialogDescription>
          </DialogHeader>
          {selectedSale && selectedSale.customerInfo && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Header con estado y fechas */}
              <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedSale.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Carga: </span>
                    <span className="text-foreground">{new Date(selectedSale.createdAt).toLocaleDateString("es-AR")}</span>
                  </div>
                  {selectedSale.appointedDate && (
                    <div>
                      <span className="text-muted-foreground">Turno: </span>
                      <span className="text-blue-400">{new Date(selectedSale.appointedDate).toLocaleDateString("es-AR")}</span>
                    </div>
                  )}
                  {selectedSale.completedDate && (
                    <div>
                      <span className="text-muted-foreground">Activacion: </span>
                      <span className="text-green-400">{new Date(selectedSale.completedDate).toLocaleDateString("es-AR")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cliente */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informacion del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{selectedSale.customerInfo?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">DNI</p>
                    <p className="font-medium">{selectedSale.customerInfo?.dni || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedSale.customerInfo?.phone || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedSale.customerInfo?.email || "N/A"}</p>
                  </div>
                  <div className="col-span-2 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p>
                      {typeof selectedSale.customerInfo?.address === 'string' 
                        ? selectedSale.customerInfo.address 
                        : selectedSale.customerInfo?.address
                          ? `${selectedSale.customerInfo.address.street || ''} ${selectedSale.customerInfo.address.number || ''}, ${selectedSale.customerInfo.address.city || ''}, ${selectedSale.customerInfo.address.province || ''}`
                          : "N/A"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Plan Contratado
                </h3>
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <p className="font-medium text-lg">{selectedSale.planName}</p>
                  {selectedSale.planDetail && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedSale.planDetail}</p>
                  )}
                </div>
              </div>

              {/* Vendedor */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Vendedor</h3>
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <p className="font-medium">{getSellerName(selectedSale)}</p>
                </div>
              </div>

              {/* Historial de Estados */}
              {selectedSale.statusHistory && selectedSale.statusHistory.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Historial de Estados
                  </h3>
                  <div className="space-y-2">
                    {selectedSale.statusHistory.map((history, index) => (
                      <div
                        key={index}
                        className="p-3 bg-secondary/20 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <StatusBadge status={history.status} />
                          {history.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{history.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(history.changedAt).toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {selectedSale && !selectedSale.customerInfo && (
            <div className="p-4 text-center text-muted-foreground">
              No hay informacion disponible para esta venta
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
              <Select value={newStatus} onValueChange={(value) => {
                setNewStatus(value)
                if (value !== "appointed" && value !== "completed") {
                  setStatusDate("")
                }
              }}>
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
            
            {/* Selector de fecha para TURNADA y ACTIVADA */}
            {(newStatus === "appointed" || newStatus === "completed") && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Fecha del {newStatus === "appointed" ? "Turno" : "Activacion"} *
                </label>
                <Input
                  type="date"
                  value={statusDate}
                  onChange={(e) => setStatusDate(e.target.value)}
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">
                  {newStatus === "appointed" 
                    ? "La venta se mostrara en el mes de esta fecha."
                    : "La activacion se registrara en esta fecha."}
                </p>
              </div>
            )}
            
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
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SupportSalesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SupportSalesContent />
    </Suspense>
  )
}
