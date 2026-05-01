"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Car,
  Bike,
  Home,
  Building2,
  Heart,
  Smartphone,
  Plane,
  Laptop,
  ShoppingBag,
  Shield,
  Phone,
  Headphones,
  Zap,
  DollarSign,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Cpu
} from "lucide-react"

const categories = [
  {
    id: "vehiculos",
    label: "Vehiculos",
    items: [
      {
        icon: Car,
        title: "Auto",
        description: "Protege tu vehiculo con las mejores coberturas",
        link: "https://ecommerce.atmseguros.com.ar/?sale-center=2y10d7f5dhj7clin0rzowprrodkfelwdjexjnksfka0aau1pytim"
      },
      {
        icon: Bike,
        title: "Moto",
        description: "Asegura tu moto con la cobertura ideal",
        link: "https://ecommerce.atmseguros.com.ar/?sale-center=2y10d7f5dhj7clin0rzowprrodkfelwdjexjnksfka0aau1pytim"
      },
      {
        icon: Bike,
        title: "Bicicleta",
        description: "Asegura tu Bici y usala tranqui",
        link: "https://bbvaseguros-api-pub-live.bbvaseguros.com.ar/segrest/api/ext/external/micrositios/accesoParametria.do?legajo=72745&tipoProducto=BIC"
      }
    ]
  },
  {
    id: "propiedades",
    label: "Propiedades",
    items: [
      {
        icon: Home,
        title: "Hogar",
        description: "Protege tu casa y tus pertenencias",
        link: "https://bbvaseguros-api-pub-live.bbvaseguros.com.ar/segrest/api/ext/external/micrositios/accesoParametria.do?legajo=72745&tipoProducto=HOG"
      },
      {
        icon: Building2,
        title: "Comercio",
        description: "Asegura tu negocio contra todo riesgo",
        link: "https://wa.me/5491171231832"
      },
      {
        icon: Shield,
        title: "Garantia de alquiler",
        description: "La mejor solucion para inquilinos",
        link: "https://www.bbvaseguros.com.ar/webprivada/seguros-personas/seguro-de-caucion/cotizador-seguro-caucion/?legajo=72745"
      }
    ]
  },
  {
    id: "personales",
    label: "Personales",
    items: [
      {
        icon: Heart,
        title: "Accidentes personales",
        description: "Proteccion ante imprevistos",
        link: "https://bbvaseguros-api-pub-live.bbvaseguros.com.ar/segrest/api/ext/external/micrositios/accesoParametria.do?legajo=72745&tipoProducto=AP"
      },
      {
        icon: Smartphone,
        title: "Celular",
        description: "Protege tu dispositivo movil",
        link: "https://bbvaseguros-api-pub-live.bbvaseguros.com.ar/segrest/api/ext/external/micrositios/accesoParametria.do?legajo=72745&tipoProducto=POR"
      },
      {
        icon: Plane,
        title: "Viajes",
        description: "Viaja tranquilo y seguro",
        link: "https://www.sistemacnet.com/vendors/grupojv"
      },
      {
        icon: ShoppingBag,
        title: "Bolso",
        description: "Lleva tu bolso donde quieras!",
        link: "https://www.bbvaseguros.com.ar/webprivada/micrositioLandingParametria.action?numeroLegajo=72745"
      },
      {
        icon: Laptop,
        title: "Notebook",
        description: "Protege tu Notebook",
        link: "https://www.bbvaseguros.com.ar/webprivada/micrositioLandingParametria.action?numeroLegajo=72745"
      },
      {
        icon: Cpu,
        title: "Dispositivos tecnologicos",
        description: "Protege todos tus dispositivos y mantene segura tu conexion al internet!",
        link: "https://www.bbvaseguros.com.ar/webprivada/micrositioLandingParametria.action?numeroLegajo=72745"
      }
    ]
  }
]

const benefits = [
  {
    icon: Shield,
    title: "Coberturas completas",
    description: "Ofrecemos las coberturas mas amplias del mercado para proteger lo que mas te importa."
  },
  {
    icon: DollarSign,
    title: "Precios competitivos",
    description: "Trabajamos con las mejores companias para ofrecerte el mejor precio sin sacrificar calidad."
  },
  {
    icon: Headphones,
    title: "Atencion personalizada",
    description: "Te acompanamos en todo momento, especialmente cuando mas nos necesitas."
  },
  {
    icon: Zap,
    title: "Respuesta inmediata",
    description: "Gestionamos tus tramites y siniestros con la mayor rapidez y eficiencia."
  }
]

const stats = [
  { number: "10+", label: "Anos de experiencia" },
  { number: "10k+", label: "Clientes satisfechos" },
  { number: "24/7", label: "Asistencias Premium" }
]

export default function CotizacionesPage() {
  const [activeTab, setActiveTab] = useState("vehiculos")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeCategory = categories.find(c => c.id === activeTab)

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
              <Link href="/cotizaciones" className="text-accent font-medium">Cotizaciones</Link>
              <Link href="/nosotros" className="text-foreground hover:text-accent transition-colors font-medium">Nosotros</Link>
              <Link href="/tusventas" className="text-foreground hover:text-accent transition-colors font-medium">TusVentas</Link>
              <a href="/#contacto" className="text-foreground hover:text-accent transition-colors font-medium">Contacto</a>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" className="font-medium">Iniciar Sesion</Button>
              </Link>
            </div>

            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden bg-background border-t border-border py-4">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg">Inicio</Link>
                <Link href="/cotizaciones" className="px-4 py-2 text-accent bg-secondary rounded-lg">Cotizaciones</Link>
                <Link href="/nosotros" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg">Nosotros</Link>
                <Link href="/tusventas" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg">TusVentas</Link>
                <a href="/#contacto" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg">Contacto</a>
                <div className="px-4 pt-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">Iniciar Sesion</Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-secondary via-background to-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Cotiza tu seguro en <span className="text-accent">minutos</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Protege lo que mas te importa con las mejores coberturas del mercado
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.number}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Que queres cotizar hoy?
            </h2>
            <p className="text-muted-foreground text-lg">
              Selecciona la categoria que necesitas y obtene tu cotizacion al instante
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Category Items */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCategory?.items.map((item, idx) => (
              <Card key={idx} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-card">
                <CardContent className="p-8">
                  <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{item.description}</p>
                  <a 
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      COTIZA AHORA
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que elegirnos?
            </h2>
            <p className="text-muted-foreground text-lg">
              Mas de 10 anos brindando tranquilidad a nuestros clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="border-0 bg-card text-center">
                <CardContent className="p-8">
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 mx-auto">
                    <benefit.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Necesitas asesoramiento personalizado?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Nuestro equipo de expertos esta listo para ayudarte a encontrar la mejor cobertura para tus necesidades.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:+5491171231832">
                <Button size="lg" variant="secondary" className="text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Llamanos
                </Button>
              </a>
              <a href="https://wa.me/5491171231832" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="text-lg bg-green-600 hover:bg-green-700 text-white">
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
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
              &copy; 2025 Grupo JV. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="/" className="text-background/60 hover:text-background transition-colors text-sm">Inicio</Link>
              <Link href="/nosotros" className="text-background/60 hover:text-background transition-colors text-sm">Nosotros</Link>
              <a href="/#contacto" className="text-background/60 hover:text-background transition-colors text-sm">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
