// components/layout/SidebarNav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    FileText,
    Plus,
    Settings,
    type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
    href: string
    label: string
    icon: LucideIcon
    match: (pathname: string) => boolean
}

const navGroups: { label: string; items: NavItem[] }[] = [
    {
        label: "Overview",
        items: [
            {
                href: "/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard,
                match: (p) => p === "/" || p.startsWith("/dashboard"),
            },
        ],
    },
    {
        label: "Billing",
        items: [
            {
                href: "/invoices",
                label: "Invoices",
                icon: FileText,
                match: (p) => p === "/invoices" || (p.startsWith("/invoices/") && p !== "/invoices/create"),
            },
            {
                href: "/invoices/create",
                label: "Create Invoice",
                icon: Plus,
                match: (p) => p === "/invoices/create",
            },
        ],
    },
    {
        label: "System",
        items: [
            {
                href: "/settings",
                label: "Settings",
                icon: Settings,
                match: (p) => p.startsWith("/settings"),
            },
        ],
    },
]

export function SidebarNav() {
    const pathname = usePathname()

    return (
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 pb-4">
            {navGroups.map((group) => (
                <div key={group.label}>
                    <p className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                        {group.label}
                    </p>
                    <div className="space-y-0.5">
                        {group.items.map((item) => {
                            const active = item.match(pathname)
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "group relative flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors",
                                        active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {active && <span className="absolute inset-y-2 -left-3 w-1 rounded-r bg-emerald-400" />}
                                    <Icon
                                        className={cn(
                                            "size-[18px] shrink-0 transition-colors",
                                            active ? "text-emerald-400" : "text-white/50 group-hover:text-white/80"
                                        )}
                                    />
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            ))}
        </nav>
    )
}