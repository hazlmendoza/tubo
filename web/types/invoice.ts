export type InvoiceStatus =
    | "PENDING"
    | "PROCESSING"
    | "SUBMITTED"
    | "FAILED"

export interface InvoiceItem {
    id: number
    invoice_id: number
    description: string
    quantity: number | string
    unit_price: number | string
    tax_rate: number | string
    tax_amount: number | string
    line_total: number | string
    created_at: string
    updated_at: string
}

export interface ProcessingLog {
    id: number
    invoice_id: number
    status: string
    message: string | null
    http_status: number | null
    retryable: boolean
    external_reference: string | null
    created_at: string
    updated_at: string
}

export interface Invoice {
    id: number
    company_id: number

    invoice_number: string
    invoice_date: string

    seller_name: string
    customer_name: string
    customer_tax_id: string | null
    customer_email: string | null

    currency: string

    subtotal: number | string
    tax_amount: number | string
    total_amount: number | string

    status: InvoiceStatus

    idempotency_key: string

    created_at: string
    updated_at: string

    items: InvoiceItem[]
    processing_logs: ProcessingLog[]
}