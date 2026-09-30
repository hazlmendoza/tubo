// components/layout/SidebarFooter.tsx
"use client"

import { ChevronDown, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export function SidebarFooter() {
    const { user, logout } = useAuth()

    // Fallback initials if user profile is loading or missing
    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "TM"

    return (
        <div className="shrink-0 border-t border-white/10 p-3">
            <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                Current workspace
            </p>
            <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/5 p-2.5 text-left transition-colors hover:bg-white/10"
            >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-emerald-500 text-sm font-bold text-white">
                    T
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-white">
                        {user?.company?.name || "Tubo Technologies"}
                    </span>
                    <span className="block truncate text-[11px] text-white/50">Business account</span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-white/40" />
            </button>

            <div className="mt-3 flex items-center gap-3 px-1">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                    {initials}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-white">
                        {user?.name || "User Account"}
                    </span>
                    <span className="block truncate text-[11px] text-white/50">
                        { "Administrator"}
                    </span>
                </span>
                <button
                    type="button"
                    title="Logout"
                    aria-label="Logout"
                    onClick={() => {
                        void logout().catch((error: unknown) => {
                            toast.error(error instanceof Error ? error.message : "Unable to log out.")
                        })
                    }}
                    className="grid size-8 shrink-0 place-items-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <LogOut className="size-[17px]" />
                </button>
            </div>
        </div>
    )
}