"use client"

import { CompanyProvider } from "@/lib/company-context"
import { AuthProvider } from "@/lib/auth-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CompanyProvider>
        {children}
      </CompanyProvider>
    </AuthProvider>
  )
}
