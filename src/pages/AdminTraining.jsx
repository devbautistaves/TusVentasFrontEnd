"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import { FiSend, FiVideo } from "react-icons/fi"

const AdminTraining = () => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    recipientType: "all",
    recipients: [],
    meetingDate: "",
    meetingLink: "",
    meetingPlatform: "zoom",
    meetingDuration: 60,
  })
  const [files, setFiles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")



  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/admin/users")
      if (response.data.success) {
        setUsers(response.data.users)
      }
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const handleRecipientChange = (userId) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.includes(userId)
        ? prev.recipients.filter((id) => id !== userId)
        : [...prev.recipients, userId],
    }))
  }



const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError("")
  setSuccess("")

  try {
    // Crear FormData para multipart/form-data
    const formDataToSend = new FormData()

    // Agregar campos de texto
    formDataToSend.append("title", formData.title)
    formDataToSend.append("message", formData.message)
    formDataToSend.append("type", formData.type)
    formDataToSend.append("priority", formData.priority)
formDataToSend.append("recipientType", formData.recipientType);
formDataToSend.append("recipients", JSON.stringify(
  formData.recipientType === "all" ? [] : formData.recipients
));    formDataToSend.append("meetingInfo", JSON.stringify({
      date: formData.meetingDate,
      link: formData.meetingLink,
      platform: formData.meetingPlatform,
      duration: formData.meetingDuration,
    }))

    // Agregar archivos bajo el campo "attachments"
    files.forEach(file => {
      formDataToSend.append("attachments", file)
    })

    // Enviar al backend con multipart/form-data
    const response = await api.post("/api/notifications", formDataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    if (response.data.success) {
      setSuccess("Notificación enviada exitosamente")
      setFormData({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        recipientType: "all",
        recipients: [],
        meetingDate: "",
        meetingLink: "",
        meetingPlatform: "zoom",
        meetingDuration: 60,
      })
      setFiles([])
      document.getElementById("files").value = ""
    }
  } catch (err) {
    console.error(err)
    setError(err.response?.data?.error || "Error al enviar la notificación")
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administrar Entrenamiento</h1>
        <p className="text-gray-600">Crear notificaciones, subir documentos y programar reuniones</p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Título de la notificación"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="info">Información</option>
                <option value="meeting">Reunión</option>
                <option value="document">Documento</option>
                <option value="announcement">Anuncio</option>
                <option value="training">Entrenamiento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destinatarios</label>
              <select
                name="recipientType"
                value={formData.recipientType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los vendedores</option>
                <option value="specific">Vendedores específicos</option>
              </select>
            </div>
          </div>

          {/* Specific Recipients */}
          {formData.recipientType === "specific" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Vendedores</label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                {users.map((user) => (
                  <label key={user._id} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.recipients.includes(user._id)}
                      onChange={() => handleRecipientChange(user._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {user.name} ({user.email})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contenido del mensaje..."
            />
          </div>

          {/* Meeting Info */}
          {formData.type === "meeting" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                <FiVideo className="mr-2" />
                Información de la Reunión
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    name="meetingDate"
                    value={formData.meetingDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
                  <select
                    name="meetingPlatform"
                    value={formData.meetingPlatform}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="zoom">Zoom</option>
                    <option value="google-meet">Google Meet</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link de la Reunión</label>
                  <input
                    type="url"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duración (minutos)</label>
                  <input
                    type="number"
                    name="meetingDuration"
                    value={formData.meetingDuration}
                    onChange={handleInputChange}
                    min="15"
                    max="480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Archivos Adjuntos</label>
            <input
              type="file"
              id="files"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formatos permitidos: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (máx. 10MB por archivo)
            </p>
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Archivos seleccionados:</p>
                <ul className="text-sm text-gray-600">
                  {files.map((file, index) => (
                    <li key={index}>
                      • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSend className="h-4 w-4" />
              )}
              <span>{loading ? "Enviando..." : "Enviar Notificación"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminTraining
