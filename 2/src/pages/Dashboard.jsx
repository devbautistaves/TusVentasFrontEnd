"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import { FiDollarSign, FiTrendingUp, FiPercent, FiBarChart2, FiClock } from "react-icons/fi"
import LoadingSpinner from "../components/LoadingSpinner"
import DashboardCard from "../components/DashboardCard"
import SalesList from "../components/SalesList"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching dashboard data for user:", currentUser?.id, "Role:", currentUser?.role)

        // Fetch dashboard stats
        const statsResponse = await api.get("/api/dashboard/stats")
        console.log("Stats response:", statsResponse.data)

        // Fetch recent sales
        const salesResponse = await api.get("/api/sales?limit=5")
        console.log("Sales response:", salesResponse.data)

        if (statsResponse.data.success && salesResponse.data.success) {
          setStats(statsResponse.data)
          setRecentSales(salesResponse.data.sales)
          console.log("Dashboard data loaded successfully")
        } else {
          throw new Error("Failed to fetch dashboard data")
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        const errorMessage = err.response?.data?.error || err.message || "Error al cargar los datos del dashboard"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchDashboardData()
    }
  }, [currentUser])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-red-600 hover:text-red-800 font-medium">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">No hay usuario autenticado</p>
          <Link to="/login" className="mt-2 text-yellow-600 hover:text-yellow-800 font-medium">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard de Ventas</h1>
        <p className="text-gray-600">
          Bienvenido, {currentUser.name} - Rol: {currentUser.role} - Comisión:{" "}
          {(currentUser.commissionRate * 100).toFixed(1)}%
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Ventas Totales"
          value={`${stats?.stats?.totalCount || 0} ventas realizadas`}
          subtitle={`Entre mas vendes mas ganas!`}
          icon={<FiDollarSign className="h-6 w-6 text-blue-500" />}
        />

        <DashboardCard
          title="Comisiones"
          value={`$${stats?.stats?.totalCommissions?.toFixed(2) || "0.00"}`}
          subtitle={`${(currentUser.commissionRate * 100).toFixed(1)}% de comisión`}
          icon={<FiTrendingUp className="h-6 w-6 text-green-500" />}
        />

        <DashboardCard
          title="Comisión Actual"
          value={`${(currentUser.commissionRate * 100).toFixed(1)}%`}
          subtitle="Tasa de comisión"
          icon={<FiPercent className="h-6 w-6 text-purple-500" />}
        />

        <DashboardCard
          title="Promedio por Venta"
          value={`$${stats?.stats?.avgSale?.toFixed(2) || "0.00"}`}
          subtitle="Por transacción"
          icon={<FiBarChart2 className="h-6 w-6 text-orange-500" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Ventas Recientes</h2>
          <Link to="/sales/history" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todas
          </Link>
        </div>

        {recentSales.length > 0 ? (
          <SalesList sales={recentSales} compact />
        ) : (
          <div className="text-center py-8">
            <FiClock className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-gray-500">No tienes ventas registradas aún</p>
            <Link
              to="/sales/new"
              className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Registrar Venta
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
