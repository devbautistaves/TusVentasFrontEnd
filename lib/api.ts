const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vps-5905394-x.dattaweb.com"

interface FetchOptions extends RequestInit {
  token?: string
  companyId?: string
}

// Funcion para obtener el companyId guardado
// Default es "prosegur" (empresa original del Grupo JV)
function getStoredCompanyId(): string {
  if (typeof window !== "undefined") {
    const companyId = localStorage.getItem("selectedCompanyId") || "prosegur"
    // Compatibilidad: si hay guardado "tusventas" lo tratamos como "prosegur"
    return companyId === "tusventas" ? "prosegur" : companyId
  }
  return "prosegur"
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, companyId, ...fetchOptions } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Company-ID": companyId || getStoredCompanyId(),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  const responseText = await response.text()
  
  let data
  try {
    data = JSON.parse(responseText)
  } catch {
    data = { success: false, message: responseText || "Error de conexion" }
  }

  if (!response.ok) {
    // Solo redirigir a login si el token expiro (401), no en 403 (permisos)
    // El 403 puede ocurrir cuando un rol intenta acceder a endpoints de otro rol
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }
    throw new Error(data.message || data.error || `Error ${response.status}`)
  }

  return data as T
}

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ success: boolean; token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterData) =>
    fetchAPI<{ success: boolean; token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Users
export const usersAPI = {
  getProfile: (token: string) =>
    fetchAPI<{ success: boolean; user: User }>("/api/users/profile", { token }),

  updateProfile: (token: string, data: Partial<User>) =>
    fetchAPI<{ success: boolean; user: User }>("/api/users/profile", {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),

  getAll: (token: string) =>
    fetchAPI<{ success: boolean; users: User[] }>("/api/admin/users", { token }),

  create: (token: string, data: CreateUserData) =>
    fetchAPI<{ success: boolean; user: User }>("/api/admin/users", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  update: (token: string, id: string, data: Partial<User>) =>
    fetchAPI<{ success: boolean; user: User }>(`/api/admin/users/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),

  delete: (token: string, id: string) =>
    fetchAPI<{ success: boolean }>(`/api/admin/users/${id}`, {
      method: "DELETE",
      token,
    }),

  // Para supervisores: obtener lista de vendedores
  getSellers: (token: string) =>
    fetchAPI<{ success: boolean; sellers: User[] }>("/api/sellers", { token }),
}

// Alias for convenience
export const userAPI = usersAPI

// Sales
export const salesAPI = {
  getAll: (token: string) =>
    fetchAPI<{ success: boolean; sales: Sale[] }>("/api/sales", { token }),

  getMySales: (token: string) =>
    fetchAPI<{ success: boolean; sales: Sale[] }>("/api/sales", { token }),

  create: (token: string, data: CreateSaleData) =>
    fetchAPI<{ success: boolean; sale: Sale }>("/api/sales", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  updateStatus: (token: string, id: string, status: string, notes?: string, statusDate?: string, ctoNumber?: string, appointmentSlot?: string) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}/status`, {
      method: "PUT",
      token,
      body: JSON.stringify({ status, notes, statusDate, ctoNumber, appointmentSlot }),
    }),

  getAdminSales: (token: string) =>
    fetchAPI<{ success: boolean; sales: Sale[] }>("/api/admin/sales", { token }),

  updateCosts: (token: string, id: string, costs: { installationCost?: number; adminCost?: number; adCost?: number; sellerCommissionPaid?: number }) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}/costs`, {
      method: "PUT",
      token,
      body: JSON.stringify(costs),
    }),

  assignSeller: (token: string, id: string, sellerId: string) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/sales/${id}/assign`, {
      method: "PUT",
      token,
      body: JSON.stringify({ sellerId }),
    }),

  update: (token: string, id: string, data: Partial<Sale>) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),
  
  updateContract: (token: string, id: string, contractNumber: string) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}/contract`, {
      method: "PUT",
      token,
      body: JSON.stringify({ contractNumber }),
    }),

  // Marcar venta como baja (usa el endpoint de update general)
  markAsBaja: (token: string, id: string, bajaData: { bajaDate: string; bajaMonthsLimit: number; bajaReason?: string; bajaAmount?: number }) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify({ ...bajaData, isBaja: true }),
    }),

  // Quitar estado de baja
  removeBaja: (token: string, id: string) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify({ isBaja: false, bajaDate: null, bajaMonthsLimit: null, bajaReason: null, bajaAmount: null }),
    }),

  // Subir archivo adjunto de instalacion
  uploadAttachment: async (token: string, saleId: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    
    const response = await fetch(`${API_URL}/api/sales/${saleId}/attachments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Error uploading file")
    }
    
    return response.json() as Promise<{ success: boolean; attachment: InstallationAttachment; sale: Sale }>
  },

  // Eliminar archivo adjunto
  deleteAttachment: (token: string, saleId: string, attachmentId: string) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/sales/${saleId}/attachments/${attachmentId}`, {
      method: "DELETE",
      token,
    }),
}

// Plans
export const plansAPI = {
  getAll: (token: string) =>
    fetchAPI<{ success: boolean; plans: Plan[] }>("/api/plans", { token }),

  create: (token: string, data: CreatePlanData) =>
    fetchAPI<{ success: boolean; plan: Plan }>("/api/admin/plans", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  update: (token: string, id: string, data: Partial<Plan>) =>
    fetchAPI<{ success: boolean; plan: Plan }>(`/api/admin/plans/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),

  delete: (token: string, id: string) =>
    fetchAPI<{ success: boolean }>(`/api/admin/plans/${id}`, {
      method: "DELETE",
      token,
    }),
}

// Dashboard
export const dashboardAPI = {
  getStats: (token: string) =>
    fetchAPI<DashboardStats>("/api/dashboard/stats", { token }),

  getAdminStats: (token: string) =>
    fetchAPI<AdminStats>("/api/admin/stats", { token }),
}

// Support - endpoints que permiten acceso tipo admin para rol support
// El backend debe configurar estos endpoints para aceptar rol "support" ademas de "admin"
export const supportAPI = {
  // Obtener todas las ventas - usa endpoint admin con token de support
  getSales: async (token: string): Promise<{ success: boolean; sales: Sale[] }> => {
    const response = await fetch(`${API_URL}/api/admin/sales`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    if (!response.ok) {
      console.error("Support getSales failed:", response.status)
      throw new Error("Error al obtener ventas")
    }
    return response.json()
  },

  // Obtener usuarios - usa endpoint admin con token de support
  getUsers: async (token: string): Promise<{ success: boolean; users: User[] }> => {
    const response = await fetch(`${API_URL}/api/admin/users`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    if (!response.ok) {
      console.error("Support getUsers failed:", response.status)
      return { success: true, users: [] }
    }
    return response.json()
  },

  // Obtener planes - usa endpoint general /api/plans
  getPlans: async (token: string): Promise<{ success: boolean; plans: Plan[] }> => {
    const response = await fetch(`${API_URL}/api/plans`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    if (!response.ok) {
      console.error("Support getPlans failed:", response.status)
      return { success: true, plans: [] }
    }
    return response.json()
  },

  // Actualizar estado de venta - usa endpoint admin
  updateSaleStatus: async (token: string, id: string, status: string, notes?: string, statusDate?: string, ctoNumber?: string, appointmentSlot?: string) => {
    const response = await fetch(`${API_URL}/api/admin/sales/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status, notes, statusDate, ctoNumber, appointmentSlot }),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error al actualizar estado" }))
      throw new Error(error.message || "Error al actualizar estado")
    }
    return response.json()
  },

  // Actualizar costos de venta - usa endpoint admin
  updateSaleCosts: async (token: string, id: string, costs: { installationCost?: number; adminCost?: number; adCost?: number; sellerCommissionPaid?: number }) => {
    const response = await fetch(`${API_URL}/api/admin/sales/${id}/costs`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(costs),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error al actualizar costos" }))
      throw new Error(error.message || "Error al actualizar costos")
    }
    return response.json()
  },

  // Asignar vendedor - usa endpoint admin
  assignSeller: async (token: string, id: string, sellerId: string) => {
    const response = await fetch(`${API_URL}/api/admin/sales/${id}/assign`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ sellerId }),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error al asignar vendedor" }))
      throw new Error(error.message || "Error al asignar vendedor")
    }
    return response.json()
  },

  // Crear venta - usa endpoint admin
  createSale: async (token: string, data: CreateSaleData) => {
    const response = await fetch(`${API_URL}/api/admin/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error al crear venta" }))
      throw new Error(error.message || "Error al crear venta")
    }
    return response.json()
  },

  // Dashboard stats para support - usa endpoint admin
  getStats: async (token: string) => {
    const response = await fetch(`${API_URL}/api/admin/stats`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error("Error al obtener estadisticas")
    }
    return response.json()
  },
}

// Notifications
export const notificationsAPI = {
  getAll: (token: string) =>
    fetchAPI<{ success: boolean; notifications: Notification[] }>("/api/notifications", { token }),

  getUnreadCount: (token: string) =>
    fetchAPI<{ success: boolean; count: number }>("/api/notifications/unread-count", { token }),

  markAsRead: (token: string, id: string) =>
    fetchAPI<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: "PUT",
      token,
    }),

  markAllAsRead: (token: string) =>
    fetchAPI<{ success: boolean }>("/api/notifications/mark-all-read", {
      method: "PUT",
      token,
    }),
}

// Announcements (Admin) - Uses multipart/form-data for file uploads
export const announcementsAPI = {
  create: async (token: string, data: CreateAnnouncementData, files?: File[]) => {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("message", data.message)
    formData.append("type", data.type || "info")
    formData.append("priority", data.priority || "medium")
    formData.append("recipientType", data.recipientType || "all")
    
    if (data.recipients && data.recipients.length > 0) {
      formData.append("recipients", JSON.stringify(data.recipients))
    }
    
    if (data.meetingInfo) {
      formData.append("meetingInfo", JSON.stringify(data.meetingInfo))
    }
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("attachments", file)
      })
    }

    const response = await fetch(`${API_URL}/api/notifications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error de conexion" }))
      throw new Error(error.message || error.error || "Error en la solicitud")
    }

    return response.json()
  },
}

export interface CreateAnnouncementData {
  title: string
  message: string
  type?: "info" | "warning" | "success" | "meeting" | "material"
  priority?: "low" | "medium" | "high" | "urgent"
  recipientType?: "all" | "selected"
  recipients?: string[]
  meetingInfo?: {
    date: string
    time: string
    link?: string
    location?: string
  }
}

// Supervisor Ad Costs
export const adCostsAPI = {
  // Admin: obtener todos los costos de anuncio
  getAll: (token: string, month?: string, supervisorId?: string) => {
    const params = new URLSearchParams()
    if (month) params.append("month", month)
    if (supervisorId) params.append("supervisorId", supervisorId)
    const queryString = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{ success: boolean; adCosts: SupervisorAdCost[] }>(`/api/admin/ad-costs${queryString}`, { token })
  },

  // Admin: crear o actualizar costo de anuncio
  upsert: (token: string, data: { supervisorId: string; amount: number; month: string; notes?: string }) =>
    fetchAPI<{ success: boolean; adCost: SupervisorAdCost; message: string }>("/api/admin/ad-costs", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  // Admin: eliminar costo de anuncio
  delete: (token: string, id: string) =>
    fetchAPI<{ success: boolean }>(`/api/admin/ad-costs/${id}`, {
      method: "DELETE",
      token,
    }),

  // Supervisor: obtener mis costos de anuncio
  getMyCosts: (token: string, month?: string) => {
    const queryString = month ? `?month=${month}` : ""
    return fetchAPI<{ success: boolean; adCosts: SupervisorAdCost[] }>(`/api/ad-costs/my${queryString}`, { token })
  },
}

// Chat
export const chatAPI = {
  getRooms: (token: string) =>
    fetchAPI<{ success: boolean; rooms: ChatRoom[] }>("/api/chat/rooms", { token }),

  getGroupChat: (token: string) =>
    fetchAPI<{ success: boolean; chatRoom: ChatRoom }>("/api/chat/group", { token }),

  getPrivateAdminChat: (token: string) =>
    fetchAPI<{ success: boolean; chatRoom: ChatRoom }>("/api/chat/private-admin", { token }),

  getPrivateChats: (token: string) =>
    fetchAPI<{ success: boolean; chatRooms: ChatRoom[] }>("/api/chat/private-chats", { token }),

  getMessages: (token: string, roomId: string) =>
    fetchAPI<{ success: boolean; messages: ChatMessage[] }>(`/api/chat/${roomId}/messages`, { token }),

  sendMessage: (token: string, roomId: string, content: string) =>
    fetchAPI<{ success: boolean; data: ChatMessage }>(`/api/chat/${roomId}/messages`, {
      method: "POST",
      token,
      body: JSON.stringify({ content }),
    }),

  getPrivateChat: (token: string, userId: string) =>
    fetchAPI<{ success: boolean; room: ChatRoom }>(`/api/chat/private/${userId}`, { token }),
}

// Leads API - Sistema de embudo de ventas
export const leadsAPI = {
  // Obtener todos los leads (admin/supervisor)
  getAll: (token: string, filters?: { status?: string; assignedTo?: string; source?: string; month?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo)
    if (filters?.source) params.append("source", filters.source)
    if (filters?.month) params.append("month", filters.month)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{ success: boolean; leads: Lead[] }>(`/api/leads${query}`, { token })
  },

  // Obtener leads asignados al vendedor actual
  getMyLeads: (token: string, filters?: { status?: string; source?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.source) params.append("source", filters.source)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{ success: boolean; leads: Lead[] }>(`/api/leads/my${query}`, { token })
  },

  // Obtener un lead por ID
  getById: (token: string, id: string) =>
    fetchAPI<{ success: boolean; lead: Lead }>(`/api/leads/${id}`, { token }),

  // Crear un nuevo lead (admin/supervisor)
  create: (token: string, data: CreateLeadData) =>
    fetchAPI<{ success: boolean; message: string; lead: Lead }>("/api/leads", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  // Actualizar un lead (admin/supervisor)
  update: (token: string, id: string, data: Partial<CreateLeadData> & { status?: LeadStatus; nextFollowUp?: string }) =>
    fetchAPI<{ success: boolean; message: string; lead: Lead }>(`/api/leads/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),

  // Agregar interaccion/contacto al historial
  addContact: (token: string, id: string, data: AddLeadContactData) =>
    fetchAPI<{ success: boolean; message: string; lead: Lead }>(`/api/leads/${id}/contact`, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  // Actualizar estado del lead
  updateStatus: (token: string, id: string, status: LeadStatus, notes?: string) =>
    fetchAPI<{ success: boolean; message: string; lead: Lead }>(`/api/leads/${id}/status`, {
      method: "PUT",
      token,
      body: JSON.stringify({ status, notes }),
    }),

  // Obtener datos para conversion a venta
  getConversionData: (token: string, id: string) =>
    fetchAPI<{
      success: boolean
      message: string
      leadData: {
        leadId: string
        sellerId: string
        customerInfo: {
          name: string
          phone: string
          email: string
          dni: string
          address: Record<string, string>
        }
        interestedPlanId?: string
        interestedPlanName?: string
      }
    }>(`/api/leads/${id}/convert`, { method: "POST", token }),

  // Marcar lead como convertido
  markConverted: (token: string, id: string, saleId: string) =>
    fetchAPI<{ success: boolean; message: string; lead: Lead }>(`/api/leads/${id}/mark-converted`, {
      method: "PUT",
      token,
      body: JSON.stringify({ saleId }),
    }),

  // Eliminar lead (solo admin)
  delete: (token: string, id: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/api/leads/${id}`, {
      method: "DELETE",
      token,
    }),

  // Obtener estadisticas de leads
  getStats: (token: string, filters?: { month?: string; assignedTo?: string }) => {
    const params = new URLSearchParams()
    if (filters?.month) params.append("month", filters.month)
    if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{
      success: boolean
      stats: {
        total: number
        byStatus: Record<string, number>
        conversionRate: number
      }
    }>(`/api/leads/stats/summary${query}`, { token })
  },
}

// Types
export interface User {
  _id: string
  companyId?: "prosegur" | "tupaginaya"
  name: string
  email: string
  phone: string
  location: string
  role: "seller" | "admin" | "supervisor" | "support"
  commissionRate: number
  supervisorBaseCommission?: number
  fixedCommissionPerSale?: number | null
  isActive: boolean
  totalSales: number
  totalCommissions: number
  createdAt: string
  updatedAt: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  location: string
}

export interface CreateUserData {
  companyId: "prosegur" | "tupaginaya"
  name: string
  email: string
  password: string
  phone: string
  location: string
  role: "seller" | "admin" | "supervisor" | "support"
}

export interface Sale {
  _id: string
  sellerId: string | { _id: string; name?: string; email?: string }
  supervisorId?: string | { _id: string; name?: string; email?: string }
  sellerName: string
  planId: string
  planName: string
  planPrice: number
  customPrice?: number
  commission: number
  commissionRate: number
  description: string
  planDetail?: string
  status: "pending" | "pending_signature" | "pending_appointment" | "observed" | "appointed" | "completed" | "cancelled"
  statusHistory: StatusHistoryItem[]
  customerInfo: CustomerInfo
  paymentInfo?: PaymentInfo
  // Campos de costos para supervisor
  installationCost?: number
  adminCost?: number
  adCost?: number
  sellerCommissionPaid?: number
  // Fechas de estados para corte mensual
  appointedDate?: string
  appointmentSlot?: "AM" | "PM"
  completedDate?: string
  installationCostDate?: string
  // Numero de CTO para ventas activadas
  ctoNumber?: string
  // Numero de contrato
  contractNumber?: string
  // Campos para bajas
  isBaja?: boolean
  bajaDate?: string
  bajaMonthsLimit?: number // Meses antes de los cuales se considera baja con descuento (ej: 6 meses)
  bajaReason?: string
  bajaAmount?: number // Importe personalizado a descontar del neto
  // Archivos adjuntos de instalacion
  installationAttachments?: InstallationAttachment[]
  createdAt: string
  updatedAt: string
}

export interface InstallationAttachment {
  _id?: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  uploadedAt: string
  uploadedBy: string
}

export interface PaymentInfo {
  paymentMethodAbono: "credit_card" | "cbu"
  cardBrand?: "visa" | "mastercard"
  cbuNumber?: string
  paymentMethodInstallation: "transfer" | "mercadopago"
}

export interface StatusHistoryItem {
  status: string
  changedBy: string
  changedAt: string
  notes?: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  dni: string
  birthDate?: string
  address: {
    street: string
    number: string
    floor?: string
    apartment?: string
    city: string
    province: string
    postalCode: string
    entreCalles?: string
    googleMapsLink?: string
  }
  emergencyContact?: {
    name: string
    phone: string
  }
}

export interface CreateSaleData {
  planId: string
  description: string
  planDetail?: string
  customPrice?: number
  customerInfo: CustomerInfo
  paymentInfo?: PaymentInfo
  sellerId?: string // Para que admin/supervisor asigne a un vendedor
}

export interface Plan {
  _id: string
  name: string
  description: string
  price: number
  features: string[]
  isActive: boolean
  createdAt: string
}

export interface CreatePlanData {
  name: string
  description: string
  price: number
  features: string[]
}

export interface DashboardStats {
  success: boolean
  stats: {
    totalSales: number
    completedSales: number
    pendingSales: number
    cancelledSales: number
    totalCommissions: number
    monthlySales: number
  }
}

export interface AdminStats {
  success: boolean
  stats: {
    totalSales: number
    totalRevenue: number
    totalCommissions: number
    totalUsers: number
    salesByStatus: Record<string, number>
    topSellers: Array<{
      _id: string
      name: string
      totalSales: number
      totalCommissions: number
    }>
  }
}

export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: "status_change" | "new_sale" | "general"
  isRead: boolean
  saleId?: string
  createdAt: string
}

export interface ChatRoom {
  _id: string
  name: string
  type: "group" | "private"
  participants: string[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  _id: string
  roomId?: string
  chatRoom?: string
  senderId?: string
  sender?: {
    _id: string
    name: string
    role: string
  }
  senderName?: string
  content: string
  attachments?: string[]
  createdAt: string
}

export interface SupervisorAdCost {
  _id: string
  supervisorId: string | { _id: string; name: string; email: string }
  amount: number
  month: string
  notes?: string
  createdBy?: string | { _id: string; name: string }
  updatedBy?: string | { _id: string; name: string }
  createdAt: string
  updatedAt: string
}

// Lead types
export type LeadStatus = "nuevo" | "contactado" | "interesado" | "no_contesta" | "no_interesado" | "seguimiento" | "cerrado_ganado" | "cerrado_perdido"
export type LeadSource = "facebook" | "instagram" | "google" | "referido" | "llamada_entrante" | "puerta_a_puerta" | "otro"
export type LeadPriority = "baja" | "media" | "alta" | "urgente"
export type ContactType = "llamada" | "whatsapp" | "email" | "visita" | "otro"
export type ContactOutcome = "contactado" | "no_contesta" | "interesado" | "no_interesado" | "agendar_seguimiento" | "cerrar"

export interface LeadContact {
  _id?: string
  type: ContactType
  date: string
  notes?: string
  outcome: ContactOutcome
  nextAction?: string
  nextActionDate?: string
  recordedBy?: string | { _id: string; name: string }
}

export interface Lead {
  _id: string
  name: string
  phone: string
  email?: string
  dni?: string
  address?: {
    street?: string
    number?: string
    city?: string
    province?: string
    postalCode?: string
  }
  source: LeadSource
  sourceDetail?: string
  assignedTo: string | { _id: string; name: string; email?: string; phone?: string }
  assignedBy: string | { _id: string; name: string }
  assignedAt: string
  status: LeadStatus
  priority: LeadPriority
  interestedPlanId?: string | { _id: string; name: string; price: number }
  interestedPlanName?: string
  contactHistory: LeadContact[]
  nextFollowUp?: string
  notes?: string
  convertedToSaleId?: string
  convertedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLeadData {
  name: string
  phone: string
  email?: string
  dni?: string
  address?: {
    street?: string
    number?: string
    city?: string
    province?: string
    postalCode?: string
  }
  source?: LeadSource
  sourceDetail?: string
  assignedTo: string
  priority?: LeadPriority
  interestedPlanId?: string
  notes?: string
}

export interface AddLeadContactData {
  type: ContactType
  notes?: string
  outcome: ContactOutcome
  nextAction?: string
  nextActionDate?: string
}

// ========================================
// TUPAGINAYA - Tipos e Interfaces
// ========================================

export type ClientStatus = "demo_pendiente" | "demo_enviada" | "web_pendiente" | "web_activada" | "web_pausada" | "cliente_baja"
export type WebType = "landing" | "ecommerce" | "catalogo" | "institucional" | "blog" | "otro"
export type PaymentMethod = "efectivo" | "transferencia" | "mercadopago" | "tarjeta" | "otro"
export type PaymentStatus = "pendiente" | "pagado" | "vencido" | "anulado"
export type TransactionType = "ingreso" | "egreso"
export type LiquidationStatus = "pendiente" | "pagado" | "anulado"

export interface SocialNetworks {
  instagram?: string
  facebook?: string
  tiktok?: string
  website?: string
  other?: string
}

export interface Client {
  _id: string
  companyId: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  dni?: string
  // Datos del negocio
  businessName: string
  businessType?: string
  whatTheySell?: string
  // Redes sociales y archivos
  socialNetworks?: SocialNetworks
  flyerUrl?: string
  logoUrl?: string
  // Datos de la web
  domain?: string
  demoUrl?: string
  liveUrl?: string
  webType: WebType
  hostingPlan?: string
  // Comprobante de pago
  paymentProofUrl?: string
  // Estado
  status: ClientStatus
  activationDate?: string
  cancellationDate?: string
  cancellationReason?: string
  // Precios
  monthlyPrice: number
  setupPrice: number
  billingDay: number
  // Relaciones
  sellerId?: string | { _id: string; name: string; email?: string }
  saleId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Datos para crear una demo
export interface CreateDemoData {
  name: string
  phone?: string
  businessName: string
  businessType?: string
  whatTheySell?: string
  socialNetworks?: SocialNetworks
  flyerUrl?: string
  logoUrl?: string
  notes?: string
}

// Datos para convertir demo a venta
export interface ConvertDemoData {
  name?: string
  email: string
  whatsapp: string
  domain: string
  monthlyPrice: number
  setupPrice: number
  paymentProofUrl?: string
  activateNow?: boolean
}

// Datos completos para crear un cliente
export interface CreateClientData {
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  dni?: string
  businessName: string
  businessType?: string
  whatTheySell?: string
  socialNetworks?: SocialNetworks
  flyerUrl?: string
  logoUrl?: string
  domain?: string
  demoUrl?: string
  webType?: WebType
  hostingPlan?: string
  monthlyPrice?: number
  setupPrice?: number
  billingDay?: number
  paymentProofUrl?: string
  sellerId?: string
  notes?: string
}

// Estadisticas de clientes
export interface ClientStats {
  total: number
  demoPendiente: number
  demoEnviada: number
  webPendiente: number
  webActivada: number
  webPausada: number
  clienteBaja: number
  setupsThisMonth: number
  setupsCount: number
  mrr: number
}

export interface Payment {
  _id: string
  companyId: string
  clientId: string | Client
  amount: number
  period: string
  paymentDate: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  notes?: string
  recordedBy?: string | { _id: string; name: string }
  createdAt: string
}

export interface Transaction {
  _id: string
  companyId: string
  type: TransactionType
  category: string
  amount: number
  description: string
  date: string
  clientId?: string | { _id: string; name: string; businessName?: string }
  paymentId?: string
  recordedBy: string | { _id: string; name: string }
  notes?: string
  createdAt: string
}

export interface Liquidation {
  _id: string
  companyId: string
  userId: string | { _id: string; name: string; email?: string }
  period: string
  totalAmount: number
  details: Array<{
    saleId?: string
    amount: number
    description: string
  }>
  status: LiquidationStatus
  paidAt?: string
  paidBy?: string | { _id: string; name: string }
  paymentMethod?: PaymentMethod
  notes?: string
  createdBy: string | { _id: string; name: string }
  createdAt: string
}

export interface CollectionItem {
  client: Client
  daysOverdue: number
  lastBillingDate: string
  amountDue: number
}

// ========================================
// TUPAGINAYA - APIs
// ========================================

// Clients API
export const clientsAPI = {
  getAll: (token: string, filters?: { status?: string; sellerId?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.sellerId) params.append("sellerId", filters.sellerId)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{ success: boolean; clients: Client[] }>(`/api/clients${query}`, { token })
  },

  // Obtener clientes asignados al vendedor actual
  getMyClients: (token: string, filters?: { status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{ success: boolean; clients: Client[] }>(`/api/clients/my${query}`, { token })
  },

  getById: (token: string, id: string) =>
    fetchAPI<{ success: boolean; client: Client }>(`/api/clients/${id}`, { token }),

  // Crear una nueva demo
  createDemo: (token: string, data: CreateDemoData) =>
    fetchAPI<{ success: boolean; client: Client }>("/api/clients/demo", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  create: (token: string, data: CreateClientData) =>
    fetchAPI<{ success: boolean; client: Client }>("/api/clients", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  update: (token: string, id: string, data: Partial<Client>) =>
    fetchAPI<{ success: boolean; client: Client }>(`/api/clients/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),

  // Cambiar estado del cliente
  updateStatus: (token: string, id: string, status: ClientStatus) =>
    fetchAPI<{ success: boolean; client: Client }>(`/api/clients/${id}/status`, {
      method: "PUT",
      token,
      body: JSON.stringify({ status }),
    }),

  // Convertir demo a venta
  convertDemo: (token: string, id: string, data: ConvertDemoData) =>
    fetchAPI<{ success: boolean; client: Client }>(`/api/clients/${id}/convert`, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  // Estadisticas de clientes
  getStats: (token: string) =>
    fetchAPI<{ success: boolean; stats: ClientStats }>("/api/clients/stats/summary", { token }),

  getPayments: (token: string, clientId: string) =>
    fetchAPI<{ success: boolean; payments: Payment[] }>(`/api/clients/${clientId}/payments`, { token }),

  addPayment: (token: string, clientId: string, data: { amount: number; period: string; paymentMethod?: string; paymentDate?: string; notes?: string }) =>
    fetchAPI<{ success: boolean; payment: Payment }>(`/api/clients/${clientId}/payments`, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
}

// Collections API (Cobranzas)
export const collectionsAPI = {
  getAll: (token: string) =>
    fetchAPI<{ success: boolean; collections: CollectionItem[] }>("/api/collections", { token }),

  sendReminder: (token: string, clientId: string, type: "5_dias" | "15_dias" | "30_dias" | "manual") =>
    fetchAPI<{ success: boolean; emailSent: boolean }>(`/api/collections/send-reminder/${clientId}`, {
      method: "POST",
      token,
      body: JSON.stringify({ type }),
    }),
}

// Transactions API
export const transactionsAPI = {
  getAll: (token: string, filters?: { type?: string; month?: string; category?: string }) => {
    const params = new URLSearchParams()
    if (filters?.type) params.append("type", filters.type)
    if (filters?.month) params.append("month", filters.month)
    if (filters?.category) params.append("category", filters.category)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{ success: boolean; transactions: Transaction[] }>(`/api/transactions${query}`, { token })
  },

  create: (token: string, data: { type: TransactionType; category: string; amount: number; description: string; date?: string; clientId?: string; notes?: string }) =>
    fetchAPI<{ success: boolean; transaction: Transaction }>("/api/transactions", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  getSummary: (token: string, month?: string) => {
    const query = month ? `?month=${month}` : ""
    return fetchAPI<{ success: boolean; summary: { ingresos: number; egresos: number; balance: number } }>(`/api/transactions/summary${query}`, { token })
  },

  delete: (token: string, id: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/api/transactions/${id}`, {
      method: "DELETE",
      token,
    }),
}

// Liquidations API
export const liquidationsAPI = {
  getAll: (token: string, filters?: { userId?: string; period?: string; status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.userId) params.append("userId", filters.userId)
    if (filters?.period) params.append("period", filters.period)
    if (filters?.status) params.append("status", filters.status)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{ success: boolean; liquidations: Liquidation[] }>(`/api/liquidations${query}`, { token })
  },

  create: (token: string, data: { userId: string; period: string; totalAmount: number; details?: Array<{ saleId?: string; amount: number; description: string }>; notes?: string }) =>
    fetchAPI<{ success: boolean; liquidation: Liquidation }>("/api/liquidations", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  pay: (token: string, id: string, data: { paymentMethod: string; notes?: string }) =>
    fetchAPI<{ success: boolean; liquidation: Liquidation }>(`/api/liquidations/${id}/pay`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),
}

// Companies API
export const companiesAPI = {
  getAll: (token: string) =>
    fetchAPI<{ success: boolean; companies: Array<{ id: string; name: string; displayName: string; isActive: boolean }> }>("/api/companies", { token }),
}

// Advances (Adelantos) API - Adelantos de dinero que se descuentan de la comision
export interface Advance {
  _id: string
  userId: string | { _id: string; name: string; email: string; role: string }
  amount: number
  date: string
  month: string // Mes al que se aplica el descuento (formato YYYY-MM)
  reason: string
  createdBy: string | { _id: string; name: string }
  createdAt: string
  updatedAt: string
}

export const advancesAPI = {
  // Admin: obtener todos los adelantos
  getAll: (token: string, month?: string, userId?: string) => {
    const params = new URLSearchParams()
    if (month) params.append("month", month)
    if (userId) params.append("userId", userId)
    const queryString = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{ success: boolean; advances: Advance[] }>(`/api/admin/advances${queryString}`, { token })
  },

  // Admin: crear adelanto
  create: (token: string, data: { userId: string; amount: number; date: string; month: string; reason: string }) =>
    fetchAPI<{ success: boolean; advance: Advance; message: string }>("/api/admin/advances", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  // Admin: eliminar adelanto
  delete: (token: string, id: string) =>
    fetchAPI<{ success: boolean }>(`/api/admin/advances/${id}`, {
      method: "DELETE",
      token,
    }),

  // Usuario: obtener mis adelantos
  getMine: (token: string, month?: string) => {
    const queryString = month ? `?month=${month}` : ""
    return fetchAPI<{ success: boolean; advances: Advance[] }>(`/api/advances/my${queryString}`, { token })
  },
}

// Liquidation Email API - Envio de liquidaciones por email y gestion de facturas
export interface LiquidationEmailRecord {
  _id: string
  userId: string | { _id: string; name: string; email: string }
  period: string
  totalAmount: number
  emailSentTo: string
  emailSentAt: string
  sentBy: string | { _id: string; name: string }
  invoiceUploaded: boolean
  invoiceUrl?: string
  invoiceUploadedAt?: string
  invoiceStatus: "pending" | "uploaded" | "processed" | "paid"
  paymentDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export const liquidationEmailsAPI = {
  // Enviar liquidacion por email
  sendEmail: (token: string, data: { userId: string; period: string; totalAmount: number; liquidationHtml?: string; pdfBase64?: string }) =>
    fetchAPI<{ success: boolean; message: string; liquidationEmailId: string }>("/api/liquidations/send-email", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  // Obtener liquidaciones enviadas
  getAll: (token: string, filters?: { userId?: string; period?: string }) => {
    const params = new URLSearchParams()
    if (filters?.userId) params.append("userId", filters.userId)
    if (filters?.period) params.append("period", filters.period)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchAPI<{ success: boolean; liquidationEmails: LiquidationEmailRecord[] }>(`/api/liquidations/emails${query}`, { token })
  },

  // Subir factura
  uploadInvoice: async (token: string, id: string, file: File) => {
    const formData = new FormData()
    formData.append("invoice", file)
    
    const response = await fetch(`${API_BASE_URL}/api/liquidations/emails/${id}/upload-invoice`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error uploading invoice")
    }
    
    return response.json() as Promise<{ success: boolean; message: string; invoiceUrl: string }>
  },

  // Actualizar estado de factura
  updateStatus: (token: string, id: string, data: { invoiceStatus: string; paymentDate?: string; notes?: string }) =>
    fetchAPI<{ success: boolean; liquidationEmail: LiquidationEmailRecord }>(`/api/liquidations/emails/${id}/status`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),
}
