"use client"

import { createContext, useState, useEffect, useContext } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is logged in on page load
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user)

        // Validate user data
        if (parsedUser && parsedUser.id && parsedUser.email) {
          console.log("User found in localStorage:", parsedUser.email, "Role:", parsedUser.role)
          setCurrentUser(parsedUser)

          // Verify token is still valid by making a test request
          api
            .get("/api/users/profile")
            .then((response) => {
              if (response.data.success) {
                console.log("Token verified successfully")
              }
            })
            .catch((error) => {
              console.warn("Token verification failed, logging out")
              localStorage.removeItem("token")
              localStorage.removeItem("user")
              delete api.defaults.headers.common["Authorization"]
              setCurrentUser(null)
            })

          api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        } else {
          console.warn("Invalid user data in localStorage")
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await api.post("/api/auth/login", { email, password })

      if (response.data.success) {
        const { token, user } = response.data
        console.log("Login successful:", user.email, "Role:", user.role)
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        setCurrentUser(user)
        return true
      } else {
        setError(response.data.error || "Login failed")
        return false
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Login failed. Please try again.")
      return false
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await api.post("/api/auth/register", userData)

      if (response.data.success) {
        const { token, user } = response.data
        console.log("Registration successful:", user.email, "Role:", user.role)
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        setCurrentUser(user)
        return true
      } else {
        setError(response.data.error || "Registration failed")
        return false
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Registration failed. Please try again.")
      return false
    }
  }

  const logout = () => {
    console.log("Logging out user")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    delete api.defaults.headers.common["Authorization"]
    setCurrentUser(null)
  }

  const updateProfile = async (profileData) => {
    try {
      setError(null)
      const response = await api.put("/api/users/profile", profileData)

      if (response.data.success) {
        const updatedUser = response.data.user
        console.log("Profile updated:", updatedUser.email, "Role:", updatedUser.role)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setCurrentUser(updatedUser)
        return true
      } else {
        setError(response.data.error || "Profile update failed")
        return false
      }
    } catch (err) {
      console.error("Profile update error:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Profile update failed. Please try again.")
      return false
    }
  }

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    setError,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
