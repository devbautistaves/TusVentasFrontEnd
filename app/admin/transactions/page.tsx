"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, TrendingUp, TrendingDown, DollarSign, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
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
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { transactionsAPI, Transaction, TransactionType } from "@/lib/api"
import { useCompany } from "@/lib/company-context"
import { StatCard } from "@/components/dashboard/stat-card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Spinner } from "@/components/ui/spinner"

const CATEGORIES = {
  ingreso: [
    "Pago mensualidad",
    "Pago setup",
    "Servicio adicional",
    "Renovacion",
    "Otro ingreso",
  ],
  egreso: [
    "Liquidacion vendedor",
    "Hosting/Dominio",
    "Publicidad",
    "Herramientas",
    "Servicios profesionales",
    "Gastos operativos",
    "Otro egreso",
  ],
}

export default function TransactionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentCompany } = useCompany()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<{ ingresos: number; egresos: number; balance: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [typeFilter, setTypeFilter] = useState<string>("all")
  
  const [formData, setFormData] = useState({
    type: "ingreso" as TransactionType,
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  })

  useEffect(() => {
    if (currentCompany.id !== "tupaginaya") {
      router.push("/admin")
      return
    }
    
    fetchData()
  }, [currentCompany, selectedMonth, typeFilter])

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      setIsLoading(true)
      const filters: { type?: string; month?: string } = { month: selectedMonth }
      if (typeFilter !== "all") filters.type = typeFilter
      
      const [transactionsRes, summaryRes] = await Promise.all([
        transactionsAPI.getAll(token, filters),
        transactionsAPI.getSummary(token, selectedMonth),
      ])
      
      setTransactions(transactionsRes.transactions)
      setSummary(summaryRes.summary)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTransaction = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    if (!formData.category || !formData.amount || !formData.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      await transactionsAPI.create(token, formData)
      toast({
        title: "Transaccion creada",
        description: `Se registro el ${formData.type} correctamente`,
      })
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error creating transaction:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la transaccion",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      type: "ingreso",
      category: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ingresos y Egresos</h1>
          <p className="text-muted-foreground">Control financiero de TuPaginaYa</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transaccion
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-500">
                Ingresos del Mes
              </CardTitle>
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-500">
                ${summary.ingresos.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-500">
                Egresos del Mes
              </CardTitle>
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-500">
                ${summary.egresos.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className={`${summary.balance >= 0 ? "border-blue-500/30 bg-blue-500/5" : "border-orange-500/30 bg-orange-500/5"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${summary.balance >= 0 ? "text-blue-500" : "text-orange-500"}`}>
                Balance
              </CardTitle>
              <DollarSign className={`h-5 w-5 ${summary.balance >= 0 ? "text-blue-500" : "text-orange-500"}`} />
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${summary.balance >= 0 ? "text-blue-500" : "text-orange-500"}`}>
                ${summary.balance.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="space-y-2">
              <Label>Mes</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full md:w-48"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ingreso">Solo Ingresos</SelectItem>
                  <SelectItem value="egreso">Solo Egresos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay transacciones en este periodo
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString("es-AR")}
                    </TableCell>
                    <TableCell>
                      <Badge className={transaction.type === "ingreso" ? "bg-emerald-500" : "bg-red-500"}>
                        {transaction.type === "ingreso" ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type === "ingreso" ? "Ingreso" : "Egreso"}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                    <TableCell>
                      {typeof transaction.clientId === "object" 
                        ? transaction.clientId?.name || transaction.clientId?.businessName || "-"
                        : "-"
                      }
                    </TableCell>
                    <TableCell className={`text-right font-bold ${transaction.type === "ingreso" ? "text-emerald-500" : "text-red-500"}`}>
                      {transaction.type === "ingreso" ? "+" : "-"}${transaction.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Transaccion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v as TransactionType, category: "" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      Ingreso
                    </span>
                  </SelectItem>
                  <SelectItem value="egreso">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Egreso
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES[formData.type].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder="10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripcion *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripcion de la transaccion"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas opcionales..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false)
              resetForm()
            }}>
              Cancelar
            </Button>
          <Button onClick={handleCreateTransaction}>
            Crear Transaccion
          </Button>
        </div>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  )
}
