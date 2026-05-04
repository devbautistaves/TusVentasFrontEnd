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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { companySettingsAPI, User, Sale } from "@/lib/api"
import { 
  DollarSign, 
  Calendar, 
  Image, 
  Globe, 
  Edit2, 
  Save, 
  Folder, 
  ExternalLink,
  Plus,
  Upload,
  Trash2 
} from "lucide-react"
import { Label } from "@/components/ui/label"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vps-5905394-x.dattaweb.com"

interface TuPaginaYaCommissionsPanelProps {
  users: User[]
  sales: Sale[]
  isLoading: boolean
}

interface Demo {
  _id: string
  clientName: string
  websiteUrl: string
  thumbnailUrl?: string
  status: "active" | "paused" | "cancelled"
  activatedDate: string
  createdAt: string
}

interface MarketingMaterial {
  _id: string
  name: string
  description: string
  type: "image" | "video" | "document"
  url: string
  createdAt: string
}

export function TuPaginaYaCommissionsPanel({ users, sales, isLoading }: TuPaginaYaCommissionsPanelProps) {
  const [basePrice, setBasePrice] = useState<number>(0)
  const [editingBasePrice, setEditingBasePrice] = useState(false)
  const [newBasePrice, setNewBasePrice] = useState<string>("")
  const [isSavingPrice, setIsSavingPrice] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<"materials" | "demos">("materials")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  
  // Material publicitario (mock - en produccion vendria del backend)
  const [materials, setMaterials] = useState<MarketingMaterial[]>([
    {
      _id: "1",
      name: "Flyer Landing Page Premium",
      description: "Flyer para promocionar servicios de landing page",
      type: "image",
      url: "#",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      name: "Video Demo Servicios",
      description: "Video explicativo de todos los servicios web",
      type: "video",
      url: "#",
      createdAt: new Date().toISOString(),
    },
  ])
  
  // Demos activadas (mock - en produccion vendria del backend)
  const [demos, setDemos] = useState<Demo[]>([
    {
      _id: "1",
      clientName: "Restaurante La Parrilla",
      websiteUrl: "https://laparrilla.tupaginaya.com",
      thumbnailUrl: "/images/grupojv/hero1.png",
      status: "active",
      activatedDate: "2024-01-15",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      clientName: "Estudio Juridico Martinez",
      websiteUrl: "https://estudiomartinez.tupaginaya.com",
      thumbnailUrl: "/images/grupojv/hero2.png",
      status: "active",
      activatedDate: "2024-02-01",
      createdAt: new Date().toISOString(),
    },
  ])
  
  // Dialog states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({ name: "", description: "", type: "image" as "image" | "video" | "document" })
  const [demoForm, setDemoForm] = useState({ clientName: "", websiteUrl: "", thumbnailUrl: "" })
  
  const { toast } = useToast()

  // Cargar configuracion de empresa
  useEffect(() => {
    loadCompanySettings()
  }, [])

  const loadCompanySettings = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await companySettingsAPI.get(token, "tupaginaya")
      if (response.settings) {
        setBasePrice(response.settings.baseCommissionPerSale || 0)
      }
    } catch (error) {
      console.error("Error loading company settings:", error)
    }
  }

  const handleSaveBasePrice = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    setIsSavingPrice(true)
    try {
      await companySettingsAPI.update(token, "tupaginaya", {
        baseCommissionPerSale: Number(newBasePrice),
      })
      
      setBasePrice(Number(newBasePrice))
      setEditingBasePrice(false)
      
      toast({
        title: "Precio base actualizado",
        description: `El precio base ahora es ${formatCurrency(Number(newBasePrice))}`,
      })
    } catch (error) {
      console.error("Error saving base price:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio base",
        variant: "destructive",
      })
    } finally {
      setIsSavingPrice(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
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

  // Calcular estadisticas basicas del mes
  const getMonthStats = () => {
    const [year, month] = selectedMonth.split("-").map(Number)
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt)
      return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year
    })
    
    const activeSales = monthSales.filter(s => s.status === "web_activada" || s.status === "completed")
    const totalRevenue = activeSales.reduce((acc, sale) => acc + (sale.planPrice || 0), 0)
    
    return {
      totalSales: monthSales.length,
      activeSales: activeSales.length,
      totalRevenue,
    }
  }

  const stats = getMonthStats()

  // Handlers para subir material
  const handleUploadMaterial = async () => {
    if (!uploadForm.name) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      })
      return
    }

    // En produccion esto iria al backend
    const newMaterial: MarketingMaterial = {
      _id: Date.now().toString(),
      name: uploadForm.name,
      description: uploadForm.description,
      type: uploadForm.type,
      url: "#",
      createdAt: new Date().toISOString(),
    }
    
    setMaterials([newMaterial, ...materials])
    setIsUploadDialogOpen(false)
    setUploadForm({ name: "", description: "", type: "image" })
    
    toast({
      title: "Material subido",
      description: "El material publicitario se ha agregado correctamente",
    })
  }

  // Handler para agregar demo
  const handleAddDemo = async () => {
    if (!demoForm.clientName || !demoForm.websiteUrl) {
      toast({
        title: "Error",
        description: "El nombre del cliente y la URL son requeridos",
        variant: "destructive",
      })
      return
    }

    // En produccion esto iria al backend
    const newDemo: Demo = {
      _id: Date.now().toString(),
      clientName: demoForm.clientName,
      websiteUrl: demoForm.websiteUrl,
      thumbnailUrl: demoForm.thumbnailUrl || "/images/grupojv/hero1.png",
      status: "active",
      activatedDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    }
    
    setDemos([newDemo, ...demos])
    setIsDemoDialogOpen(false)
    setDemoForm({ clientName: "", websiteUrl: "", thumbnailUrl: "" })
    
    toast({
      title: "Demo agregada",
      description: "La demo se ha registrado correctamente",
    })
  }

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
            Gestiona el precio base y los recursos de la empresa
          </p>
        </div>
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
      </div>

      {/* Precio Base Modificable */}
      <Card className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            Precio Base por Venta
          </CardTitle>
          <CardDescription>
            Este es el monto base que se utiliza para calcular las comisiones de los vendedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {editingBasePrice ? (
              <>
                <div className="flex-1 max-w-xs">
                  <Input
                    type="number"
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    placeholder="Ingrese el nuevo precio base"
                    className="text-lg"
                  />
                </div>
                <Button 
                  onClick={handleSaveBasePrice} 
                  disabled={isSavingPrice || !newBasePrice}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSavingPrice ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingBasePrice(false)
                    setNewBasePrice("")
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-blue-500">
                  {formatCurrency(basePrice)}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingBasePrice(true)
                    setNewBasePrice(basePrice.toString())
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
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
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ventas del Mes</p>
                <p className="text-3xl font-bold">{stats.totalSales}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Webs Activadas</p>
                <p className="text-3xl font-bold text-emerald-500">{stats.activeSales}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-emerald-500">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selector de Carpetas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className={`cursor-pointer transition-all hover:border-blue-500/50 ${selectedFolder === "materials" ? "border-blue-500 bg-blue-500/5" : ""}`}
          onClick={() => setSelectedFolder("materials")}
        >
          <CardContent className="pt-6 flex items-center gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${selectedFolder === "materials" ? "bg-blue-500" : "bg-blue-500/20"}`}>
              <Image className={`h-7 w-7 ${selectedFolder === "materials" ? "text-white" : "text-blue-500"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Material Publicitario</h3>
              <p className="text-sm text-muted-foreground">{materials.length} archivos disponibles</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all hover:border-emerald-500/50 ${selectedFolder === "demos" ? "border-emerald-500 bg-emerald-500/5" : ""}`}
          onClick={() => setSelectedFolder("demos")}
        >
          <CardContent className="pt-6 flex items-center gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${selectedFolder === "demos" ? "bg-emerald-500" : "bg-emerald-500/20"}`}>
              <Globe className={`h-7 w-7 ${selectedFolder === "demos" ? "text-white" : "text-emerald-500"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Demos Activadas</h3>
              <p className="text-sm text-muted-foreground">{demos.length} webs entregadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido de la carpeta seleccionada */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {selectedFolder === "materials" ? "Material Publicitario" : "Demos Activadas"}
            </CardTitle>
            <CardDescription>
              {selectedFolder === "materials" 
                ? "Recursos de marketing disponibles para los vendedores" 
                : "Paginas web entregadas a clientes"}
            </CardDescription>
          </div>
          <Button 
            onClick={() => selectedFolder === "materials" ? setIsUploadDialogOpen(true) : setIsDemoDialogOpen(true)}
            className={selectedFolder === "materials" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {selectedFolder === "materials" ? "Subir Material" : "Agregar Demo"}
          </Button>
        </CardHeader>
        <CardContent>
          {selectedFolder === "materials" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {materials.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay materiales publicitarios</p>
                  <p className="text-sm">Sube el primer material para comenzar</p>
                </div>
              ) : (
                materials.map((material) => (
                  <Card key={material._id} className="overflow-hidden">
                    <div className="aspect-video bg-secondary flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-medium truncate">{material.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {material.description}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs bg-secondary px-2 py-1 rounded capitalize">
                          {material.type === "image" ? "Imagen" : material.type === "video" ? "Video" : "Documento"}
                        </span>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {demos.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay demos activadas</p>
                  <p className="text-sm">Agrega la primera demo para comenzar</p>
                </div>
              ) : (
                demos.map((demo) => (
                  <Card key={demo._id} className="overflow-hidden group">
                    <div className="aspect-video bg-secondary relative overflow-hidden">
                      {demo.thumbnailUrl ? (
                        <img 
                          src={demo.thumbnailUrl} 
                          alt={demo.clientName}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Globe className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => window.open(demo.websiteUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visitar Web
                        </Button>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-medium">{demo.clientName}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {demo.websiteUrl}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          demo.status === "active" 
                            ? "bg-emerald-500/20 text-emerald-500" 
                            : demo.status === "paused"
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-red-500/20 text-red-500"
                        }`}>
                          {demo.status === "active" ? "Activa" : demo.status === "paused" ? "Pausada" : "Baja"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(demo.activatedDate).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para subir material */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Material Publicitario</DialogTitle>
            <DialogDescription>
              Agrega un nuevo recurso de marketing para los vendedores
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="material-name">Nombre del material</Label>
              <Input
                id="material-name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="Ej: Flyer Landing Page"
              />
            </div>
            <div>
              <Label htmlFor="material-description">Descripcion</Label>
              <Input
                id="material-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Descripcion breve del material"
              />
            </div>
            <div>
              <Label>Tipo de archivo</Label>
              <Select 
                value={uploadForm.type} 
                onValueChange={(value: "image" | "video" | "document") => setUploadForm({ ...uploadForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Imagen</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Archivo</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arrastra un archivo o haz clic para seleccionar
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUploadMaterial} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Subir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para agregar demo */}
      <Dialog open={isDemoDialogOpen} onOpenChange={setIsDemoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Demo Activada</DialogTitle>
            <DialogDescription>
              Registra una nueva pagina web entregada a un cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="demo-client">Nombre del cliente</Label>
              <Input
                id="demo-client"
                value={demoForm.clientName}
                onChange={(e) => setDemoForm({ ...demoForm, clientName: e.target.value })}
                placeholder="Ej: Restaurante La Parrilla"
              />
            </div>
            <div>
              <Label htmlFor="demo-url">URL de la pagina web</Label>
              <Input
                id="demo-url"
                type="url"
                value={demoForm.websiteUrl}
                onChange={(e) => setDemoForm({ ...demoForm, websiteUrl: e.target.value })}
                placeholder="https://ejemplo.tupaginaya.com"
              />
            </div>
            <div>
              <Label htmlFor="demo-thumbnail">URL de imagen de portada (opcional)</Label>
              <Input
                id="demo-thumbnail"
                type="url"
                value={demoForm.thumbnailUrl}
                onChange={(e) => setDemoForm({ ...demoForm, thumbnailUrl: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDemoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddDemo} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
