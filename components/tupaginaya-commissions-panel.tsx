"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { companySettingsAPI, User, Sale } from "@/lib/api"
import { 
  DollarSign, 
  Calendar, 
  Edit2, 
  Save, 
  TrendingUp,
  Users,
  Globe,
  X
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vps-5905394-x.dattaweb.com"

interface TuPaginaYaCommissionsPanelProps {
  users: User[]
  sales: Sale[]
  isLoading: boolean
}

export function TuPaginaYaCommissionsPanel({ users, sales, isLoading }: TuPaginaYaCommissionsPanelProps) {
  const [basePrice, setBasePrice] = useState<number>(15000)
  const [editingBasePrice, setEditingBasePrice] = useState(false)
  const [newBasePrice, setNewBasePrice] = useState<string>("")
  const [isSavingPrice, setIsSavingPrice] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  
  const { toast } = useToast()

  // Cargar configuracion al inicio
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await companySettingsAPI.get("tupaginaya")
      if (settings?.basePrice) {
        setBasePrice(settings.basePrice)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const handleSaveBasePrice = async () => {
    const price = parseFloat(newBasePrice)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un precio valido",
        variant: "destructive",
      })
      return
    }

    setIsSavingPrice(true)
    try {
      await companySettingsAPI.update("tupaginaya", { basePrice: price })
      setBasePrice(price)
      setEditingBasePrice(false)
      setNewBasePrice("")
      toast({
        title: "Precio actualizado",
        description: `El precio base se actualizo a $${price.toLocaleString("es-AR")}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio",
        variant: "destructive",
      })
    } finally {
      setIsSavingPrice(false)
    }
  }

  // Generar lista de meses
  const generateMonths = () => {
    const months = []
    const currentDate = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const label = date.toLocaleDateString("es-AR", { month: "long", year: "numeric" })
      months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
    }
    return months
  }

  // Filtrar ventas de TuPaginaYa por mes seleccionado
  const tupaginayaSales = sales.filter(sale => {
    if (sale.company !== "tupaginaya") return false
    const saleDate = new Date(sale.createdAt)
    const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, "0")}`
    return saleMonth === selectedMonth
  })

  // Calcular estadisticas
  const totalSales = tupaginayaSales.length
  const totalRevenue = tupaginayaSales.reduce((acc, sale) => {
    const planPrice = sale.plan?.price || basePrice
    return acc + planPrice
  }, 0)
  const activeSellers = new Set(tupaginayaSales.map(s => s.seller?._id)).size

  // Calcular comisiones por vendedor
  const sellerCommissions = tupaginayaSales.reduce((acc, sale) => {
    const sellerId = sale.seller?._id || "unknown"
    const sellerName = sale.seller?.name || "Vendedor desconocido"
    if (!acc[sellerId]) {
      acc[sellerId] = { name: sellerName, sales: 0, commission: 0 }
    }
    acc[sellerId].sales += 1
    acc[sellerId].commission += sale.commission || 0
    return acc
  }, {} as Record<string, { name: string; sales: number; commission: number }>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comisiones TuPaginaYa</h1>
          <p className="text-muted-foreground">
            Gestiona el precio base y visualiza las comisiones de vendedores
          </p>
        </div>
        
        {/* Selector de mes */}
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {generateMonths().map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Precio Base - Configuracion principal */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Precio Base por Venta
          </CardTitle>
          <CardDescription>
            Este es el precio base que se usa para calcular las comisiones de cada venta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {editingBasePrice ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">$</span>
                  <Input
                    type="number"
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    placeholder={basePrice.toString()}
                    className="w-40 text-2xl font-bold"
                    autoFocus
                  />
                </div>
                <Button 
                  onClick={handleSaveBasePrice} 
                  disabled={isSavingPrice}
                  size="sm"
                >
                  {isSavingPrice ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Guardar
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingBasePrice(false)
                    setNewBasePrice("")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="text-4xl font-bold text-primary">
                  ${basePrice.toLocaleString("es-AR")}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingBasePrice(true)
                    setNewBasePrice(basePrice.toString())
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Modificar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estadisticas del mes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Webs vendidas este mes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalRevenue.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Facturacion del mes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendedores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSellers}</div>
            <p className="text-xs text-muted-foreground">
              Con ventas este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de comisiones por vendedor */}
      <Card>
        <CardHeader>
          <CardTitle>Comisiones por Vendedor</CardTitle>
          <CardDescription>
            Resumen de ventas y comisiones del mes seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(sellerCommissions).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay ventas registradas en este mes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-center">Ventas</TableHead>
                  <TableHead className="text-right">Comision Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(sellerCommissions).map(([id, data]) => (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{data.name}</TableCell>
                    <TableCell className="text-center">{data.sales}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      ${data.commission.toLocaleString("es-AR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
