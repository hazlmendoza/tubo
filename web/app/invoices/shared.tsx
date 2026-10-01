"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    FileSearch,
    Pencil,
    RefreshCw,
    Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Invoice, InvoiceStatus } from "@/types/invoice"

const badgeStyles: Record<InvoiceStatus, string> = {
    PENDING: "bg-info-soft text-info",
    PROCESSING: "bg-warning-soft text-warning",
    SUBMITTED: "bg-success-soft text-success",
    FAILED: "bg-destructive/10 text-destructive",
}

const statIconStyles: Record<InvoiceStatus, string> = {
    PENDING: "bg-info-soft text-info",
    PROCESSING: "bg-warning-soft text-warning",
    SUBMITTED: "bg-success-soft text-success",
    FAILED: "bg-destructive/10 text-destructive",
}

const statAccentStyles: Record<InvoiceStatus, string> = {
    PENDING: "border-l-info",
    PROCESSING: "border-l-warning",
    SUBMITTED: "border-l-success",
    FAILED: "border-l-destructive",
}

const thBase =
    "px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"

const tdBase =
    "px-4 py-3.5 text-[13px] text-muted-foreground"

/**
 * Format a Laravel date value for display.
 */
export function date(
    value: string | null | undefined
): string {
    if (!value) {
        return "—"
    }

    const parsed = new Date(value)

    if (Number.isNaN(parsed.getTime())) {
        return "—"
    }

    return parsed.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

/**
 * Format an amount using the invoice currency.
 */
export function money(
    amount: number | string | null | undefined,
    currency = "PHP"
): string {
    const numericAmount = Number(amount ?? 0)

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "PHP",
    }).format(numericAmount)
}

export function StatusBadge({
    status,
}: {
    status: InvoiceStatus
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
                badgeStyles[status]
            )}
        >
            <span className="size-1.5 rounded-full bg-current" />

            {status.charAt(0) +
                status.slice(1).toLowerCase()}
        </span>
    )
}

export function PageHeading({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow?: string
    title: string
    description?: string
    action?: ReactNode
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                    {eyebrow || "WORKSPACE / INVOICES"}
                </div>

                <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight text-foreground sm:text-[27px]">
                    {title}
                </h1>

                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {action && (
                <div className="flex shrink-0 items-center gap-2">
                    {action}
                </div>
            )}
        </div>
    )
}

export function LoadingState({
    rows = 5,
}: {
    rows?: number
}) {
    return (
        <div
            className="space-y-4 p-6"
            aria-label="Loading invoices"
        >
            {Array.from(
                { length: rows },
                (_, index) => (
                    <Skeleton
                        key={index}
                        className="h-12 w-full"
                    />
                )
            )}
        </div>
    )
}

export function EmptyState({
    title = "No invoices found.",
    description = "Try a different search or clear your filters.",
}: {
    title?: string
    description?: string
}) {
    return (
        <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
                <FileSearch size={23} />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-foreground">
                {title}
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
                {description}
            </p>
        </div>
    )
}

export function ErrorState({
    message,
    retry,
}: {
    message: string
    retry?: (() => void) | undefined
}) {
    return (
        <div className="flex flex-col items-center px-6 py-14 text-center">
            <h3 className="text-sm font-semibold text-foreground">
                Something went wrong
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
                {message}
            </p>

            {retry && (
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={retry}
                >
                    <RefreshCw size={15} />
                    Try again
                </Button>
            )}
        </div>
    )
}

export function StatCard({
    label,
    value,
    status,
    icon,
}: {
    label: string
    value: number
    status?: InvoiceStatus
    icon: ReactNode
}) {
    return (
        <div
            className={cn(
                "min-w-0 rounded-lg border border-l-[3px] border-border bg-card p-4 shadow-xs",
                status
                    ? statAccentStyles[status]
                    : "border-l-primary"
            )}
        >
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>{label}</span>

                <span
                    className={cn(
                        "grid size-8 place-items-center rounded-md",
                        status
                            ? statIconStyles[status]
                            : "bg-accent text-accent-foreground"
                    )}
                >
                    {icon}
                </span>
            </div>

            <strong className="mt-3 block font-display text-3xl font-bold leading-none text-foreground">
                {value.toString().padStart(2, "0")}
            </strong>

            <span className="mt-1.5 block text-[11px] text-muted-foreground">
                {status
                    ? `${label} invoices`
                    : "Across all statuses"}
            </span>
        </div>
    )
}

export function InvoiceTable({
    invoices,
    showCreated = true,
    onDelete,
}: {
    invoices: Invoice[]
    showCreated?: boolean
    onDelete?: (invoice: Invoice) => void
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                    <tr className="border-b border-border bg-muted/60">
                        <th className={thBase}>
                            INVOICE NUMBER
                        </th>

                        <th className={thBase}>
                            CUSTOMER
                        </th>

                        <th className={thBase}>
                            DATE
                        </th>

                        <th className={thBase}>
                            CURRENCY
                        </th>

                        <th
                            className={cn(
                                thBase,
                                "text-right"
                            )}
                        >
                            SUBTOTAL
                        </th>

                        <th
                            className={cn(
                                thBase,
                                "text-right"
                            )}
                        >
                            TAX
                        </th>

                        <th
                            className={cn(
                                thBase,
                                "text-right"
                            )}
                        >
                            TOTAL
                        </th>

                        <th className={thBase}>
                            STATUS
                        </th>

                        {showCreated && (
                            <th className={thBase}>
                                CREATED
                            </th>
                        )}

                        <th
                            className={cn(
                                thBase,
                                "text-right"
                            )}
                        >
                            ACTIONS
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {invoices.map((invoice) => (
                        <tr
                            key={invoice.id}
                            className="border-b border-border transition-colors last:border-0 hover:bg-accent/40"
                        >
                            {/* Invoice number */}
                            <td className={tdBase}>
                                <Link
                                    href={`/invoices/${invoice.id}`}
                                    className="font-display font-bold text-foreground hover:text-primary"
                                >
                                    {invoice.invoice_number}
                                </Link>
                            </td>

                            {/* Customer */}
                            <td className={tdBase}>
                                <div>
                                    <p className="font-medium text-foreground">
                                        {
                                            invoice.customer_name
                                        }
                                    </p>

                                    {invoice.customer_email && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {
                                                invoice.customer_email
                                            }
                                        </p>
                                    )}
                                </div>
                            </td>

                            {/* Invoice date */}
                            <td className={tdBase}>
                                {date(
                                    invoice.invoice_date
                                )}
                            </td>

                            {/* Currency */}
                            <td className={tdBase}>
                                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                                    {
                                        invoice.currency
                                    }
                                </span>
                            </td>

                            {/* Subtotal */}
                            <td
                                className={cn(
                                    tdBase,
                                    "whitespace-nowrap text-right tabular-nums"
                                )}
                            >
                                {money(
                                    invoice.subtotal,
                                    invoice.currency
                                )}
                            </td>

                            {/* Tax */}
                            <td
                                className={cn(
                                    tdBase,
                                    "whitespace-nowrap text-right tabular-nums"
                                )}
                            >
                                {money(
                                    invoice.tax_amount,
                                    invoice.currency
                                )}
                            </td>

                            {/* Total */}
                            <td
                                className={cn(
                                    tdBase,
                                    "whitespace-nowrap text-right font-semibold tabular-nums text-foreground"
                                )}
                            >
                                {money(
                                    invoice.total_amount,
                                    invoice.currency
                                )}
                            </td>

                            {/* Status */}
                            <td className={tdBase}>
                                <StatusBadge
                                    status={
                                        invoice.status
                                    }
                                />
                            </td>

                            {/* Created */}
                            {showCreated && (
                                <td className={tdBase}>
                                    {date(
                                        invoice.created_at
                                    )}
                                </td>
                            )}

                            {/* Actions */}
                            <td className={tdBase}>
                                <div className="flex justify-end gap-1">
                                    {/* View */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        title={`View ${invoice.invoice_number}`}
                                    >
                                        <Link
                                            href={`/invoices/${invoice.id}`}
                                            aria-label={`View ${invoice.invoice_number}`}
                                        >
                                            <ArrowRight size={16} />
                                        </Link>
                                    </Button>

                                    {/* Edit */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        title={`Edit ${invoice.invoice_number}`}
                                    >
                                        <Link
                                            href={`/invoices/${invoice.id}/edit`}
                                            aria-label={`Edit ${invoice.invoice_number}`}
                                        >
                                            <Pencil size={16} />
                                        </Link>
                                    </Button>

                                    {/* Delete */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        title={`Delete ${invoice.invoice_number}`}
                                        aria-label={`Delete ${invoice.invoice_number}`}
                                        onClick={() => onDelete?.(invoice)}
                                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function Pagination({
    page,
    pages,
    count,
    pageSize,
    onPage,
}: {
    page: number
    pages: number
    count: number
    pageSize: number
    onPage: (page: number) => void
}) {
    return (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
                Showing{" "}
                {count
                    ? (page - 1) * pageSize + 1
                    : 0}
                &ndash;
                {Math.min(
                    page * pageSize,
                    count
                )}{" "}
                of {count} invoices
            </span>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() =>
                        onPage(page - 1)
                    }
                >
                    <ChevronLeft size={16} />
                </Button>

                <span>
                    Page {page} of {pages}
                </span>

                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Next page"
                    disabled={page >= pages}
                    onClick={() =>
                        onPage(page + 1)
                    }
                >
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    )
}

export function InvoiceSummary({
    subtotal,
    taxAmount,
    totalAmount,
    currency = "PHP",
}: {
    subtotal: number
    taxAmount: number
    totalAmount: number
    currency?: string
}) {
    return (
        <div className="grid gap-3">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>

                <span className="tabular-nums">
                    {money(subtotal, currency)}
                </span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total tax</span>

                <span className="tabular-nums">
                    {money(taxAmount, currency)}
                </span>
            </div>

            <div className="mt-1 flex justify-between border-t border-border pt-3.5 text-base text-foreground">
                <strong>Total amount</strong>

                <strong className="tabular-nums">
                    {money(totalAmount, currency)}
                </strong>
            </div>
        </div>
    )
}