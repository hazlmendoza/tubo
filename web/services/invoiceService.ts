import { apiFetch } from "@/lib/api"
import type {
    Invoice,
    CreateInvoiceInput,
} from "@/types/invoice"

export const invoiceService = {
    /**
     * Get all invoices for the authenticated company.
     */
    async getInvoices(): Promise<Invoice[]> {
        const response = await apiFetch("/invoices")

        return response.invoices
    },

    /**
     * Get a single invoice by ID.
     */
    async getInvoices(): Promise<Invoice[]> {
        const response = await apiFetch("/invoices")

        return response.invoices
    },

    /**
     * Create a new invoice.
     *
     * Invoice number, subtotal, tax amount,
     * and total amount are generated/calculated by Laravel.
     */
    async createInvoice(
        input: CreateInvoiceInput
    ): Promise<Invoice> {
        const response = await apiFetch("/invoices", {
            method: "POST",
            body: JSON.stringify(input),
        })

        return response.invoice
    },

    /**
     * Update an existing invoice.
     */
    async updateInvoice(
        id: string,
        input: Partial<CreateInvoiceInput>
    ): Promise<Invoice> {
        const response = await apiFetch(`/invoices/${id}`, {
            method: "PUT",
            body: JSON.stringify(input),
        })

        return response.invoice
    },

    /**
     * Delete an invoice.
     */
    async deleteInvoice(id: string): Promise<void> {
        await apiFetch(`/invoices/${id}`, {
            method: "DELETE",
        })
    },
}