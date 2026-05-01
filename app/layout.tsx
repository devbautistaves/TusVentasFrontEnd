import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Grupo JV - Broker de Negocios y Seguros",
  description: "En nuestra organizacion podras encontrar una amplia gama de soluciones para vos, tus bienes y tu vida diaria, desde seguros con las mejores coberturas hasta alarmas monitoreadas.",
  keywords: "GrupoJV, Jonathan, Vescio, Seguros, ADT, ALARMAS, ASEGURADORA, PRODUCTOR, EMPRESA",
  authors: [{ name: "Grupo JV" }],
  openGraph: {
    type: "website",
    url: "https://www.grupojv.com.ar",
    locale: "es_AR",
    siteName: "Grupo JV",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
