"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useToast } from "@/hooks/use-toast"
import { usersAPI, salesAPI, User, Sale } from "@/lib/api"
import { DollarSign, TrendingUp, Edit2, Users, Award } from "lucide-react"

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
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const [usersRes, salesRes] = await Promise.all([
        usersAPI.getAll(token),
        salesAPI.getAdminSales(token),
      ])
      setUsers(usersRes.users.filter((u) => u.role === "seller"))
      setSales(salesRes.sales)

      // Load saved tiers from localStorage
      const savedTiers = localStorage.getItem("commissionTiers")
      if (savedTiers) {
        setTiers(JSON.parse(savedTiers))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSellerSales = (sellerId: string) => {
    return sales.filter(
      (s) =>
        s.sellerId === sellerId &&
        (s.status === "completed" || s.status === "installed")
    ).length
  }

  const calculateCommission = (salesCount: number) => {
    for (const tier of tiers) {
      if (salesCount >= tier.minSales && salesCount <= tier.maxSales) {
        return tier.amount
      }
    }
    return 0
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

  const totalCommissions = users.reduce((acc, user) => {
    const sellerSales = getSellerSales(user._id)
    return acc + calculateCommission(sellerSales)
  }, 0)

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
              Gestiona las comisiones de los vendedores
            </p>
          </div>
          <Button
            onClick={handleOpenEditDialog}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Editar Rangos
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Comisiones del Mes</p>
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
                  <p className="text-sm text-muted-foreground">Vendedores Activos</p>
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
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
                  <p className="text-sm text-muted-foreground">Ventas Activadas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {sales.filter((s) => s.status === "completed" || s.status === "installed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Scale */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Escala de Comisiones</CardTitle>
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

        {/* Sellers Table */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Comisiones por Vendedor</CardTitle>
            <CardDescription>Resumen de comisiones del mes actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vendedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ventas Totales</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ventas Activadas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rango Actual</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Comision</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const totalUserSales = sales.filter((s) => s.sellerId === user._id).length
                    const activatedSales = getSellerSales(user._id)
                    const commission = calculateCommission(activatedSales)
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
                        <td className="py-3 px-4 text-foreground">{totalUserSales}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                            <Award className="h-4 w-4" />
                            {activatedSales}
                          </span>
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
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(commission)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
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
                Modifica los rangos y montos de comision
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
      </div>
    </DashboardLayout>
  )
}
