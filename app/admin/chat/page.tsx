"use client"

import { useEffect, useState, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { chatAPI, usersAPI, ChatRoom, ChatMessage, User } from "@/lib/api"
import { Send, Users, MessageSquare, Shield, UserCheck, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminChatPage() {
  const [groupRoom, setGroupRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (groupRoom) {
      fetchMessages(groupRoom._id)
      const interval = setInterval(() => fetchMessages(groupRoom._id), 5000)
      return () => clearInterval(interval)
    }
  }, [groupRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchInitialData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const [groupRes, usersRes, profileRes] = await Promise.all([
        chatAPI.getGroupChat(token),
        usersAPI.getAll(token),
        usersAPI.getProfile(token),
      ])

      if (groupRes.chatRoom) {
        setGroupRoom(groupRes.chatRoom)
      }
      setUsers(usersRes.users || [])
      setCurrentUser(profileRes.user || null)
    } catch (error) {
      console.error("Error fetching chat data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (roomId: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await chatAPI.getMessages(token, roomId)
      setMessages(response.messages || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!newMessage.trim() || !groupRoom) return

    const token = localStorage.getItem("token")
    if (!token) return

    setIsSending(true)
    try {
      await chatAPI.sendMessage(token, groupRoom._id, newMessage)
      setNewMessage("")
      await fetchMessages(groupRoom._id)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    })
  }

  // Obtener nombre real del usuario que envio el mensaje
  const getSenderName = (msg: ChatMessage) => {
    // Primero intentar obtener de sender.name
    if (msg.sender?.name) return msg.sender.name
    // Luego de senderName
    if (msg.senderName) return msg.senderName
    // Buscar en la lista de usuarios por senderId
    if (msg.senderId) {
      const user = users.find(u => u._id === msg.senderId)
      if (user) return user.name
    }
    // Buscar por sender._id
    if (msg.sender?._id) {
      const user = users.find(u => u._id === msg.sender?._id)
      if (user) return user.name
    }
    return "Usuario"
  }

  // Obtener rol del usuario
  const getSenderRole = (msg: ChatMessage) => {
    if (msg.sender?.role) return msg.sender.role
    if (msg.senderId) {
      const user = users.find(u => u._id === msg.senderId)
      if (user) return user.role
    }
    if (msg.sender?._id) {
      const user = users.find(u => u._id === msg.sender?._id)
      if (user) return user.role
    }
    return "seller"
  }

  // Verificar si es mensaje propio
  const isOwnMessage = (msg: ChatMessage) => {
    if (!currentUser) return false
    if (msg.senderId === currentUser._id) return true
    if (msg.sender?._id === currentUser._id) return true
    return false
  }

  // Obtener color del badge segun rol
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return { label: "Admin", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
      case "supervisor":
        return { label: "Supervisor", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" }
      default:
        return { label: "Vendedor", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
    }
  }

  // Agrupar usuarios por rol
  const admins = users.filter(u => u.role === "admin" && u.isActive)
  const supervisors = users.filter(u => u.role === "supervisor" && u.isActive)
  const sellers = users.filter(u => u.role === "seller" && u.isActive)

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chat Grupal</h1>
          <p className="text-muted-foreground">
            Comunicate con todo el equipo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-240px)]">
          {/* Sidebar - User List */}
          <Card className="border-border/50 bg-card/50 lg:col-span-1 overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participantes ({users.filter(u => u.isActive).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-350px)]">
              <div className="divide-y divide-border/50">
                {/* Admins */}
                {admins.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">Administradores ({admins.length})</span>
                    </div>
                    <div className="space-y-2">
                      {admins.map((user) => (
                        <div key={user._id} className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supervisors */}
                {supervisors.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-medium text-amber-400">Supervisores ({supervisors.length})</span>
                    </div>
                    <div className="space-y-2">
                      {supervisors.map((user) => (
                        <div key={user._id} className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sellers */}
                {sellers.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCircle className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400">Vendedores ({sellers.length})</span>
                    </div>
                    <div className="space-y-2">
                      {sellers.map((user) => (
                        <div key={user._id} className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="border-border/50 bg-card/50 lg:col-span-3 flex flex-col overflow-hidden">
            {groupRoom ? (
              <>
                {/* Chat Header */}
                <CardHeader className="py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Chat Grupal del Equipo</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {users.filter(u => u.isActive).length} participantes activos
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                      <p>No hay mensajes aun</p>
                      <p className="text-sm">Envia el primer mensaje</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const senderName = getSenderName(msg)
                      const senderRole = getSenderRole(msg)
                      const ownMessage = isOwnMessage(msg)
                      const roleBadge = getRoleBadge(senderRole)
                      const showDate =
                        index === 0 ||
                        formatDate(msg.createdAt) !==
                          formatDate(messages[index - 1].createdAt)

                      return (
                        <div key={msg._id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                                {formatDate(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div
                            className={cn(
                              "flex gap-3",
                              ownMessage && "flex-row-reverse"
                            )}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback
                                className={cn(
                                  "text-xs",
                                  senderRole === "admin" && "bg-purple-500/20 text-purple-400",
                                  senderRole === "supervisor" && "bg-amber-500/20 text-amber-400",
                                  senderRole === "seller" && "bg-blue-500/20 text-blue-400"
                                )}
                              >
                                {getInitials(senderName)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={cn(
                                "max-w-[70%] rounded-2xl px-4 py-2",
                                ownMessage
                                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                                  : "bg-secondary/50 text-foreground rounded-tl-sm"
                              )}
                            >
                              {!ownMessage && (
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-medium opacity-90">
                                    {senderName}
                                  </p>
                                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", roleBadge.color)}>
                                    {roleBadge.label}
                                  </Badge>
                                </div>
                              )}
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={cn(
                                  "text-xs mt-1",
                                  ownMessage
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                )}
                              >
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t border-border/50">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(e)
                        }
                      }}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-secondary/50"
                      disabled={isSending}
                    />
                    <Button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="bg-primary text-primary-foreground"
                    >
                      {isSending ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Chat no disponible</p>
                <p className="text-sm">No se pudo cargar el chat grupal</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
