"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Shield, 
  Camera, 
  Users, 
  Laptop, 
  Megaphone, 
  Calculator,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Quote,
  Menu,
  X,
  Car,
  Home,
  Plane,
  Smartphone,
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  BarChart3,
  Zap
} from "lucide-react"

const heroSlides = [
  {
    title: "COTIZA TUS SEGUROS CON",
    highlight: "NOSOTROS",
    description: "Tenemos el mejor costo y cobertura para proteger lo que mas queres.",
    cta: "Cotizar Online",
    ctaLink: "/cotizaciones",
    ctaSecondary: "Cotizar Whatsapp",
    ctaSecondaryLink: "https://wa.me/5491171570893",
    image: "/images/grupojv/hero1.png"
  },
  {
    title: "ALARMAS",
    highlight: "MONITOREADAS",
    description: "Protege tu Casa o Comercio Con nuestros sistemas de alarma de ultima tecnologia",
    cta: "Cotizar Alarma",
    ctaLink: "https://wa.me/5491171570893",
    image: "/images/grupojv/hero2.png"
  },
  {
    title: "UNITE A NUESTRO",
    highlight: "EXITO",
    description: "Si sos Productor de Seguros o tienes estructura comercial, en JV te damos la oportunidad de comercializar marcas lideres del mercado",
    cta: "Mas Informacion",
    ctaLink: "https://wa.me/5491171570893",
    image: "/images/grupojv/hero3.jpg"
  },
  {
    title: "CONOCE",
    highlight: "TUSVENTAS.DIGITAL",
    description: "El software de gestion comercial mas completo. Control total de tu empresa, ventas, comisiones, clientes y mas en tiempo real.",
    cta: "Conocer Mas",
    ctaLink: "/tusventas",
    ctaSecondary: "Ir a TusVentas.digital",
    ctaSecondaryLink: "https://tusventas.digital",
    image: "/images/grupojv/jv10años.jpg",
    isTusVentas: true
  }
]

const services = [
  {
    icon: Shield,
    title: "Seguros Generales",
    description: "Brindamos seguros de maxima calidad, con muchos anos en el rubro que nos hace profesionales e infalibles.",
    link: "/cotizaciones"
  },
  {
    icon: Camera,
    title: "Alarmas Monitoreadas",
    description: "Protege tu casa o comercio con la mejor tecnologia en Seguridad con nuestros sistemas de Alarmas y Camaras Inteligentes.",
    link: "https://wa.me/5491171570893"
  },
  {
    icon: Users,
    title: "Recursos Humanos",
    description: "Seleccion, capacitacion y desarrollo del capital humano de su empresa.",
    link: "https://wa.me/5491171570893"
  },
  {
    icon: Laptop,
    title: "Soluciones Tecnologicas",
    description: "Implementacion de herramientas digitales para optimizar su negocio.",
    link: "/tusventas"
  },
  {
    icon: Megaphone,
    title: "Marketing y Comunicacion",
    description: "Estrategias efectivas para potenciar su marca y alcanzar nuevos clientes.",
    link: "https://wa.me/5491171570893"
  },
  {
    icon: Calculator,
    title: "Asesoria Financiera",
    description: "Analisis y planificacion financiera para optimizar sus recursos.",
    link: "https://wa.me/5491171570893"
  }
]

const testimonials = [
  {
    quote: "Son un 10. Me asesoraron y brindaron informacion detallada. Me ofrecieron todas las alternativas y me ayudaron a elegir la que mas se adaptaba a mi necesidad. Gracias por la paciencia!",
    author: "Ailen Doorman",
    source: "Resenas Google",
    image: "/images/grupojv/clientexample.jpeg"
  },
  {
    quote: "Excelente atencion. siempre estan atentos a responderte, ayudarte y aclararte cualquier duda. gracias!!",
    author: "Bianca Rossini",
    source: "Resenas Google",
    image: "/images/grupojv/client.png"
  },
  {
    quote: "Sin lugar a duda son los mejores en lo que hacen, impecable atencion, eficacia y rapidez los definen. Hace 6 anos q me solucionan la vida de diferentes formas. No los cambio por nada!!!!!",
    author: "Rodrigo Andrade",
    source: "Resenas Google",
    image: "/images/grupojv/client-3.png"
  }
]

const stats = [
  { number: "10+", label: "Anos de Experiencia" },
  { number: "10.000+", label: "Clientes Protegidos" },
  { number: "50+", label: "Asesores Especialistas" },
  { number: "4", label: "Sucursales Abiertas" }
]

const insuranceTypes = [
  { icon: Car, label: "Auto", link: "/cotizaciones" },
  { icon: Home, label: "Hogar", link: "/cotizaciones" },
  { icon: Plane, label: "Viajes", link: "/cotizaciones" },
  { icon: Smartphone, label: "Celular", link: "/cotizaciones" },
  { icon: Heart, label: "Vida", link: "/cotizaciones" },
  { icon: Shield, label: "Comercio", link: "/cotizaciones" }
]

const partnerLogos = [
  { src: "/images/grupojv/atm.png", alt: "ATM Seguros" },
  { src: "/images/grupojv/bancodelsol.png", alt: "Banco del Sol" },
  { src: "/images/grupojv/logobbva.png", alt: "BBVA Seguros" },
  { src: "/images/grupojv/logosancor.png", alt: "Sancor Seguros" },
  { src: "/images/grupojv/logogaleno.png", alt: "Galeno" }
]

const sucursales = [
  { address: "Av Hipolito Irigoyen 20912, Glew, Bs As." },
  { address: "Dr. Kellertas 575, Longchamps, Bs As." },
  { address: "Av. San Martin 1285, Lanus, Bs As." },
  { address: "Av. 31 N° 556, La Plata, Bs As." }
]

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background/80 backdrop-blur-sm"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/images/grupojv/logo2.png" 
                alt="Grupo JV Logo" 
                width={120} 
                height={48}
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#inicio" className="text-foreground hover:text-accent transition-colors font-medium">Inicio</a>
              <Link href="/nosotros" className="text-foreground hover:text-accent transition-colors font-medium">Nosotros</Link>
              <Link href="/cotizaciones" className="text-foreground hover:text-accent transition-colors font-medium">Cotizaciones</Link>
              <a href="#servicios" className="text-foreground hover:text-accent transition-colors font-medium">Servicios</a>
              <Link href="/tusventas" className="text-foreground hover:text-accent transition-colors font-medium">TusVentas</Link>
              <a href="#contacto" className="text-foreground hover:text-accent transition-colors font-medium">Contacto</a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" className="font-medium">
                  Iniciar Sesion
                </Button>
              </Link>
              <a href="#contacto">
                <Button className="font-medium bg-accent text-accent-foreground hover:bg-accent/90">
                  Contactanos
                </Button>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-background border-t border-border py-4">
              <nav className="flex flex-col gap-4">
                <a href="#inicio" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>Inicio</a>
                <Link href="/nosotros" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
                <Link href="/cotizaciones" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>Cotizaciones</Link>
                <a href="#servicios" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>Servicios</a>
                <Link href="/tusventas" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>TusVentas</Link>
                <a href="#contacto" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
                <div className="px-4 pt-2 flex flex-col gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">Iniciar Sesion</Button>
                  </Link>
                  <a href="#contacto">
                    <Button className="w-full bg-accent text-accent-foreground">Contactanos</Button>
                  </a>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Image Background */}
      <section id="inicio" className="relative min-h-screen flex items-center pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={heroSlides[currentSlide].image}
            alt="Hero Background"
            fill
            className="object-cover transition-opacity duration-500"
            priority
          />
          <div className="absolute inset-0 bg-foreground/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="animate-fade-in-up">
                {heroSlides[currentSlide].isTusVentas && (
                  <span className="inline-block px-4 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded-full mb-4">
                    NUEVO
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight text-balance">
                  {heroSlides[currentSlide].title}{" "}
                  <span className="text-accent">{heroSlides[currentSlide].highlight}</span>
                </h1>
              </div>
              
              <p className="text-lg md:text-xl text-background/90 max-w-xl text-pretty">
                {heroSlides[currentSlide].description}
              </p>

              <div className="flex flex-wrap gap-4">
                {heroSlides[currentSlide].ctaLink.startsWith("/") ? (
                  <Link href={heroSlides[currentSlide].ctaLink}>
                    <Button size="lg" className="text-lg px-8 py-6 bg-accent text-accent-foreground hover:bg-accent/90">
                      {heroSlides[currentSlide].cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <a href={heroSlides[currentSlide].ctaLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="text-lg px-8 py-6 bg-accent text-accent-foreground hover:bg-accent/90">
                      {heroSlides[currentSlide].cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                )}
                {heroSlides[currentSlide].ctaSecondary && (
                  heroSlides[currentSlide].ctaSecondaryLink?.startsWith("http") ? (
                    <a href={heroSlides[currentSlide].ctaSecondaryLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-background/10 border-background text-background hover:bg-background hover:text-foreground">
                        {heroSlides[currentSlide].ctaSecondary}
                      </Button>
                    </a>
                  ) : (
                    <Link href={heroSlides[currentSlide].ctaSecondaryLink || "#"}>
                      <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-background/10 border-background text-background hover:bg-background hover:text-foreground">
                        {heroSlides[currentSlide].ctaSecondary}
                      </Button>
                    </Link>
                  )
                )}
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-4 pt-4">
                <button onClick={prevSlide} className="p-2 rounded-full border border-background/50 hover:bg-background/20 transition-colors text-background">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-3 rounded-full transition-all ${idx === currentSlide ? "bg-accent w-8" : "bg-background/50 w-3"}`}
                    />
                  ))}
                </div>
                <button onClick={nextSlide} className="p-2 rounded-full border border-background/50 hover:bg-background/20 transition-colors text-background">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Insurance Types Quick Access */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-3 gap-4">
                {insuranceTypes.map((type, idx) => (
                  <Link href={type.link} key={idx}>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-background/95 backdrop-blur-sm border-0">
                      <CardContent className="p-6 text-center">
                        <div className="h-14 w-14 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                          <type.icon className="h-7 w-7" />
                        </div>
                        <p className="font-semibold text-foreground">{type.label}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-primary">
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

      {/* About Section Preview */}
      <section id="nosotros" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-muted-foreground">Sobre Nosotros</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Conoce a Grupo JV
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square bg-secondary rounded-3xl overflow-hidden relative">
                <Image
                  src="/images/grupojv/Jonathan.png"
                  alt="Jonathan Vescio - CEO & Fundador de Grupo JV"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-2xl shadow-xl">
                <Image
                  src="/images/grupojv/logo3.png"
                  alt="Grupo JV Logo"
                  width={150}
                  height={60}
                  className="h-16 w-auto"
                />
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Nuestra Historia</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Grupo JV nacio con la vision de ofrecer protecciones integrales que generen la tranquilidad y respaldo de nuestros clientes. Con mas de 10 anos de experiencia en el mercado, nos hemos consolidado como un referente en la industria aseguradora y lideres en la comercializacion de servicios integrales.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Nuestra Mision</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Evaluar y analizar las necesidades brindando seguros accesibles y flexibles para ofrecerte soluciones personalizadas.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Proporcionar asesoramiento y orientacion experta en materia de seguros y protecciones.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Gestionar, tramitar y resolver reclamos y siniestros de manera eficiente y efectiva.</span>
                  </li>
                </ul>
              </div>

              <Link href="/nosotros">
                <Button size="lg" className="mt-4">
                  Conoce mas sobre nosotros
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 md:py-32 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-muted-foreground">Que Ofrecemos</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Nuestros Servicios
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <Card key={idx} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-card">
                <CardContent className="p-8">
                  <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <service.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                  {service.link.startsWith("/") ? (
                    <Link 
                      href={service.link}
                      className="inline-flex items-center gap-2 text-foreground font-semibold hover:text-accent transition-colors"
                    >
                      Cotiza Ahora
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <a 
                      href={service.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-foreground font-semibold hover:text-accent transition-colors"
                    >
                      Mas Informacion
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TusVentas Promo Section */}
      <section className="py-20 md:py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded-full">
                NUEVA HERRAMIENTA
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground text-balance">
                TusVentas.Digital
              </h2>
              <p className="text-xl text-primary-foreground/80 text-pretty">
                El software de gestion comercial mas completo del mercado. Control total de tu empresa en tiempo real.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-primary-foreground">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  Gestion de ventas y comisiones
                </li>
                <li className="flex items-center gap-3 text-primary-foreground">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  Control de clientes y leads
                </li>
                <li className="flex items-center gap-3 text-primary-foreground">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  Reportes y estadisticas en tiempo real
                </li>
                <li className="flex items-center gap-3 text-primary-foreground">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  Plataforma multi-usuario
                </li>
              </ul>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/tusventas">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Conocer Mas
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="https://tusventas.digital" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Ir a TusVentas.digital
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-accent/20 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-24 w-24 text-accent mx-auto mb-4" />
                    <p className="text-3xl font-bold text-primary-foreground">TusVentas</p>
                    <p className="text-primary-foreground/70">.digital</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="h-10 w-10 text-accent-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="clientes" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-muted-foreground">Quienes Confian en Nosotros</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Nuestros Clientes
            </h2>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <Card className="border-0 bg-secondary/30">
              <CardContent className="p-8 md:p-12">
                <Quote className="h-12 w-12 text-accent mb-6" />
                <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8">
                  {testimonials[currentTestimonial].quote}
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-secondary">
                    <Image
                      src={testimonials[currentTestimonial].image}
                      alt={testimonials[currentTestimonial].author}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{testimonials[currentTestimonial].author}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{testimonials[currentTestimonial].source}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentTestimonial ? "bg-accent w-8" : "bg-muted w-2"}`}
                />
              ))}
            </div>
          </div>

          {/* Partner Logos */}
          <div className="border-t border-border pt-12">
            <p className="text-center text-muted-foreground mb-8">Trabajamos con las mejores companias</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {partnerLogos.map((logo, idx) => (
                <div key={idx} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={60}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 md:py-32 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-muted-foreground">Estamos para Ayudarte</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Contactanos
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Sucursales</h3>
                  {sucursales.map((suc, idx) => (
                    <p key={idx} className="text-muted-foreground">{suc.address}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Telefono</h3>
                  <p className="text-muted-foreground">+54 11 7123-1832</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Email</h3>
                  <p className="text-muted-foreground">Hola@grupojv.com.ar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Horario de Atencion</h3>
                  <p className="text-muted-foreground">Lunes a Viernes: 10:00 - 18:00</p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-bold text-foreground mb-4">Siguenos en Redes Sociales</h3>
                <div className="flex gap-4">
                  <a href="#" className="h-12 w-12 rounded-xl bg-foreground flex items-center justify-center hover:bg-accent transition-colors">
                    <Facebook className="h-5 w-5 text-background" />
                  </a>
                  <a href="#" className="h-12 w-12 rounded-xl bg-foreground flex items-center justify-center hover:bg-accent transition-colors">
                    <Instagram className="h-5 w-5 text-background" />
                  </a>
                  <a href="#" className="h-12 w-12 rounded-xl bg-foreground flex items-center justify-center hover:bg-accent transition-colors">
                    <Linkedin className="h-5 w-5 text-background" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="border-0">
              <CardContent className="p-8">
                <form action="https://formsubmit.co/jvescio@grupojv.com.ar" method="POST" className="space-y-6">
                  <input type="hidden" name="_next" value="https://grupojv.com.ar" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_subject" value="FORMULARIO GRUPOJV.COM.AR" />
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Nombre Completo</label>
                    <Input id="name" name="name" required placeholder="Tu nombre" />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Correo Electronico</label>
                    <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">Telefono</label>
                    <Input id="phone" name="phone" type="tel" placeholder="+54 11 xxxx-xxxx" />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">Asunto</label>
                    <Input id="subject" name="subject" required placeholder="Asunto de tu mensaje" />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Mensaje</label>
                    <Textarea id="message" name="message" required rows={5} placeholder="Escribi tu mensaje..." />
                  </div>
                  
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-96">
        <iframe 
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDqF1ynZ91XEWKQ7aUqqRPEohDUht30vzY&q=AV.%20HIPOLITO%20YRIGOYEN%2020916%2C%20GLEW%2C%20Buenos%20Aires%2C%20Argentina"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicacion Grupo JV"
        />
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <Image
                src="/images/grupojv/logo23.png"
                alt="Grupo JV Logo"
                width={150}
                height={60}
                className="h-14 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-primary-foreground/80">
                Proteccion y Transparencia desde hace mas de 10 anos.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Enlaces Rapidos</h3>
              <ul className="space-y-2">
                <li><a href="#inicio" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Inicio</a></li>
                <li><Link href="/nosotros" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Nosotros</Link></li>
                <li><Link href="/cotizaciones" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Cotizaciones</Link></li>
                <li><Link href="/tusventas" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">TusVentas</Link></li>
                <li><a href="#contacto" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Nuestros Servicios</h3>
              <ul className="space-y-2">
                <li><Link href="/cotizaciones" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Seguros Generales</Link></li>
                <li><a href="#servicios" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Alarmas Monitoreadas</a></li>
                <li><a href="#servicios" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Recursos Humanos</a></li>
                <li><Link href="/tusventas" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Soluciones Tecnologicas</Link></li>
                <li><a href="#servicios" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Marketing y Comunicacion</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Newsletter</h3>
              <p className="text-primary-foreground/80 mb-4">Recibe noticias y actualizaciones directamente en tu correo.</p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Tu correo electronico" 
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                />
                <Button variant="secondary" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-primary-foreground/60 text-sm">
                &copy; 2025 Grupo JV. Todos los derechos reservados.
              </p>
              <p className="text-primary-foreground/40 text-xs text-center max-w-3xl">
                GRUPO JV S.A.S. CUIT 30-71903750-6 | Domicilio Legal: Peru 1537 1 A, CABA | Responsable Legal: Jonathan Ignacio Vescio | Matricula de Productor Asesor de Seguros 81900 - SSN
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
