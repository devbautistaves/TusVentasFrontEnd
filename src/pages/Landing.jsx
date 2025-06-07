"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FiBarChart2,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiShield,
  FiMessageCircle,
  FiCalendar,
  FiStar,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi"

const Landing = () => {
  const navigate = useNavigate()
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const features = [
    {
      icon: <FiBarChart2 className="w-8 h-8" />,
      title: "Dashboard Inteligente",
      description: "Visualiza tus ventas, comisiones y métricas en tiempo real con gráficos interactivos.",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Gestión de Equipo",
      description: "Administra tu equipo de vendedores, asigna comisiones y monitorea el rendimiento.",
    },
    {
      icon: <FiDollarSign className="w-8 h-8" />,
      title: "Control de Comisiones",
      description: "Calcula automáticamente las comisiones y mantén un registro detallado de pagos.",
    },
    {
      icon: <FiMessageCircle className="w-8 h-8" />,
      title: "Chat Integrado",
      description: "Comunícate con tu equipo a través de chat grupal y conversaciones privadas.",
    },
    {
      icon: <FiCalendar className="w-8 h-8" />,
      title: "Sistema de Entrenamientos",
      description: "Programa reuniones, sube documentos y mantén a tu equipo siempre capacitado.",
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Seguridad Total",
      description: "Protección de datos con encriptación y autenticación de dos factores.",
    },
  ]

  const testimonials = [
    {
      name: "María González",
      role: "Gerente de Ventas",
      image: "/placeholder.svg?height=60&width=60",
      text: "TusVentas transformó completamente nuestra gestión. Aumentamos las ventas un 40% en 3 meses.",
    },
    {
      name: "Carlos Rodríguez",
      role: "Director Comercial",
      image: "/placeholder.svg?height=60&width=60",
      text: "La mejor inversión que hicimos. El control de comisiones y reportes nos ahorra horas semanales.",
    },
    {
      name: "Ana Martínez",
      role: "Vendedora Senior",
      image: "/placeholder.svg?height=60&width=60",
      text: "Como vendedora, me encanta poder ver mis comisiones en tiempo real y el chat con el equipo.",
    },
  ]

  const plans = [
    {
      name: "Starter",
      price: "Gratis",
      description: "Perfecto para empezar",
      features: ["Hasta 5 vendedores", "Dashboard básico", "Gestión de ventas", "Soporte por email"],
      popular: false,
    },
    {
      name: "Professional",
      price: "$29/mes",
      description: "Para equipos en crecimiento",
      features: [
        "Vendedores ilimitados",
        "Dashboard avanzado",
        "Chat integrado",
        "Sistema de entrenamientos",
        "Reportes personalizados",
        "Soporte prioritario",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      description: "Para grandes organizaciones",
      features: [
        "Todo lo de Professional",
        "API personalizada",
        "Integraciones avanzadas",
        "Soporte 24/7",
        "Consultoría incluida",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                TusVentas
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-gray-300 hover:text-emerald-400 transition-colors">
                Inicio
              </a>
              <a href="#caracteristicas" className="text-gray-300 hover:text-emerald-400 transition-colors">
                Características
              </a>
              <a href="#precios" className="text-gray-300 hover:text-emerald-400 transition-colors">
                Precios
              </a>
              <a href="#testimonios" className="text-gray-300 hover:text-emerald-400 transition-colors">
                Testimonios
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-emerald-400 border border-emerald-400 rounded-lg hover:bg-emerald-400 hover:text-white transition-all duration-200"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  POTENCIA TUS{" "}
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    VENTAS
                  </span>{" "}
                  CON LA PLATAFORMA{" "}
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    LÍDER
                  </span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  ¡Únete a más de 5000 vendedores que ya transformaron su negocio! Gestiona tu equipo, controla
                  comisiones y aumenta tus ventas con nuestra plataforma todo-en-uno.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Comenzar Gratis</span>
                  <FiArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 border-2 border-emerald-400 text-emerald-400 text-lg font-semibold rounded-xl hover:bg-emerald-400 hover:text-white transition-all duration-200"
                >
                  Acceder al Panel
                </button>
              </div>

              <div className="flex items-center space-x-8 text-gray-400">
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-emerald-400" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-emerald-400" />
                  <span>Setup en 5 minutos</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl p-8 backdrop-blur-sm border border-emerald-500/30">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-semibold">Dashboard de Ventas</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg p-4">
                      <div className="text-white text-2xl font-bold">$45,230</div>
                      <div className="text-emerald-100 text-sm">Ventas del Mes</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-white text-2xl font-bold">127</div>
                      <div className="text-gray-300 text-sm">Ventas Totales</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Plan Premium</span>
                      <span className="text-emerald-400">$1,200</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Plan Básico</span>
                      <span className="text-emerald-400">$800</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Plan Starter</span>
                      <span className="text-emerald-400">$400</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Todo lo que necesitas para{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                vender más
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Una plataforma completa diseñada para maximizar tus ventas y optimizar la gestión de tu equipo comercial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                5000+
              </div>
              <div className="text-gray-300">Vendedores Activos</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                $2M+
              </div>
              <div className="text-gray-300">En Ventas Gestionadas</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                98%
              </div>
              <div className="text-gray-300">Satisfacción del Cliente</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-gray-300">Soporte Disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Lo que dicen nuestros{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                clientes
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Planes que se adaptan a{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                tu negocio
              </span>
            </h2>
            <p className="text-xl text-gray-300">Comienza gratis y escala según tus necesidades</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 ${
                  plan.popular ? "border-emerald-500 scale-105" : "border-gray-700 hover:border-emerald-500/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {plan.price}
                  </div>
                  <p className="text-gray-300">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <FiCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate("/register")}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                      : "border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-white"
                  }`}
                >
                  Comenzar Ahora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">¿Listo para transformar tus ventas?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Únete a miles de vendedores que ya están maximizando sus resultados con TusVentas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-white text-emerald-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              Comenzar Gratis Ahora
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-200"
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  TusVentas
                </span>
              </div>
              <p className="text-gray-400">La plataforma líder para gestión de ventas y equipos comerciales.</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#caracteristicas" className="hover:text-emerald-400 transition-colors">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#precios" className="hover:text-emerald-400 transition-colors">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Integraciones
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Estado del Sistema
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Acerca de
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Carreras
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TusVentas. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
