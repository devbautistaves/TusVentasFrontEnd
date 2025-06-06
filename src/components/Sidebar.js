"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { FiHome, FiPlus, FiList, FiUser, FiUsers, FiSettings, FiBarChart2, FiPackage } from "react-icons/fi"
import { FiBookOpen } from "react-icons/fi";

const Sidebar = () => {
  const { currentUser } = useAuth()
  const location = useLocation()

  console.log("Sidebar - Current user:", currentUser)
  console.log("Sidebar - User role:", currentUser?.role)
  console.log("Sidebar - Is admin:", currentUser?.role === "admin")

  const isActive = (path) => location.pathname === path

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FiHome,
      roles: ["seller", "admin"],
    },
    {
      name: "Nueva Venta",
      path: "/sales/new",
      icon: FiPlus,
      roles: ["seller", "admin"],
    },
    {
      name: "Historial de Ventas",
      path: "/sales/history",
      icon: FiList,
      roles: ["seller", "admin"],
    },
    {
    name: "Guías y Tutoriales",
    path: "/guides",
    icon: FiBookOpen,
    roles: ["seller", "admin"], // o solo ["seller"] si lo querés exclusivo
  },
];

  const adminMenuItems = [
    {
      name: "Dashboard Admin",
      path: "/admin/dashboard",
      icon: FiBarChart2,
      roles: ["admin"],
    },

  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(currentUser?.role))

  const filteredAdminItems = adminMenuItems.filter((item) => item.roles.includes(currentUser?.role))

  return (
    <div className="bg-white shadow-lg h-screen w-64 fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Sales Management</h2>
        <p className="text-sm text-gray-600">Panel de Vendedor</p>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {currentUser?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-medium text-gray-800">{currentUser?.name || "Usuario"}</p>

            <p className="text-xs text-blue-600 font-medium">
              {currentUser?.role === "admin" ? "Administrador" : "Vendedor"} ({currentUser?.role})
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Menú Principal</h3>
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {currentUser?.role === "admin" && filteredAdminItems.length > 0 && (
          <div className="px-4 mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Administración</h3>
            <ul className="space-y-1">
              {filteredAdminItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? "bg-red-100 text-red-700 border-r-2 border-red-700"
                          : "text-gray-700 hover:bg-red-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Sidebar
