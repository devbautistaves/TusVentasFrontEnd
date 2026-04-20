import Link from "next/link"
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Shield, 
  Zap, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Star
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TusVentas</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Caracteristicas
              </a>
              <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Resultados
              </a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Testimonios
              </a>
            </div>

            <Link 
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Iniciar Sesion
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <Zap className="h-4 w-4" />
              <span>Plataforma de Gestion de Ventas</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight text-balance">
              Potencia tu equipo de ventas al maximo
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Gestiona vendedores, controla comisiones y optimiza el rendimiento de tu negocio con nuestra plataforma integral.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors gap-2 w-full sm:w-auto"
              >
                Comenzar ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a 
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-8 py-3 text-base font-medium text-foreground hover:bg-secondary transition-colors w-full sm:w-auto"
              >
                Ver caracteristicas
              </a>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/50" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/50" />
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <DashboardCard title="Ventas Totales" value="$2.4M" change="+12%" />
                <DashboardCard title="Vendedores Activos" value="24" change="+3" />
                <DashboardCard title="Comisiones Pagadas" value="$180K" change="+8%" />
                <DashboardCard title="Tasa de Conversion" value="34%" change="+5%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="+150%" label="Aumento en ventas" />
            <StatCard value="98%" label="Satisfaccion de usuarios" />
            <StatCard value="50+" label="Empresas confian en nosotros" />
            <StatCard value="24/7" label="Soporte disponible" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Todo lo que necesitas para gestionar tu equipo
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Herramientas potentes y faciles de usar para maximizar el rendimiento de tu equipo de ventas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6" />}
              title="Dashboard en tiempo real"
              description="Visualiza metricas clave, graficos de rendimiento y estadisticas actualizadas al instante."
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Gestion de equipo"
              description="Administra vendedores, asigna roles y monitorea el desempeno individual y grupal."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-6 w-6" />}
              title="Control de ventas"
              description="Seguimiento completo del ciclo de ventas con estados personalizables y historial detallado."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6" />}
              title="Seguridad avanzada"
              description="Datos encriptados, autenticacion segura y permisos basados en roles."
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6" />}
              title="Comisiones automaticas"
              description="Calculo automatico de comisiones basado en escalas configurables y metas alcanzadas."
            />
            <FeatureCard 
              icon={<Clock className="h-6 w-6" />}
              title="Notificaciones instantaneas"
              description="Alertas en tiempo real sobre cambios de estado, nuevas ventas y metas cumplidas."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="TusVentas transformo completamente la manera en que gestionamos nuestro equipo. Las comisiones se calculan automaticamente y todo es transparente."
              author="Maria Garcia"
              role="Directora de Ventas"
              company="TechCorp"
            />
            <TestimonialCard 
              quote="La mejor inversion que hicimos. En 3 meses aumentamos nuestras ventas en un 40% gracias al seguimiento detallado que ofrece la plataforma."
              author="Carlos Rodriguez"
              role="CEO"
              company="Innovatech"
            />
            <TestimonialCard 
              quote="Mis vendedores estan mas motivados porque pueden ver su progreso en tiempo real. El sistema de comisiones es justo y facil de entender."
              author="Ana Martinez"
              role="Gerente Comercial"
              company="GlobalSales"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Comienza a potenciar tu equipo hoy
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Unete a las empresas que ya estan maximizando su rendimiento con TusVentas.
          </p>
          <div className="mt-8">
            <Link 
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors gap-2"
            >
              Acceder a la plataforma
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">TusVentas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 TusVentas. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DashboardCard({ title, value, change }: { title: string; value: string; change: string }) {
  return (
    <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <span className="text-sm text-green-500 font-medium">{change}</span>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-primary">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role, company }: { quote: string; author: string; role: string; company: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border/50">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
        ))}
      </div>
      <p className="text-foreground mb-6 text-pretty">&quot;{quote}&quot;</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-foreground">{author}</p>
          <p className="text-sm text-muted-foreground">{role}, {company}</p>
        </div>
      </div>
    </div>
  )
}
