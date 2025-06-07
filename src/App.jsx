import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import SalesForm from "./pages/SalesForm"
import SalesHistory from "./pages/SalesHistory"
import AdminDashboard from "./pages/AdminDashboard"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import Layout from "./components/Layout"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import "./App.css"
import Training from "./pages/Training"
import AdminTraining from "./pages/AdminTraining"
import Chat from "./pages/Chat"
import { Helmet } from "react-helmet";
import GuidesPage from "./pages/GuidesPage"
import Landing from "./pages/Landing"


function App() {
  return (
      <>

        <Helmet>
        <meta name="keywords" content="Ventas, Comisiones, Emprender, Ingresos Extra, Independencia Financiera, Ser tu propio jefe, Comercializadora, Oportunidad Laboral, TusVentas, Bautista Vescio, Distribuidor, Trabajo Independiente" />
        <meta name="description" content="Convertite en tu propio jefe vendiendo con nosotros. Ingresos por comisión, flexibilidad horaria y apoyo constante. Sumate a TusVentas y construí tu negocio hoy mismo." />
        <meta name="author" content="BautistaVes" />
        <meta name="copyright" content="BautistaVes" />
        <meta name="robots" content="index" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tusventas.digital" />
        <meta property="og:image" content="https://tusventas.digital/bannertusventas.png" />
        <meta property="og:locale" content="es_AR" />
        <meta property="og:site_name" content="TusVentasDigitales" />
        <title>TusVentas - Sé tu propio jefe</title>
      </Helmet>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/sales/new" element={<SalesForm />} />
            <Route path="/app/sales/history" element={<SalesHistory />} />
            <Route path="/app/profile" element={<Profile />} />
            <Route path="/app/guia" element={<GuidesPage />} />
            <Route path="/app/training" element={<Training />} />
            <Route path="/app/chat" element={<Chat />} />

            {/* Admin Routes */}
            <Route
              path="/app/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/app/admin/training" element={<AdminTraining />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
    </>
  )
}

export default App
