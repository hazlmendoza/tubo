"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import InvoiceForm from "@/components/invoices/InvoiceForm"
import { createInvoice } from "@/lib/invoices"
import type { CreateInvoiceInput } from "@/types/invoice"

export default function CreateInvoicePage() {
    const router = useRouter()

    async function handleSubmit(
        data: CreateInvoiceInput
    ) {
        try {
            const response = await createInvoice(data)

            /*
             * The backend returns HTTP 202 Accepted.
             *
             * This means Tubo successfully created the invoice
             * and queued it for background processing.
             *
             * Government submission happens asynchronously.
             */
            toast.success(
                response.message ||
                    "Invoice accepted for processing."
            )

            router.push("/invoices")
        } catch (error) {
            console.error("Create invoice error:", error)

            toast.error(
                "Failed to create invoice. Please check your information and try again."
            )
        }
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <Link
                    href="/invoices"
                    className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to invoices
                </Link>

                <h1 className="text-2xl font-semibold">
                    Create Invoice
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Create a new invoice for your customer.
                </p>
            </div>

            <InvoiceForm onSubmit={handleSubmit} />
        </div>
    )
}