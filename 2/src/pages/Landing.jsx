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
      description: "Mirá tus ventas, comisiones y métricas en tiempo real con gráficos claros e interactivos.",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Supervisión Acompañada",
      description: "Nosotros supervisamos tu actividad para que puedas concentrarte en vender. Accedé a tus ventas, clientes y movimientos desde un solo lugar.",
    },
    {
      icon: <FiDollarSign className="w-8 h-8" />,
      title: "Control de Comisiones",
      description: "Consultá cuánto ganaste, cuánto vas a cobrar y cuándo. Todo automatizado, sin hacer cuentas.",
    },
    {
      icon: <FiMessageCircle className="w-8 h-8" />,
      title: "Chat Integrado",
      description: "Accedé a soporte o hablá con otros vendedores a través del chat integrado.",
    },
    {
      icon: <FiCalendar className="w-8 h-8" />,
      title: "Sistema de Entrenamientos",
      description: "Accedé a capacitaciones, documentos y guías para mejorar tus ventas todos los días.",
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Seguridad Total",
      description: "Tus datos están protegidos con encriptación y verificación en dos pasos.",
    },
  ]

  const testimonials = [
    {
      name: "Luciana Romero",
      role: "Vendedora Independiente",
      image: "/placeholder.svg?height=60&width=60",
      text: "Empecé sin experiencia y en la primera semana ya tenía mis primeras comisiones. Todo está listo para salir a vender.",
    },
    {
      name: "Carlos Rodríguez",
      role: "Vendedor Independiente",
      image: "/placeholder.svg?height=60&width=60",
      text: "TusVentas me cambió el juego. Vendo planes de seguridad, tengo todo el sistema armado y solo tengo que enfocarme en conseguir clientes.",
    },
    {
      name: "Ana Martínez",
      role: "Vendedora Independiente",
      image: "/placeholder.svg?height=60&width=60",
      text: "Me encanta ver cuánto gané al instante. Ya no tengo que hacer cuentas, todo está cargado automáticamente.",
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
                  VENDÉ ALARMAS{" "}
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    EN TODO EL PAIS
                  </span>{" "}
                  Y GANÁ PLATA{" "}
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    DESDE TU CELULAR
                  </span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                Miles de personas ya están generando ingresos desde su celular con TusVentas. Sumate hoy y descubrí lo fácil que es vender alarmas monitoreadas, sin stock, sin inversión y con todo el respaldo que necesitás para crecer.
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
                  <span>Rapido y facil.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-emerald-400" />
                  <span>Entrenamiento diario y mentorias gratis.</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl p-6 backdrop-blur-sm border border-emerald-500/30">
                <div className="bg-gray-800 rounded-2xl p-5 shadow-xl space-y-5">

                  {/* Encabezado */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-base">Dashboard de Ventas</h3>
                    <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                      <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Ventas activadas */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl p-4">
                      <div className="text-white text-xl font-bold">$300,000</div>
                      <div className="text-white text-sm">10 Ventas Activadas</div>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl p-4">
                      <div className="text-white text-xl font-bold">$1,000,000</div>
                      <div className="text-white text-sm">30 Ventas Activadas</div>
                    </div>
                  </div>

                  {/* Promedio */}
                  <div className="bg-gray-700 rounded-xl p-3">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Promedio mensual por vendedor</span>
                      <span className="text-emerald-400 font-semibold">39 ventas</span>
                    </div>
                  </div>

                  {/* Info adicional */}
                  <div className="text-sm space-y-2 text-gray-300">
                    <div className="flex justify-between">
                      <span>Planes de Alarmas</span>
                      <span className="text-emerald-400">Desde $43.300</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonificaciones a clientes</span>
                      <span className="text-emerald-400">Activas</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonos mensuales</span>
                      <span className="text-emerald-400">En efectivo</span>
                    </div>
                    <div className="text-emerald-300 pt-2 text-xs text-center">
                      Empezá rápido, sin trámites. Capacitación y apoyo diario.
                    </div>
                  </div>

                </div>
              </div>
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
                empezar a vender y ganar comisiones
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
Una plataforma lista para usar, con productos reales y todas las herramientas para que empieces a ganar desde el día uno.            </p>
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

      {/* Testimonials Section
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
      </section> */}



      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">¿Listo para empezar a ganar dinero vendiendo?</h2>
          <p className="text-xl text-emerald-100 mb-8">
Únete a miles de vendedores independientes que ya están generando ingresos con TusVentas. ¡Solo tenés que activar tu cuenta y salir a vender!

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
              <p className="text-gray-400">Con TusVentas recibís productos listos para vender, un sistema de comisiones automatizado y todo lo que necesitás para empezar hoy mismo.</p>
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
