"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { apiFetch } from "@/lib/api"

export interface UserProfile {
  id: number
  user_id: number
  phone: string | null
  birthday: string | null
  avatar: string | null
  points: number
  redeemed: number
}

export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "customer"
  profile?: UserProfile | null
  loyalty_points: number
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

interface AuthContextType {
  user: User | null
  loading: boolean

  login: (data: LoginData) => Promise<User>

  register: (data: RegisterData) => Promise<User>

  logout: () => Promise<void>

  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: User }>("/auth/user")

      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser()
  }, [refreshUser])

  const login = async (data: LoginData): Promise<User> => {
    const result = await apiFetch<{
      message: string
      user: User
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })

    setUser(result.user)

    return result.user
  }

  const register = async (data: RegisterData): Promise<User> => {
    const result = await apiFetch<{
      message: string
      user: User
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })

    setUser(result.user)

    return result.user
  }

  const logout = async (): Promise<void> => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      })
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
