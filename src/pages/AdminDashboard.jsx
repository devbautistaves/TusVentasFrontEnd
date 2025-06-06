"use client"

import React, { useState, useEffect } from "react"
import api from "../services/api"
import { FiDollarSign, FiUsers, FiPackage, FiAlertCircle, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi"
import LoadingSpinner from "../components/LoadingSpinner"
import DashboardCard from "../components/DashboardCard"
import { getStatusText,  STATUS_KEYS } from '../components/SalesList';




const AdminDashboard = () => {
  const [selectedSale, setSelectedSale] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "pending", notes: "" });
  const [stats, setStats] = useState(null)
  const [plans, setPlans] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [editingUser, setEditingUser] = useState(null)

  const openStatusModal = (sale) => {
    setSelectedSale(sale);
    setStatusForm({ status: sale.status, notes: "" }); // Aquí seteás el status actual de la venta
    // Abrir modal (ejemplo)
  };
const closeStatusModal = () => {
    setSelectedSale(null)
    setIsStatusModalOpen(false)
  }
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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: "",
    features: [""],
  })

  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    location: "",
    commissionRate: "",
    isActive: true,
    
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)

      const [statsRes, plansRes, usersRes, salesRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/plans"),
        api.get("/api/admin/users"),
        api.get("/api/admin/sales?limit=1000"),
      ])

      console.log("Admin API responses:", {
        stats: statsRes.data,
        plans: plansRes.data,
        users: usersRes.data,
        sales: salesRes.data,
      })

      if (statsRes.data.success) setStats(statsRes.data)
      if (plansRes.data.success) setPlans(plansRes.data.plans)
      if (usersRes.data.success) setUsers(usersRes.data.users)
      if (salesRes.data.success) setSales(salesRes.data.sales)
    } catch (err) {
      console.error("Error fetching admin data:", err)
      const errorMessage = err.response?.data?.error || err.message || "Error al cargar los datos del dashboard"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSubmit = async (e) => {
    e.preventDefault()
    try {
      const planData = {
        ...planForm,
        features: planForm.features.filter((f) => f.trim() !== ""),
      }

      if (editingPlan) {
        await api.put(`/api/admin/plans/${editingPlan._id}`, planData)
      } else {
        await api.post("/api/admin/plans", planData)
      }

      setShowPlanModal(false)
      setEditingPlan(null)
      setPlanForm({ name: "", description: "", price: "", features: [""] })
      fetchAdminData()
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar el plan")
    }
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/api/admin/users/${editingUser._id}`, userForm)
      setShowUserModal(false)
      setEditingUser(null)
      setUserForm({ name: "", phone: "", location: "", commissionRate: "", isActive: true })
      fetchAdminData()
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el usuario")
    }
  }

  const handleDeletePlan = async (planId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este plan?")) {
      try {
        await api.delete(`/api/admin/plans/${planId}`)
        fetchAdminData()
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el plan")
      }
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este vendedor?")) {
      try {
        await api.delete(`/api/admin/users/${userId}`)
        fetchAdminData()
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el usuario")
      }
    }
  }

  const openPlanModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan)
      setPlanForm({
        name: plan.name,
        description: plan.description,
        price: plan.price.toString(),
        features: plan.features.length > 0 ? plan.features : [""],
      })
    } else {
      setEditingPlan(null)
      setPlanForm({ name: "", description: "", price: "", features: [""] })
    }
    setShowPlanModal(true)
  }


const [isUpdating, setIsUpdating] = React.useState(false);
const [errorMsg, setErrorMsg] = React.useState(null);



  const openUserModal = (user) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      phone: user.phone,
      location: user.location,
      commissionRate: (user.commissionRate * 100).toString(),
      isActive: user.isActive,
    })
    setShowUserModal(true)
  }

  const addFeature = () => {
    setPlanForm({
      ...planForm,
      features: [...planForm.features, ""],
    })
  }

  const updateFeature = (index, value) => {
    const newFeatures = [...planForm.features]
    newFeatures[index] = value
    setPlanForm({
      ...planForm,
      features: newFeatures,
    })
  }

  const removeFeature = (index) => {
    setPlanForm({
      ...planForm,
      features: planForm.features.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button onClick={fetchAdminData} className="mt-2 text-red-600 hover:text-red-800 font-medium">
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  const handleStatusFormChange = (e) => {
    const { name, value } = e.target
    setStatusForm({
      ...statusForm,
      [name]: value,
    })
  }
const handleStatusChange = async (_id, newStatus) => {
  try {
    // Actualizar solo el status vía API
    const response = await api.put(`/api/admin/sales/${_id}/status`, { status: newStatus });
    
    if (response.data.success) {
      // Actualizar estado local para reflejar cambio
      setSales((prevSales) =>
        prevSales.map((sale) =>
          sale._id === _id ? { ...sale, status: newStatus } : sale
        )
      );
    } else {
      alert("No se pudo actualizar el estado");
    }
  } catch (err) {
    alert(err.response?.data?.error || "Error al actualizar el estado de la venta");
  }
};
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard de Administración</h1>
        <p className="text-gray-600">Gestiona planes, vendedores y ventas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Ventas Totales"
          value={`$${Number(stats?.stats?.totalSales || 0).toFixed(2)}`}
          subtitle={`${stats?.stats?.totalCount || 0} ventas registradas`}
          icon={<FiDollarSign className="h-6 w-6 text-blue-500" />}
        />

        <DashboardCard
          title="Comisiones Pagadas"
          value={`$${Number(stats?.stats?.totalCommissions || 0).toFixed(2)}`}
          subtitle="Total en comisiones"
          icon={<FiDollarSign className="h-6 w-6 text-green-500" />}
        />

        <DashboardCard
          title="Vendedores"
          value={stats?.userCount || 0}
          subtitle="Vendedores activos"
          icon={<FiUsers className="h-6 w-6 text-purple-500" />}
        />

        <DashboardCard
          title="Planes"
          value={stats?.planCount || 0}
          subtitle="Planes disponibles"
          icon={<FiPackage className="h-6 w-6 text-orange-500" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { key: "overview", label: "Resumen" },
              { key: "plans", label: "Gestión de Planes" },
              { key: "users", label: "Gestión de Vendedores" },
              { key: "sales", label: "Ventas Recientes" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Vendedores</h3>
                <div className="space-y-3">
                  {stats?.topSellers?.slice(0, 5).map((seller, index) => (
                    <div key={seller._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{seller.sellerName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">${Number(seller?.totalSales || 0).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">{seller.salesCount} ventas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Planes Más Vendidos</h3>
                <div className="space-y-3">
                  {stats?.topPlans?.slice(0, 5).map((plan, index) => (
                    <div key={plan._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{plan.planName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">${Number(seller?.totalSales || 0).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">{plan.salesCount} ventas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "plans" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Gestión de Planes</h3>
                <button
                  onClick={() => openPlanModal()}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  <FiPlus className="mr-2" />
                  Nuevo Plan
                </button>
              </div>

              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{plan.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                        <div className="mt-2">
                          <span className="text-lg font-bold text-green-600">${Number(plan?.price || 0).toFixed(2)}</span>
                          <span
                            className={`ml-3 px-2 py-1 text-xs rounded-full ${
                              plan.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {plan.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        {plan.features.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Características:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {plan.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openPlanModal(plan)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Gestión de Vendedores</h3>
              </div>

              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Teléfono:</span> {user.phone}
                          </div>
                          <div>
                            <span className="text-gray-500">Ubicación:</span> {user.location}
                          </div>
                          <div>
                            <span className="text-gray-500">Comisión:</span> {Number(user.commissionRate * 100).toFixed(1)}%
                          </div>
                          <div>
                            <span className="text-gray-500">Ventas Totales:</span> ${Number(user?.totalSales || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openUserModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "sales" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas Recientes</h3>
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div key={sale._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{sale.description}</h4>
                        <p className="text-sm text-gray-500">
                          {sale.sellerName} - {sale.planName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cliente: {sale.customerInfo.name} - {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">${Number(sale?.planPrice || 0).toFixed(2)}</div>
                        <div className="text-sm text-green-600">Comisión: ${Number(sale?.commission || 0).toFixed(2)}</div>
  <span
    className={`block mb-1 px-2 py-1 text-xs rounded-full ${
      sale.status === "completed"
        ? "bg-green-100 text-green-800"
        : sale.status === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : sale.status === "cancelled"
        ? "bg-red-100 text-red-800"
        : sale.status === "installed"
        ? "bg-blue-100 text-blue-800"
        : sale.status === "pending_appointment"
        ? "bg-purple-100 text-purple-800"
        : sale.status === "appointed"
        ? "bg-indigo-100 text-indigo-800"
        : "bg-gray-100 text-gray-800"
    }`}
  >
    {getStatusText(sale.status)}
  </span>

  {/* Select para cambiar estado */}
<select
  value={sale.status}
  onChange={(e) => handleStatusChange(sale._id, e.target.value)}
  className="text-xs rounded px-2 py-1 border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
>
  {STATUS_KEYS.map((key) => (
    <option key={key} value={key}>
      {getStatusText(key)}
    </option>
  ))}
</select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{editingPlan ? "Editar Plan" : "Nuevo Plan"}</h3>

            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Características</label>
                {planForm.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Característica del plan"
                    />
                    {planForm.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addFeature} className="text-blue-600 hover:text-blue-800 text-sm">
                  + Agregar característica
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingPlan ? "Actualizar" : "Crear"} Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Vendedor: {editingUser?.name}</h3>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input
                  type="text"
                  value={userForm.location}
                  onChange={(e) => setUserForm({ ...userForm, location: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comisión (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1001231"
                  value={userForm.commissionRate}
                  onChange={(e) => setUserForm({ ...userForm, commissionRate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userForm.isActive}
                    onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Usuario Activo</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Actualizar Vendedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
