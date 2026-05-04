"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { FileImage, FileVideo, FileText, Download, ExternalLink, Folder, Plus, Image, Video, File, Trash2, Upload, Globe, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useCompany } from "@/lib/company-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Spinner } from "@/components/ui/spinner"

// Tipos para materiales
interface Material {
  id: string
  category: string
  name: string
  description: string
  type: "image" | "video" | "document"
  url: string
  thumbnailUrl?: string
  createdAt: string
}

// Tipo para demos activadas de TuPaginaYa
interface DemoActivada {
  id: string
  clientName: string
  websiteUrl: string
  thumbnailUrl: string
  description: string
  activatedAt: string
}

// Datos de ejemplo para Prosegur/TusVentas
const MATERIALS_PROSEGUR = [
  {
    id: "1",
    category: "Flyers",
    name: "Flyer Internet Fibra",
    description: "Flyer promocional fibra optica",
    type: "image" as const,
    url: "#",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    category: "Precios",
    name: "Lista de Planes Internet",
    description: "Planes y precios de internet",
    type: "document" as const,
    url: "#",
    createdAt: "2024-01-10",
  },
]

const CATEGORIES_PROSEGUR = ["Flyers", "Precios", "Videos", "Presentaciones", "Redes Sociales", "Otros"]

// Categorias especiales para TuPaginaYa
const CATEGORIES_TUPAGINAYA = ["Material Publicitario", "Demos Activadas"]

export default function MaterialsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentCompany } = useCompany()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [materials, setMaterials] = useState<Material[]>([])
  const [demosActivadas, setDemosActivadas] = useState<DemoActivada[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para modales
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAddDemoModal, setShowAddDemoModal] = useState(false)
  const [uploadCategory, setUploadCategory] = useState<string>("")
  
  // Estados para formularios
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    description: "",
    type: "image" as "image" | "video" | "document",
    file: null as File | null,
  })
  
  const [newDemo, setNewDemo] = useState({
    clientName: "",
    websiteUrl: "",
    description: "",
    thumbnailFile: null as File | null,
  })

  const isTuPaginaYa = currentCompany.id === "tupaginaya"

  useEffect(() => {
    loadData()
  }, [currentCompany])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // En produccion, cargar desde el backend
      if (isTuPaginaYa) {
        // Datos de ejemplo para TuPaginaYa
        setMaterials([
          {
            id: "tpy-1",
            category: "Material Publicitario",
            name: "Flyer Landing Page Premium",
            description: "Flyer promocional para servicios de landing page",
            type: "image",
            url: "/images/grupojv/hero1.png",
            createdAt: "2024-01-15",
          },
          {
            id: "tpy-2",
            category: "Material Publicitario",
            name: "Video Demo Servicios",
            description: "Video demostrativo de nuestros servicios web",
            type: "video",
            url: "#",
            createdAt: "2024-01-10",
          },
          {
            id: "tpy-3",
            category: "Material Publicitario",
            name: "Catalogo de Precios 2024",
            description: "Lista de precios actualizada",
            type: "document",
            url: "#",
            createdAt: "2024-02-01",
          },
        ])
        
        setDemosActivadas([
          {
            id: "demo-1",
            clientName: "Restaurante El Buen Sabor",
            websiteUrl: "https://elbuensabor.tupaginaya.com",
            thumbnailUrl: "/images/grupojv/hero1.png",
            description: "Landing page para restaurante con menu digital",
            activatedAt: "2024-03-15",
          },
          {
            id: "demo-2",
            clientName: "Consultorio Dental Sonrisas",
            websiteUrl: "https://sonrisas.tupaginaya.com",
            thumbnailUrl: "/images/grupojv/hero2.png",
            description: "Pagina web para consultorio dental con turnos online",
            activatedAt: "2024-03-10",
          },
        ])
      } else {
        setMaterials(MATERIALS_PROSEGUR)
        setDemosActivadas([])
      }
    } catch (error) {
      console.error("Error loading materials:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los materiales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadMaterial = async () => {
    if (!newMaterial.name || !newMaterial.file) {
      toast({
        title: "Error",
        description: "Completa el nombre y selecciona un archivo",
        variant: "destructive",
      })
      return
    }

    try {
      // En produccion, subir al backend
      const newItem: Material = {
        id: `new-${Date.now()}`,
        category: uploadCategory || "Material Publicitario",
        name: newMaterial.name,
        description: newMaterial.description,
        type: newMaterial.type,
        url: URL.createObjectURL(newMaterial.file),
        createdAt: new Date().toISOString().split("T")[0],
      }
      
      setMaterials(prev => [newItem, ...prev])
      setShowUploadModal(false)
      setNewMaterial({ name: "", description: "", type: "image", file: null })
      
      toast({
        title: "Material subido",
        description: "El material se ha subido correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir el material",
        variant: "destructive",
      })
    }
  }

  const handleAddDemo = async () => {
    if (!newDemo.clientName || !newDemo.websiteUrl) {
      toast({
        title: "Error",
        description: "Completa el nombre del cliente y la URL",
        variant: "destructive",
      })
      return
    }

    try {
      const newDemoItem: DemoActivada = {
        id: `demo-${Date.now()}`,
        clientName: newDemo.clientName,
        websiteUrl: newDemo.websiteUrl,
        description: newDemo.description,
        thumbnailUrl: newDemo.thumbnailFile 
          ? URL.createObjectURL(newDemo.thumbnailFile) 
          : "/images/grupojv/hero1.png",
        activatedAt: new Date().toISOString().split("T")[0],
      }
      
      setDemosActivadas(prev => [newDemoItem, ...prev])
      setShowAddDemoModal(false)
      setNewDemo({ clientName: "", websiteUrl: "", description: "", thumbnailFile: null })
      
      toast({
        title: "Demo agregada",
        description: "La demo se ha agregado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar la demo",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id))
    toast({
      title: "Material eliminado",
      description: "El material se ha eliminado correctamente",
    })
  }

  const handleDeleteDemo = (id: string) => {
    setDemosActivadas(prev => prev.filter(d => d.id !== id))
    toast({
      title: "Demo eliminada",
      description: "La demo se ha eliminado correctamente",
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-8 w-8 text-blue-500" />
      case "video": return <Video className="h-8 w-8 text-purple-500" />
      case "document": return <File className="h-8 w-8 text-emerald-500" />
      default: return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const getMaterialsCount = (category: string) => {
    if (category === "Demos Activadas") {
      return demosActivadas.length
    }
    return materials.filter(m => m.category === category).length
  }

  const filteredMaterials = selectedCategory === "all" || selectedCategory === "Demos Activadas"
    ? materials.filter(m => isTuPaginaYa ? m.category === "Material Publicitario" : true)
    : materials.filter(m => m.category === selectedCategory)

  const categories = isTuPaginaYa ? CATEGORIES_TUPAGINAYA : CATEGORIES_PROSEGUR

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isTuPaginaYa ? "Materiales y Demos" : "Material Grafico"}
            </h1>
            <p className="text-muted-foreground">
              {isTuPaginaYa 
                ? "Gestiona el material publicitario y las demos activadas"
                : `Recursos de marketing para ${currentCompany.name}`
              }
            </p>
          </div>
        </div>

        {/* Carpetas - Solo 2 para TuPaginaYa */}
        <div className={`grid gap-4 ${isTuPaginaYa ? "md:grid-cols-2" : "md:grid-cols-3 lg:grid-cols-6"}`}>
          {categories.map((category) => {
            const count = getMaterialsCount(category)
            const isSelected = selectedCategory === category
            const isDemosCategory = category === "Demos Activadas"
            
            return (
              <Card 
                key={category}
                className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                  isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${isDemosCategory ? "bg-emerald-100" : "bg-blue-100"}`}>
                      {isDemosCategory 
                        ? <Globe className="h-8 w-8 text-emerald-600" />
                        : <Folder className="h-8 w-8 text-blue-600" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{category}</p>
                      <p className="text-sm text-muted-foreground">
                        {count} {isDemosCategory ? "demos" : "archivos"}
                      </p>
                    </div>
                  </div>
                  {isTuPaginaYa && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isDemosCategory) {
                          setShowAddDemoModal(true)
                        } else {
                          setUploadCategory(category)
                          setShowUploadModal(true)
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isDemosCategory ? "Agregar Demo" : "Subir Material"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Contenido segun carpeta seleccionada */}
        {selectedCategory === "Demos Activadas" && isTuPaginaYa ? (
          // Vista de Demos Activadas
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Demos Activadas</CardTitle>
                  <CardDescription>
                    Paginas web entregadas a clientes
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddDemoModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Demo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {demosActivadas.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay demos activadas</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowAddDemoModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar primera demo
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {demosActivadas.map((demo) => (
                    <Card key={demo.id} className="overflow-hidden group">
                      <div className="aspect-video bg-secondary relative">
                        <img 
                          src={demo.thumbnailUrl} 
                          alt={demo.clientName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => window.open(demo.websiteUrl, "_blank")}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteDemo(demo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold truncate">{demo.clientName}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {demo.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <a 
                            href={demo.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            Ver sitio
                          </a>
                          <span className="text-xs text-muted-foreground">
                            {new Date(demo.activatedAt).toLocaleDateString("es-AR")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Vista de Material Publicitario o materiales generales
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {isTuPaginaYa ? "Material Publicitario" : (selectedCategory === "all" ? "Todos los Materiales" : selectedCategory)}
                  </CardTitle>
                  <CardDescription>
                    {filteredMaterials.length} archivos disponibles
                  </CardDescription>
                </div>
                {isTuPaginaYa && (
                  <Button onClick={() => {
                    setUploadCategory("Material Publicitario")
                    setShowUploadModal(true)
                  }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Material
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay materiales en esta categoria</p>
                  {isTuPaginaYa && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setUploadCategory("Material Publicitario")
                        setShowUploadModal(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Subir primer material
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMaterials.map((material) => (
                    <Card key={material.id} className="overflow-hidden group">
                      <div className="aspect-video bg-secondary flex items-center justify-center relative">
                        {material.type === "image" && material.url !== "#" ? (
                          <img 
                            src={material.url} 
                            alt={material.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getIcon(material.type)
                        )}
                        {isTuPaginaYa && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteMaterial(material.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{material.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {material.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-secondary px-2 py-1 rounded">
                                {material.type === "image" ? "Imagen" : material.type === "video" ? "Video" : "Documento"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(material.createdAt).toLocaleDateString("es-AR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal para subir material */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Material</DialogTitle>
            <DialogDescription>
              Sube un nuevo archivo a {uploadCategory || "Material Publicitario"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="material-name">Nombre del material</Label>
              <Input
                id="material-name"
                placeholder="Ej: Flyer Promocional"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="material-description">Descripcion</Label>
              <Textarea
                id="material-description"
                placeholder="Descripcion del material..."
                value={newMaterial.description}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="material-type">Tipo de archivo</Label>
              <Select
                value={newMaterial.type}
                onValueChange={(value: "image" | "video" | "document") => 
                  setNewMaterial(prev => ({ ...prev, type: value }))
                }
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
            
            <div className="space-y-2">
              <Label>Archivo</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {newMaterial.file ? (
                  <div className="flex items-center justify-center gap-2">
                    <File className="h-5 w-5 text-primary" />
                    <span className="text-sm">{newMaterial.file.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNewMaterial(prev => ({ ...prev, file: null }))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click para seleccionar archivo
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={
                  newMaterial.type === "image" ? "image/*" :
                  newMaterial.type === "video" ? "video/*" :
                  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                }
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setNewMaterial(prev => ({ ...prev, file }))
                  }
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUploadMaterial}>
              <Upload className="h-4 w-4 mr-2" />
              Subir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar demo */}
      <Dialog open={showAddDemoModal} onOpenChange={setShowAddDemoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Demo Activada</DialogTitle>
            <DialogDescription>
              Agrega una nueva pagina web entregada a un cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="demo-client">Nombre del cliente</Label>
              <Input
                id="demo-client"
                placeholder="Ej: Restaurante El Buen Sabor"
                value={newDemo.clientName}
                onChange={(e) => setNewDemo(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demo-url">URL del sitio web</Label>
              <Input
                id="demo-url"
                placeholder="https://ejemplo.tupaginaya.com"
                value={newDemo.websiteUrl}
                onChange={(e) => setNewDemo(prev => ({ ...prev, websiteUrl: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demo-description">Descripcion</Label>
              <Textarea
                id="demo-description"
                placeholder="Descripcion del proyecto..."
                value={newDemo.description}
                onChange={(e) => setNewDemo(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Imagen de portada</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "image/*"
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      setNewDemo(prev => ({ ...prev, thumbnailFile: file }))
                    }
                  }
                  input.click()
                }}
              >
                {newDemo.thumbnailFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    <span className="text-sm">{newDemo.thumbnailFile.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNewDemo(prev => ({ ...prev, thumbnailFile: null }))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click para seleccionar imagen de portada
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDemoModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddDemo}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Demo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
