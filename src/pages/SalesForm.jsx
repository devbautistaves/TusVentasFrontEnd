"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import {
  FiPackage,
  FiFileText,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheck,
  FiCreditCard,
  FiUpload,
  FiImage,
} from "react-icons/fi"

const SalesForm = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [formData, setFormData] = useState({
    planId: "",
    description: "",
    customerInfo: {
      name: "",
      email: "",
      phone: "",
      dni: "",
      address: {
        street: "",
        number: "",
        city: "",
        province: "",
        postalCode: "",
      },
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/api/plans")
        if (response.data.success) {
          setPlans(response.data.plans)
        }
      } catch (err) {
        console.error("Error fetching plans:", err)
        setError("Error al cargar los planes")
      }
    }

    fetchPlans()
  }, [])

  const selectedPlan = plans.find((plan) => plan._id === formData.planId)
  const commission = selectedPlan ? selectedPlan.price * currentUser.commissionRate : 0

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes("customerInfo.address.")) {
      const addressField = name.split(".")[2]
      setFormData({
        ...formData,
        customerInfo: {
          ...formData.customerInfo,
          address: {
            ...formData.customerInfo.address,
            [addressField]: value,
          },
        },
      })
    } else if (name.includes("customerInfo.")) {
      const customerField = name.split(".")[1]
      setFormData({
        ...formData,
        customerInfo: {
          ...formData.customerInfo,
          [customerField]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)



    // Validate all required fields
    const requiredFields = [
      { field: formData.planId, name: "Plan" },
      { field: formData.description, name: "Descripción" },
      { field: formData.customerInfo.name, name: "Nombre del cliente" },
      { field: formData.customerInfo.email, name: "Email del cliente" },
      { field: formData.customerInfo.phone, name: "Teléfono del cliente" },
      { field: formData.customerInfo.dni, name: "DNI del cliente" },
      { field: formData.customerInfo.address.street, name: "Calle" },
      { field: formData.customerInfo.address.number, name: "Altura" },
      { field: formData.customerInfo.address.city, name: "Localidad" },
      { field: formData.customerInfo.address.province, name: "Provincia" },
      { field: formData.customerInfo.address.postalCode, name: "Código postal" },
    ]

    for (const { field, name } of requiredFields) {
      if (!field || field.trim() === "") {
        setError(`El campo ${name} es obligatorio`)
        setIsLoading(false)
        return
      }
    }

    try {
      console.log("Sending data:", {
        planId: formData.planId,
        description: formData.description,
        customerInfo: formData.customerInfo,
      })

      const formDataToSend = new FormData()
      formDataToSend.append("planId", formData.planId)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("customerInfo", JSON.stringify(formData.customerInfo))

      // Debug FormData contents
      for (const pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + (pair[1] instanceof File ? pair[1].name : pair[1]))
      }

      const response = await api.post("/api/sales", formDataToSend, {
        headers: {
          "Content-Type": "application/json"
        },
      })

      if (response.data.success) {
        setSuccess(true)
        // Reset form
        setFormData({
          planId: "",
          description: "",
          customerInfo: {
            name: "",
            email: "",
            phone: "",
            dni: "",
            address: {
              street: "",
              number: "",
              city: "",
              province: "",
              postalCode: "",
            },
          },
        })

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/dashboard")
        }, 2000)
      } else {
        setError(response.data.error || "Error al registrar la venta")
      }
    } catch (err) {
      console.error("Error details:", err.response?.data)
      console.error("Error status:", err.response?.status)
      console.error("Error message:", err.message)

      if (err.response?.data?.details) {
        setError(`Error de validación: ${err.response.data.details.join(", ")}`)
      } else {
        setError(err.response?.data?.error || "Error al registrar la venta. Intenta nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registrar Nueva Venta</h1>
        <p className="text-gray-600">Completa el formulario para registrar una nueva venta</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <FiCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">¡Venta registrada con éxito!</h3>
            <p className="mt-1 text-sm text-gray-500">
              La venta ha sido registrada correctamente. Serás redirigido al dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="planId" className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Plan *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPackage className="text-gray-400" />
                  </div>
                  <select
                    id="planId"
                    name="planId"
                    value={formData.planId}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un plan</option>
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} - ${Number(plan.price || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedPlan && <p className="mt-1 text-sm text-gray-500">{selectedPlan.description}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción de la Venta *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFileText className="text-gray-400" />
                  </div>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción de la venta"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      id="customerName"
                      name="customerInfo.name"
                      type="text"
                      value={formData.customerInfo.name}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre completo del cliente"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      id="customerEmail"
                      name="customerInfo.email"
                      type="email"
                      value={formData.customerInfo.email}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="cliente@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      id="customerPhone"
                      name="customerInfo.phone"
                      type="tel"
                      value={formData.customerInfo.phone}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="customerDni" className="block text-sm font-medium text-gray-700 mb-1">
                    DNI *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className="text-gray-400" />
                    </div>
                    <input
                      id="customerDni"
                      name="customerInfo.dni"
                      type="text"
                      value={formData.customerInfo.dni}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12345678"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Dirección</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Calle *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="text-gray-400" />
                      </div>
                      <input
                        id="street"
                        name="customerInfo.address.street"
                        type="text"
                        value={formData.customerInfo.address.street}
                        onChange={handleChange}
                        required
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Av. Corrientes"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                      Altura *
                    </label>
                    <input
                      id="number"
                      name="customerInfo.address.number"
                      type="text"
                      value={formData.customerInfo.address.number}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Localidad *
                    </label>
                    <input
                      id="city"
                      name="customerInfo.address.city"
                      type="text"
                      value={formData.customerInfo.address.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Buenos Aires"
                    />
                  </div>

                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                      Provincia *
                    </label>
                    <input
                      id="province"
                      name="customerInfo.address.province"
                      type="text"
                      value={formData.customerInfo.address.province}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Buenos Aires"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal *
                    </label>
                    <input
                      id="postalCode"
                      name="customerInfo.address.postalCode"
                      type="text"
                      value={formData.customerInfo.address.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {selectedPlan && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Resumen de la Venta</h4>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-blue-700">Plan Seleccionado:</p>
                    <p className="font-medium">{selectedPlan.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Precio del Plan:</p>
                    <p className="font-medium">${Number(selectedPlan.price || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">
                      Tu Comisión ({(currentUser.commissionRate * 100).toFixed(1)}%):
                    </p>
                    <p className="font-medium">${Number(commission || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Registrando..." : "Registrar Venta"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default SalesForm
