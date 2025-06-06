import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "quavito79:fTxCH10YJ8FSimQ2@cluster0.wzrxbrq.mongodb.net/"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      console.warn("Unauthorized - clearing auth data")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      delete api.defaults.headers.common["Authorization"]
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

export default api
