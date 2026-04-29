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

// Empresas predefinidas
export const COMPANIES: Company[] = [
  {
    id: "tusventas",
    name: "TusVentas",
    displayName: "TusVentas - Internet",
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
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

const STORAGE_KEY = "selectedCompanyId"

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company>(COMPANIES[0])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar empresa guardada
    const savedCompanyId = localStorage.getItem(STORAGE_KEY)
    if (savedCompanyId) {
      const company = COMPANIES.find((c) => c.id === savedCompanyId)
      if (company && company.isActive) {
        setCurrentCompany(company)
      }
    }
    setIsLoading(false)
  }, [])

  const switchCompany = (companyId: string) => {
    const company = COMPANIES.find((c) => c.id === companyId)
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
        companies: COMPANIES.filter((c) => c.isActive),
        switchCompany,
        isLoading,
        getStatusLabel,
        getStatusColor,
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
