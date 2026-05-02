"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authAPI.login(email, password)
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.removeItem("selectedCompanyId")
      
      toast({
        title: "Bienvenido",
        description: `Hola ${response.user.name}!`,
      })

      if (response.user.role === "admin") {
        router.push("/admin")
      } else if (response.user.role === "supervisor") {
        router.push("/supervisor")
      } else if (response.user.role === "support") {
        router.push("/support")
      } else {
        router.push("/seller")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Credenciales incorrectas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a3a5c] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full h-full">
          {/* Logo section */}
          <div className="flex flex-col items-center">
            <Image
              src="/images/grupojv/logo2.png"
              alt="Grupo JV - 10 Anos"
              width={320}
              height={280}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          
          {/* Title and subtitle */}
          <div className="space-y-6 text-center mt-10">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white leading-tight tracking-wide">
                SISTEMA DE GESTION COMERCIAL GRUPOJV
              </h1>
              <p className="text-xl text-[#5eb3e4] font-semibold tracking-widest">
                COMERCIALIZADORA
              </p>
            </div>
            
            <div className="pt-8 border-t border-white/20 mt-8">
              <p className="text-lg text-white font-medium">
                AGENTE OFICIAL PROSEGUR ARGENTINA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md border-slate-200 shadow-xl">
          <CardHeader className="space-y-4 text-center pb-2">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-2">
              <Image
                src="/images/grupojv/logo2.png"
                alt="Grupo JV"
                width={200}
                height={160}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Iniciar Sesion
              </CardTitle>
              <CardDescription className="text-slate-500 mt-2">
                Ingresa tus credenciales para acceder al sistema de gestion
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email" className="text-slate-700">
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border-slate-300 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password" className="text-slate-700">
                    Contrasena
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border-slate-300 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]"
                  />
                </Field>
              </FieldGroup>
              <Button
                type="submit"
                className="w-full bg-[#1a3a5c] hover:bg-[#0f2840] text-white font-semibold py-5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-400">
                Sistema de Gestion de Ventas
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Powered by TusVentas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


