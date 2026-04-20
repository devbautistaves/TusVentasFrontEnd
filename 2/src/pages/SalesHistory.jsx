"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { FiFilter, FiCalendar, FiDownload, FiAlertCircle, FiRefreshCw } from "react-icons/fi"
import LoadingSpinner from "../components/LoadingSpinner"
import SalesList from "../components/SalesList"
import Pagination from "../components/Pagination"

const SalesHistory = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const fetchSales = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        setError(null)

        let url = `/api/sales?page=${page}&limit=10`

        if (filters.status) url += `&status=${filters.status}`
        if (filters.startDate) url += `&startDate=${filters.startDate}`
        if (filters.endDate) url += `&endDate=${filters.endDate}`

        console.log("Fetching sales from:", url)
        const response = await api.get(url)
        console.log("Sales API response:", response.data)

        if (response.data.success) {
          setSales(response.data.sales || [])
          setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, total: 0 })
          console.log("Sales loaded:", response.data.sales?.length || 0)
        } else {
          throw new Error(response.data.error || "Error al cargar las ventas")
        }
      } catch (err) {
        console.error("Error fetching sales:", err)
        const errorMessage = err.response?.data?.error || err.message || "Error al cargar las ventas"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [filters.status, filters.startDate, filters.endDate],
  )

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const handlePageChange = (page) => {
    fetchSales(page)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchSales(1)
    setIsFilterOpen(false)
  }

  const handleFilterReset = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
    })
    fetchSales(1)
    setIsFilterOpen(false)
  }

  const handleRefresh = () => {
    fetchSales(pagination.currentPage)
  }

  const exportToCSV = () => {
    // Get all sales (without pagination)
    api
      .get("/api/sales?limit=1000")
      .then((response) => {
        if (response.data.success) {
          const sales = response.data.sales

          // Format data for CSV
          const csvContent = [
            // Header
            ["ID", "Fecha", "Descripción", "Monto", "Comisión", "Estado", "Cliente"],
            // Data
            ...sales.map((sale) => [
              sale._id,
              new Date(sale.createdAt).toLocaleString(),
              sale.description,
              sale.planPrice?.toFixed(2) || "0.00",
              sale.commission?.toFixed(2) || "0.00",
              sale.status === "completed" ? "Completada" : sale.status === "pending" ? "Pendiente" : "Cancelada",
              sale.customerInfo?.name || "N/A",
            ]),
          ]
            .map((row) => row.join(","))
            .join("\n")

          // Create download link
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.setAttribute("href", url)
          link.setAttribute("download", `ventas_${new Date().toISOString().split("T")[0]}.csv`)
          link.style.visibility = "hidden"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      })
      .catch((err) => {
        console.error("Error exporting sales:", err)
        setError("Error al exportar las ventas")
      })
  }

  if (loading && pagination.currentPage === 1) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Historial de Ventas</h1>
          <p className="text-gray-600">Consulta y gestiona todas tus ventas</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md"
          >
            <FiFilter className="mr-2" />
            Filtrar
          </button>

          <Link
            to="/sales/new"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            + Nueva Venta
          </Link>

          <button
            onClick={exportToCSV}
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
          >
            <FiDownload className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Filtros</h2>

          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="completed">Completada</option>
                <option value="pending">Pendiente</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleFilterReset}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Limpiar
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Aplicar Filtros
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => fetchSales(pagination.currentPage)}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sales.length > 0 ? (
          <>
            <SalesList sales={sales} loading={loading} />

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron ventas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.values(filters).some(Boolean)
                ? "No hay ventas que coincidan con los filtros aplicados."
                : "Aún no has registrado ninguna venta."}
            </p>
            <div className="mt-6">
              <Link
                to="/sales/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Registrar Venta
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesHistory
