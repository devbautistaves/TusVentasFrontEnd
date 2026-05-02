import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "Grupo JV - Seguros, Alarmas y Soluciones Empresariales en Argentina",
    template: "%s | Grupo JV",
  },
  description: "Grupo JV: Tu aliado en seguros de auto, moto, hogar, vida, ART, alarmas ADT, recursos humanos y marketing digital. Mas de 10 anos protegiendo a mas de 10,000 clientes en Argentina. Cotiza gratis online.",
  keywords: [
    "seguros argentina",
    "seguro de auto",
    "seguro de moto", 
    "seguro de hogar",
    "seguro de vida",
    "ART",
    "alarmas ADT",
    "recursos humanos",
    "marketing digital",
    "cotizar seguro",
    "grupo jv",
    "tusventas",
    "asesores de seguros",
    "broker de seguros",
  ],
  authors: [{ name: "Grupo JV" }],
  creator: "Grupo JV",
  publisher: "Grupo JV",
  metadataBase: new URL("https://grupojv.com.ar"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://grupojv.com.ar",
    siteName: "Grupo JV",
    title: "Grupo JV - Seguros, Alarmas y Soluciones Empresariales",
    description: "Tu aliado en seguros de auto, moto, hogar, vida, ART, alarmas y mas. Cotiza gratis online. Mas de 10 anos de experiencia.",
    images: [
      {
        url: "/images/grupojv/logo.png",
        width: 1200,
        height: 630,
        alt: "Grupo JV - Seguros y Soluciones Empresariales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grupo JV - Seguros, Alarmas y Soluciones Empresariales",
    description: "Tu aliado en seguros de auto, moto, hogar, vida, ART, alarmas y mas. Cotiza gratis online.",
    images: ["/images/grupojv/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "tu-codigo-de-verificacion-google",
  },
  category: "Insurance",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a5f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
