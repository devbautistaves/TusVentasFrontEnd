"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import {
  FiBell,
  FiCalendar,
  FiFileText,
  FiDownload,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiVideo,
  FiUsers,
} from "react-icons/fi"
import LoadingSpinner from "../components/LoadingSpinner"

const Training = () => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/notifications?unreadOnly=${filter === "unread"}`)
      if (response.data.success) {
        setNotifications(response.data.notifications)
      }
    } catch (err) {
      setError("Error al cargar las notificaciones")
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/api/notifications/unread-count")
      if (response.data.success) {
        setUnreadCount(response.data.count)
      }
    } catch (err) {
      console.error("Error fetching unread count:", err)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`)
      fetchNotifications()
      fetchUnreadCount()
    } catch (err) {
      console.error("Error marking as read:", err)
    }
  }
function NotificationAttachments({ notification }) {
  if (!notification.attachments || notification.attachments.length === 0) {
    return <p>No hay archivos adjuntos.</p>;
  }

  return (
    <div>
      {notification.attachments.map((attachment) => (
        <div key={attachment._id} style={{ marginBottom: 10 }}>

          <img
            src={attachment.url}
            alt={attachment.originalName}
            style={{ maxWidth: '300px', maxHeight: '300px' }}
          />
        </div>
      ))}
    </div>
  );
}
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-100"
      case "high":
        return "text-orange-600 bg-orange-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "meeting":
        return <FiVideo className="h-5 w-5" />
      case "document":
        return <FiFileText className="h-5 w-5" />
      case "announcement":
        return <FiBell className="h-5 w-5" />
      case "training":
        return <FiUsers className="h-5 w-5" />
      default:
        return <FiAlertCircle className="h-5 w-5" />
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Centro de Entrenamiento</h1>
        <p className="text-gray-600">Notificaciones, documentos y reuniones para tu desarrollo</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setFilter("all")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Todas las Notificaciones
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                filter === "unread"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              No Leídas
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">{unreadCount}</span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <FiBell className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No hay notificaciones</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const userRecipient = notification.userRecipient
            const isRead = userRecipient?.read

            return (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow border-l-4 p-6 ${
                  isRead ? "border-gray-300" : "border-blue-500"
                } ${!isRead ? "bg-blue-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority.toUpperCase()}
                        </span>
                        {!isRead && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            NUEVO
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3">{notification.message}</p>

                      {/* Meeting Info */}
{/* Meeting Info */}
{notification.meetingInfo?.date && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
    <div className="flex items-center space-x-2 mb-2">
      <FiCalendar className="h-4 w-4 text-blue-600" />
      <span className="font-medium text-blue-900">Información de la Reunión</span>
    </div>
    <div className="space-y-1 text-sm text-blue-800">
      <p>
        <strong>Fecha:</strong> {new Date(notification.meetingInfo.date).toLocaleString()}
      </p>
      <p>
        <strong>Plataforma:</strong> {notification.meetingInfo.platform}
      </p>
      <p>
        <strong>Duración:</strong> {notification.meetingInfo.duration} minutos
      </p>
      {notification.meetingInfo.link && (
        <a
          href={notification.meetingInfo.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
        >
          <FiVideo className="h-4 w-4" />
          <span>Unirse a la reunión</span>
        </a>
      )}
    </div>
  </div>
)}

                     {notification.attachments && notification.attachments.length > 0 && (
  <div className="space-y-2 mt-4">
    <h4 className="font-medium text-gray-900">Archivos adjuntos:</h4>

{notification && <NotificationAttachments notification={notification} />}

  </div>
)}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <FiClock className="h-4 w-4" />
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>

                        {!isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-800 font-medium text-sm"
                          >
                            <FiCheckCircle className="h-4 w-4" />
                            <span>Marcar como leído</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Training
