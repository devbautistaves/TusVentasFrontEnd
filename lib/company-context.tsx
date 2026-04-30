"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export interface Company {
  id: string
  name: string
  displayName: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  isActive: boolean
  saleStatuses: SaleStatus[]
  settings: CompanySettings
}

export interface SaleStatus {
  id: string
  label: string
  color: string
  order: number
}

export interface CompanySettings {
  hasCobranzas: boolean
  hasClients: boolean
  hasTransactions: boolean
  hasLiquidations: boolean
  hasMaterials: boolean
  hasLeads: boolean
  emailReminders: boolean
  reminderDays: number[]
}

// Empresas predefinidas del Grupo JV
export const COMPANIES: Company[] = [
  {
    id: "prosegur",
    name: "Prosegur",
    displayName: "Prosegur - Internet",
    primaryColor: "#f59e0b",
    secondaryColor: "#1a1a2e",
    isActive: true,
    saleStatuses: [
      { id: "pending", label: "Cargada", color: "#f59e0b", order: 1 },
      { id: "pending_signature", label: "Pendiente de Firma", color: "#f97316", order: 2 },
      { id: "pending_appointment", label: "Pendiente de Turno", color: "#a855f7", order: 3 },
      { id: "observed", label: "Observada", color: "#d97706", order: 4 },
      { id: "appointed", label: "Turnada", color: "#3b82f6", order: 5 },
      { id: "completed", label: "Instalada", color: "#10b981", order: 6 },
      { id: "cancelled", label: "Cancelada", color: "#ef4444", order: 7 },
    ],
    settings: {
      hasCobranzas: false,
      hasClients: false,
      hasTransactions: false,
      hasLiquidations: true,
      hasMaterials: true,
      hasLeads: true,
      emailReminders: false,
      reminderDays: [],
    },
  },
  {
    id: "tupaginaya",
    name: "TuPaginaYa",
    displayName: "TuPaginaYa - Webs",
    primaryColor: "#3b82f6",
    secondaryColor: "#0f172a",
    isActive: true,
    saleStatuses: [
      { id: "demo_pendiente", label: "Demo Pendiente", color: "#f59e0b", order: 1 },
      { id: "demo_enviada", label: "Demo Enviada", color: "#8b5cf6", order: 2 },
      { id: "web_activada", label: "Web Activada", color: "#10b981", order: 3 },
      { id: "web_pausada", label: "Web Pausada", color: "#6b7280", order: 4 },
      { id: "cliente_baja", label: "Cliente Baja", color: "#ef4444", order: 5 },
    ],
    settings: {
      hasCobranzas: true,
      hasClients: true,
      hasTransactions: true,
      hasLiquidations: true,
      hasMaterials: true,
      hasLeads: true,
      emailReminders: true,
      reminderDays: [5, 15, 30],
    },
  },
]

interface CompanyContextType {
  currentCompany: Company
  companies: Company[]
  switchCompany: (companyId: string) => void
  isLoading: boolean
  getStatusLabel: (statusId: string) => string
  getStatusColor: (statusId: string) => string
  canSwitchCompany: boolean
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

const STORAGE_KEY = "selectedCompanyId"

// Helper para obtener las empresas disponibles segun el rol y companyId del usuario
function getAvailableCompanies(userRole?: string, userCompanyId?: string): Company[] {
  const activeCompanies = COMPANIES.filter((c) => c.isActive)
  
  // Solo admin puede ver todas las empresas activas
  if (userRole === "admin") {
    return activeCompanies
  }
  
  // Vendedores, supervisores y soporte solo pueden ver su empresa asignada
  if (userCompanyId) {
    const assignedCompany = activeCompanies.find((c) => c.id === userCompanyId)
    if (assignedCompany) {
      return [assignedCompany]
    }
  }
  
  // Si no hay empresa asignada, default a prosegur (compatibilidad)
  const defaultCompany = activeCompanies.find((c) => c.id === "prosegur")
  return defaultCompany ? [defaultCompany] : activeCompanies.slice(0, 1)
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company>(COMPANIES[0])
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>(COMPANIES.filter((c) => c.isActive))
  const [canSwitchCompany, setCanSwitchCompany] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const initializeCompany = () => {
    // Obtener datos del usuario desde localStorage
    const userDataString = localStorage.getItem("user")
    let userRole: string | undefined
    let userCompanyId: string | undefined
    
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString)
        userRole = userData.role
        userCompanyId = userData.companyId
      } catch {
        // Error parsing user data
      }
    }
    
    // Calcular empresas disponibles segun rol y companyId
    const companies = getAvailableCompanies(userRole, userCompanyId)
    setAvailableCompanies(companies)
    
    // Verificar si el usuario puede cambiar de empresa
    // Solo admin puede cambiar de empresa
    const canSwitch = userRole === "admin"
    setCanSwitchCompany(canSwitch)
    
    // Cargar empresa guardada o usar la empresa asignada
    const savedCompanyId = localStorage.getItem(STORAGE_KEY)
    
    // Priorizar la empresa asignada para vendedores/supervisores/soporte
    if (!canSwitch && userCompanyId) {
      const assignedCompany = companies.find((c) => c.id === userCompanyId)
      if (assignedCompany) {
        setCurrentCompany(assignedCompany)
        localStorage.setItem(STORAGE_KEY, assignedCompany.id)
        setIsLoading(false)
        return
      }
    }
    
    // Para admin, usar la empresa guardada si es valida
    if (savedCompanyId) {
      const company = companies.find((c) => c.id === savedCompanyId)
      if (company) {
        setCurrentCompany(company)
        setIsLoading(false)
        return
      }
    }
    
    // Default: primera empresa disponible
    if (companies.length > 0) {
      setCurrentCompany(companies[0])
      localStorage.setItem(STORAGE_KEY, companies[0].id)
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    initializeCompany()
    
    // Escuchar cambios en localStorage (para cuando el usuario hace login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === STORAGE_KEY) {
        initializeCompany()
      }
    }
    
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const switchCompany = (companyId: string) => {
    // Solo permitir cambio si el usuario puede hacerlo
    if (!canSwitchCompany) {
      return
    }
    
    const company = availableCompanies.find((c) => c.id === companyId)
    if (company && company.isActive) {
      setCurrentCompany(company)
      localStorage.setItem(STORAGE_KEY, companyId)
      // Recargar la pagina para actualizar todos los datos
      window.location.reload()
    }
  }

  const getStatusLabel = (statusId: string): string => {
    const status = currentCompany.saleStatuses.find((s) => s.id === statusId)
    return status?.label || statusId
  }

  const getStatusColor = (statusId: string): string => {
    const status = currentCompany.saleStatuses.find((s) => s.id === statusId)
    return status?.color || "#6b7280"
  }

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        companies: availableCompanies,
        switchCompany,
        isLoading,
        getStatusLabel,
        getStatusColor,
        canSwitchCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider")
  }
  return context
}
