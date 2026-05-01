"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Shield, 
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  Building2
} from "lucide-react"

const valores = [
  {
    icon: Shield,
    title: "Proteccion",
    description: "Brindamos la maxima seguridad y respaldo para nuestros clientes, garantizando tranquilidad en cada momento."
  },
  {
    icon: Heart,
    title: "Compromiso",
    description: "Nos comprometemos con cada cliente, entendiendo sus necesidades y ofreciendo soluciones personalizadas."
  },
  {
    icon: Award,
    title: "Excelencia",
    description: "Buscamos la excelencia en cada servicio, con profesionales capacitados y las mejores herramientas del mercado."
  },
  {
    icon: Users,
    title: "Confianza",
    description: "Construimos relaciones de confianza duraderas, basadas en la transparencia y la honestidad."
  }
]

const timeline = [
  {
    year: "2014",
    title: "Fundacion",
    description: "Jonathan Vescio funda Grupo JV con la vision de ofrecer protecciones integrales en el mercado argentino."
  },
  {
    year: "2016",
    title: "Primera Sucursal",
    description: "Apertura de la primera sucursal en Glew, comenzando a consolidar nuestra presencia en el sur del Gran Buenos Aires."
  },
  {
    year: "2018",
    title: "Expansion",
    description: "Ampliacion del equipo y apertura de nuevas sucursales en Longchamps y Lanus."
  },
  {
    year: "2020",
    title: "Digitalizacion",
    description: "Implementacion de sistemas digitales y desarrollo de TusVentas.digital para optimizar la gestion comercial."
  },
  {
    year: "2023",
    title: "10.000 Clientes",
    description: "Alcanzamos la marca de 10.000 clientes protegidos y mas de 50 asesores especialistas."
  },
  {
    year: "2024",
    title: "10 Anos",
    description: "Celebramos 10 anos de trayectoria consolidandonos como referentes en el mercado asegurador argentino."
  }
]

const equipo = [
  {
    nombre: "Jonathan Vescio",
    cargo: "CEO & Fundador",
    descripcion: "Visionario y lider, con mas de 10 anos de experiencia en el mercado asegurador.",
    imagen: "/images/grupojv/Jonathan.png"
  }
]

const sucursales = [
  {
    nombre: "Sucursal Glew (Casa Central)",
    direccion: "Av Hipolito Irigoyen 20912, Glew, Buenos Aires",
    telefono: "+54 11 7123-1832"
  },
  {
    nombre: "Sucursal Longchamps",
    direccion: "Dr. Kellertas 575, Longchamps, Buenos Aires",
    telefono: "+54 11 7123-1832"
  },
  {
    nombre: "Sucursal Lanus",
    direccion: "Av. San Martin 1285, Lanus, Buenos Aires",
    telefono: "+54 11 7123-1832"
  },
  {
    nombre: "Sucursal La Plata",
    direccion: "Av. 31 N° 556, La Plata, Buenos Aires",
    telefono: "+54 11 7123-1832"
  }
]

const stats = [
  { number: "10+", label: "Anos de Experiencia" },
  { number: "10.000+", label: "Clientes Protegidos" },
  { number: "50+", label: "Asesores Especialistas" },
  { number: "4", label: "Sucursales" }
]

export default function NosotrosPage() {
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
              <Link href="/nosotros" className="text-accent font-medium">Nosotros</Link>
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
                <Link href="/cotizaciones" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg">Cotizaciones</Link>
                <Link href="/nosotros" className="px-4 py-2 text-accent bg-secondary rounded-lg">Nosotros</Link>
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
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/grupojv/jv10años.jpg"
            alt="Grupo JV 10 Anos"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-foreground/80" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-6">
              <span className="text-sm font-medium text-accent-foreground">10+ Anos de Experiencia</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 text-balance">
              Conoce a <span className="text-accent">Grupo JV</span>
            </h1>
            <p className="text-xl text-background/80 text-pretty mb-8">
              Somos una organizacion dedicada a brindar protecciones integrales, generando tranquilidad y respaldo para todos nuestros clientes.
            </p>
            <Link href="/cotizaciones">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Cotiza tu Seguro
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary -mt-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary-foreground">{stat.number}</p>
                <p className="text-primary-foreground/80 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-medium text-muted-foreground">Nuestra Historia</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                De la vision a la realidad
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Grupo JV nacio con la vision de ofrecer protecciones integrales que generen la tranquilidad y respaldo de nuestros clientes. Fundada por Jonathan Vescio, la empresa comenzo como un pequeno emprendimiento con grandes suenos.
                </p>
                <p>
                  Con mas de 10 anos de experiencia en el mercado, nos hemos consolidado como un referente en la industria aseguradora y lideres en la comercializacion de servicios integrales en la zona sur del Gran Buenos Aires.
                </p>
                <p>
                  Hoy contamos con 4 sucursales, mas de 50 asesores especialistas y mas de 10.000 clientes que confian en nosotros para proteger lo que mas quieren.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <Image
                  src="/images/grupojv/Jonathan.png"
                  alt="Jonathan Vescio - Fundador de Grupo JV"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-xl">
                <Image
                  src="/images/grupojv/logo3.png"
                  alt="Grupo JV Logo"
                  width={150}
                  height={60}
                  className="h-16 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mision y Vision */}
      <section className="py-20 md:py-32 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-0 bg-card">
              <CardContent className="p-8 md:p-12">
                <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Nuestra Mision</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-1" />
                    <span className="text-muted-foreground">Evaluar y analizar las necesidades brindando seguros accesibles y flexibles para ofrecerte soluciones personalizadas y adaptadas a tus necesidades especificas.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-1" />
                    <span className="text-muted-foreground">Proporcionar asesoramiento y orientacion experta en materia de seguros y protecciones para que nuestros clientes puedan tomar buenas decisiones.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-1" />
                    <span className="text-muted-foreground">Gestionar, tramitar y resolverte los reclamos y siniestros de manera eficiente y efectiva para que puedas volver a tu normalidad lo antes posible.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card">
              <CardContent className="p-8 md:p-12">
                <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
                  <Eye className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Nuestra Vision</h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Ser la organizacion lider en protecciones integrales en Argentina, reconocida por nuestra excelencia en servicio, innovacion tecnologica y compromiso con nuestros clientes.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Buscamos expandir nuestra presencia a nivel nacional, manteniendo siempre nuestros valores de transparencia, confianza y profesionalismo que nos caracterizan.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-muted-foreground">Lo que nos define</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Nuestros Valores
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor, idx) => (
              <Card key={idx} className="border-0 bg-secondary/30 text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 mx-auto">
                    <valor.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{valor.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{valor.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-32 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Nuestra Trayectoria
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-foreground/20 transform md:-translate-x-1/2" />
              
              {timeline.map((item, idx) => (
                <div key={idx} className={`relative flex items-start gap-8 mb-12 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                    <div className="bg-primary-foreground/10 rounded-2xl p-6">
                      <span className="text-accent font-bold text-2xl">{item.year}</span>
                      <h3 className="text-xl font-bold text-primary-foreground mt-2 mb-2">{item.title}</h3>
                      <p className="text-primary-foreground/70">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-accent rounded-full transform md:-translate-x-1/2 mt-2" />
                  
                  <div className="flex-1 md:hidden pl-12">
                    <div className="bg-primary-foreground/10 rounded-2xl p-6">
                      <span className="text-accent font-bold text-2xl">{item.year}</span>
                      <h3 className="text-xl font-bold text-primary-foreground mt-2 mb-2">{item.title}</h3>
                      <p className="text-primary-foreground/70">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sucursales */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-muted-foreground">Donde Encontrarnos</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Nuestras Sucursales
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {sucursales.map((sucursal, idx) => (
              <Card key={idx} className="border-0 bg-secondary/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{sucursal.nombre}</h3>
                      <p className="text-muted-foreground flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4" />
                        {sucursal.direccion}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {sucursal.telefono}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comienza a proteger lo que mas queres
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Nuestro equipo de expertos esta listo para asesorarte y encontrar la mejor solucion para tus necesidades.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/cotizaciones">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Cotiza tu Seguro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="https://wa.me/5491171231832" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline">
                  Contactanos por WhatsApp
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
              <Link href="/cotizaciones" className="text-background/60 hover:text-background transition-colors text-sm">Cotizaciones</Link>
              <a href="/#contacto" className="text-background/60 hover:text-background transition-colors text-sm">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
