import type { Metadata } from "next"
import { Inter, Fraunces } from "next/font/google"
import "./globals.css"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "react-hot-toast"

import Providers from "@/components/Providers"
import Navbar from "@/components/layout/NavBar"

export const metadata: Metadata = {
  title: "Tubo",
  description: "",
}

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable}`}>
        <Providers>
          <Navbar />

          <TooltipProvider>{children}</TooltipProvider>

          <Footer />

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: "9999px",
                background: "#25eb36",
                color: "#FAF9F6",
                padding: "10px 18px",
                fontSize: "14px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
