"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  Smartphone,
  Cloud,
  Lock,
  Zap,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Play,
  Star,
  Building2,
  UserCheck,
  FileText,
  Bell,
  MessageSquare,
  Settings,
  PieChart,
  Calendar,
  Target
} from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Dashboard en Tiempo Real",
    description: "Visualiza todas las metricas de tu negocio en un solo lugar. Ventas, comisiones, rendimiento del equipo y mas."
  },
  {
    icon: Users,
    title: "Gestion de Clientes",
    description: "Administra tu cartera de clientes de forma eficiente. Historial completo, recordatorios y seguimiento automatico."
  },
  {
    icon: DollarSign,
    title: "Control de Comisiones",
    description: "Calculo automatico de comisiones por venta. Visualiza ganancias por vendedor, producto y periodo."
  },
  {
    icon: TrendingUp,
    title: "Seguimiento de Leads",
    description: "Convierte prospectos en clientes. Pipeline de ventas completo con etapas personalizables."
  },
  {
    icon: FileText,
    title: "Gestion de Ventas",
    description: "Registra y administra todas tus ventas. Estados, pagos, documentacion y mas en un solo lugar."
  },
  {
    icon: Bell,
    title: "Notificaciones Inteligentes",
    description: "Alertas automaticas para renovaciones, seguimientos pendientes y oportunidades de venta."
  },
  {
    icon: MessageSquare,
    title: "Chat Interno",
    description: "Comunicacion fluida entre el equipo. Mensajes, archivos y coordinacion en tiempo real."
  },
  {
    icon: PieChart,
    title: "Reportes Avanzados",
    description: "Informes detallados y personalizables. Exporta datos, analiza tendencias y toma mejores decisiones."
  }
]

const benefits = [
  {
    icon: Cloud,
    title: "100% en la Nube",
    description: "Accede desde cualquier lugar y dispositivo. Tus datos siempre sincronizados y disponibles."
  },
  {
    icon: Lock,
    title: "Seguridad Garantizada",
    description: "Encriptacion de datos, backups automaticos y cumplimiento de normativas de seguridad."
  },
  {
    icon: Zap,
    title: "Rapido y Eficiente",
    description: "Interfaz optimizada para maxima velocidad. Ahorra tiempo en cada tarea."
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Funciona perfectamente en computadoras, tablets y celulares."
  }
]

const roles = [
  {
    icon: Building2,
    title: "Administradores",
    description: "Control total del sistema. Gestion de usuarios, configuraciones, reportes globales y supervision completa.",
    features: ["Dashboard ejecutivo", "Gestion de usuarios", "Configuracion del sistema", "Reportes globales"]
  },
  {
    icon: UserCheck,
    title: "Supervisores",
    description: "Monitorea el rendimiento de tu equipo. Aprueba ventas, gestiona leads y optimiza resultados.",
    features: ["Vista de equipo", "Aprobacion de ventas", "Asignacion de leads", "Metricas de rendimiento"]
  },
  {
    icon: Users,
    title: "Vendedores",
    description: "Herramientas para maximizar tus ventas. Gestiona clientes, registra ventas y sigue tu progreso.",
    features: ["Cartera de clientes", "Registro de ventas", "Seguimiento de comisiones", "Calendario de actividades"]
  },
  {
    icon: Shield,
    title: "Soporte",
    description: "Atencion al cliente eficiente. Gestiona consultas, reclamos y brinda soporte de calidad.",
    features: ["Gestion de tickets", "Historial de clientes", "Base de conocimiento", "Chat en vivo"]
  }
]

const testimonials = [
  {
    quote: "TusVentas transformo completamente nuestra operacion. Ahora tenemos visibilidad total de nuestro negocio.",
    author: "Carlos M.",
    role: "Director Comercial",
    company: "Broker de Seguros"
  },
  {
    quote: "El mejor sistema de gestion que hemos usado. Facil de usar y con todas las funciones que necesitamos.",
    author: "Maria L.",
    role: "Supervisora de Ventas",
    company: "Agencia de Seguros"
  },
  {
    quote: "Mis comisiones ahora se calculan automaticamente. Ya no hay errores ni demoras en los pagos.",
    author: "Juan P.",
    role: "Vendedor Senior",
    company: "Productor de Seguros"
  }
]

const pricingFeatures = [
  "Dashboard personalizado",
  "Gestion de clientes ilimitada",
  "Calculo automatico de comisiones",
  "Seguimiento de leads y demos",
  "Chat interno del equipo",
  "Notificaciones inteligentes",
  "Reportes y exportaciones",
  "Soporte tecnico dedicado",
  "Actualizaciones incluidas",
  "Capacitacion inicial"
]

export default function TusVentasPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/images/grupojv/logo2.png" 
                alt="Grupo JV Logo" 
                width={120} 
                height={48}
                className="h-12 w-auto"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium">Inicio</Link>
              <Link href="/cotizaciones" className="text-foreground hover:text-accent transition-colors font-medium">Cotizaciones</Link>
              <Link href="/nosotros" className="text-foreground hover:text-accent transition-colors font-medium">Nosotros</Link>
              <Link href="/tusventas" className="text-accent font-medium">TusVentas</Link>
              <a href="/#contacto" className="text-foreground hover:text-accent transition-colors font-medium">Contacto</a>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <a href="https://tusventas.digital" target="_blank" rel="noopener noreferrer">
                <Button className="font-medium bg-accent text-accent-foreground hover:bg-accent/90">
                  Ir a TusVentas.digital
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden bg-background border-t border-border py-4">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg">Inicio</Link>
                <Link href="/cotizaciones" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg">Cotizaciones</Link>
                <Link href="/nosotros" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg">Nosotros</Link>
                <Link href="/tusventas" className="px-4 py-2 text-accent bg-secondary rounded-lg">TusVentas</Link>
                <a href="/#contacto" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg">Contacto</a>
                <div className="px-4 pt-2">
                  <a href="https://tusventas.digital" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-accent text-accent-foreground">Ir a TusVentas.digital</Button>
                  </a>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-primary/95 to-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Software de Gestion Comercial</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground text-balance">
                TusVentas<span className="text-accent">.Digital</span>
              </h1>
              <p className="text-xl text-primary-foreground/80 text-pretty">
                El sistema de gestion comercial mas completo del mercado. Control total de tu empresa, ventas, comisiones, clientes y equipo en tiempo real.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://tusventas.digital" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg">
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="https://wa.me/5491171231832?text=Hola!%20Quiero%20mas%20informacion%20sobre%20TusVentas.digital" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg">
                    Solicitar Demo
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-accent/30 border-2 border-primary flex items-center justify-center">
                      <Users className="h-4 w-4 text-accent" />
                    </div>
                  ))}
                </div>
                <div className="text-primary-foreground/80">
                  <span className="font-bold text-primary-foreground">+50</span> empresas ya confian en nosotros
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-card rounded-3xl shadow-2xl p-6 border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-sm text-muted-foreground">tusventas.digital</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-secondary rounded-lg flex items-center px-4">
                      <BarChart3 className="h-4 w-4 text-accent mr-2" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-secondary/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">$2.5M</p>
                        <p className="text-xs text-muted-foreground">Ventas del Mes</p>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">1,234</p>
                        <p className="text-xs text-muted-foreground">Clientes</p>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">98%</p>
                        <p className="text-xs text-muted-foreground">Satisfaccion</p>
                      </div>
                    </div>
                    <div className="h-32 bg-secondary/30 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-16 w-16 text-accent/50" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-accent rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-accent-foreground" />
                    <span className="text-sm font-medium text-accent-foreground">Venta registrada!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-muted-foreground">Funcionalidades</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              TusVentas.digital ofrece todas las herramientas para gestionar tu negocio de manera eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-0 bg-secondary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 md:py-32 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-muted-foreground">Roles de Usuario</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Una plataforma para todo el equipo
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Cada rol tiene acceso a las herramientas que necesita para ser mas productivo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, idx) => (
              <Card key={idx} className="border-0 bg-card">
                <CardContent className="p-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
                    <role.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{role.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{role.description}</p>
                  <ul className="space-y-2">
                    {role.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-medium text-muted-foreground">Beneficios</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Por que elegir TusVentas?
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <benefit.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <BarChart3 className="h-32 w-32 text-accent mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-primary-foreground mb-2">TusVentas</h3>
                  <p className="text-primary-foreground/70 text-xl">.digital</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-0 bg-primary-foreground/10">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-primary-foreground/90 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold text-primary-foreground">{testimonial.author}</p>
                    <p className="text-primary-foreground/60 text-sm">{testimonial.role}</p>
                    <p className="text-primary-foreground/60 text-sm">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-accent overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-12 bg-accent">
                    <h3 className="text-3xl font-bold text-accent-foreground mb-4">
                      Plan Completo
                    </h3>
                    <p className="text-accent-foreground/80 mb-6">
                      Acceso completo a todas las funcionalidades de TusVentas.digital
                    </p>
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-accent-foreground">Consultar</span>
                    </div>
                    <a href="https://tusventas.digital" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="w-full bg-accent-foreground text-accent hover:bg-accent-foreground/90">
                        Comenzar Ahora
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </a>
                  </div>
                  <div className="p-8 md:p-12">
                    <h4 className="font-bold text-foreground mb-4">Incluye:</h4>
                    <ul className="space-y-3">
                      {pricingFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Listo para transformar tu negocio?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Comienza hoy mismo a gestionar tu empresa de manera profesional con TusVentas.digital
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://tusventas.digital" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg">
                  Ir a TusVentas.digital
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="https://wa.me/5491171231832?text=Hola!%20Quiero%20mas%20informacion%20sobre%20TusVentas.digital" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg">
                  Solicitar Informacion
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image 
                src="/images/grupojv/logo23.png" 
                alt="Grupo JV Logo" 
                width={120} 
                height={48}
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-background/60 text-sm text-center">
              &copy; 2025 Grupo JV. Todos los derechos reservados. TusVentas.digital es un producto de Grupo JV.
            </p>
            <div className="flex gap-4">
              <Link href="/" className="text-background/60 hover:text-background transition-colors text-sm">Inicio</Link>
              <a href="https://tusventas.digital" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors text-sm">TusVentas.digital</a>
              <a href="/#contacto" className="text-background/60 hover:text-background transition-colors text-sm">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
