import { apiFetch } from "@/lib/api"
import type {
    CreateInvoiceInput,
    Invoice,
    PaginatedInvoices,
} from "@/types/invoice"

/**
 * Get paginated invoices.
 */
export async function getInvoices(
    page = 1
): Promise<PaginatedInvoices> {
    return apiFetch<PaginatedInvoices>(
        `/api/invoices?page=${page}`,
        {
            method: "GET",
        }
    )
}

/**
 * Get one invoice.
 */
export async function getInvoice(
    id: string | number
): Promise<Invoice> {
    return apiFetch<Invoice>(
        `/api/invoices/${id}`,
        {
            method: "GET",
        }
    )
}

/**
 * Create invoice.
 */
export async function createInvoice(
    data: CreateInvoiceInput
): Promise<{
    message: string
    invoice: Invoice
}> {
    return apiFetch<{
        message: string
        invoice: Invoice
    }>("/invoices", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export function date(value: string | null | undefined): string {
    if (!value) return "—"

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

export function dateTime(value: string | null | undefined): string {
    if (!value) return "—"

    const parsed = new Date(value)

    if (Number.isNaN(parsed.getTime())) {
        return "—"
    }

    return parsed.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })
}

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

/**
 * Calculate invoice totals from its items.
 *
 * Backend totals remain the source of truth.
 * This helper is only useful for frontend display/fallback calculations.
 */
export function totals(invoice: Invoice) {
    const subtotal = invoice.items.reduce(
        (sum, item) =>
            sum + Number(item.quantity) * Number(item.unit_price),
        0
    )

    const tax = invoice.items.reduce(
        (sum, item) => sum + Number(item.tax_amount),
        0
    )

    const total = subtotal + tax

    return {
        subtotal,
        tax,
        total,
    }
}