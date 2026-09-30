"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    UserPlus,
    Building2,
    User,
    Mail,
    Lock,
    Loader2,
} from "lucide-react"
import GoogleIcon from "@/components/auth/GoogleIcon"
import { safeReturnTo } from "@/lib/authReturnTo"
import AuthLayout from "@/components/auth/AuthLayout"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function Register() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { register } = useAuth()
    const [companyName, setCompanyName] = useState("")
    const [taxId, setTaxId] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const returnTo = safeReturnTo(searchParams.get("returnTo"))

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        if (
            !companyName.trim() ||
            !name.trim() ||
            !email.trim() ||
            !password ||
            !passwordConfirmation
        ) {
            setError("Please complete all required fields.")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }

        if (password !== passwordConfirmation) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)

        try {
            await register({
                company_name: companyName.trim(),
                tax_id: taxId.trim(),
                name: name.trim(),
                email: email.trim(),
                password,
                password_confirmation: passwordConfirmation,
            })

            toast.success("Business account created successfully!")
            router.push(returnTo)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create your business account."
            )
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = () => {
        setError(
            "Google registration will be available when authentication is connected."
        )
    }

    return (
        <AuthLayout
            icon={UserPlus}
            title="Create your business account"
            subtitle="Set up your business and get started"
            footer={
                <>
                    Already have an account?{" "}
                    <Link
                        href={
                            "/login" +
                            (returnTo !== "/"
                                ? "?returnTo=" +
                                encodeURIComponent(returnTo)
                                : "")
                        }
                        className="font-medium text-primary hover:underline"
                    >
                        Log in
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

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Business Name */}
                <div className="space-y-2">
                    <Label htmlFor="company_name">Business name</Label>

                    <div className="relative">
                        <Building2
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />

                        <Input
                            id="company_name"
                            type="text"
                            autoComplete="organization"
                            autoFocus
                            placeholder="e.g. ABC Company"
                            value={companyName}
                            onChange={(e) =>
                                setCompanyName(e.target.value)
                            }
                            className="h-12 pl-10"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Owner Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">Your name</Label>

                    <div className="relative">
                        <User
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />

                        <Input
                            id="name"
                            type="text"
                            autoComplete="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 pl-10"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>

                    <div className="relative">
                        <Mail
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />

                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 pl-10"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>

                    <div className="relative">
                        <Lock
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />

                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 pl-10"
                            required
                            disabled={loading}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Use at least 8 characters.
                    </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                        Confirm password
                    </Label>

                    <div className="relative">
                        <Lock
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />

                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={passwordConfirmation}
                            onChange={(e) =>
                                setPasswordConfirmation(e.target.value)
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
                            Creating business account...
                        </>
                    ) : (
                        <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create business account
                        </>
                    )}
                </Button>
            </form>
        </AuthLayout>
    )
}
