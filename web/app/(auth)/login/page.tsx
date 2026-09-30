"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, Mail, Lock, Loader2 } from "lucide-react"
import GoogleIcon from "@/components/auth/GoogleIcon"
import { safeReturnTo } from "@/lib/authReturnTo"
import AuthLayout from "@/components/auth/AuthLayout"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function Login() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const returnTo = safeReturnTo(searchParams.get("returnTo"))

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault()
        setError("")

        if (!email.trim() || !password) {
            setError("Please enter your email and password.")
            return
        }

        setLoading(true)

        try {
            await login({
                email: email.trim(),
                password,
            })

            toast.success("Welcome back!")

            router.push(returnTo)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to log in. Please check your credentials."
            )
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = () => {
        setError(
            "Google login is not available yet."
        )
    }

    return (
        <AuthLayout
            icon={LogIn}
            title="Welcome back"
            subtitle="Log in to your business account"
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link
                        href={
                            "/register" +
                            (returnTo !== "/"
                                ? "?returnTo=" +
                                encodeURIComponent(returnTo)
                                : "")
                        }
                        className="font-medium text-primary hover:underline"
                    >
                        Create a business account
                    </Link>
                </>
            }
        >
            <Button
                variant="outline"
                className="mb-6 h-12 w-full text-sm font-medium"
                onClick={handleGoogle}
                type="button"
                disabled={loading}
            >
                <GoogleIcon className="mr-2 h-5 w-5" />
                Continue with Google
            </Button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                </div>

                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">
                        or
                    </span>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                >
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">
                        Email
                    </Label>

                    <div className="relative">
                        <Mail
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />

                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            className="h-12 pl-10"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">
                            Password
                        </Label>

                        <Link
                            href="/forgot-password"
                            className="text-xs text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <div className="relative">
                        <Lock
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />

                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            className="h-12 pl-10"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="h-12 w-full font-medium"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                        </>
                    ) : (
                        "Log in"
                    )}
                </Button>
            </form>
        </AuthLayout>
    )
}
