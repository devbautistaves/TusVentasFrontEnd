const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tusventasbackend.onrender.com"

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

  const data = await response.json().catch(() => ({ success: false, message: "Error de conexion" }))

  if (!response.ok) {
    throw new Error(data.message || data.error || "Error en la solicitud")
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
}

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

  updateStatus: (token: string, id: string, status: string, notes?: string) =>
    fetchAPI<{ success: boolean; sale: Sale }>(`/api/admin/sales/${id}/status`, {
      method: "PUT",
      token,
      body: JSON.stringify({ status, notes }),
    }),

  getAdminSales: (token: string) =>
    fetchAPI<{ success: boolean; sales: Sale[] }>("/api/admin/sales", { token }),
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
  role: "seller" | "admin"
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
  role: "seller" | "admin"
}

export interface Sale {
  _id: string
  sellerId: string
  sellerName: string
  planId: string
  planName: string
  planPrice: number
  commission: number
  commissionRate: number
  description: string
  status: "pending" | "completed" | "cancelled" | "installed" | "pending_appointment" | "appointed"
  statusHistory: StatusHistoryItem[]
  customerInfo: CustomerInfo
  createdAt: string
  updatedAt: string
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
  address: {
    street: string
    number: string
    city: string
    province: string
    postalCode: string
  }
}

export interface CreateSaleData {
  planId: string
  description: string
  customerInfo: CustomerInfo
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
  roomId: string
  senderId: string
  senderName: string
  content: string
  attachments?: string[]
  createdAt: string
}
