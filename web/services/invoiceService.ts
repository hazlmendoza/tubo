import { apiFetch } from "@/lib/api"
import type {
    CreateInvoiceInput,
    Invoice,
    ProcessingLog,
} from "@/types/invoice"

export interface InvoiceListResponse {
    invoices: Invoice[]
}

export interface ProcessingLogsResponse {
    processing_logs: ProcessingLog[]
}

export const invoiceService = {
    async getInvoices(): Promise<InvoiceListResponse> {
        return apiFetch<InvoiceListResponse>("/invoices")
    },

    async getInvoice(id: string | number): Promise<Invoice> {
        return apiFetch<Invoice>(`/invoices/${id}`)
    },

    async getProcessingLogs(
        id: string | number
    ): Promise<ProcessingLogsResponse> {
        return apiFetch<ProcessingLogsResponse>(
            `/invoices/${id}/processing-logs`
        )
    },

    async createInvoice(
        data: CreateInvoiceInput
    ): Promise<Invoice> {
        return apiFetch<Invoice>("/invoices", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    async updateInvoice(
        id: string | number,
        data: Partial<CreateInvoiceInput>
    ): Promise<Invoice> {
        return apiFetch<Invoice>(`/invoices/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },

    async deleteInvoice(
        id: string | number
    ): Promise<void> {
        await apiFetch(`/invoices/${id}`, {
            method: "DELETE",
        })
    },

    async retryInvoice(
        id: string | number
    ): Promise<Invoice> {
        return apiFetch<Invoice>(
            `/invoices/${id}/retry`,
            {
                method: "POST",
            }
        )
    },
}