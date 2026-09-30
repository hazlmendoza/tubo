"use client"

import React from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowLeft } from "lucide-react"

interface AuthLayoutProps {
  icon: LucideIcon
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function AuthLayout({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Mellow Cup
        </Link>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Icon className="h-7 w-7" />
            </div>

            <h1 className="font-display text-2xl font-semibold text-foreground">
              {title}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          {footer && (
            <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Mellow Cup Café · Sip Slow. Stay Sweet.
        </p>
      </div>
    </main>
  )
}
