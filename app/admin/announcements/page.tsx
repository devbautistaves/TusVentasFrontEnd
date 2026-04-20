"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { useToast } from "@/hooks/use-toast"
import { usersAPI, User } from "@/lib/api"
import { 
  Megaphone, 
  Send, 
  Users, 
  Calendar, 
  FileText, 
  AlertTriangle,
  Plus,
  Clock,
  Link as LinkIcon,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tusventasbackend.onrender.com"

interface AnnouncementFormData {
  title: string
  message: string
  type: "general" | "meeting" | "material" | "urgent"
  targetType: "all" | "specific"
  targetUsers: string[]
  meetingDate: string
  meetingTime: string
  meetingLink: string
}

const initialFormData: AnnouncementFormData = {
  title: "",
  message: "",
  type: "general",
  targetType: "all",
  targetUsers: [],
  meetingDate: "",
  meetingTime: "",
  meetingLink: "",
}

export default function AnnouncementsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<AnnouncementFormData>(initialFormData)
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    setIsLoading(true)
    try {
      const response = await usersAPI.getAll(token)
      setUsers(response.users.filter((u) => u.role === "seller"))
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendAnnouncement = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "El titulo y mensaje son requeridos",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const payload: any = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
      }

      if (formData.type === "meeting" && formData.meetingDate) {
        payload.meetingDate = `${formData.meetingDate}T${formData.meetingTime || "00:00"}`
        payload.meetingLink = formData.meetingLink
      }

      const response = await fetch(`${API_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Error al enviar")

      toast({
        title: "Anuncio enviado",
        description: "El anuncio ha sido enviado a todos los vendedores",
      })

      setRecentAnnouncements((prev) => [
        {
          ...payload,
          createdAt: new Date().toISOString(),
          id: Date.now(),
        },
        ...prev,
      ])

      setFormData(initialFormData)
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el anuncio",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "meeting":
        return {
          icon: Calendar,
          label: "Reunion",
          color: "text-blue-500 bg-blue-500/10",
        }
      case "material":
        return {
          icon: FileText,
          label: "Material",
          color: "text-green-500 bg-green-500/10",
        }
      case "urgent":
        return {
          icon: AlertTriangle,
          label: "Urgente",
          color: "text-red-500 bg-red-500/10",
        }
      default:
        return {
          icon: Megaphone,
          label: "General",
          color: "text-primary bg-primary/10",
        }
    }
  }

  const quickAnnouncements = [
    {
      title: "Reunion de equipo",
      type: "meeting" as const,
      icon: Calendar,
      description: "Programar una reunion con el equipo",
    },
    {
      title: "Nuevo material",
      type: "material" as const,
      icon: FileText,
      description: "Compartir material de ventas",
    },
    {
      title: "Aviso urgente",
      type: "urgent" as const,
      icon: AlertTriangle,
      description: "Enviar comunicado urgente",
    },
    {
      title: "Anuncio general",
      type: "general" as const,
      icon: Megaphone,
      description: "Comunicado general al equipo",
    },
  ]

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
            <h1 className="text-3xl font-bold text-foreground">Anuncios</h1>
            <p className="text-muted-foreground">
              Envia comunicados y avisos a tu equipo de vendedores
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Anuncio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Anuncio</DialogTitle>
                <DialogDescription>
                  Envia un comunicado a todos los vendedores
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Tipo de anuncio</FieldLabel>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="meeting">Reunion</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel>Titulo</FieldLabel>
                    <Input
                      placeholder="Titulo del anuncio"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel>Mensaje</FieldLabel>
                    <Textarea
                      placeholder="Escribe el mensaje del anuncio..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      rows={4}
                    />
                  </Field>
                </FieldGroup>

                {formData.type === "meeting" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Fecha</FieldLabel>
                          <Input
                            type="date"
                            value={formData.meetingDate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                meetingDate: e.target.value,
                              }))
                            }
                          />
                        </Field>
                      </FieldGroup>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Hora</FieldLabel>
                          <Input
                            type="time"
                            value={formData.meetingTime}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                meetingTime: e.target.value,
                              }))
                            }
                          />
                        </Field>
                      </FieldGroup>
                    </div>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Link de la reunion (opcional)</FieldLabel>
                        <Input
                          placeholder="https://meet.google.com/..."
                          value={formData.meetingLink}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              meetingLink: e.target.value,
                            }))
                          }
                        />
                      </Field>
                    </FieldGroup>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendAnnouncement}
                  disabled={isSending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar a todos
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Vendedores activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentAnnouncements.length}</p>
                  <p className="text-sm text-muted-foreground">Anuncios enviados hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Ahora</p>
                  <p className="text-sm text-muted-foreground">Entrega instantanea</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Acciones rapidas</CardTitle>
            <CardDescription>Selecciona un tipo de anuncio para comenzar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickAnnouncements.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        type: item.type,
                        title: item.type === "general" ? "" : item.title,
                      }))
                      setIsDialogOpen(true)
                    }}
                    className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                        getTypeConfig(item.type).color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Anuncios Recientes
            </CardTitle>
            <CardDescription>Historial de comunicados enviados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length === 0 ? (
              <div className="py-12 text-center">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No has enviado anuncios todavia
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crea tu primer anuncio para comunicarte con tu equipo
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map((announcement) => {
                  const config = getTypeConfig(announcement.type)
                  const Icon = config.icon
                  return (
                    <div
                      key={announcement.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-secondary/20"
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                          config.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {announcement.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {announcement.message}
                            </p>
                            {announcement.meetingDate && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-blue-500">
                                <Calendar className="h-3 w-3" />
                                {new Date(announcement.meetingDate).toLocaleString("es-AR")}
                                {announcement.meetingLink && (
                                  <>
                                    <LinkIcon className="h-3 w-3 ml-2" />
                                    <a
                                      href={announcement.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline"
                                    >
                                      Link
                                    </a>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                config.color
                              )}
                            >
                              {config.label}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(announcement.createdAt).toLocaleTimeString(
                                "es-AR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
