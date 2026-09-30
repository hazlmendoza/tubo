"use client"

import { AppProvider } from "@/lib/app-context"
import { AuthProvider } from "@/lib/auth-context"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProvider>
  )
}