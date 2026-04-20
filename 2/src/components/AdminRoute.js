"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()

  console.log("AdminRoute check:", {
    currentUser: currentUser
      ? {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
        }
      : null,
    isAdmin: currentUser?.role === "admin",
    loading,
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!currentUser) {
    console.warn("No user found, redirecting to login")
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== "admin") {
    console.warn("Access denied: User is not an admin", currentUser.role)
    return <Navigate to="/dashboard" replace />
  }

  console.log("Admin access granted")
  return children
}

export default AdminRoute
