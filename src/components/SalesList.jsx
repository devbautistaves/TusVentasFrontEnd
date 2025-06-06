"use client"

import { FiCalendar, FiDollarSign, FiUser, FiPackage, FiImage } from "react-icons/fi"
import { useState } from "react"

  export const getStatusText = (status) => {
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

  export const STATUS_KEYS = [
  "pending",
  "completed",
  "cancelled",
  "installed",
  "pending_appointment",
  "appointed"
];



const SalesList = ({ sales, loading, compact = false }) => {
  const [selectedImage, setSelectedImage] = useState(null)

  console.log("SalesList received sales:", sales)
  console.log("SalesList loading:", loading)

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



  const openImageModal = (imagePath) => {
    const imageUrl = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/uploads/${imagePath}`
    console.log("Opening image:", imageUrl)
    setSelectedImage(imageUrl)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-20 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!sales || sales.length === 0) {
    console.log("No sales to display")
    return (
      <div className="text-center py-8 p-4">
        <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No hay ventas</h3>
        <p className="mt-1 text-sm text-gray-500">No se encontraron ventas para mostrar.</p>
      </div>
    )
  }

  console.log("Rendering", sales.length, "sales")

  return (
    <>
      <div className="p-4">
        <div className="space-y-4">
          {sales.map((sale, index) => {
            console.log(`Rendering sale ${index}:`, sale)
            return (
              <div
                key={sale._id || index}
                className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                  compact ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{sale.description || "Venta sin descripción"}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiPackage className="mr-1" />
                            <span>{sale.planName || "Plan no especificado"}</span>
                          </div>
                          <div className="flex items-center">
                            <FiUser className="mr-1" />
                            <span>{sale.customerInfo?.name || sale.sellerName || "N/A"}</span>
                          </div>
                          <div className="flex items-center">
                            <FiCalendar className="mr-1" />
                            <span>
                              {sale.createdAt
                                ? new Date(sale.createdAt).toLocaleDateString("es-ES")
                                : "Fecha no disponible"}
                            </span>
                          </div>
                          {sale.customerInfo?.dniPhoto && (
                            <button
                              onClick={() => openImageModal(sale.customerInfo.dniPhoto)}
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <FiImage className="mr-1" />
                              <span>Ver DNI</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {!compact && sale.customerInfo && (
                      <div className="mt-3 text-sm text-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {sale.customerInfo.name && (
                            <p>
                              <strong>Cliente:</strong> {sale.customerInfo.name}
                            </p>
                          )}
                          {sale.customerInfo.dni && (
                            <p>
                              <strong>DNI:</strong> {sale.customerInfo.dni}
                            </p>
                          )}
                          {sale.customerInfo.phone && (
                            <p>
                              <strong>Teléfono:</strong> {sale.customerInfo.phone}
                            </p>
                          )}
                          {sale.customerInfo.email && (
                            <p>
                              <strong>Email:</strong> {sale.customerInfo.email}
                            </p>
                          )}
                        </div>
                        {sale.customerInfo.address && (
                          <p className="mt-2">
                            <strong>Dirección:</strong>
                            {` ${sale.customerInfo.address.street || ""} ${sale.customerInfo.address.number || ""}, ${sale.customerInfo.address.city || ""}, ${sale.customerInfo.address.state || sale.customerInfo.address.province || ""} ${sale.customerInfo.address.zipCode || sale.customerInfo.address.postalCode || ""}`.trim()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="flex items-center text-lg font-bold text-gray-900">
                      <FiDollarSign className="mr-1" />
                      {Number(sale.planPrice || sale.amount || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600">Comisión: ${Number(sale.commission || 0).toFixed(2)}</div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(sale.status)}`}>
                      {getStatusText(sale.status)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

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
    </>
  )
}

export default SalesList
