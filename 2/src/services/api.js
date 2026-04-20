import axios from "axios"

// Determine API URL based on environment
const getApiUrl = () => {
  // Production API URL
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_API_URL || "https://tusventasbackend.onrender.com"
  }

  // Development API URL
  return process.env.REACT_APP_API_URL || "https://tusventasbackend.onrender.com"
}

const API_BASE_URL = getApiUrl()

console.log("API Base URL:", API_BASE_URL)

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
      message: error.message,
    })

    // Handle network errors
    if (!error.response) {
      console.error("Network error - API might be down")
      return Promise.reject({
        ...error,
        message: "Error de conexión. Verifica tu conexión a internet.",
      })
    }

    if (error.response?.status === 401) {
      console.warn("Unauthorized - clearing auth data")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      delete api.defaults.headers.common["Authorization"]

      // Only redirect if not already on login page
      if (!window.location.hash.includes("/login")) {
        window.location.hash = "/login"
      }
    }

    return Promise.reject(error)
  },
)

export default api
