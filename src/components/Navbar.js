"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { currentUser, logout } = useAuth()

  console.log(
    "Navbar - Current user:",
    currentUser
      ? {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          name: currentUser.name,
        }
      : null,
  )

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-white text-lg font-semibold">
          Sistema de Ventas
        </Link>
        <div className="space-x-4">
          {currentUser ? (
            <>
              <span className="text-gray-300">
                Bienvenido, {currentUser.name} ({currentUser.role})
              </span>
              <button onClick={handleLogout} className="text-white hover:text-gray-300 bg-red-600 px-3 py-1 rounded">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-gray-300">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="text-white hover:text-gray-300">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
