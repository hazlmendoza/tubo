export interface InvoiceItem {
    id: number
    invoice_id: number
    description: string
    quantity: number
    unit_price: number
    tax_rate: number
    tax_amount: number
    line_total: number
    created_at?: string
    updated_at?: string
}

export interface InvoiceItemInput {
    description: string
    quantity: number
    unit_price: number
    tax_rate: number
}

export interface CreateInvoiceInput {
    invoice_date: string
    seller_name: string
    customer_name: string
    customer_tax_id: string
    customer_email: string
    currency: string
    items: InvoiceItemInput[]
}

export interface ProcessingLog {
    id: number
    invoice_id: number
    status?: string
    message?: string
    created_at: string
}

export interface Invoice {
    id: number
    company_id: number
    invoice_number: string
    invoice_date: string
    seller_name: string
    customer_name: string
    customer_tax_id: string
    customer_email: string
    currency: string
    subtotal: number
    tax_amount: number
    total_amount: number
    status: string
    idempotency_key?: string
    created_at: string
    updated_at: string
    items: InvoiceItem[]
    processing_logs?: ProcessingLog[]
}

export interface InvoiceItemInput {
    description: string
    quantity: number
    unit_price: number
    tax: number
}

export interface CreateInvoiceInput {
    invoice_number: string
    invoice_date: string
    seller_name: string
    customer_name: string
    customer_tax_id: string
    customer_email: string
    currency: string
    items: InvoiceItemInput[]
}

export interface PaginatedInvoices {
    current_page: number
    data: Invoice[]
    first_page_url: string
    from: number | null
    last_page: number
    last_page_url: string
    next_page_url: string | null
    prev_page_url: string | null
    per_page: number
    to: number | null
    total: number
}