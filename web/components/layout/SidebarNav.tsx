"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    FileText,
    Plus,
    Settings,
    type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
    href: string
    label: string
    icon: LucideIcon
    exact?: boolean
}

type NavGroup = {
    label: string
    items: NavItem[]
}

const navGroups: NavGroup[] = [
    {
        label: "Overview",
        items: [
            {
                href: "/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard,
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
            },
        ],
    },
    
]

function isActiveRoute(
    pathname: string,
    item: NavItem
): boolean {
    if (item.exact) {
        return pathname === item.href
    }

    if (item.href === "/dashboard") {
        return pathname === "/" || pathname.startsWith("/dashboard")
    }

    return (
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`)
    )
}

export function SidebarNav() {
    const pathname = usePathname()

    return (
        <nav
            aria-label="Main navigation"
            className="flex-1 overflow-y-auto px-3 pb-4"
        >
            {navGroups.map((group) => (
                <div key={group.label}>
                    <p className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                        {group.label}
                    </p>

                    <div className="space-y-0.5">
                        {group.items.map((item) => {
                            const active = isActiveRoute(
                                pathname,
                                item
                            )

                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={
                                        active
                                            ? "page"
                                            : undefined
                                    }
                                    className={cn(
                                        "group relative flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors",
                                        active
                                            ? "bg-white/10 text-white"
                                            : "text-white/65 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {active && (
                                        <span className="absolute inset-y-2 -left-3 w-1 rounded-r bg-emerald-400" />
                                    )}

                                    <Icon
                                        className={cn(
                                            "size-[18px] shrink-0 transition-colors",
                                            active
                                                ? "text-emerald-400"
                                                : "text-white/50 group-hover:text-white/80"
                                        )}
                                    />

                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            ))}
        </nav>
    )
}