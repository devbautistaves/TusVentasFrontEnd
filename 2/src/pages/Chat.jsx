"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import { FiSend, FiUsers, FiUser, FiMessageCircle, FiClock } from "react-icons/fi"
import LoadingSpinner from "../components/LoadingSpinner"

const Chat = () => {
  const { currentUser } = useAuth()
  const [activeChat, setActiveChat] = useState(null)
  const [chatType, setChatType] = useState("group") // 'group' or 'private'
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [privateChats, setPrivateChats] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    initializeChat()
  }, [chatType])

  useEffect(() => {
    if (activeChat) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
      return () => clearInterval(interval)
    }
  }, [activeChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const initializeChat = async () => {
    try {
      setLoading(true)

      if (chatType === "group") {
        const response = await api.get("/api/chat/group")
        if (response.data.success) {
          setActiveChat(response.data.chatRoom)
        }
      } else {
        if (currentUser.role === "admin") {
          // Admin sees all private chats
          const response = await api.get("/api/chat/private-chats")
          if (response.data.success) {
            setPrivateChats(response.data.chatRooms)
            if (response.data.chatRooms.length > 0) {
              setActiveChat(response.data.chatRooms[0])
            }
          }
        } else {
          // Seller gets private chat with admin
          const response = await api.get("/api/chat/private-admin")
          if (response.data.success) {
            setActiveChat(response.data.chatRoom)
          }
        }
      }
    } catch (err) {
      console.error("Error initializing chat:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!activeChat) return

    try {
      const response = await api.get(`/api/chat/${activeChat._id}/messages`)
      if (response.data.success) {
        setMessages(response.data.messages)
        // Mark messages as read
        await api.put(`/api/chat/${activeChat._id}/read`)
      }
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || sending) return

    setSending(true)
    try {
      const response = await api.post(`/api/chat/${activeChat._id}/messages`, {
        content: newMessage.trim(),
      })

      if (response.data.success) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Chat Type Selector */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setChatType("group")}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium ${
                chatType === "group" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiUsers className="h-4 w-4" />
              <span>Chat Grupal</span>
            </button>
            <button
              onClick={() => setChatType("private")}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium ${
                chatType === "private" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiUser className="h-4 w-4" />
              <span>Chat Privado</span>
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chatType === "group" ? (
            <div className="p-4">
              <div
                className={`p-3 rounded-lg cursor-pointer ${
                  activeChat?.type === "group" ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
                onClick={() => initializeChat()}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FiUsers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Chat Grupal</h3>
                    <p className="text-sm text-gray-500">Equipo de Ventas</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {currentUser.role === "admin" ? (
                privateChats.map((chat) => {
                  const otherUser = chat.participants.find((p) => p._id !== currentUser.id)
                  return (
                    <div
                      key={chat._id}
                      className={`p-3 rounded-lg cursor-pointer ${
                        activeChat?._id === chat._id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveChat(chat)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <FiUser className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{otherUser?.name}</h3>
                          <p className="text-sm text-gray-500">{otherUser?.email}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FiUser className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Chat con Admin</h3>
                      <p className="text-sm text-gray-500">Soporte directo</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${chatType === "group" ? "bg-blue-100" : "bg-green-100"}`}>
                  {chatType === "group" ? (
                    <FiUsers className={`h-5 w-5 ${chatType === "group" ? "text-blue-600" : "text-green-600"}`} />
                  ) : (
                    <FiUser className={`h-5 w-5 ${chatType === "group" ? "text-blue-600" : "text-green-600"}`} />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{activeChat.name}</h2>
                  <p className="text-sm text-gray-500">
                    {chatType === "group" ? `${activeChat.participants?.length} participantes` : "Chat privado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender._id === currentUser.id
                const showDate =
                  index === 0 || formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt)

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {!isOwnMessage && chatType === "group" && (
                          <p className="text-xs font-medium mb-1 opacity-75">{message.sender.name}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={`flex items-center space-x-1 mt-1 ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <FiClock className="h-3 w-3 opacity-50" />
                          <span className="text-xs opacity-75">{formatTime(message.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2 rounded-md transition-colors"
                >
                  <FiSend className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Selecciona un chat para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
