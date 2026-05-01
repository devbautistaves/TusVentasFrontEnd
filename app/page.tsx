"use client"

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
  Star
} from "lucide-react"

const heroSlides = [
  {
    title: "COTIZA TUS SEGUROS CON",
    highlight: "NOSOTROS",
    description: "Tenemos el mejor costo y cobertura para proteger lo que mas queres.",
    cta: "Cotizar Online",
    ctaLink: "https://ecommerce.atmseguros.com.ar/?sale-center=2y10d7f5dhj7clin0rzowprrodkfelwdjexjnksfka0aau1pytim",
    ctaSecondary: "Cotizar Whatsapp",
    ctaSecondaryLink: "https://wa.me/5491171570893"
  },
  {
    title: "ALARMAS",
    highlight: "MONITOREADAS",
    description: "Protege tu Casa o Comercio Con nuestros sistemas de alarma de ultima tecnologia",
    cta: "Cotizar Alarma",
    ctaLink: "https://wa.me/5491171570893"
  },
  {
    title: "UNITE A NUESTRO",
    highlight: "EXITO",
    description: "Si sos Productor de Seguros o tienes estructura comercial, en JV te damos la oportunidad de comercializar marcas lideres del mercado",
    cta: "Mas Informacion",
    ctaLink: "https://wa.me/5491171570893"
  }
]

const services = [
  {
    icon: Shield,
    title: "Seguros Generales",
    description: "Brindamos seguros de maxima calidad, con muchos anos en el rubro que nos hace profesionales e infalibles.",
    link: "https://ecommerce.atmseguros.com.ar/?sale-center=2y10d7f5dhj7clin0rzowprrodkfelwdjexjnksfka0aau1pytim"
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
    link: "https://wa.me/5491171570893"
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
    source: "Resenas Google"
  },
  {
    quote: "Excelente atencion. siempre estan atentos a responderte, ayudarte y aclararte cualquier duda. gracias!!",
    author: "Bianca Rossini",
    source: "Resenas Google"
  },
  {
    quote: "Sin lugar a duda son los mejores en lo que hacen, impecable atencion, eficacia y rapidez los definen. Hace 6 anos q me solucionan la vida de diferentes formas. No los cambio por nada!!!!!",
    author: "Rodrigo Andrade",
    source: "Resenas Google"
  }
]

const stats = [
  { number: "10+", label: "Anos de Experiencia" },
  { number: "10.000+", label: "Clientes Protegidos" },
  { number: "50+", label: "Asesores Especialistas" },
  { number: "4", label: "Sucursales Abiertas" }
]

const insuranceTypes = [
  { icon: Car, label: "Auto", link: "https://ecommerce.atmseguros.com.ar/?sale-center=2y10d7f5dhj7clin0rzowprrodkfelwdjexjnksfka0aau1pytim" },
  { icon: Home, label: "Hogar", link: "https://bbvaseguros-api-pub-live.bbvaseguros.com.ar/segrest/api/ext/external/micrositios/accesoParametria.do?legajo=72745&tipoProducto=HOG" },
  { icon: Plane, label: "Viajes", link: "https://www.sistemacnet.com/vendors/grupojv" },
  { icon: Smartphone, label: "Celular", link: "https://bbvaseguros-api-pub-live.bbvaseguros.com.ar/segrest/api/ext/external/micrositios/accesoParametria.do?legajo=72745&tipoProducto=POR" },
  { icon: Heart, label: "Vida", link: "https://bbvaseguros-api-pub-live.bbvaseguros.com.ar/segrest/api/ext/external/micrositios/accesoParametria.do?legajo=72745&tipoProducto=AP" },
  { icon: Shield, label: "Comercio", link: "https://wa.me/5491171570893" }
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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">JV</span>
              </div>
              <span className="text-xl font-bold text-foreground">Grupo JV</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#inicio" className="text-foreground hover:text-muted-foreground transition-colors font-medium">Inicio</a>
              <a href="#nosotros" className="text-foreground hover:text-muted-foreground transition-colors font-medium">Nosotros</a>
              <a href="#servicios" className="text-foreground hover:text-muted-foreground transition-colors font-medium">Servicios</a>
              <a href="#clientes" className="text-foreground hover:text-muted-foreground transition-colors font-medium">Clientes</a>
              <a href="#contacto" className="text-foreground hover:text-muted-foreground transition-colors font-medium">Contacto</a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" className="font-medium">
                  Iniciar Sesion
                </Button>
              </Link>
              <a href="#contacto">
                <Button className="font-medium">
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
                <a href="#nosotros" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>Nosotros</a>
                <a href="#servicios" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>Servicios</a>
                <a href="#clientes" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>Clientes</a>
                <a href="#contacto" className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
                <div className="px-4 pt-2 flex flex-col gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">Iniciar Sesion</Button>
                  </Link>
                  <a href="#contacto">
                    <Button className="w-full">Contactanos</Button>
                  </a>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary/50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                  {heroSlides[currentSlide].title}{" "}
                  <span className="text-accent">{heroSlides[currentSlide].highlight}</span>
                </h1>
              </div>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl text-pretty">
                {heroSlides[currentSlide].description}
              </p>

              <div className="flex flex-wrap gap-4">
                <a href={heroSlides[currentSlide].ctaLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="text-lg px-8 py-6">
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                {heroSlides[currentSlide].ctaSecondary && (
                  <a href={heroSlides[currentSlide].ctaSecondaryLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      {heroSlides[currentSlide].ctaSecondary}
                    </Button>
                  </a>
                )}
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-4 pt-4">
                <button onClick={prevSlide} className="p-2 rounded-full border border-border hover:bg-secondary transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? "bg-primary w-8" : "bg-muted"}`}
                    />
                  ))}
                </div>
                <button onClick={nextSlide} className="p-2 rounded-full border border-border hover:bg-secondary transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Insurance Types Quick Access */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-3 gap-4">
                {insuranceTypes.map((type, idx) => (
                  <a href={type.link} target="_blank" rel="noopener noreferrer" key={idx}>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="h-14 w-14 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <type.icon className="h-7 w-7" />
                        </div>
                        <p className="font-semibold text-foreground">{type.label}</p>
                      </CardContent>
                    </Card>
                  </a>
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

      {/* About Section */}
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="h-24 w-24 mx-auto bg-primary rounded-2xl flex items-center justify-center mb-6">
                      <span className="text-primary-foreground font-bold text-4xl">JV</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Jonathan Vescio</h3>
                    <p className="text-muted-foreground">CEO & Fundador</p>
                  </div>
                </div>
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
                  <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <service.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                  <a 
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-foreground font-semibold hover:text-accent transition-colors"
                  >
                    Cotiza Ahora
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
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

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 bg-secondary/30">
              <CardContent className="p-8 md:p-12">
                <Quote className="h-12 w-12 text-accent mb-6" />
                <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8">
                  {testimonials[currentTestimonial].quote}
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">
                      {testimonials[currentTestimonial].author.charAt(0)}
                    </span>
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

                {/* Testimonial Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTestimonial(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${idx === currentTestimonial ? "bg-primary w-8" : "bg-muted"}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 md:py-32 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-muted-foreground">Estamos para Ayudarle</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Contactenos
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Sucursales</h3>
                  <p className="text-muted-foreground">Av Hipolito Irigoyen 20912, Glew, Bs As.</p>
                  <p className="text-muted-foreground">Dr. Kellertas 575, Longchamps, Bs As.</p>
                  <p className="text-muted-foreground">Av. San Martin 1285, Lanus, Bs As.</p>
                  <p className="text-muted-foreground">Av. 31 N 556, La Plata, Bs As.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Telefono</h3>
                  <p className="text-muted-foreground">+54 11 7123-1832</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Email</h3>
                  <p className="text-muted-foreground">Hola@grupojv.com.ar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Horario de Atencion</h3>
                  <p className="text-muted-foreground">Lunes a Viernes: 10:00 - 18:00</p>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden mt-8">
                <iframe 
                  width="100%" 
                  height="250" 
                  frameBorder="0" 
                  scrolling="no" 
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDqF1ynZ91XEWKQ7aUqqRPEohDUht30vzY&q=AV.%20HIPOLITO%20YRIGOYEN%2020916%2C%20GLEW%2C%20Buenos%20Aires%2C%20Argentina"
                  className="w-full"
                />
              </div>
            </div>

            {/* Contact Form */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <form className="space-y-6" action="https://formsubmit.co/jvescio@grupojv.com.ar" method="POST">
                  <input type="hidden" name="_next" value="https://grupojv.com.ar" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_subject" value="FORMULARIO GRUPOJV.COM.AR" />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nombre</label>
                      <Input name="name" placeholder="Tu nombre" required className="bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Telefono</label>
                      <Input name="phone" type="tel" placeholder="+54 11..." className="bg-secondary/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input name="email" type="email" placeholder="tu@email.com" required className="bg-secondary/50" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Asunto</label>
                    <Input name="subject" placeholder="Asunto del mensaje" required className="bg-secondary/50" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Mensaje</label>
                    <Textarea name="message" placeholder="Tu mensaje..." rows={5} required className="bg-secondary/50" />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Enviar Mensaje
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-primary-foreground rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">JV</span>
                </div>
                <span className="text-xl font-bold">Grupo JV</span>
              </div>
              <p className="text-primary-foreground/80">
                Proteccion y Transparencia desde hace mas de 10 anos.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Enlaces Rapidos</h3>
              <ul className="space-y-2">
                <li><a href="#inicio" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Inicio</a></li>
                <li><a href="#nosotros" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Nosotros</a></li>
                <li><a href="#servicios" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Servicios</a></li>
                <li><a href="#clientes" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Clientes</a></li>
                <li><a href="#contacto" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contacto</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-lg mb-4">Nuestros Servicios</h3>
              <ul className="space-y-2">
                <li><a href="#servicios" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Seguros Generales</a></li>
                <li><a href="#servicios" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Alarmas Monitoreadas</a></li>
                <li><a href="#servicios" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Recursos Humanos</a></li>
                <li><a href="#servicios" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Soluciones Tech</a></li>
                <li><a href="#servicios" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Marketing</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contacto</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +54 11 7123-1832
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Hola@grupojv.com.ar
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Lun-Vie: 10:00 - 18:00
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-primary-foreground/70">
                2025 Grupo JV. Todos los derechos reservados.
              </p>
              <p className="text-xs text-primary-foreground/50 text-center md:text-right max-w-2xl">
                GRUPO JV S.A.S. CUIT 30-71903750-6 - Matricula de Productor Asesor de Seguros 81900 - Superintendencia de Seguros de la Nacion
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
