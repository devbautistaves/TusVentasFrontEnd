"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { StatusBadge } from "@/components/ui/status-badge"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
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
import { useToast } from "@/hooks/use-toast"
import { usersAPI, salesAPI, adCostsAPI, User, Sale, SupervisorAdCost as APIAdCost } from "@/lib/api"
import { DollarSign, TrendingUp, Edit2, Users, Award, FileSpreadsheet, Calendar, Eye, Megaphone, History, Wrench } from "lucide-react"

// Constantes
const SUPERVISOR_BASE_COMMISSION = 750000
const ADMIN_COST = 35000
const SUPERVISOR_PERCENTAGE = 0.40

interface CommissionTier {
  minSales: number
  maxSales: number
  amount: number
}

const DEFAULT_TIERS: CommissionTier[] = [
  { minSales: 1, maxSales: 4, amount: 200000 },
  { minSales: 5, maxSales: 9, amount: 300000 },
  { minSales: 10, maxSales: 19, amount: 350000 },
  { minSales: 20, maxSales: 25, amount: 375000 },
  { minSales: 26, maxSales: 999, amount: 400000 },
]

export default function AdminCommissionsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tiers, setTiers] = useState<CommissionTier[]>(DEFAULT_TIERS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTiers, setEditingTiers] = useState<CommissionTier[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isCostsDialogOpen, setIsCostsDialogOpen] = useState(false)
  const [costForm, setCostForm] = useState({
    installationCost: 0,
    adminCost: 0,
    adCost: 0,
    sellerCommissionPaid: 0,
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  // Estado para costos de anuncio de supervisores
  const [supervisorAdCosts, setSupervisorAdCosts] = useState<APIAdCost[]>([])
  const [isAdCostDialogOpen, setIsAdCostDialogOpen] = useState(false)
  const [selectedSupervisorForAdCost, setSelectedSupervisorForAdCost] = useState<User | null>(null)
  const [adCostAmount, setAdCostAmount] = useState(0)
  const [isAdCostHistoryDialogOpen, setIsAdCostHistoryDialogOpen] = useState(false)
  const [isSavingAdCost, setIsSavingAdCost] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  // Recargar costos de anuncio cuando cambia el mes
  useEffect(() => {
    fetchAdCosts()
  }, [selectedMonth])

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const [usersRes, salesRes] = await Promise.all([
        usersAPI.getAll(token),
        salesAPI.getAdminSales(token),
      ])
      setUsers(usersRes.users.filter((u) => u.role === "seller" || u.role === "supervisor"))
      setSales(salesRes.sales)

      const savedTiers = localStorage.getItem("commissionTiers")
      if (savedTiers) {
        setTiers(JSON.parse(savedTiers))
      }

      // Cargar costos de anuncio de supervisores desde API
      await fetchAdCosts()
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAdCosts = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const adCostsRes = await adCostsAPI.getAll(token)
      setSupervisorAdCosts(adCostsRes.adCosts)
    } catch (error) {
      console.error("Error fetching ad costs:", error)
    }
  }

  // Obtener costo de anuncio de un supervisor para el mes seleccionado
  const getSupervisorAdCostForMonth = (supervisorId: string): number => {
    const adCost = supervisorAdCosts.find((cost) => {
      const costSupervisorId = typeof cost.supervisorId === "object" 
        ? cost.supervisorId._id 
        : cost.supervisorId
      return costSupervisorId === supervisorId && cost.month === selectedMonth
    })
    return adCost?.amount || 0
  }

  // Guardar o actualizar costo de anuncio de un supervisor
  const handleSaveAdCost = async () => {
    if (!selectedSupervisorForAdCost) return

    const token = localStorage.getItem("token")
    if (!token) return

    setIsSavingAdCost(true)
    try {
      await adCostsAPI.upsert(token, {
        supervisorId: selectedSupervisorForAdCost._id,
        amount: adCostAmount,
        month: selectedMonth,
      })

      // Recargar costos de anuncio
      await fetchAdCosts()

      toast({
        title: "Costo de anuncio actualizado",
        description: `Se ha guardado el costo de anuncio para ${selectedSupervisorForAdCost.name}`,
      })

      setIsAdCostDialogOpen(false)
      setSelectedSupervisorForAdCost(null)
      setAdCostAmount(0)
    } catch (error) {
      console.error("Error saving ad cost:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el costo de anuncio",
        variant: "destructive",
      })
    } finally {
      setIsSavingAdCost(false)
    }
  }

  // Abrir dialog para editar costo de anuncio
  const handleOpenAdCostDialog = (supervisor: User) => {
    setSelectedSupervisorForAdCost(supervisor)
    setAdCostAmount(getSupervisorAdCostForMonth(supervisor._id))
    setIsAdCostDialogOpen(true)
  }

  // Obtener historial de costos de anuncio de un supervisor
  const getSupervisorAdCostHistory = (supervisorId: string): APIAdCost[] => {
    return supervisorAdCosts
      .filter((cost) => {
        const costSupervisorId = typeof cost.supervisorId === "object" 
          ? cost.supervisorId._id 
          : cost.supervisorId
        return costSupervisorId === supervisorId
      })
      .sort((a, b) => b.month.localeCompare(a.month))
  }

  // Filtrar ventas del mes seleccionado segun reglas de negocio:
  // - INSTALADAS (completed): Se muestran en el mes de completedDate (fecha de activacion)
  // - TURNADAS (appointed): Se muestran en el mes de appointedDate (fecha del turno)
  // - PENDIENTE DE TURNO (pending_appointment): Aparecen en TODOS los meses hasta que se resuelvan
  // - CANCELADAS: Quedan en el mes donde fueron canceladas (createdAt)
  // - CARGADAS y PENDIENTE DE FIRMA: Se muestran en el mes de createdAt
  const getMonthSales = () => {
    const [year, month] = selectedMonth.split("-").map(Number)
    
    return sales.filter(sale => {
      // PENDIENTE DE TURNO: aparecen en todos los meses
      if (sale.status === "pending_appointment") {
        return true
      }
      
      // ACTIVADAS: usar fecha de activacion
      if (sale.status === "completed" && sale.completedDate) {
        const completedDate = new Date(sale.completedDate)
        return completedDate.getMonth() + 1 === month && completedDate.getFullYear() === year
      }
      
      // TURNADAS: usar fecha del turno
      if (sale.status === "appointed" && sale.appointedDate) {
        const appointedDate = new Date(sale.appointedDate)
        return appointedDate.getMonth() + 1 === month && appointedDate.getFullYear() === year
      }
      
      // CANCELADAS y otras: usar fecha de creacion
      const saleDate = new Date(sale.createdAt)
      return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year
    })
  }

  const monthSales = getMonthSales()
  
  // Obtener ventas con costo de instalacion en el mes seleccionado
  // El costo de instalacion se descuenta en el mes que se coloco
  const getInstallationCostForMonth = (sale: Sale): number => {
    const [year, month] = selectedMonth.split("-").map(Number)
    
    if (!sale.installationCost || sale.installationCost <= 0) return 0
    
    // Si tiene fecha de costo de instalacion, usar esa fecha
    if (sale.installationCostDate) {
      const costDate = new Date(sale.installationCostDate)
      if (costDate.getMonth() + 1 === month && costDate.getFullYear() === year) {
        return sale.installationCost
      }
      return 0
    }
    
    // Si no tiene fecha especifica, usar la fecha de creacion
    const saleDate = new Date(sale.createdAt)
    if (saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year) {
      return sale.installationCost
    }
    
    return 0
  }

  // Helper para extraer el ID de sellerId o supervisorId (puede ser string u objeto)
  const extractId = (field: string | { _id: string } | undefined): string => {
    if (!field) return ""
    if (typeof field === "string") return field
    return field._id || ""
  }

  // Obtener ventas de un usuario (vendedor o supervisor)
  // Para supervisores, las ventas pueden estar en sellerId o supervisorId
  const getUserSales = (userId: string, userRole: string) => {
    return monthSales.filter((s) => {
      const saleSellerIdStr = extractId(s.sellerId)
      const saleSupervisorIdStr = extractId(s.supervisorId)
      
      if (userRole === "supervisor") {
        // Supervisor: ventas donde es vendedor O donde es supervisor asignado
        return saleSellerIdStr === userId || saleSupervisorIdStr === userId
      }
      // Vendedor: solo sus propias ventas
      return saleSellerIdStr === userId
    })
  }

  const getSellerSales = (sellerId: string) => {
    const user = users.find(u => u._id === sellerId)
    const userSales = getUserSales(sellerId, user?.role || "seller")
    return userSales.filter((s) => s.status === "completed").length
  }

  const getSellerSalesByStatus = (sellerId: string, status: string) => {
    const user = users.find(u => u._id === sellerId)
    const userSales = getUserSales(sellerId, user?.role || "seller")
    return userSales.filter(s => s.status === status).length
  }

  const getCommissionPerSale = (salesCount: number) => {
    for (const tier of tiers) {
      if (salesCount >= tier.minSales && salesCount <= tier.maxSales) {
        return tier.amount
      }
    }
    return 0
  }

  // Calcular comision del vendedor con descuentos de instalacion
  // La comision se imputa en el mes que se activa (completedDate)
  // El costo de instalacion se descuenta en el mes que se coloco (installationCostDate)
  const calculateSellerCommission = (sellerId: string) => {
    const user = users.find(u => u._id === sellerId)
    const userSales = getUserSales(sellerId, user?.role || "seller")
    const completedSales = userSales.filter(s => s.status === "completed")
    
    // Comision base por cantidad de ventas instaladas en este mes
    const activatedCount = completedSales.length
    const perSale = getCommissionPerSale(activatedCount)
    let totalCommission = activatedCount * perSale
    
    // Descontar costos de instalacion que correspondan a este mes
    // Revisar TODAS las ventas del usuario (no solo las del mes) para costos de instalacion
    const allUserSales = sales.filter((s) => {
      const saleSellerIdStr = extractId(s.sellerId)
      return saleSellerIdStr === sellerId
    })
    
    allUserSales.forEach(sale => {
      const installationCost = getInstallationCostForMonth(sale)
      if (installationCost > 0) {
        totalCommission -= installationCost
      }
    })
    
    return Math.max(0, totalCommission)
  }
  
  // Obtener solo la comision bruta (sin descuentos) para mostrar en tabla
  const getSellerGrossCommission = (sellerId: string) => {
    const activatedSales = getSellerSales(sellerId)
    const perSale = getCommissionPerSale(activatedSales)
    return activatedSales * perSale
  }
  
  // Obtener total de descuentos de instalacion del vendedor para este mes
  const getSellerInstallationDiscounts = (sellerId: string) => {
    // Revisar TODAS las ventas del usuario para costos de instalacion del mes
    const allUserSales = sales.filter((s) => {
      const saleSellerIdStr = extractId(s.sellerId)
      return saleSellerIdStr === sellerId
    })
    
    let totalDiscounts = 0
    allUserSales.forEach(sale => {
      totalDiscounts += getInstallationCostForMonth(sale)
    })
    
    return totalDiscounts
  }

  // Calcular comision del supervisor
  // La comision se imputa en el mes que se activa (completedDate)
  // El costo de instalacion se descuenta en el mes que se coloco (installationCostDate)
  // El costo de anuncio mensual se descuenta del total
  const calculateSupervisorCommission = (supervisorId: string) => {
    // Supervisor: ventas donde es vendedor O donde es supervisor asignado
    const userSales = monthSales.filter(s => {
      const saleSellerIdStr = extractId(s.sellerId)
      const saleSupervisorIdStr = extractId(s.supervisorId)
      return saleSellerIdStr === supervisorId || saleSupervisorIdStr === supervisorId
    })
    const completedSales = userSales.filter(s => s.status === "completed")
    
    let totalBeforePercentage = 0
    
    // Comisiones de ventas completadas en este mes
    // Solo se restan: Base - Admin - Comision del vendedor
    completedSales.forEach(sale => {
      const baseCommission = SUPERVISOR_BASE_COMMISSION
      const sellerCommission = sale.sellerCommissionPaid || 0
      
      // La instalacion se descuenta por separado segun su fecha
      const netCommission = baseCommission - ADMIN_COST - sellerCommission
      totalBeforePercentage += netCommission
    })
    
    // Descontar costos de instalacion que correspondan a este mes
    // Revisar TODAS las ventas del supervisor para costos de instalacion
    const allSupervisorSales = sales.filter(s => {
      const saleSellerIdStr = extractId(s.sellerId)
      const saleSupervisorIdStr = extractId(s.supervisorId)
      return saleSellerIdStr === supervisorId || saleSupervisorIdStr === supervisorId
    })
    
    allSupervisorSales.forEach(sale => {
      const installationCost = getInstallationCostForMonth(sale)
      if (installationCost > 0) {
        totalBeforePercentage -= installationCost
      }
    })
    
    // Descontar costo de anuncio mensual del neto (100%) ANTES de aplicar el 40%
    const monthlyAdCost = getSupervisorAdCostForMonth(supervisorId)
    const netAfterAdCost = totalBeforePercentage - monthlyAdCost
    
    // Aplicar 40% sobre el neto despues de descontar anuncio
    return Math.max(0, netAfterAdCost * SUPERVISOR_PERCENTAGE)
  }

  // Calcular comision ANTES de descontar costo de anuncio (para mostrar desglose)
  const calculateSupervisorCommissionBeforeAdCost = (supervisorId: string) => {
    const userSales = monthSales.filter(s => {
      const saleSellerIdStr = extractId(s.sellerId)
      const saleSupervisorIdStr = extractId(s.supervisorId)
      return saleSellerIdStr === supervisorId || saleSupervisorIdStr === supervisorId
    })
    const completedSales = userSales.filter(s => s.status === "completed")
    
    let totalBeforePercentage = 0
    
    completedSales.forEach(sale => {
      const baseCommission = SUPERVISOR_BASE_COMMISSION
      const sellerCommission = sale.sellerCommissionPaid || 0
      const netCommission = baseCommission - ADMIN_COST - sellerCommission
      totalBeforePercentage += netCommission
    })
    
    const allSupervisorSales = sales.filter(s => {
      const saleSellerIdStr = extractId(s.sellerId)
      const saleSupervisorIdStr = extractId(s.supervisorId)
      return saleSellerIdStr === supervisorId || saleSupervisorIdStr === supervisorId
    })
    
    allSupervisorSales.forEach(sale => {
      const installationCost = getInstallationCostForMonth(sale)
      if (installationCost > 0) {
        totalBeforePercentage -= installationCost
      }
    })
    
    // Esta funcion devuelve la comision SIN descontar el costo de anuncio
    return Math.max(0, totalBeforePercentage * SUPERVISOR_PERCENTAGE)
  }

  // Calcular el total neto antes del 40% (para mostrar el desglose)
  const calculateSupervisorNetBeforePercentage = (supervisorId: string) => {
    const userSales = monthSales.filter(s => {
      const saleSellerIdStr = extractId(s.sellerId)
      const saleSupervisorIdStr = extractId(s.supervisorId)
      return saleSellerIdStr === supervisorId || saleSupervisorIdStr === supervisorId
    })
    const completedSales = userSales.filter(s => s.status === "completed")
    
    let totalBeforePercentage = 0
    
    completedSales.forEach(sale => {
      const baseCommission = SUPERVISOR_BASE_COMMISSION
      const sellerCommission = sale.sellerCommissionPaid || 0
      const netCommission = baseCommission - ADMIN_COST - sellerCommission
      totalBeforePercentage += netCommission
    })
    
    const allSupervisorSales = sales.filter(s => {
      const saleSellerIdStr = extractId(s.sellerId)
      const saleSupervisorIdStr = extractId(s.supervisorId)
      return saleSellerIdStr === supervisorId || saleSupervisorIdStr === supervisorId
    })
    
    allSupervisorSales.forEach(sale => {
      const installationCost = getInstallationCostForMonth(sale)
      if (installationCost > 0) {
        totalBeforePercentage -= installationCost
      }
    })
    
    return totalBeforePercentage
  }

  // Calcular total de costos de instalacion de un supervisor en el mes
  const getSupervisorInstallationCostForMonth = (supervisorId: string) => {
    // Obtener TODAS las ventas del supervisor (en cualquier estado)
    const allSupervisorSales = sales.filter(s => {
      const saleSellerIdStr = extractId(s.sellerId)
      const saleSupervisorIdStr = extractId(s.supervisorId)
      return saleSellerIdStr === supervisorId || saleSupervisorIdStr === supervisorId
    })
    
    let totalInstallationCost = 0
    allSupervisorSales.forEach(sale => {
      const installationCost = getInstallationCostForMonth(sale)
      if (installationCost > 0) {
        totalInstallationCost += installationCost
      }
    })
    
    return totalInstallationCost
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleOpenEditDialog = () => {
    setEditingTiers([...tiers])
    setIsDialogOpen(true)
  }

  const handleTierChange = (index: number, field: keyof CommissionTier, value: string) => {
    const newTiers = [...editingTiers]
    newTiers[index] = {
      ...newTiers[index],
      [field]: parseInt(value) || 0,
    }
    setEditingTiers(newTiers)
  }

  const handleSaveTiers = () => {
    setIsSubmitting(true)
    try {
      setTiers(editingTiers)
      localStorage.setItem("commissionTiers", JSON.stringify(editingTiers))
      toast({
        title: "Comisiones actualizadas",
        description: "Los rangos de comisiones se han actualizado correctamente",
      })
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar las comisiones",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDetailDialog = (user: User) => {
    setSelectedUser(user)
    setIsDetailDialogOpen(true)
  }

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

    setIsSubmitting(true)
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await salesAPI.updateCosts(token, selectedSale._id, costForm)
      toast({
        title: "Costos actualizados",
        description: "Los costos de la venta se han actualizado correctamente",
      })
      setIsCostsDialogOpen(false)
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar los costos",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper para obtener etiqueta de estado
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "CARGADA",
      pending_signature: "PENDIENTE DE FIRMA",
      pending_appointment: "PENDIENTE DE TURNO",
      observed: "OBSERVADA",
      appointed: "TURNADA",
      completed: "INSTALADA",
      cancelled: "CANCELADA",
    }
    return labels[status] || status.toUpperCase()
  }

  // Exportar comisiones de un usuario con diseño mejorado para Google Sheets
  const handleExportUserCommissions = (user: User) => {
    const allUserSales = getUserSales(user._id, user.role)
    const completedUserSales = allUserSales.filter(s => s.status === "completed")
    const cancelledUserSales = allUserSales.filter(s => s.status === "cancelled")
    
    // Obtener nombre del mes
    const [year, month] = selectedMonth.split("-").map(Number)
    const monthName = new Date(year, month - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    
    let csvRows: string[] = []
    
    if (user.role === "supervisor") {
      // ENCABEZADO BONITO
      csvRows.push(`LIQUIDACION DE COMISIONES - SUPERVISOR`)
      csvRows.push(``)
      csvRows.push(`Nombre:,${user.name}`)
      csvRows.push(`Periodo:,${monthName.toUpperCase()}`)
      csvRows.push(`Fecha de emision:,${new Date().toLocaleDateString("es-AR")}`)
      csvRows.push(``)
      csvRows.push(`═══════════════════════════════════════════════════════════════════════════`)
      csvRows.push(``)
      
      // SECCION: VENTAS ACTIVADAS
      csvRows.push(`VENTAS ACTIVADAS (${completedUserSales.length})`)
      csvRows.push(`───────────────────���───────────────────────────────────────────────────────`)
      csvRows.push(`#,Cliente,DNI,Plan,Fecha Carga,Fecha Activacion,Base,Instalacion,Admin,Com.Vendedor,Neto`)
      
      let totalNetCompleted = 0
      completedUserSales.forEach((sale, idx) => {
        const base = SUPERVISOR_BASE_COMMISSION
        const inst = sale.installationCost || 0
        const seller = sale.sellerCommissionPaid || 0
        const net = base - inst - ADMIN_COST - seller
        totalNetCompleted += net
        const completedDate = sale.completedDate ? new Date(sale.completedDate).toLocaleDateString("es-AR") : "-"
        csvRows.push(`${idx + 1},${sale.customerInfo.name},${sale.customerInfo.dni},${sale.planName},${new Date(sale.createdAt).toLocaleDateString("es-AR")},${completedDate},${formatCurrency(base)},${formatCurrency(inst)},${formatCurrency(ADMIN_COST)},${formatCurrency(seller)},${formatCurrency(net)}`)
      })
      
      if (completedUserSales.length === 0) {
        csvRows.push(`-,Sin ventas activadas este mes,-,-,-,-,-,-,-,-,-`)
      }
      
      csvRows.push(``)
      csvRows.push(`,,,,,SUBTOTAL ACTIVADAS:,,,,,${formatCurrency(totalNetCompleted)}`)
      csvRows.push(``)
      
      // SECCION: VENTAS CANCELADAS CON DESCUENTO
      const cancelledWithCost = cancelledUserSales.filter(s => s.installationCost && s.installationCost > 0)
      csvRows.push(`VENTAS CANCELADAS CON DESCUENTO DE INSTALACION (${cancelledWithCost.length})`)
      csvRows.push(`─────────────���──���───���──────────────────────────────────────────────────────`)
      csvRows.push(`#,Cliente,DNI,Plan,Fecha Carga,Estado,Costo Instalacion Descontado`)
      
      let totalCancelledDiscount = 0
      cancelledWithCost.forEach((sale, idx) => {
        const inst = sale.installationCost || 0
        totalCancelledDiscount += inst
        csvRows.push(`${idx + 1},${sale.customerInfo.name},${sale.customerInfo.dni},${sale.planName},${new Date(sale.createdAt).toLocaleDateString("es-AR")},CANCELADA,-${formatCurrency(inst)}`)
      })
      
      if (cancelledWithCost.length === 0) {
        csvRows.push(`-,Sin descuentos por cancelaciones,-,-,-,-,-`)
      }
      
      csvRows.push(``)
      csvRows.push(`,,,,SUBTOTAL DESCUENTOS:,,-${formatCurrency(totalCancelledDiscount)}`)
      csvRows.push(``)
      
      // SECCION: OTRAS VENTAS DEL PERIODO (para referencia)
      const otherSales = allUserSales.filter(s => s.status !== "completed" && s.status !== "cancelled")
      if (otherSales.length > 0) {
        csvRows.push(`OTRAS VENTAS EN PROCESO (${otherSales.length})`)
        csvRows.push(`───────────────────────────────────────────────────────────────────────────`)
        csvRows.push(`#,Cliente,DNI,Plan,Fecha Carga,Estado,Observacion`)
        otherSales.forEach((sale, idx) => {
          csvRows.push(`${idx + 1},${sale.customerInfo.name},${sale.customerInfo.dni},${sale.planName},${new Date(sale.createdAt).toLocaleDateString("es-AR")},${getStatusLabel(sale.status)},Pendiente de activacion`)
        })
        csvRows.push(``)
      }
      
      // RESUMEN FINAL
      const supervisorInstallationCost = getSupervisorInstallationCostForMonth(user._id)
      const supervisorAdCost = getSupervisorAdCostForMonth(user._id)
      const netBeforePercentage = calculateSupervisorNetBeforePercentage(user._id)
      const netAfterAdCost = netBeforePercentage - supervisorAdCost
      const commissionFinal = calculateSupervisorCommission(user._id)
      
      csvRows.push(`═══════════════════════════════════════════════════════════════════════════`)
      csvRows.push(`RESUMEN DE LIQUIDACION`)
      csvRows.push(`═══════════════════════════════════════════════════════════════════════════`)
      csvRows.push(``)
      csvRows.push(`Total Ventas Activadas:,${completedUserSales.length}`)
      csvRows.push(`Total Ventas Canceladas:,${cancelledUserSales.length}`)
      csvRows.push(`Total Ventas en Proceso:,${otherSales.length}`)
      csvRows.push(``)
      csvRows.push(`Subtotal Neto Activadas:,${formatCurrency(totalNetCompleted)}`)
      csvRows.push(`Descuento Cancelaciones:,-${formatCurrency(totalCancelledDiscount)}`)
      if (supervisorInstallationCost > 0) {
        csvRows.push(`Costo de Instalaciones (sobre 100%):,-${formatCurrency(supervisorInstallationCost)}`)
      }
      csvRows.push(`Neto (100%):,${formatCurrency(netBeforePercentage)}`)
      if (supervisorAdCost > 0) {
        csvRows.push(`Costo de Anuncio Mensual (sobre 100%):,-${formatCurrency(supervisorAdCost)}`)
        csvRows.push(`Neto despues de Anuncio:,${formatCurrency(netAfterAdCost)}`)
      }
      csvRows.push(``)
      csvRows.push(`COMISION FINAL (40%):,${formatCurrency(commissionFinal)}`)
      csvRows.push(``)
      csvRows.push(`═══════════════════════════════════════════════════════════════════════════`)
      
    } else {
      // VENDEDOR
      const activatedCount = completedUserSales.length
      const perSale = getCommissionPerSale(activatedCount)
      const grossCommission = getSellerGrossCommission(user._id)
      const installationDiscounts = getSellerInstallationDiscounts(user._id)
      const netCommission = calculateSellerCommission(user._id)
      
      // ENCABEZADO BONITO
      csvRows.push(`LIQUIDACION DE COMISIONES - VENDEDOR`)
      csvRows.push(``)
      csvRows.push(`Nombre:,${user.name}`)
      csvRows.push(`Periodo:,${monthName.toUpperCase()}`)
      csvRows.push(`Fecha de emision:,${new Date().toLocaleDateString("es-AR")}`)
      csvRows.push(``)
      csvRows.push(`═══════════════════════════════════════════════════════════════════════════`)
      csvRows.push(``)
      
      // ESCALA DE COMISIONES VIGENTE
      csvRows.push(`ESCALA DE COMISIONES VIGENTE`)
      csvRows.push(`───────────────────────────────────────────────────────────────────────────`)
      tiers.forEach(tier => {
        csvRows.push(`${tier.minSales}-${tier.maxSales} ventas:,${formatCurrency(tier.amount)} por venta`)
      })
      csvRows.push(``)
      
      // SECCION: VENTAS ACTIVADAS
      csvRows.push(`VENTAS ACTIVADAS (${completedUserSales.length})`)
      csvRows.push(`───────────────────────────────────────────────────────────────────────────`)
      csvRows.push(`#,Cliente,DNI,Plan,Fecha Carga,Fecha Activacion,Comision Unitaria`)
      
      completedUserSales.forEach((sale, idx) => {
        const completedDate = sale.completedDate ? new Date(sale.completedDate).toLocaleDateString("es-AR") : "-"
        csvRows.push(`${idx + 1},${sale.customerInfo.name},${sale.customerInfo.dni},${sale.planName},${new Date(sale.createdAt).toLocaleDateString("es-AR")},${completedDate},${formatCurrency(perSale)}`)
      })
      
      if (completedUserSales.length === 0) {
        csvRows.push(`-,Sin ventas activadas este mes,-,-,-,-,-`)
      }
      
      csvRows.push(``)
      csvRows.push(`,,,,,SUBTOTAL:,${formatCurrency(grossCommission)}`)
      csvRows.push(``)
      
      // SECCION: VENTAS CANCELADAS CON DESCUENTO
      const cancelledWithCost = cancelledUserSales.filter(s => s.installationCost && s.installationCost > 0)
      csvRows.push(`VENTAS CANCELADAS CON DESCUENTO DE INSTALACION (${cancelledWithCost.length})`)
      csvRows.push(`───────────────────────────────────────────────────────────────────────────`)
      csvRows.push(`#,Cliente,DNI,Plan,Fecha Carga,Estado,Costo Instalacion Descontado`)
      
      cancelledWithCost.forEach((sale, idx) => {
        const inst = sale.installationCost || 0
        csvRows.push(`${idx + 1},${sale.customerInfo.name},${sale.customerInfo.dni},${sale.planName},${new Date(sale.createdAt).toLocaleDateString("es-AR")},CANCELADA,-${formatCurrency(inst)}`)
      })
      
      if (cancelledWithCost.length === 0) {
        csvRows.push(`-,Sin descuentos por cancelaciones,-,-,-,-,-`)
      }
      
      csvRows.push(``)
      csvRows.push(`,,,,SUBTOTAL DESCUENTOS:,,-${formatCurrency(installationDiscounts)}`)
      csvRows.push(``)
      
      // SECCION: OTRAS VENTAS DEL PERIODO (para referencia)
      const otherSales = allUserSales.filter(s => s.status !== "completed" && s.status !== "cancelled")
      if (otherSales.length > 0) {
        csvRows.push(`OTRAS VENTAS EN PROCESO (${otherSales.length})`)
        csvRows.push(`─────────────────────────────────────────────────���───────────���─────────────`)
        csvRows.push(`#,Cliente,DNI,Plan,Fecha Carga,Estado,Observacion`)
        otherSales.forEach((sale, idx) => {
          csvRows.push(`${idx + 1},${sale.customerInfo.name},${sale.customerInfo.dni},${sale.planName},${new Date(sale.createdAt).toLocaleDateString("es-AR")},${getStatusLabel(sale.status)},Pendiente de activacion`)
        })
        csvRows.push(``)
      }
      
      // RESUMEN FINAL
      csvRows.push(`═══════════════════════════════════════════════════════════════════════════`)
      csvRows.push(`RESUMEN DE LIQUIDACION`)
      csvRows.push(`═══════════════════════════════════════════════════════════════════════════`)
      csvRows.push(``)
      csvRows.push(`Total Ventas Activadas:,${completedUserSales.length}`)
      csvRows.push(`Total Ventas Canceladas:,${cancelledUserSales.length}`)
      csvRows.push(`Total Ventas en Proceso:,${otherSales.length}`)
      csvRows.push(``)
      csvRows.push(`Comision por Venta (segun escala):,${formatCurrency(perSale)}`)
      csvRows.push(`Comision Bruta (${activatedCount} x ${formatCurrency(perSale)}):,${formatCurrency(grossCommission)}`)
      csvRows.push(`Descuento por Instalaciones:,-${formatCurrency(installationDiscounts)}`)
      csvRows.push(``)
      csvRows.push(`COMISION NETA A COBRAR:,${formatCurrency(netCommission)}`)
      csvRows.push(``)
      csvRows.push(`═══════════════════════════════════════════════════════════════════════════`)
    }

    // Agregar BOM para que Excel/Sheets detecte UTF-8
    const BOM = "\uFEFF"
    const csvContent = BOM + csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `liquidacion-${user.name.replace(/\s+/g, "-")}-${selectedMonth}.csv`
    link.click()

    toast({
      title: "Exportacion completada",
      description: `Liquidacion de ${user.name} exportada correctamente`,
    })
  }

  // Exportar todas las comisiones con diseño mejorado
  const handleExportAll = () => {
    const [year, month] = selectedMonth.split("-").map(Number)
    const monthName = new Date(year, month - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    
    const rows: string[] = []
    
    // ENCABEZADO
    rows.push(`LIQUIDACION GENERAL DE COMISIONES`)
    rows.push(``)
    rows.push(`Periodo:,${monthName.toUpperCase()}`)
    rows.push(`Fecha de emision:,${new Date().toLocaleDateString("es-AR")}`)
    rows.push(``)
    rows.push(`═══════════════════════════════════════════════════════════════════════════`)
    rows.push(``)
    
    // RESUMEN POR USUARIO
    rows.push(`RESUMEN POR USUARIO`)
    rows.push(`───────────────────────────────────────────────────────────────────────────`)
    rows.push(`#,Nombre,Rol,Ventas Activadas,Ventas Canceladas,Ventas Proceso,Descuentos,Comision Neta`)
    
    let totalActivated = 0
    let totalCancelled = 0
    let totalPending = 0
    let totalDiscounts = 0
    let grandTotalCommissions = 0
    
    users.forEach((user, idx) => {
      const userSales = getUserSales(user._id, user.role)
      const activated = userSales.filter(s => s.status === "completed").length
      const cancelled = userSales.filter(s => s.status === "cancelled").length
      const pending = userSales.filter(s => s.status !== "completed" && s.status !== "cancelled").length
      const discounts = user.role === "supervisor" 
        ? userSales.filter(s => s.status === "cancelled" && s.installationCost).reduce((acc, s) => acc + (s.installationCost || 0), 0)
        : getSellerInstallationDiscounts(user._id)
      const commission = user.role === "supervisor" 
        ? calculateSupervisorCommission(user._id)
        : calculateSellerCommission(user._id)
      
      totalActivated += activated
      totalCancelled += cancelled
      totalPending += pending
      totalDiscounts += discounts
      grandTotalCommissions += commission
      
      rows.push(`${idx + 1},${user.name},${user.role === "supervisor" ? "Supervisor" : "Vendedor"},${activated},${cancelled},${pending},${formatCurrency(discounts)},${formatCurrency(commission)}`)
    })
    
    rows.push(``)
    rows.push(`,TOTALES,,${totalActivated},${totalCancelled},${totalPending},${formatCurrency(totalDiscounts)},${formatCurrency(grandTotalCommissions)}`)
    rows.push(``)
    rows.push(`═══════════════════════════════════════════════════════════════════════════`)
    rows.push(``)
    
    // DETALLE POR VENDEDORES
    rows.push(`DETALLE VENDEDORES`)
    rows.push(`───────────────────────────────────────────────────────────────────────────`)
    
    sellers.forEach(seller => {
      const sellerSales = getUserSales(seller._id, seller.role)
      const activated = sellerSales.filter(s => s.status === "completed").length
      const perSale = getCommissionPerSale(activated)
      const gross = getSellerGrossCommission(seller._id)
      const discounts = getSellerInstallationDiscounts(seller._id)
      const net = calculateSellerCommission(seller._id)
      
      rows.push(``)
      rows.push(`${seller.name}`)
      rows.push(`Ventas activadas: ${activated} | Comision por venta: ${formatCurrency(perSale)}`)
      rows.push(`Comision bruta: ${formatCurrency(gross)} | Descuentos: ${formatCurrency(discounts)} | NETO: ${formatCurrency(net)}`)
    })
    
    rows.push(``)
    rows.push(`═══════════════════════════════════════════════════════════════════════════`)
    rows.push(``)
    
    // DETALLE POR SUPERVISORES
    rows.push(`DETALLE SUPERVISORES`)
    rows.push(`──��────────────────────────────────────────────────────────────────────────`)
    
    supervisors.forEach(supervisor => {
      const supSales = getUserSales(supervisor._id, supervisor.role)
      const activated = supSales.filter(s => s.status === "completed").length
      const commission = calculateSupervisorCommission(supervisor._id)
      
      rows.push(``)
      rows.push(`${supervisor.name}`)
      rows.push(`Ventas activadas: ${activated} | COMISION (40%): ${formatCurrency(commission)}`)
    })
    
    rows.push(``)
    rows.push(`═══════════════════════════════════════════════════════════════════════════`)
    rows.push(`TOTAL A LIQUIDAR:,${formatCurrency(grandTotalCommissions)}`)
    rows.push(`════════════════════════════════════��════���═══��════════════════���════════════`)

    // Agregar BOM para que Excel/Sheets detecte UTF-8
    const BOM = "\uFEFF"
    const csvContent = BOM + rows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `liquidacion-general-${selectedMonth}.csv`
    link.click()

    toast({
      title: "Exportacion completada",
      description: "Liquidacion general de comisiones exportada correctamente",
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

  const totalCommissions = users.reduce((acc, user) => {
    return acc + (user.role === "supervisor" 
      ? calculateSupervisorCommission(user._id)
      : calculateSellerCommission(user._id))
  }, 0)

  const sellers = users.filter(u => u.role === "seller")
  const supervisors = users.filter(u => u.role === "supervisor")

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
            <h1 className="text-3xl font-bold text-foreground">Comisiones</h1>
            <p className="text-muted-foreground">
              Gestiona las comisiones de vendedores y supervisores
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] bg-secondary/50">
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
              onClick={handleExportAll}
              variant="outline"
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Todo
            </Button>
            <Button
              onClick={handleOpenEditDialog}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Editar Rangos
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Comisiones</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalCommissions)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendedores</p>
                  <p className="text-2xl font-bold text-foreground">{sellers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supervisores</p>
                  <p className="text-2xl font-bold text-foreground">{supervisors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ventas Instaladas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {monthSales.filter((s) => s.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Scale for Sellers */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Escala de Comisiones (Vendedores)</CardTitle>
            <CardDescription>Rangos de comision por cantidad de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {tiers.map((tier, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-center"
                >
                  <p className="text-sm text-muted-foreground mb-2">
                    {tier.minSales} - {tier.maxSales === 999 ? "+" : tier.maxSales} ventas
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(tier.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supervisor Commission Info */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-400">Comision Supervisores</CardTitle>
            <CardDescription>Formula de calculo para supervisores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-sm text-muted-foreground mb-2">Base por Venta</p>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(SUPERVISOR_BASE_COMMISSION)}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-sm text-muted-foreground mb-2">Costo Admin (fijo)</p>
                <p className="text-2xl font-bold text-red-400">-{formatCurrency(ADMIN_COST)}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-sm text-muted-foreground mb-2">+ Costos Variables</p>
                <p className="text-sm text-muted-foreground">Instalacion, Com. Vendedor</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/20 text-center">
                <p className="text-sm text-muted-foreground mb-2">Porcentaje Final</p>
                <p className="text-2xl font-bold text-amber-400">40%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supervisors Table */}
        {supervisors.length > 0 && (
          <Card className="border-amber-500/30 bg-card/50">
            <CardHeader>
              <CardTitle className="text-amber-400">Comisiones Supervisores ({supervisors.length})</CardTitle>
              <CardDescription>Resumen de comisiones del mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Supervisor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Instaladas</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Canceladas</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Turnadas</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pendientes</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Neto (100%)</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          Instalacion
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Megaphone className="h-3 w-3" />
                          Anuncio
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Com. (40%)</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisors.map((user) => {
                      const netBeforePercentage = calculateSupervisorNetBeforePercentage(user._id)
                      const installationCost = getSupervisorInstallationCostForMonth(user._id)
                      const adCost = getSupervisorAdCostForMonth(user._id)
                      const totalCommission = calculateSupervisorCommission(user._id)

                      return (
                        <tr
                          key={user._id}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-amber-400">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-green-400 font-medium">
                            {getSellerSalesByStatus(user._id, "completed")}
                          </td>
                          <td className="py-3 px-4 text-red-400">
                            {getSellerSalesByStatus(user._id, "cancelled")}
                          </td>
                          <td className="py-3 px-4 text-blue-400">
                            {getSellerSalesByStatus(user._id, "appointed")}
                          </td>
                          <td className="py-3 px-4 text-orange-400">
                            {getSellerSalesByStatus(user._id, "pending") + getSellerSalesByStatus(user._id, "pending_appointment")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-foreground">
                              {formatCurrency(netBeforePercentage)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {installationCost > 0 ? (
                              <span className="text-red-400 font-medium">-{formatCurrency(installationCost)}</span>
                            ) : (
                              <span className="text-muted-foreground">$0</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {adCost > 0 ? (
                                <span className="text-red-400 font-medium">-{formatCurrency(adCost)}</span>
                              ) : (
                                <span className="text-muted-foreground">$0</span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenAdCostDialog(user)}
                                title="Editar costo de anuncio"
                                className="h-7 w-7"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-lg font-bold text-amber-400">
                              {formatCurrency(totalCommission)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDetailDialog(user)}
                                title="Ver detalle"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedSupervisorForAdCost(user)
                                  setIsAdCostHistoryDialogOpen(true)
                                }}
                                title="Ver historial de anuncios"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleExportUserCommissions(user)}
                                title="Exportar"
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sellers Table */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Comisiones Vendedores ({sellers.length})</CardTitle>
            <CardDescription>Resumen de comisiones del mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vendedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Instaladas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Canceladas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Turnadas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pendientes</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rango</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Com. Bruta</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Desc. Inst.</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Com. Neta</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((user) => {
                    const activatedSales = getSellerSales(user._id)
                    const commissionPerSale = getCommissionPerSale(activatedSales)
                    const grossCommission = getSellerGrossCommission(user._id)
                    const installationDiscounts = getSellerInstallationDiscounts(user._id)
                    const netCommission = calculateSellerCommission(user._id)
                    const currentTier = tiers.find(
                      (t) => activatedSales >= t.minSales && activatedSales <= t.maxSales
                    )

                    return (
                      <tr
                        key={user._id}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-green-400 font-medium">
                          {activatedSales}
                        </td>
                        <td className="py-3 px-4 text-red-400">
                          {getSellerSalesByStatus(user._id, "cancelled")}
                        </td>
                        <td className="py-3 px-4 text-blue-400">
                          {getSellerSalesByStatus(user._id, "appointed")}
                        </td>
                        <td className="py-3 px-4 text-orange-400">
                          {getSellerSalesByStatus(user._id, "pending") + getSellerSalesByStatus(user._id, "pending_appointment")}
                        </td>
                        <td className="py-3 px-4">
                          {currentTier ? (
                            <span className="text-sm text-muted-foreground">
                              {currentTier.minSales} - {currentTier.maxSales === 999 ? "+" : currentTier.maxSales}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin ventas</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-foreground">
                              {formatCurrency(grossCommission)}
                            </span>
                            {activatedSales > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {activatedSales} x {formatCurrency(commissionPerSale)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {installationDiscounts > 0 ? (
                            <span className="text-red-400">
                              -{formatCurrency(installationDiscounts)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">$0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(netCommission)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDetailDialog(user)}
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleExportUserCommissions(user)}
                              title="Exportar"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {sellers.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-muted-foreground">
                        No hay vendedores registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Tiers Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Rangos de Comision</DialogTitle>
              <DialogDescription>
                Modifica los rangos y montos de comision para vendedores
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {editingTiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Min Ventas</FieldLabel>
                      <Input
                        type="number"
                        value={tier.minSales}
                        onChange={(e) => handleTierChange(index, "minSales", e.target.value)}
                        className="bg-secondary/50"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Max Ventas</FieldLabel>
                      <Input
                        type="number"
                        value={tier.maxSales === 999 ? "" : tier.maxSales}
                        onChange={(e) =>
                          handleTierChange(index, "maxSales", e.target.value || "999")
                        }
                        placeholder="Sin limite"
                        className="bg-secondary/50"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Monto ($)</FieldLabel>
                      <Input
                        type="number"
                        value={tier.amount}
                        onChange={(e) => handleTierChange(index, "amount", e.target.value)}
                        className="bg-secondary/50"
                      />
                    </Field>
                  </FieldGroup>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveTiers}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Detalle de Comisiones - {selectedUser?.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({selectedUser?.role === "supervisor" ? "Supervisor" : "Vendedor"})
                </span>
              </DialogTitle>
              <DialogDescription>
                Ventas instaladas del mes seleccionado
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">DNI</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                        {selectedUser.role === "supervisor" && (
                          <>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Costos</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Editar</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {monthSales
                        .filter(s => {
                          const saleSellerIdStr = extractId(s.sellerId)
                          const saleSupervisorIdStr = extractId(s.supervisorId)
                          const matchesSeller = saleSellerIdStr === selectedUser._id
                          const matchesSupervisor = saleSupervisorIdStr === selectedUser._id
                          const isCompleted = s.status === "completed"
                          // Para supervisores, mostrar ventas donde es vendedor o supervisor
                          if (selectedUser.role === "supervisor") {
                            return (matchesSeller || matchesSupervisor) && isCompleted
                          }
                          return matchesSeller && isCompleted
                        })
                        .map((sale) => (
                          <tr
                            key={sale._id}
                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-foreground">{sale.customerInfo.name}</td>
                            <td className="py-3 px-4 text-foreground">{sale.customerInfo.dni}</td>
                            <td className="py-3 px-4 text-foreground">{sale.planName}</td>
                            <td className="py-3 px-4">
                              <StatusBadge status={sale.status} />
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                            </td>
                            {selectedUser.role === "supervisor" && (
                              <>
                                <td className="py-3 px-4 text-right text-xs">
                                  <div className="space-y-1">
                                    <p>Inst: {formatCurrency(sale.installationCost || 0)}</p>
                                    <p>Anun: {formatCurrency(sale.adCost || 0)}</p>
                                    <p>Vend: {formatCurrency(sale.sellerCommissionPaid || 0)}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenCostsDialog(sale)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-lg font-semibold text-foreground">
                    Total Comision: {" "}
                    <span className="text-primary">
                      {formatCurrency(
                        selectedUser.role === "supervisor"
                          ? calculateSupervisorCommission(selectedUser._id)
                          : calculateSellerCommission(selectedUser._id)
                      )}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
                <FieldLabel htmlFor="adCost">Costo de Anuncio (informativo - no se resta automaticamente)</FieldLabel>
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
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCostsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateCosts}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground"
              >
                {isSubmitting ? (
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

        {/* Ad Cost Dialog for Supervisors */}
        <Dialog open={isAdCostDialogOpen} onOpenChange={setIsAdCostDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-amber-400" />
                Costo de Anuncio Mensual
              </DialogTitle>
              <DialogDescription>
                Establece el costo de anuncio para <span className="font-semibold text-foreground">{selectedSupervisorForAdCost?.name}</span> en el mes de{" "}
                <span className="font-semibold text-foreground">
                  {new Date(selectedMonth + "-01").toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
                </span>
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="adCostAmount">Costo de Anuncio del Mes</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="adCostAmount"
                    type="number"
                    value={adCostAmount}
                    onChange={(e) => setAdCostAmount(Number(e.target.value))}
                    className="bg-secondary/50 pl-8"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Este monto se restara del neto (100%) del supervisor antes de aplicar el 40%.
                </p>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAdCostDialogOpen(false)
                setSelectedSupervisorForAdCost(null)
                setAdCostAmount(0)
              }}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveAdCost}
                disabled={isSavingAdCost}
                className="bg-amber-500 text-white hover:bg-amber-600"
              >
                {isSavingAdCost ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Costo"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ad Cost History Dialog */}
        <Dialog open={isAdCostHistoryDialogOpen} onOpenChange={setIsAdCostHistoryDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-amber-400" />
                Historial de Costos de Anuncio
              </DialogTitle>
              <DialogDescription>
                Historial de costos de anuncio para <span className="font-semibold text-foreground">{selectedSupervisorForAdCost?.name}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {selectedSupervisorForAdCost && getSupervisorAdCostHistory(selectedSupervisorForAdCost._id).length > 0 ? (
                getSupervisorAdCostHistory(selectedSupervisorForAdCost._id).map((cost) => (
                  <div
                    key={cost._id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      cost.month === selectedMonth 
                        ? "bg-amber-500/10 border-amber-500/30" 
                        : "bg-secondary/30 border-border/50"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(cost.month + "-01").toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Actualizado: {new Date(cost.updatedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-400">-{formatCurrency(cost.amount)}</p>
                      {cost.month === selectedMonth && (
                        <span className="text-xs text-amber-400">Mes actual</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay historial de costos de anuncio para este supervisor.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAdCostHistoryDialogOpen(false)
                setSelectedSupervisorForAdCost(null)
              }}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
