const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vps-5905394-x.dattaweb.com"

interface FetchOptions extends RequestInit {
  token?: string
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
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
    // Si el token expiro o es invalido, limpiar sesion y redirigir
    if (response.status === 401 || response.status === 403) {
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

  updateStatus: (token: string, id: string, status: string, notes?: string, statusDate?: string) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}/status`, {
      method: "PUT",
      token,
      body: JSON.stringify({ status, notes, statusDate }),
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
export const supportAPI = {
  // Obtener todas las ventas (usa el mismo endpoint que admin pero con fallback)
  getSales: async (token: string): Promise<{ success: boolean; sales: Sale[] }> => {
    try {
      // Primero intentar endpoint de support
      const response = await fetch(`${API_URL}/api/support/sales`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      if (response.ok) {
        return response.json()
      }
      // Si no existe, intentar endpoint de admin
      return fetchAPI<{ success: boolean; sales: Sale[] }>("/api/admin/sales", { token })
    } catch {
      // Fallback final
      return fetchAPI<{ success: boolean; sales: Sale[] }>("/api/admin/sales", { token })
    }
  },

  // Obtener usuarios (usa el mismo endpoint que admin)
  getUsers: async (token: string): Promise<{ success: boolean; users: User[] }> => {
    try {
      const response = await fetch(`${API_URL}/api/support/users`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      if (response.ok) {
        return response.json()
      }
      return fetchAPI<{ success: boolean; users: User[] }>("/api/admin/users", { token })
    } catch {
      return fetchAPI<{ success: boolean; users: User[] }>("/api/admin/users", { token })
    }
  },

  // Actualizar estado de venta
  updateSaleStatus: (token: string, id: string, status: string, notes?: string, statusDate?: string) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/support/sales/${id}/status`, {
      method: "PUT",
      token,
      body: JSON.stringify({ status, notes, statusDate }),
    }).catch(() => 
      // Fallback a endpoint de admin
      fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}/status`, {
        method: "PUT",
        token,
        body: JSON.stringify({ status, notes, statusDate }),
      })
    ),

  // Actualizar costos de venta
  updateSaleCosts: (token: string, id: string, costs: { installationCost?: number; adminCost?: number; adCost?: number; sellerCommissionPaid?: number }) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/support/sales/${id}/costs`, {
      method: "PUT",
      token,
      body: JSON.stringify(costs),
    }).catch(() =>
      fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}/costs`, {
        method: "PUT",
        token,
        body: JSON.stringify(costs),
      })
    ),

  // Asignar vendedor
  assignSeller: (token: string, id: string, sellerId: string) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/support/sales/${id}/assign`, {
      method: "PUT",
      token,
      body: JSON.stringify({ sellerId }),
    }).catch(() =>
      fetchAPI<{ success: boolean; sale: Sale }>(`/api/sales/${id}/assign`, {
        method: "PUT",
        token,
        body: JSON.stringify({ sellerId }),
      })
    ),

  // Crear venta
  createSale: (token: string, data: CreateSaleData) =>
    fetchAPI<{ success: boolean; sale: Sale }>("/api/support/sales", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }).catch(() =>
      fetchAPI<{ success: boolean; sale: Sale }>("/api/sales", {
        method: "POST",
        token,
        body: JSON.stringify(data),
      })
    ),

  // Dashboard stats para support
  getStats: (token: string) =>
    fetchAPI<AdminStats>("/api/support/stats", { token }).catch(() =>
      fetchAPI<AdminStats>("/api/admin/stats", { token })
    ),
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

// Types
export interface User {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  role: "seller" | "admin" | "supervisor" | "support"
  commissionRate: number
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
  status: "pending" | "completed" | "cancelled" | "pending_appointment" | "appointed"
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
  completedDate?: string
  installationCostDate?: string
  createdAt: string
  updatedAt: string
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
