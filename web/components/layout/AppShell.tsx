// components/layout/AppShell.tsx
"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, ChevronRight, Menu, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SidebarNav } from "./SidebarNav"
import { SidebarFooter } from "./SidebarFooter"
import { useAuth } from "@/lib/auth-context"

export function AppShell({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading } = useAuth()
    const isAuthRoute = pathname === "/login" || pathname === "/register"

    const current =
        pathname.startsWith("/invoices/") && pathname !== "/invoices/create"
            ? "Invoice details"
            : pathname === "/invoices/create"
                ? "Create Invoice"
                : pathname.startsWith("/invoices")
                    ? "Invoices"
                    : pathname.startsWith("/settings")
                        ? "Settings"
                        : "Dashboard"

    // Close mobile drawer on route changes
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    useEffect(() => {
        if (!isAuthRoute && !loading && !user) {
            router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
        }
    }, [isAuthRoute, loading, pathname, router, user])

    // Handle escape key and body scroll lock for mobile drawer
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("keydown", onKey)
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("keydown", onKey)
            document.body.style.overflow = ""
        }
    }, [open])

    const userInitials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "TM"

    if (isAuthRoute) return <>{children}</>
    if (loading) {
        return (
            <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground" aria-busy="true">
                Checking your session...
            </main>
        )
    }
    if (!user) return null

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Mobile overlay */}
            <div
                aria-hidden="true"
                onClick={() => setOpen(false)}
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden",
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                )}
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[oklch(0.24_0.045_160)] text-white/80",
                    "transition-transform duration-200 ease-out lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
                    <Link href="/dashboard" className="flex items-center gap-2.5 font-display text-2xl font-bold text-white">
                        <span className="grid size-7 place-items-center rounded-full border-2 border-emerald-400">
                            <span className="size-2 rounded-full bg-emerald-400" />
                        </span>
                        <span>
                            tubo<span className="text-emerald-400">.</span>
                        </span>
                    </Link>
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setOpen(false)}
                        className="grid size-8 place-items-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <SidebarNav />
                <SidebarFooter />
            </aside>

            {/* Main column */}
            <div className="flex min-h-screen flex-col lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-t-2 border-border border-t-primary bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open menu"
                            onClick={() => setOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu className="size-5" />
                        </Button>
                        <nav aria-label="Breadcrumb" className="min-w-0">
                            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <li className="hidden sm:block">Workspace</li>
                                <li aria-hidden="true" className="hidden sm:block">
                                    <ChevronRight className="size-3.5" />
                                </li>
                                <li className="truncate font-semibold text-foreground" aria-current="page">
                                    {current}
                                </li>
                            </ol>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Notifications"
                            aria-label="Notifications"
                            onClick={() => toast.info("No new notifications.")}
                            className="relative"
                        >
                            <Bell className="size-[18px]" />
                            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
                        </Button>
                        <span className="mx-1 h-6 w-px bg-border" />
                        <span className="grid size-8 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                            {userInitials}
                        </span>
                    </div>
                </header>

                <main className="flex-1">{children}</main>

                <footer className="flex flex-col gap-1 border-t border-border px-4 py-4 text-[11px] text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8">
                    <span>&copy; 2026 Tubo Technologies Inc.</span>
                    <span>Invoice management, made simple.</span>
                </footer>
            </div>
        </div>
    )
}