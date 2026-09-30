"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"

import { apiFetch, getCsrfCookie, resetCsrf } from "@/lib/api"

export interface User {
    id: number
    company_id: number
    name: string
    email: string
    email_verified_at: string | null
    created_at: string
    updated_at: string
    company?: {
        id: number
        name: string
    }
}

interface LoginData {
    email: string
    password: string
}

interface RegisterData {
    company_name: string
    tax_id: string
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
        refreshUser()
    }, [refreshUser])

    const login = async (data: LoginData): Promise<User> => {
        // Initialize Sanctum CSRF cookie.
        await getCsrfCookie()

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
            resetCsrf()
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
        throw new Error("useAuth must be used within an AuthProvider.")
    }

    return context
}