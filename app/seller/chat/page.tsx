"use client"

import { useEffect, useState, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { chatAPI, usersAPI, ChatRoom, ChatMessage, User } from "@/lib/api"
import { Send, Users, MessageSquare, Shield, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SellerChatPage() {
  const [groupRoom, setGroupRoom] = useState<ChatRoom | null>(null)
  const [privateRooms, setPrivateRooms] = useState<{ room: ChatRoom; user: User }[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [selectedRoomUser, setSelectedRoomUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; _id: string } | null>(null)
  const [adminsAndSupervisors, setAdminsAndSupervisors] = useState<User[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom._id)
      const interval = setInterval(() => fetchMessages(selectedRoom._id), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedRoom])

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
      // Get group chat
      const groupRes = await chatAPI.getGroupChat(token)
      if (groupRes.chatRoom) {
        setGroupRoom(groupRes.chatRoom)
        setSelectedRoom(groupRes.chatRoom)
      }

      // Get all users to find admins and supervisors
      try {
        const usersRes = await usersAPI.getAll(token)
        const adminsSups = usersRes.users.filter(
          (u) => (u.role === "admin" || u.role === "supervisor") && u.isActive
        )
        setAdminsAndSupervisors(adminsSups)

        // For each admin/supervisor, get or create private chat
        const rooms: { room: ChatRoom; user: User }[] = []
        for (const user of adminsSups) {
          try {
            const res = await chatAPI.getPrivateChat(token, user._id)
            if (res.room) {
              rooms.push({ room: res.room, user })
            }
          } catch (err) {
            console.log("[v0] Could not get private chat with:", user.name)
          }
        }
        setPrivateRooms(rooms)
      } catch (err) {
        // If can't get all users, try the old private-admin endpoint
        const privateRes = await chatAPI.getPrivateAdminChat(token)
        if (privateRes.chatRoom) {
          // We don't have user info, but we can still show the chat
          setPrivateRooms([{ room: privateRes.chatRoom, user: { _id: "", name: "Admin", role: "admin" } as User }])
        }
      }
    } catch (error) {
      console.log("[v0] Error fetching chat data:", error)
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
      console.log("[v0] Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!newMessage.trim() || !selectedRoom) return

    const token = localStorage.getItem("token")
    if (!token) return

    setIsSending(true)
    try {
      await chatAPI.sendMessage(token, selectedRoom._id, newMessage)
      setNewMessage("")
      await fetchMessages(selectedRoom._id)
    } catch (error) {
      console.log("[v0] Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectPrivateRoom = (room: ChatRoom, user: User) => {
    setSelectedRoom(room)
    setSelectedRoomUser(user)
  }

  const handleSelectGroupRoom = () => {
    if (groupRoom) {
      setSelectedRoom(groupRoom)
      setSelectedRoomUser(null)
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "supervisor":
        return "Supervisor"
      default:
        return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-5 w-5 text-purple-400" />
      case "supervisor":
        return <UserCheck className="h-5 w-5 text-blue-400" />
      default:
        return <Users className="h-5 w-5 text-primary" />
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="seller">
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="seller">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chat</h1>
          <p className="text-muted-foreground">
            Comunicate con el equipo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-240px)]">
          {/* Sidebar - Chat List */}
          <Card className="border-border/50 bg-card/50 lg:col-span-1 overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Conversaciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50 max-h-[calc(100vh-350px)] overflow-y-auto">
                {/* Group Chat */}
                {groupRoom && (
                  <button
                    onClick={handleSelectGroupRoom}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left",
                      selectedRoom?._id === groupRoom._id && !selectedRoomUser && "bg-secondary/50"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        Chat Grupal
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Todos los vendedores
                      </p>
                    </div>
                  </button>
                )}

                {/* Private Chats with Admins and Supervisors */}
                {privateRooms.map(({ room, user }) => (
                  <button
                    key={room._id}
                    onClick={() => handleSelectPrivateRoom(room, user)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left",
                      selectedRoom?._id === room._id && "bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      user.role === "admin" ? "bg-purple-500/20" : "bg-blue-500/20"
                    )}>
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRoleLabel(user.role)}
                      </p>
                    </div>
                  </button>
                ))}

                {!groupRoom && privateRooms.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No hay conversaciones disponibles
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="border-border/50 bg-card/50 lg:col-span-3 flex flex-col overflow-hidden">
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <CardHeader className="py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    {selectedRoomUser ? (
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        selectedRoomUser.role === "admin" ? "bg-purple-500/20" : "bg-blue-500/20"
                      )}>
                        {getRoleIcon(selectedRoomUser.role)}
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {selectedRoomUser ? selectedRoomUser.name : "Chat Grupal"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {selectedRoomUser
                          ? getRoleLabel(selectedRoomUser.role)
                          : "Todos los vendedores"}
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
                      const messageSenderName = msg.senderName || msg.sender?.name || "Usuario"
                      const messageSenderId = msg.senderId || msg.sender?._id
                      const isOwnMessage = messageSenderId === currentUser?._id || messageSenderName === currentUser?.name
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
                              isOwnMessage && "flex-row-reverse"
                            )}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback
                                className={cn(
                                  "text-xs",
                                  isOwnMessage
                                    ? "bg-primary/20 text-primary"
                                    : "bg-blue-500/20 text-blue-400"
                                )}
                              >
                                {getInitials(messageSenderName)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={cn(
                                "max-w-[70%] rounded-2xl px-4 py-2",
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                                  : "bg-secondary/50 text-foreground rounded-tl-sm"
                              )}
                            >
                              {!isOwnMessage && (
                                <p className="text-xs font-medium mb-1 opacity-70">
                                  {messageSenderName}
                                </p>
                              )}
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={cn(
                                  "text-xs mt-1",
                                  isOwnMessage
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
                <p className="text-lg font-medium">Selecciona una conversacion</p>
                <p className="text-sm">Elige un chat de la lista para comenzar</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
