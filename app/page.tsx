"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ChevronUp, Shield, Camera, Users, Laptop, Megaphone, Calculator, Quote, MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin, Menu, X, Play, Car, Home, Heart, Briefcase, Building2, Bike, Plane, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const quickCotizadores = [
  { icon: Car, title: "Auto", description: "Cotiza tu seguro de auto", href: "https://webventas.com.ar/emision/alta?cod=2266", color: "from-blue-500 to-blue-600" },
  { icon: Bike, title: "Moto", description: "Protege tu moto", href: "https://webventas.com.ar/emision/alta?cod=2266", color: "from-green-500 to-green-600" },
  { icon: Home, title: "Hogar", description: "Seguro para tu casa", href: "https://webventas.com.ar/emision/alta?cod=2266", color: "from-orange-500 to-orange-600" },
  { icon: Heart, title: "Vida", description: "Proteccion personal", href: "https://wa.me/5491171570893?text=Hola!%20Quiero%20cotizar%20un%20seguro%20de%20vida", color: "from-red-500 to-red-600" },
  { icon: Briefcase, title: "ART", description: "Riesgos del trabajo", href: "https://wa.me/5491171570893?text=Hola!%20Quiero%20cotizar%20ART", color: "from-purple-500 to-purple-600" },
  { icon: Building2, title: "Comercio", description: "Para tu negocio", href: "https://wa.me/5491171570893?text=Hola!%20Quiero%20cotizar%20seguro%20comercial", color: "from-cyan-500 to-cyan-600" },
]

const heroSlides = [
  {
    title: "COTIZA TUS SEGUROS CON",
    highlight: "NOSOTROS",
    description: "Tenemos el mejor costo y cobertura para proteger lo que más queres.",
    image: "/images/grupojv/hero1.png",
    buttons: [
      { text: "Cotizar Online", href: "/cotizaciones", primary: true },
      { text: "Cotizar Whatsapp", href: "https://wa.me/5491171570893", primary: false },
    ],
  },
  {
    title: "ALARMAS",
    highlight: "MONITOREADAS",
    description: "Protegé tu Casa o Comercio Con nuestros sistemas de alarma de última tecnología",
    image: "/images/grupojv/hero2.png",
    buttons: [
      { text: "COTIZAR ALARMA", href: "https://wa.me/5491171570893", primary: true },
    ],
  },
  {
    title: "UNITE A NUESTRO",
    highlight: "ÉXITO",
    description: "Si sos Productor de Seguros o tienes estructura comercial, en JV te damos la oportunidad de comercializar marcas líderes del mercado, con nosotros el crecimiento está asegurado",
    image: "/images/grupojv/hero3.jpg",
    buttons: [
      { text: "MÁS INFORMACIÓN", href: "https://wa.me/5491171570893", primary: true },
    ],
  },
  {
    title: "POTENCIÁ TUS VENTAS CON",
    highlight: "TUSVENTAS.DIGITAL",
    description: "La plataforma integral para gestionar tu equipo de ventas, comisiones y clientes de manera eficiente",
    image: "/images/grupojv/hero1.png",
    buttons: [
      { text: "CONOCER MÁS", href: "/tusventas", primary: true },
      { text: "IR A TUSVENTAS", href: "https://tusventas.digital", primary: false },
    ],
  },
]

const services = [
  {
    icon: Shield,
    title: "Seguros Generales",
    description: "Brindamos seguros de maxima calidad, con muchos años en el rubro que nos hace profesionales e infalibles.",
    link: "/cotizaciones",
    linkText: "COTIZÁ AHORA",
  },
  {
    icon: Camera,
    title: "Alarmas Monitoreadas",
    description: "Protege tu casa o comercio con la mejor tecnología en Seguridad con nuestros sistemas de Alarmas y Cámaras Inteligentes.",
    link: "https://wa.me/5491171570893",
    linkText: "COTIZÁ AHORA",
  },
  {
    icon: Users,
    title: "Recursos Humanos",
    description: "Selección, capacitación y desarrollo del capital humano de su empresa.",
    link: "https://wa.me/5491171570893",
    linkText: "Más información",
  },
  {
    icon: Laptop,
    title: "Soluciones Tecnológicas",
    description: "Implementación de herramientas digitales para optimizar su negocio.",
    link: "https://wa.me/5491171570893",
    linkText: "Más información",
  },
  {
    icon: Megaphone,
    title: "Marketing y Comunicación",
    description: "Estrategias efectivas para potenciar su marca y alcanzar nuevos clientes.",
    link: "https://wa.me/5491171570893",
    linkText: "Más información",
  },
  {
    icon: Calculator,
    title: "Asesoría Financiera",
    description: "Análisis y planificación financiera para optimizar sus recursos.",
    link: "https://wa.me/5491171570893",
    linkText: "Más información",
  },
]

const testimonials = [
  {
    content: "Son un 10. Me asesoraron y brindaron información detallada. Me ofrecieron todas las alternativas y me ayudaron a elegir la que mas se adaptaba a mi necesidad. Gracias por la paciencia.",
    author: "Ailen Doorman",
    source: "Reseñas Google",
    image: "/images/grupojv/clientexample.jpeg",
  },
  {
    content: "Excelente atencion. siempre estan atentos a responderte, ayudarte y aclararte cualquier duda. gracias!!",
    author: "Bianca Rossini",
    source: "Reseñas Google",
    image: "/images/grupojv/client.png",
  },
  {
    content: "Sin lugar a duda son los mejores en lo que hacen, impecable atención, eficacia y rapidez los definen. Hace 6 años q me solucionan la vida de diferentes formas. No los cambio por nada!!!!!",
    author: "Rodrigo Andrade",
    source: "Reseñas Google",
    image: "/images/grupojv/client-3.png",
  },
]

const partners = [
  { name: "ATM", logo: "/images/grupojv/atm.png" },
  { name: "Banco del Sol", logo: "/images/grupojv/bancodelsol.png" },
  { name: "BBVA", logo: "/images/grupojv/logobbva.png" },
  { name: "Sancor", logo: "/images/grupojv/logosancor.png" },
  { name: "Galeno", logo: "/images/grupojv/logogaleno.png" },
]

const stats = [
  { value: 10, label: "Años de Experiencia", suffix: "+" },
  { value: 10000, label: "Clientes Protegidos", suffix: "+" },
  { value: 50, label: "Asesores Especialistas", suffix: "+" },
  { value: 4, label: "Sucursales abiertas", suffix: "" },
]

const branches = [
  "Av Hipolito Irigoyen 20912, Glew, Bs As.",
  "Dr. Kellertas 575, Longchamps, Bs As.",
  "Av. San Martin 1285, Lanus, Bs As.",
  "Av. 31 N° 556, La Plata, Bs As.",
]

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [animatedStats, setAnimatedStats] = useState<number[]>(stats.map(() => 0))
  const statsRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  // Hero slider auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Testimonials auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Animate stats on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          stats.forEach((stat, index) => {
            const duration = 2000
            const steps = 60
            const increment = stat.value / steps
            let current = 0
            const timer = setInterval(() => {
              current += increment
              if (current >= stat.value) {
                current = stat.value
                clearInterval(timer)
              }
              setAnimatedStats((prev) => {
                const newStats = [...prev]
                newStats[index] = Math.floor(current)
                return newStats
              })
            }, duration / steps)
          })
        }
      },
      { threshold: 0.5 }
    )
    if (statsRef.current) {
      observer.observe(statsRef.current)
    }
    return () => observer.disconnect()
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/grupojv/logo2.png"
              alt="Grupo JV Logo"
              width={180}
              height={60}
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#inicio" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <Link href="#nosotros" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Nosotros
            </Link>
            <Link href="#servicios" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Servicios
            </Link>
            <Link href="/cotizaciones" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Cotizar
            </Link>
            <Link href="/tusventas" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              TusVentas
            </Link>
            <Link href="#clientes" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Clientes
            </Link>
            <Link href="#contacto">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Contacto
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Iniciar Sesion
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="#inicio" className="text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>
              <Link href="#nosotros" className="text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Nosotros
              </Link>
              <Link href="#servicios" className="text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Servicios
              </Link>
              <Link href="/cotizaciones" className="text-sm font-medium text-blue-600 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Zap className="h-4 w-4" />
                Cotizar
              </Link>
              <Link href="/tusventas" className="text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                TusVentas
              </Link>
              <Link href="#clientes" className="text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Clientes
              </Link>
              <Link href="#contacto" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  Contacto
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Iniciar Sesion
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen pt-16">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover opacity-20"
                priority={index === 0}
              />
            </div>
          </div>
        ))}

        {/* Hero Content - Always visible */}
        <div className="relative z-20 container mx-auto px-4 pt-12 pb-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Slider Content */}
            <div className="text-white">
              <div className="min-h-[280px] md:min-h-[320px]">
                {heroSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-500 ${
                      index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute"
                    }`}
                  >
                    {index === currentSlide && (
                      <>
                        <span className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-4">
                          {index === 3 ? "Nueva Plataforma" : "Grupo JV"}
                        </span>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                          {slide.title} <span className="text-blue-400">{slide.highlight}</span>
                        </h1>
                        <p className="text-base md:text-lg mb-6 text-gray-300 leading-relaxed max-w-xl">
                          {slide.description}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {slide.buttons.map((button, btnIndex) => (
                            <Link key={btnIndex} href={button.href} target={button.href.startsWith("http") ? "_blank" : undefined}>
                              <Button
                                size="lg"
                                className={
                                  button.primary
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all"
                                    : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-gray-900 transition-all"
                                }
                              >
                                {button.text}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide ? "bg-blue-500 w-8" : "bg-white/30 hover:bg-white/50 w-2"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Right Side - Quick Cotizadores Grid */}
            <div className="lg:pl-8">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Cotiza rapido
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {quickCotizadores.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      target="_blank"
                      className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-white/20 group-hover:bg-white/30 flex items-center justify-center mb-3 transition-colors">
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-400 group-hover:text-white/80 transition-colors">{item.description}</p>
                        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/cotizaciones" className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-blue-600/30">
                  Ver todos los cotizadores
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Partners Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="bg-white/5 backdrop-blur-md border-t border-white/10 py-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <span className="text-gray-400 text-sm hidden sm:block">Trabajamos con:</span>
                {partners.map((partner, index) => (
                  <div key={index} className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={80}
                      height={40}
                      className="h-6 w-auto object-contain brightness-0 invert"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Image
              src="/images/grupojv/logo3.png"
              alt="Grupo JV"
              width={200}
              height={100}
              className="mx-auto mb-6 h-24 w-auto"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Sobre Grupo JV</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src="/images/grupojv/Jonathan.png"
                alt="Jonathan Vescio - CEO Fundador"
                width={500}
                height={600}
                className="rounded-2xl shadow-xl mx-auto"
              />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Nuestra Historia</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Grupo JV nació con la visión de ofrecer protecciones integrales que generen la tranquilidad y respaldo de nuestros clientes. Con más de 10 años de experiencia en el mercado, nos hemos consolidado como un referente en la industria aseguradora y líderes en la comercialización de servicios integrales.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Nuestra Misión</h3>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Evaluar y analizar las necesidades brindando seguros accesibles y flexibles para ofrecerte soluciones personalizadas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Proporcionar asesoramiento y orientación experta en materia de seguros y protecciones.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Gestionar, tramitar y resolverte los reclamos y siniestros de manera eficiente y efectiva.</span>
                </li>
              </ul>

              {/* Stats */}
              <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <div className="text-2xl md:text-3xl font-bold text-blue-600">
                      {animatedStats[index].toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-medium">Qué Ofrecemos</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Nuestros Servicios</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group p-6 bg-gray-50 rounded-2xl hover:bg-blue-600 transition-all duration-300 hover:shadow-xl"
              >
                <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-500 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <service.icon className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white mb-3 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 group-hover:text-blue-100 mb-4 transition-colors">
                  {service.description}
                </p>
                <Link
                  href={service.link}
                  target={service.link.startsWith("http") ? "_blank" : undefined}
                  className="inline-flex items-center gap-2 text-blue-600 group-hover:text-white font-medium transition-colors"
                >
                  {service.linkText}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TusVentas Promo Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-blue-500/30 rounded-full text-sm font-medium mb-4">
                Nueva Plataforma
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                TusVentas.Digital
              </h2>
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                La plataforma integral para gestionar tu equipo de ventas, comisiones, clientes y mucho más. Optimiza tu negocio con nuestra tecnología.
              </p>
              <ul className="space-y-3 mb-8">
                {["Gestión de ventas en tiempo real", "Control de comisiones automatizado", "Seguimiento de clientes y leads", "Reportes y análisis detallados"].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="h-3 w-3 text-white" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/tusventas">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                    Conocer más
                  </Button>
                </Link>
                <Link href="https://tusventas.digital" target="_blank">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                    Ir a TusVentas.Digital
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">+500</div>
                    <div className="text-sm text-blue-200">Vendedores activos</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">+1M</div>
                    <div className="text-sm text-blue-200">Ventas gestionadas</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">99.9%</div>
                    <div className="text-sm text-blue-200">Uptime garantizado</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm text-blue-200">Soporte técnico</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="clientes" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-medium">Quiénes Confían en Nosotros</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Nuestros Clientes</h2>
          </div>

          {/* Testimonials Slider */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <Quote className="h-12 w-12 text-blue-100 absolute top-6 left-6" />
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-opacity duration-500 ${
                    index === currentTestimonial ? "opacity-100" : "opacity-0 absolute inset-0"
                  }`}
                >
                  <p className="text-lg md:text-xl text-gray-700 italic mb-6 relative z-10 leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                      <span className="text-sm text-gray-500">{testimonial.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial Controls */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Partners Logo Slider */}
          <div className="overflow-hidden">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {partners.map((partner, index) => (
                <div key={index} className="grayscale hover:grayscale-0 transition-all p-4">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
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
      <section id="contacto" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-medium">Estamos para Ayudarle</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Contáctenos</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sucursales</h3>
                  {branches.map((branch, index) => (
                    <p key={index} className="text-gray-600">{branch}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Teléfono</h3>
                  <p className="text-gray-600">+54 11 7123-1832</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">Hola@grupojv.com.ar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Horario de Atención</h3>
                  <p className="text-gray-600">Lunes a Viernes: 10:00 - 18:00</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <form action="https://formsubmit.co/jvescio@grupojv.com.ar" method="POST" className="space-y-6">
                <input type="hidden" name="_next" value="https://grupojv.com.ar" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_subject" value="FORMULARIO GRUPOJV.COM.AR" />

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  Enviar Mensaje
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96">
        <iframe
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDqF1ynZ91XEWKQ7aUqqRPEohDUht30vzY&q=AV.%20HIPOLITO%20YRIGOYEN%2020916%2C%20GLEW%2C%20Buenos%20Aires%2C%20Argentina"
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación Grupo JV"
        />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <Image
                src="/images/grupojv/logo23.png"
                alt="Grupo JV"
                width={150}
                height={60}
                className="h-12 w-auto mb-4"
              />
              <p className="text-gray-400">
                Protección y Transparencia desde hace más de 10 años.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><Link href="#inicio" className="text-gray-400 hover:text-white transition-colors">Inicio</Link></li>
                <li><Link href="#nosotros" className="text-gray-400 hover:text-white transition-colors">Nosotros</Link></li>
                <li><Link href="#servicios" className="text-gray-400 hover:text-white transition-colors">Servicios</Link></li>
                <li><Link href="/tusventas" className="text-gray-400 hover:text-white transition-colors">TusVentas</Link></li>
                <li><Link href="#clientes" className="text-gray-400 hover:text-white transition-colors">Clientes</Link></li>
                <li><Link href="#contacto" className="text-gray-400 hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Nuestros Servicios</h3>
              <ul className="space-y-2">
                <li><Link href="/cotizaciones" className="text-gray-400 hover:text-white transition-colors">Seguros de Auto</Link></li>
                <li><Link href="/cotizaciones" className="text-gray-400 hover:text-white transition-colors">Seguros de Hogar</Link></li>
                <li><Link href="/cotizaciones" className="text-gray-400 hover:text-white transition-colors">Seguros de Vida</Link></li>
                <li><Link href="/cotizaciones" className="text-gray-400 hover:text-white transition-colors">Seguros para Empresas</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {branches.map((branch, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{branch}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>+54 11 7123-1832</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>Hola@grupojv.com.ar</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2025 Grupo JV. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-xs max-w-3xl text-center">
              GRUPO JV S.A.S. CUIT 30-71903750-6 DOMICILIO LEGAL PERU 1537 1 A CIUDAD AUTONOMA DE BUENOS AIRES. MATRICULA DE PRODUCTOR ASESOR DE SEGUROS 81900 SUPERINTENDENCIA DE SEGUROS DE LA NACION.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-50"
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
