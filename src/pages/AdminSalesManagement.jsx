"use client"

import { useState, useEffect, useCallback } from "react"
import api from "../services/api"
import { FiFilter, FiCalendar, FiAlertCircle, FiEdit, FiCheck, FiX, FiEye, FiImage } from "react-icons/fi"
import LoadingSpinner from "../components/LoadingSpinner"
import Pagination from "../components/Pagination"


const [statusForm, setStatusForm] = useState({ status: selectedSale.status || "pending" });

const AdminSalesManagement = () => {
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
    sellerId: "",
    startDate: "",
    endDate: "",
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sellers, setSellers] = useState([])
  const [selectedSale, setSelectedSale] = useState(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [statusForm, setStatusForm] = useState({
    status: "",
    notes: "",
  })

  const fetchSales = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        setError(null)

        let url = `/api/admin/sales?page=${page}&limit=10`

        if (filters.status) url += `&status=${filters.status}`
        if (filters.sellerId) url += `&sellerId=${filters.sellerId}`
        if (filters.startDate) url += `&startDate=${filters.startDate}`
        if (filters.endDate) url += `&endDate=${filters.endDate}`

        console.log("Fetching admin sales:", url)

        const response = await api.get(url)

        if (response.data.success) {
          setSales(response.data.sales)
          setPagination(response.data.pagination)
          console.log("Admin sales loaded:", response.data.sales.length)
        } else {
          setError(response.data.error || "Error al cargar las ventas")
        }
      } catch (err) {
        console.error("Error fetching admin sales:", err)
        setError(err.response?.data?.error || "Error al cargar las ventas")
      } finally {
        setLoading(false)
      }
    },
    [filters.status, filters.sellerId, filters.startDate, filters.endDate],
  )

  const fetchSellers = async () => {
    try {
      const response = await api.get("/api/admin/users")
      if (response.data.success) {
        setSellers(response.data.users)
      }
    } catch (err) {
      console.error("Error fetching sellers:", err)
    }
  }

  useEffect(() => {
    fetchSales()
    fetchSellers()
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
      sellerId: "",
      startDate: "",
      endDate: "",
    })
    fetchSales(1)
    setIsFilterOpen(false)
  }

  const openStatusModal = (sale) => {
    setSelectedSale(sale)
    setStatusForm({
      status: sale.status,
      notes: "",
    })
    setIsStatusModalOpen(true)
  }

  const closeStatusModal = () => {
    setSelectedSale(null)
    setIsStatusModalOpen(false)
  }

  const openDetailModal = (sale) => {
    setSelectedSale(sale)
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setSelectedSale(null)
    setIsDetailModalOpen(false)
  }

  const openImageModal = (imagePath) => {
    const imageUrl = `${process.env.REACT_APP_API_URL || "https://tusventasbackend.onrender.com"}/uploads/${imagePath}`
    setSelectedImage(imageUrl)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  const handleStatusFormChange = (e) => {
    const { name, value } = e.target
    setStatusForm({
      ...statusForm,
      [name]: value,
    })
  }

const handleStatusSubmit = async (e) => {
  e.preventDefault();
  try {
    // Llamada PUT para actualizar solo el status
    const response = await api.put(`/api/admin/sales/${selectedSale._id}/status`, statusForm);
    if (response.data.success) {
      // Actualizar la lista localmente con el nuevo estado
      setSales((prevSales) =>
        prevSales.map((sale) =>
          sale._id === selectedSale._id ? { ...sale, status: statusForm.status } : sale
        )
      );
      closeStatusModal(); // Cerrar modal o UI
    }
  } catch (err) {
    setError(err.response?.data?.error || "Error al actualizar el estado de la venta");
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "installed":
        return "bg-green-100 text-green-800"
      case "pending":
      case "pending_appointment":
        return "bg-yellow-100 text-yellow-800"
      case "appointed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completada"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelada"
      case "installed":
        return "Instalada"
      case "pending_appointment":
        return "Pendiente de Turno"
      case "appointed":
        return "Turnada"
      default:
        return "Desconocido"
    }
  }

  if (loading && pagination.currentPage === 1) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Ventas</h1>
          <p className="text-gray-600">Administra y actualiza el estado de las ventas</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
          >
            <FiFilter className="mr-2" />
            Filtrar
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Filtros</h2>

          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
                <option value="installed">Instalada</option>
                <option value="pending_appointment">Pendiente de Turno</option>
                <option value="appointed">Turnada</option>
              </select>
            </div>

            <div>
              <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700 mb-1">
                Vendedor
              </label>
              <select
                id="sellerId"
                name="sellerId"
                value={filters.sellerId}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {sellers.map((seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.name}
                  </option>
                ))}
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
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleFilterReset}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {sales.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sale.customerInfo?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{sale.customerInfo?.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sale.planName}</div>
                        <div className="text-sm text-gray-500">${(sale.planPrice || 0).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sale.sellerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(sale.createdAt).toLocaleDateString("es-ES")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(sale.createdAt).toLocaleTimeString("es-ES")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            sale.status,
                          )}`}
                        >
                          {getStatusText(sale.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDetailModal(sale)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Ver detalles"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openStatusModal(sale)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Cambiar estado"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          {sale.customerInfo?.dniPhoto && (
                            <button
                              onClick={() => openImageModal(sale.customerInfo.dniPhoto)}
                              className="text-purple-600 hover:text-purple-900 flex items-center"
                              title="Ver DNI"
                            >
                              <FiImage className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
            <p className="mt-1 text-sm text-gray-500">No hay ventas que coincidan con los criterios de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actualizar Estado de Venta</h3>
              <form onSubmit={handleStatusSubmit}>
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={statusForm.status}
                    onChange={handleStatusFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="installed">Instalada</option>
                    <option value="pending_appointment">Pendiente de Turno</option>
                    <option value="appointed">Turnada</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={statusForm.notes}
                    onChange={handleStatusFormChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Añade notas sobre el cambio de estado..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeStatusModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <FiX className="mr-1" /> Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors"
                  >
                    <FiCheck className="mr-1" /> Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalles de la Venta</h3>
                <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600">
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Nombre:</strong> {selectedSale.customerInfo?.name || "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedSale.customerInfo?.email || "N/A"}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {selectedSale.customerInfo?.phone || "N/A"}
                      </p>
                      <p>
                        <strong>DNI:</strong> {selectedSale.customerInfo?.dni || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Información de la Venta</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Plan:</strong> {selectedSale.planName}
                      </p>
                      <p>
                        <strong>Precio:</strong> ${(selectedSale.planPrice || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Comisión:</strong> ${(selectedSale.commission || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Vendedor:</strong> {selectedSale.sellerName}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedSale.customerInfo?.address && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dirección</h4>
                    <p className="text-sm">
                      {selectedSale.customerInfo.address.street} {selectedSale.customerInfo.address.number},{" "}
                      {selectedSale.customerInfo.address.city}, {selectedSale.customerInfo.address.province} (
                      {selectedSale.customerInfo.address.postalCode})
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600">{selectedSale.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estado Actual</h4>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedSale.status)}`}
                  >
                    {getStatusText(selectedSale.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold z-10"
            >
              ×
            </button>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="DNI del cliente"
              className="max-w-full max-h-full object-contain rounded-lg"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error("Error loading image:", e)
                e.target.src = "/placeholder.svg?height=400&width=600"
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSalesManagement
