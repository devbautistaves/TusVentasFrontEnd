"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, authAPI, usersAPI } from "./api"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const response = await usersAPI.getProfile(authToken)
      setUser(response.user)
    } catch (error) {
      console.error("Error fetching user:", error)
      localStorage.removeItem("token")
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password)
    localStorage.setItem("token", response.token)
    setToken(response.token)
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
