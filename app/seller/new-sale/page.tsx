"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { plansAPI, salesAPI, Plan } from "@/lib/api"
import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

export default function NewSalePage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerDni: "",
    street: "",
    number: "",
    city: "",
    province: "",
    postalCode: "",
    description: "",
  })

  useEffect(() => {
    const fetchPlans = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const response = await plansAPI.getAll(token)
        setPlans(response.plans.filter((p) => p.isActive))
      } catch (error) {
        console.error("Error fetching plans:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Debes seleccionar un plan",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No autenticado")

      await salesAPI.create(token, {
        planId: selectedPlan._id,
        description: formData.description,
        customerInfo: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          dni: formData.customerDni,
          address: {
            street: formData.street,
            number: formData.number,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode,
          },
        },
      })

      toast({
        title: "Venta registrada",
        description: "La venta se ha registrado correctamente",
      })

      router.push("/seller/sales")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al registrar la venta",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/seller">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nueva Venta</h1>
            <p className="text-muted-foreground">Registra una nueva venta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Selection */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Seleccionar Plan</CardTitle>
              <CardDescription>Elige el plan contratado por el cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative cursor-pointer rounded-lg border p-4 transition-all hover:border-primary ${
                      selectedPlan?._id === plan._id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-secondary/30"
                    }`}
                  >
                    {selectedPlan?._id === plan._id && (
                      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {formatCurrency(plan.price)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {plan.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
              <CardDescription>Informacion personal del cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="customerName">Nombre Completo *</FieldLabel>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Juan Perez"
                      required
                      className="bg-secondary/50"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="customerDni">DNI *</FieldLabel>
                    <Input
                      id="customerDni"
                      name="customerDni"
                      value={formData.customerDni}
                      onChange={handleInputChange}
                      placeholder="12345678"
                      required
                      className="bg-secondary/50"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="customerEmail">Email *</FieldLabel>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="cliente@email.com"
                      required
                      className="bg-secondary/50"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="customerPhone">Telefono *</FieldLabel>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="+54 11 1234-5678"
                      required
                      className="bg-secondary/50"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Direccion</CardTitle>
              <CardDescription>Domicilio del cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="street">Calle *</FieldLabel>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Av. Corrientes"
                      required
                      className="bg-secondary/50"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="number">Numero *</FieldLabel>
                    <Input
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      placeholder="1234"
                      required
                      className="bg-secondary/50"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="city">Ciudad *</FieldLabel>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Buenos Aires"
                      required
                      className="bg-secondary/50"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="province">Provincia *</FieldLabel>
                    <Input
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      placeholder="Buenos Aires"
                      required
                      className="bg-secondary/50"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="postalCode">Codigo Postal *</FieldLabel>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="1000"
                      required
                      className="bg-secondary/50"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
              <CardDescription>Notas adicionales sobre la venta</CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Escribe observaciones adicionales..."
                  rows={4}
                  required
                  className="bg-secondary/50"
                />
              </Field>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/seller">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting || !selectedPlan}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Registrando...
                </>
              ) : (
                "Registrar Venta"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
