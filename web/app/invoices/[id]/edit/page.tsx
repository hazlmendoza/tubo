"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { invoiceService } from "@/services/invoiceService"
import type { Invoice } from "@/types/invoice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    PageHeading,
    ErrorState,
    LoadingState,
} from "../../shared"

type PageProps = {
    params: Promise<{
        id: string
    }>
}

type InvoiceItemForm = {
    description: string
    quantity: string
    unit_price: string
    tax_rate: string
}

type InvoiceForm = {
    invoice_date: string
    seller_name: string
    customer_name: string
    customer_tax_id: string
    customer_email: string
    currency: string
    items: InvoiceItemForm[]
}

const fieldClass = "h-9 bg-card text-[13px]"

export default function InvoiceEditPage({ params }: PageProps) {
    const router = useRouter()

    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const [form, setForm] = useState<InvoiceForm>({
        invoice_date: "",
        seller_name: "",
        customer_name: "",
        customer_tax_id: "",
        customer_email: "",
        currency: "PHP",
        items: [
            {
                description: "",
                quantity: "1",
                unit_price: "0",
                tax_rate: "0",
            },
        ],
    })

    useEffect(() => {
        let cancelled = false

        const loadInvoice = async () => {
            try {
                const { id } = await params

                if (!id || id === "undefined") {
                    throw new Error("Invoice ID is missing.")
                }

                const data = await invoiceService.getInvoice(id)

                if (cancelled) return

                setInvoice(data)

                setForm({
                    invoice_date: data.invoice_date
                        ? data.invoice_date.slice(0, 10)
                        : "",
                    seller_name: data.seller_name ?? "",
                    customer_name: data.customer_name ?? "",
                    customer_tax_id: data.customer_tax_id ?? "",
                    customer_email: data.customer_email ?? "",
                    currency: data.currency ?? "PHP",
                    items:
                        data.items.length > 0
                            ? data.items.map((item) => ({
                                description:
                                    item.description ?? "",
                                quantity: String(
                                    item.quantity ?? ""
                                ),
                                unit_price: String(
                                    item.unit_price ?? ""
                                ),
                                tax_rate: String(
                                    item.tax_rate ?? "0"
                                ),
                            }))
                            : [
                                {
                                    description: "",
                                    quantity: "1",
                                    unit_price: "0",
                                    tax_rate: "0",
                                },
                            ],
                })
            } catch (e) {
                if (!cancelled) {
                    setError(
                        e instanceof Error
                            ? e.message
                            : "Unable to load invoice."
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadInvoice()

        return () => {
            cancelled = true
        }
    }, [params])

    function updateField(
        field: keyof Omit<InvoiceForm, "items">,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))
    }

    function updateItem(
        index: number,
        field: keyof InvoiceItemForm,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            ),
        }))
    }

    function addItem() {
        setForm((current) => ({
            ...current,
            items: [
                ...current.items,
                {
                    description: "",
                    quantity: "1",
                    unit_price: "0",
                    tax_rate: "0",
                },
            ],
        }))
    }

    function removeItem(index: number) {
        if (form.items.length === 1) {
            toast.error("An invoice must have at least one item.")
            return
        }

        setForm((current) => ({
            ...current,
            items: current.items.filter(
                (_, itemIndex) => itemIndex !== index
            ),
        }))
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        if (!invoice) return

        setSaving(true)
        setError("")

        try {
            const payload = {
                invoice_date: form.invoice_date,
                seller_name: form.seller_name,
                customer_name: form.customer_name,
                customer_tax_id: form.customer_tax_id,
                customer_email: form.customer_email,
                currency: form.currency.toUpperCase(),
                items: form.items.map((item) => ({
                    description: item.description,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.unit_price),
                    tax_rate: Number(item.tax_rate),
                })),
            }

            await invoiceService.updateInvoice(
                invoice.id,
                payload
            )

            toast.success("Invoice updated successfully.")

            router.push(`/invoices/${invoice.id}`)
            router.refresh()
        } catch (e) {
            const message =
                e instanceof Error
                    ? e.message
                    : "Unable to update invoice."

            setError(message)
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="content-wrap">
                <PageHeading title="Edit invoice" />

                <div className="panel mt-6">
                    <LoadingState rows={10} />
                </div>
            </div>
        )
    }

    if (error && !invoice) {
        return (
            <div className="content-wrap">
                <PageHeading title="Edit invoice" />

                <div className="panel mt-6">
                    <ErrorState
                        message={error}
                        retry={() => {
                            window.location.reload()
                        }}
                    />
                </div>
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="content-wrap">
                <PageHeading title="Edit invoice" />

                <div className="panel mt-6">
                    <ErrorState
                        message="Invoice not found."
                        retry={() => {
                            window.location.reload()
                        }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="content-wrap">
            <PageHeading
                eyebrow="WORKSPACE / INVOICES / EDIT"
                title={`Edit Invoice #${invoice.invoice_number}`}
                description="Update the invoice details and line items."
                action={
                    <Button
                        variant="outline"
                        asChild
                        size="sm"
                        className="h-9 w-auto shrink-0 whitespace-nowrap px-3"
                    >
                        <Link
                            href={`/invoices/${invoice.id}`}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="size-4 shrink-0" />
                            <span>Back to Invoice</span>
                        </Link>
                    </Button>
                }
            />

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Invoice information */}
                    <section className="panel">
                        <div className="detail-panel-title">
                            <h2>Invoice information</h2>
                            <span>INVOICE DETAILS</span>
                        </div>

                        <div className="grid gap-4 p-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="invoice_number"
                                    className="text-xs font-medium"
                                >
                                    Invoice number
                                </label>

                                <Input
                                    id="invoice_number"
                                    value={invoice.invoice_number}
                                    disabled
                                    className={fieldClass}
                                />

                                <p className="text-[11px] text-muted-foreground">
                                    Invoice number cannot be changed.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="invoice_date"
                                    className="text-xs font-medium"
                                >
                                    Invoice date
                                </label>

                                <Input
                                    id="invoice_date"
                                    type="date"
                                    value={form.invoice_date}
                                    onChange={(event) =>
                                        updateField(
                                            "invoice_date",
                                            event.target.value
                                        )
                                    }
                                    required
                                    className={fieldClass}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="currency"
                                    className="text-xs font-medium"
                                >
                                    Currency
                                </label>

                                <select
                                    id="currency"
                                    value={form.currency}
                                    onChange={(event) =>
                                        updateField(
                                            "currency",
                                            event.target.value
                                        )
                                    }
                                    className={`${fieldClass} w-full rounded-md border border-input px-3 outline-none focus:ring-2 focus:ring-ring`}
                                    required
                                >
                                    <option value="PHP">PHP</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Seller */}
                    <section className="panel">
                        <div className="detail-panel-title">
                            <h2>Seller</h2>
                            <span>FROM</span>
                        </div>

                        <div className="p-5">
                            <div className="max-w-xl space-y-1.5">
                                <label
                                    htmlFor="seller_name"
                                    className="text-xs font-medium"
                                >
                                    Seller name
                                </label>

                                <Input
                                    id="seller_name"
                                    value={form.seller_name}
                                    onChange={(event) =>
                                        updateField(
                                            "seller_name",
                                            event.target.value
                                        )
                                    }
                                    required
                                    className={fieldClass}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Customer */}
                    <section className="panel">
                        <div className="detail-panel-title">
                            <h2>Customer</h2>
                            <span>BILL TO</span>
                        </div>

                        <div className="grid gap-4 p-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="customer_name"
                                    className="text-xs font-medium"
                                >
                                    Customer name
                                </label>

                                <Input
                                    id="customer_name"
                                    value={form.customer_name}
                                    onChange={(event) =>
                                        updateField(
                                            "customer_name",
                                            event.target.value
                                        )
                                    }
                                    required
                                    className={fieldClass}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="customer_tax_id"
                                    className="text-xs font-medium"
                                >
                                    Tax ID
                                </label>

                                <Input
                                    id="customer_tax_id"
                                    value={form.customer_tax_id}
                                    onChange={(event) =>
                                        updateField(
                                            "customer_tax_id",
                                            event.target.value
                                        )
                                    }
                                    required
                                    className={fieldClass}
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label
                                    htmlFor="customer_email"
                                    className="text-xs font-medium"
                                >
                                    Email address
                                </label>

                                <Input
                                    id="customer_email"
                                    type="email"
                                    value={form.customer_email}
                                    onChange={(event) =>
                                        updateField(
                                            "customer_email",
                                            event.target.value
                                        )
                                    }
                                    required
                                    className={fieldClass}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Items */}
                    <section className="panel">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Invoice items
                                </h2>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Update the products or services included
                                    in this invoice.
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                                className="shrink-0"
                            >
                                <Plus className="mr-2 size-4" />
                                Add item
                            </Button>
                        </div>

                        <div className="space-y-4 p-5">
                            {form.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-border p-4"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Item {index + 1}
                                        </p>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removeItem(index)
                                            }
                                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Remove
                                        </Button>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="space-y-1.5 lg:col-span-2">
                                            <label className="text-xs font-medium">
                                                Description
                                            </label>

                                            <Input
                                                value={item.description}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        "description",
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                className={fieldClass}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium">
                                                Quantity
                                            </label>

                                            <Input
                                                type="number"
                                                min="0.0001"
                                                step="any"
                                                value={item.quantity}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        "quantity",
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                className={fieldClass}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium">
                                                Unit price
                                            </label>

                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        "unit_price",
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                className={fieldClass}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium">
                                                Tax rate (%)
                                            </label>

                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={item.tax_rate}
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        "tax_rate",
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                className={fieldClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Error */}
                    {error && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            disabled={saving}
                        >
                            <Link href={`/invoices/${invoice.id}`}>
                                Cancel
                            </Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={saving}
                            className="min-w-[130px]"
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}