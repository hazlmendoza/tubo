"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Circle } from "lucide-react"
import { invoiceService } from "@/services/invoiceService"
import { date, dateTime, money } from "@/lib/invoices"
import type { Invoice } from "@/types/invoice"
import {
    ErrorState,
    InvoiceSummary,
    LoadingState,
    PageHeading,
    StatusBadge,
} from "../shared"
import { Button } from "@/components/ui/button"

type PageProps = {
    params: Promise<{
        id: string
    }>
}

export default function InvoiceDetail({ params }: PageProps) {
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const load = async (invoiceId: string) => {
        setLoading(true)
        setError("")

        try {
            const data = await invoiceService.getInvoice(invoiceId)
            setInvoice(data)
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Unable to load invoice."
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let cancelled = false

        const loadInvoice = async () => {
            try {
                // Next.js 16 dynamic route params are async.
                const { id } = await params

                if (!id || id === "undefined") {
                    throw new Error("Invoice ID is missing.")
                }

                if (cancelled) return

                await load(id)
            } catch (e) {
                if (!cancelled) {
                    setError(
                        e instanceof Error
                            ? e.message
                            : "Unable to load invoice."
                    )
                    setLoading(false)
                }
            }
        }

        void loadInvoice()

        return () => {
            cancelled = true
        }
        // params is the route parameter object supplied by Next.js.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params])

    if (loading) {
        return (
            <div className="content-wrap">
                <PageHeading title="Invoice details" />

                <div className="panel mt-6">
                    <LoadingState rows={8} />
                </div>
            </div>
        )
    }

    if (error || !invoice) {
        return (
            <div className="content-wrap">
                <PageHeading title="Invoice details" />

                <div className="panel mt-6">
                    <ErrorState
                        message={error || "Invoice not found."}
                        retry={() => {
                            void (async () => {
                                const { id } = await params

                                if (id && id !== "undefined") {
                                    await load(id)
                                }
                            })()
                        }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="content-wrap">
            <PageHeading
                eyebrow="WORKSPACE / INVOICES / DETAILS"
                title={`Invoice #${invoice.invoice_number}`}
                description={`Created ${date(
                    invoice.created_at
                )} · ${invoice.customer_name}`}
                action={
                    <Button
                        variant="outline"
                        asChild
                        size="sm"
                        className="h-9 w-auto shrink-0 whitespace-nowrap px-3"
                    >
                        <Link
                            href="/invoices"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="size-4 shrink-0" />
                            <span>Back to Invoices</span>
                        </Link>
                    </Button>
                }
            />

            <div className="detail-status-line">
                <StatusBadge status={invoice.status} />

                <span>
                    Last updated{" "}
                    {dateTime(invoice.updated_at)}
                </span>
            </div>

            <div className="detail-grid">
                <div className="detail-main">
                    {/* Invoice information */}
                    <section className="panel detail-panel">
                        <div className="detail-panel-title">
                            <h2>Invoice information</h2>
                            <span>INVOICE DETAILS</span>
                        </div>

                        <div className="detail-kv">
                            <div>
                                <span>Invoice number</span>
                                <strong>
                                    {invoice.invoice_number}
                                </strong>
                            </div>

                            <div>
                                <span>Invoice date</span>
                                <strong>
                                    {date(invoice.invoice_date)}
                                </strong>
                            </div>

                            <div>
                                <span>Created date</span>
                                <strong>
                                    {dateTime(invoice.created_at)}
                                </strong>
                            </div>

                            <div>
                                <span>Updated date</span>
                                <strong>
                                    {dateTime(invoice.updated_at)}
                                </strong>
                            </div>

                            <div>
                                <span>Currency</span>
                                <strong>
                                    {invoice.currency}
                                </strong>
                            </div>

                            <div>
                                <span>Status</span>
                                <StatusBadge
                                    status={invoice.status}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Seller */}
                    <section className="panel detail-panel">
                        <div className="detail-panel-title">
                            <h2>Seller</h2>
                            <span>FROM</span>
                        </div>

                        <div className="detail-kv">
                            <div>
                                <span>Seller name</span>
                                <strong>
                                    {invoice.seller_name || "—"}
                                </strong>
                            </div>
                        </div>
                    </section>

                    {/* Customer */}
                    <section className="panel detail-panel">
                        <div className="detail-panel-title">
                            <h2>Customer</h2>
                            <span>BILL TO</span>
                        </div>

                        <div className="detail-kv">
                            <div>
                                <span>Customer name</span>
                                <strong>
                                    {invoice.customer_name}
                                </strong>
                            </div>

                            <div>
                                <span>Tax ID</span>
                                <strong>
                                    {invoice.customer_tax_id || "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Email address</span>
                                <strong>
                                    {invoice.customer_email || "—"}
                                </strong>
                            </div>
                        </div>
                    </section>

                    {/* Invoice items */}
                    <section className="panel detail-panel items-panel">
                        <div className="detail-panel-title">
                            <h2>Invoice items</h2>

                            <span>
                                {invoice.items.length}{" "}
                                {invoice.items.length === 1
                                    ? "ITEM"
                                    : "ITEMS"}
                            </span>
                        </div>

                        <div className="table-scroll">
                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th>DESCRIPTION</th>
                                        <th className="numeric">
                                            QTY
                                        </th>
                                        <th className="numeric">
                                            UNIT PRICE
                                        </th>
                                        <th className="numeric">
                                            TAX RATE
                                        </th>
                                        <th className="numeric">
                                            TAX
                                        </th>
                                        <th className="numeric">
                                            LINE TOTAL
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {invoice.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="customer-name">
                                                {item.description}
                                            </td>

                                            <td className="numeric">
                                                {item.quantity}
                                            </td>

                                            <td className="numeric">
                                                {money(
                                                    item.unit_price,
                                                    invoice.currency
                                                )}
                                            </td>

                                            <td className="numeric">
                                                {Number(
                                                    item.tax_rate
                                                ).toFixed(2)}
                                                %
                                            </td>

                                            <td className="numeric">
                                                {money(
                                                    item.tax_amount,
                                                    invoice.currency
                                                )}
                                            </td>

                                            <td className="numeric amount-cell">
                                                {money(
                                                    item.line_total,
                                                    invoice.currency
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="item-summary">
                            <InvoiceSummary
                                subtotal={Number(invoice.subtotal)}
                                taxAmount={Number(invoice.tax_amount)}
                                totalAmount={Number(invoice.total_amount)}
                                currency={invoice.currency}
                            />
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="detail-aside">
                    <section className="panel detail-panel">
                        <div className="detail-panel-title">
                            <h2>Invoice status</h2>
                        </div>

                        <div className="timeline">
                            <div className="timeline-entry">
                                <span className="timeline-marker complete">
                                    <Circle size={13} />
                                </span>

                                <div>
                                    <strong>Invoice created</strong>
                                    <p>
                                        {dateTime(
                                            invoice.created_at
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="timeline-entry">
                                <span
                                    className={`timeline-marker ${invoice.status === "FAILED"
                                        ? "failed"
                                        : invoice.status ===
                                            "SUBMITTED"
                                            ? "complete"
                                            : ""
                                        }`}
                                >
                                    <Circle size={13} />
                                </span>

                                <div>
                                    <strong>
                                        {getStatusLabel(
                                            invoice.status
                                        )}
                                    </strong>

                                    <p>
                                        {dateTime(
                                            invoice.updated_at
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Amount summary */}
                    <section className="panel detail-panel">
                        <div className="detail-panel-title">
                            <h2>Amount summary</h2>
                        </div>

                        <div className="detail-kv">
                            <div>
                                <span>Subtotal</span>
                                <strong>
                                    {money(
                                        invoice.subtotal,
                                        invoice.currency
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Tax</span>
                                <strong>
                                    {money(
                                        invoice.tax_amount,
                                        invoice.currency
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Total</span>
                                <strong className="text-lg">
                                    {money(
                                        invoice.total_amount,
                                        invoice.currency
                                    )}
                                </strong>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}

function getStatusLabel(status: Invoice["status"]): string {
    switch (status) {
        case "PENDING":
            return "Pending"
        case "PROCESSING":
            return "Processing"
        case "SUBMITTED":
            return "Submitted"
        case "FAILED":
            return "Failed"
        default:
            return status
    }
}