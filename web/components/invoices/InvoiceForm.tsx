"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"

import type {
    CreateInvoiceInput,
    InvoiceItemInput,
} from "@/types/invoice"

interface InvoiceFormProps {
    onSubmit: (data: CreateInvoiceInput) => Promise<void>
}

const emptyItem: InvoiceItemInput = {
    description: "",
    quantity: 1,
    unit_price: 0,
    tax_rate: 12,
}

const currencies = [
    { code: "PHP", name: "Philippine Peso" },
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "SGD", name: "Singapore Dollar" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
]

export default function InvoiceForm({
    onSubmit,
}: InvoiceFormProps) {
    const [loading, setLoading] = useState(false)

    const [form, setForm] =
        useState<CreateInvoiceInput>({
            invoice_date: new Date()
                .toISOString()
                .split("T")[0],

            seller_name: "",

            customer_name: "",
            customer_tax_id: "",
            customer_email: "",

            currency: "PHP",

            items: [{ ...emptyItem }],
        })

    function updateField(
        field: keyof CreateInvoiceInput,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))
    }

    function updateItem(
        index: number,
        field: keyof InvoiceItemInput,
        value: string
    ) {
        setForm((current) => ({
            ...current,

            items: current.items.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [field]:
                            field === "description"
                                ? value
                                : Number(value),
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
                { ...emptyItem },
            ],
        }))
    }

    function removeItem(index: number) {
        if (form.items.length === 1) {
            return
        }

        setForm((current) => ({
            ...current,
            items: current.items.filter(
                (_, i) => i !== index
            ),
        }))
    }

    const subtotal = form.items.reduce(
        (total, item) =>
            total +
            Number(item.quantity) *
                Number(item.unit_price),
        0
    )

    const taxAmount = form.items.reduce(
        (total, item) => {
            const lineSubtotal =
                Number(item.quantity) *
                Number(item.unit_price)

            const lineTax =
                lineSubtotal *
                (Number(item.tax_rate) / 100)

            return total + lineTax
        },
        0
    )

    const total = subtotal + taxAmount

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        if (loading) {
            return
        }

        /*
         * Client-side validation.
         *
         * Laravel performs the authoritative validation,
         * but these checks provide immediate feedback and
         * prevent obviously invalid submissions.
         */
        const hasInvalidItem = form.items.some(
            (item) =>
                !item.description.trim() ||
                Number(item.quantity) <= 0 ||
                Number(item.unit_price) < 0 ||
                Number(item.tax_rate) < 0 ||
                Number(item.tax_rate) > 100
        )

        if (hasInvalidItem) {
            return
        }

        try {
            setLoading(true)

            /*
             * The backend:
             *
             * 1. Creates the invoice as PENDING.
             * 2. Stores the invoice items.
             * 3. Dispatches ProcessInvoiceJob.
             * 4. Returns HTTP 202 Accepted.
             *
             * Government submission happens asynchronously.
             */
            await onSubmit(form)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Invoice Information */}
            <section className="rounded-xl border bg-background p-6">
                <h2 className="text-lg font-semibold">
                    Invoice Information
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {/* Invoice Date */}
                    <div>
                        <label className="text-sm font-medium">
                            Invoice Date
                        </label>

                        <input
                            required
                            type="date"
                            value={form.invoice_date}
                            onChange={(e) =>
                                updateField(
                                    "invoice_date",
                                    e.target.value
                                )
                            }
                            className="mt-2 w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="text-sm font-medium">
                            Currency
                        </label>

                        <select
                            required
                            value={form.currency}
                            onChange={(e) =>
                                updateField(
                                    "currency",
                                    e.target.value
                                )
                            }
                            className="mt-2 w-full rounded-lg border px-3 py-2"
                        >
                            {currencies.map((currency) => (
                                <option
                                    key={currency.code}
                                    value={currency.code}
                                >
                                    {currency.code} -{" "}
                                    {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Seller */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">
                            Seller / Company Name
                        </label>

                        <input
                            required
                            value={form.seller_name}
                            onChange={(e) =>
                                updateField(
                                    "seller_name",
                                    e.target.value
                                )
                            }
                            className="mt-2 w-full rounded-lg border px-3 py-2"
                            placeholder="Your company name"
                        />

                        <p className="mt-1 text-xs text-muted-foreground">
                            This will identify the seller on the
                            invoice.
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                    Invoice number and financial totals are
                    generated and calculated by the server.
                </p>
            </section>

            {/* Customer Information */}
            <section className="rounded-xl border bg-background p-6">
                <h2 className="text-lg font-semibold">
                    Customer Information
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {/* Customer Name */}
                    <div>
                        <label className="text-sm font-medium">
                            Customer Name
                        </label>

                        <input
                            required
                            value={form.customer_name}
                            onChange={(e) =>
                                updateField(
                                    "customer_name",
                                    e.target.value
                                )
                            }
                            className="mt-2 w-full rounded-lg border px-3 py-2"
                            placeholder="Customer or company name"
                        />
                    </div>

                    {/* Customer Tax ID */}
                    <div>
                        <label className="text-sm font-medium">
                            Tax ID
                        </label>

                        <input
                            required
                            value={form.customer_tax_id}
                            onChange={(e) =>
                                updateField(
                                    "customer_tax_id",
                                    e.target.value
                                )
                            }
                            className="mt-2 w-full rounded-lg border px-3 py-2"
                            placeholder="Tax identification number"
                        />
                    </div>

                    {/* Customer Email */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">
                            Customer Email
                        </label>

                        <input
                            required
                            type="email"
                            value={form.customer_email}
                            onChange={(e) =>
                                updateField(
                                    "customer_email",
                                    e.target.value
                                )
                            }
                            className="mt-2 w-full rounded-lg border px-3 py-2"
                            placeholder="customer@example.com"
                        />
                    </div>
                </div>
            </section>

            {/* Invoice Items */}
            <section className="rounded-xl border bg-background p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Invoice Items
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Add the products or services included
                            in this invoice.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Add Item
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    {form.items.map((item, index) => {
                        const lineSubtotal =
                            Number(item.quantity) *
                            Number(item.unit_price)

                        const lineTax =
                            lineSubtotal *
                            (Number(item.tax_rate) / 100)

                        const lineTotal =
                            lineSubtotal + lineTax

                        return (
                            <div
                                key={index}
                                className="rounded-lg border p-4"
                            >
                                <div className="grid gap-4 md:grid-cols-12">
                                    {/* Description */}
                                    <div className="md:col-span-4">
                                        <label className="text-xs font-medium">
                                            Description
                                        </label>

                                        <input
                                            required
                                            value={
                                                item.description
                                            }
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                                            placeholder="Website development"
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium">
                                            Quantity
                                        </label>

                                        <input
                                            required
                                            min="0.01"
                                            step="0.01"
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "quantity",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                                        />
                                    </div>

                                    {/* Unit Price */}
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium">
                                            Unit Price
                                        </label>

                                        <input
                                            required
                                            min="0"
                                            step="0.01"
                                            type="number"
                                            value={
                                                item.unit_price
                                            }
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "unit_price",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                                        />
                                    </div>

                                    {/* Tax Rate */}
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium">
                                            Tax Rate (%)
                                        </label>

                                        <input
                                            required
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            type="number"
                                            value={
                                                item.tax_rate
                                            }
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "tax_rate",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                                        />
                                    </div>

                                    {/* Line Total */}
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium">
                                            Line Total
                                        </label>

                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm">
                                                {form.currency}{" "}
                                                {lineTotal.toFixed(
                                                    2
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    loading ||
                                                    form.items
                                                        .length ===
                                                        1
                                                }
                                                className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex justify-end text-xs text-muted-foreground">
                                    {item.tax_rate}% tax:{" "}
                                    {form.currency}{" "}
                                    {lineTax.toFixed(2)}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Invoice Totals */}
                <div className="mt-6 ml-auto max-w-sm space-y-3 border-t pt-5">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Subtotal
                        </span>

                        <span>
                            {form.currency}{" "}
                            {subtotal.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Tax
                        </span>

                        <span>
                            {form.currency}{" "}
                            {taxAmount.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between border-t pt-3 text-base font-semibold">
                        <span>Total</span>

                        <span>
                            {form.currency}{" "}
                            {total.toFixed(2)}
                        </span>
                    </div>
                </div>
            </section>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
                <Link
                    href="/invoices"
                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted"
                >
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Creating..."
                        : "Create Invoice"}
                </button>
            </div>
        </form>
    )
}