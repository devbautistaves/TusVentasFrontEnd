"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  ChevronRight, 
  ChevronUp, 
  Menu, 
  X, 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Clock, 
  Zap, 
  CheckCircle,
  Target,
  PieChart,
  Bell,
  MessageSquare,
  FileText,
  Settings,
  Smartphone,
  Globe,
  Headphones,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    description: "Visualiza todas tus métricas de ventas en tiempo real. Gráficos interactivos, KPIs personalizados y reportes automatizados.",
  },
  {
    icon: Users,
    title: "Gestión de Equipos",
    description: "Administra vendedores, supervisores y administradores. Control total de permisos y accesos por rol.",
  },
  {
    icon: DollarSign,
    title: "Comisiones Automatizadas",
    description: "Cálculo automático de comisiones según planes configurables. Liquidaciones transparentes y trazables.",
  },
  {
    icon: Target,
    title: "Seguimiento de Leads",
    description: "Captura, clasifica y da seguimiento a tus prospectos. Convierte más leads en clientes con nuestro embudo de ventas.",
  },
  {
    icon: PieChart,
    title: "Reportes Avanzados",
    description: "Genera reportes detallados de ventas, comisiones, rendimiento por vendedor y mucho más.",
  },
  {
    icon: Bell,
    title: "Notificaciones en Tiempo Real",
    description: "Mantente informado de cada venta, cobro y actualización importante en tu negocio.",
  },
  {
    icon: MessageSquare,
    title: "Chat Integrado",
    description: "Comunicación directa entre vendedores, supervisores y administradores dentro de la plataforma.",
  },
  {
    icon: FileText,
    title: "Gestión Documental",
    description: "Almacena y accede a documentos de ventas, contratos y materiales de marketing desde un solo lugar.",
  },
]

const benefits = [
  {
    title: "Aumenta tu productividad",
    description: "Automatiza tareas repetitivas y enfócate en lo que importa: vender más.",
    stat: "+45%",
    statLabel: "Productividad",
  },
  {
    title: "Reduce errores manuales",
    description: "Elimina el cálculo manual de comisiones y la gestión en hojas de cálculo.",
    stat: "-90%",
    statLabel: "Errores",
  },
  {
    title: "Escala tu negocio",
    description: "Crece sin límites. Nuestra plataforma crece contigo.",
    stat: "Sin límites",
    statLabel: "Escalabilidad",
  },
  {
    title: "Mejora la retención",
    description: "Vendedores motivados con comisiones claras y oportunas.",
    stat: "+60%",
    statLabel: "Retención",
  },
]

const pricing = [
  {
    name: "Starter",
    description: "Para equipos pequeños que están empezando",
    price: "Consultar",
    features: [
      "Hasta 10 usuarios",
      "Dashboard básico",
      "Gestión de ventas",
      "Reportes mensuales",
      "Soporte por email",
    ],
    highlighted: false,
  },
  {
    name: "Business",
    description: "Para empresas en crecimiento",
    price: "Consultar",
    features: [
      "Hasta 50 usuarios",
      "Dashboard avanzado",
      "Comisiones automatizadas",
      "Reportes en tiempo real",
      "Chat integrado",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Solución completa para grandes organizaciones",
    price: "A medida",
    features: [
      "Usuarios ilimitados",
      "Personalización completa",
      "API disponible",
      "Integraciones custom",
      "Account Manager dedicado",
      "SLA garantizado",
    ],
    highlighted: false,
  },
]

const faqs = [
  {
    question: "¿Qué es TusVentas.Digital?",
    answer: "TusVentas.Digital es una plataforma integral de gestión de ventas diseñada para empresas que necesitan controlar equipos comerciales, calcular comisiones automáticamente y hacer seguimiento de clientes y leads de manera eficiente.",
  },
  {
    question: "¿Cómo funciona el cálculo de comisiones?",
    answer: "Puedes configurar diferentes planes de comisiones según tus necesidades: porcentaje sobre ventas, bonos por objetivos, comisiones escalonadas, etc. El sistema calcula automáticamente las liquidaciones según las reglas que definas.",
  },
  {
    question: "¿Puedo integrar TusVentas con otros sistemas?",
    answer: "Sí, ofrecemos API REST para integrar con tu ERP, CRM u otros sistemas. En el plan Enterprise también desarrollamos integraciones personalizadas.",
  },
  {
    question: "¿Qué soporte técnico ofrecen?",
    answer: "Todos los planes incluyen soporte técnico. El nivel de soporte varía según el plan: desde email hasta un Account Manager dedicado para Enterprise.",
  },
  {
    question: "¿Hay período de prueba?",
    answer: "Sí, ofrecemos una demostración personalizada y período de prueba para que puedas evaluar la plataforma antes de comprometerte.",
  },
]

export default function TusVentasPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <Link href="#caracteristicas" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Características
            </Link>
            <Link href="#beneficios" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Beneficios
            </Link>
            <Link href="#precios" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Precios
            </Link>
            <Link href="https://tusventas.digital" target="_blank">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Ir a TusVentas
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/" className="text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>
              <Link href="#caracteristicas" className="text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Características
              </Link>
              <Link href="#beneficios" className="text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Beneficios
              </Link>
              <Link href="#precios" className="text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Precios
              </Link>
              <Link href="https://tusventas.digital" target="_blank" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  Ir a TusVentas
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Iniciar Sesión
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <span className="inline-block px-4 py-1 bg-blue-500/30 rounded-full text-sm font-medium mb-4">
                Plataforma de Gestión de Ventas
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                TusVentas<span className="text-blue-400">.Digital</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                La solución integral para gestionar tu equipo de ventas, automatizar comisiones y potenciar el crecimiento de tu negocio.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="https://tusventas.digital" target="_blank">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                    Acceder a la Plataforma
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="https://wa.me/5491171570893" target="_blank">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                    Solicitar Demo
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6">
                {[
                  { icon: Shield, text: "Datos seguros" },
                  { icon: Clock, text: "Soporte 24/7" },
                  { icon: Zap, text: "Implementación rápida" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-blue-200">
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Ventas del mes</h3>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">$2,450,000</div>
                    <div className="text-sm text-green-600">+23% vs mes anterior</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/90 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">127</div>
                      <div className="text-sm text-gray-500">Ventas cerradas</div>
                    </div>
                    <div className="bg-white/90 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">45</div>
                      <div className="text-sm text-gray-500">Vendedores activos</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm opacity-80">Próxima liquidación</div>
                        <div className="text-xl font-bold">$485,200</div>
                      </div>
                      <DollarSign className="h-10 w-10 opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-medium">Todo lo que necesitas</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa diseñada para optimizar cada aspecto de tu operación comercial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <feature.icon className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-medium">Proceso simple</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Cómo Funciona
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Configura tu empresa",
                description: "Carga tus vendedores, define planes de comisiones y personaliza tu dashboard según tus necesidades.",
                icon: Settings,
              },
              {
                step: "02",
                title: "Registra tus ventas",
                description: "Tu equipo carga las ventas desde cualquier dispositivo. El sistema calcula comisiones automáticamente.",
                icon: FileText,
              },
              {
                step: "03",
                title: "Analiza y crece",
                description: "Accede a reportes en tiempo real, identifica oportunidades y toma decisiones basadas en datos.",
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 rounded-2xl p-8 h-full">
                  <div className="text-5xl font-bold text-blue-100 mb-4">{item.step}</div>
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="h-8 w-8 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-400 font-medium">Resultados comprobados</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Beneficios para tu Negocio
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-blue-400 mb-2">{benefit.stat}</div>
                <div className="text-sm text-gray-400 mb-4">{benefit.statLabel}</div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-platform Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-600 font-medium">Acceso desde cualquier lugar</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                Diseñado para el Trabajo Moderno
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Accede a TusVentas.Digital desde cualquier dispositivo: computadora, tablet o celular. Tu equipo puede registrar ventas y consultar información en tiempo real, estén donde estén.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Smartphone, text: "App responsive optimizada para móviles" },
                  { icon: Globe, text: "Acceso web desde cualquier navegador" },
                  { icon: Shield, text: "Datos encriptados y seguros" },
                  { icon: Headphones, text: "Soporte técnico especializado" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-xl p-4 text-white text-center">
                    <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-80" />
                    <div className="text-sm">Mobile</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-white text-center">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-80" />
                    <div className="text-sm">Web</div>
                  </div>
                </div>
                <div className="mt-6 bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Nueva venta registrada</div>
                      <div className="text-sm text-gray-500">Hace 2 minutos</div>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2">
                    Comisión calculada: $12,500
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-medium">Planes flexibles</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Elige el Plan Ideal
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Soluciones adaptadas al tamaño y necesidades de tu negocio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-blue-600 text-white ring-4 ring-blue-200 scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block px-3 py-1 bg-blue-500 rounded-full text-sm font-medium mb-4">
                    Más popular
                  </span>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-blue-100" : "text-gray-500"}`}>
                  {plan.description}
                </p>
                <div className={`text-3xl font-bold mb-6 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className={`h-5 w-5 flex-shrink-0 ${plan.highlighted ? "text-blue-200" : "text-green-500"}`} />
                      <span className={plan.highlighted ? "text-blue-100" : "text-gray-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="https://wa.me/5491171570893" target="_blank" className="block">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-white text-blue-600 hover:bg-gray-100"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    size="lg"
                  >
                    Contactar
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-medium">Preguntas frecuentes</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Resolvemos tus dudas
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronRight
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      openFaq === index ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <Award className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comienza a transformar tu negocio hoy
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de empresas que ya optimizaron su gestión de ventas con TusVentas.Digital
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://tusventas.digital" target="_blank">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Acceder a TusVentas.Digital
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://wa.me/5491171570893" target="_blank">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Hablar con un asesor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/">
              <Image
                src="/images/grupojv/logo23.png"
                alt="Grupo JV"
                width={150}
                height={60}
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                Inicio
              </Link>
              <Link href="/cotizaciones" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cotizaciones
              </Link>
              <Link href="#contacto" className="text-gray-400 hover:text-white transition-colors text-sm">
                Contacto
              </Link>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; 2025 Grupo JV. Todos los derechos reservados.
            </p>
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
