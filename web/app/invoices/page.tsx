"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
    AlertCircle,
    Clock3,
    FileText,
    Plus,
    Search,
    Send,
    Timer,
    X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { invoiceService } from "@/services/invoiceService"

import type {
    Invoice,
    InvoiceStatus,
} from "@/types/invoice"

import {
    EmptyState,
    ErrorState,
    InvoiceTable,
    LoadingState,
    PageHeading,
    Pagination,
    StatCard,
} from "./shared"

const PAGE_SIZE = 6

const fieldClass = "h-9 bg-card text-[13px]"

export default function InvoiceListPage({
    dashboard = false,
}: {
    dashboard?: boolean
}) {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [query, setQuery] = useState("")
    const [number, setNumber] = useState("")
    const [status, setStatus] =
        useState<"ALL" | InvoiceStatus>("ALL")
    const [filterDate, setFilterDate] = useState("")

    const [page, setPage] = useState(1)

    // Delete state
    const [deleteInvoice, setDeleteInvoice] =
        useState<Invoice | null>(null)

    const [deleting, setDeleting] = useState(false)

    async function load() {
        setLoading(true)
        setError("")

        try {
            const result =
                await invoiceService.getInvoices()

            setInvoices(result.invoices)
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load invoices."
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    // Invoice status counts.
    const counts = useMemo(
        () => ({
            ALL: invoices.length,

            PENDING: invoices.filter(
                (invoice) =>
                    invoice.status === "PENDING"
            ).length,

            PROCESSING: invoices.filter(
                (invoice) =>
                    invoice.status === "PROCESSING"
            ).length,

            SUBMITTED: invoices.filter(
                (invoice) =>
                    invoice.status === "SUBMITTED"
            ).length,

            FAILED: invoices.filter(
                (invoice) =>
                    invoice.status === "FAILED"
            ).length,
        }),
        [invoices]
    )

    // Filter invoices on the frontend.
    const filtered = useMemo(() => {
        return invoices.filter((invoice) => {
            const matchesStatus =
                status === "ALL" ||
                invoice.status === status

            const matchesDate =
                !filterDate ||
                invoice.invoice_date.slice(0, 10) ===
                filterDate

            const matchesNumber =
                !number ||
                invoice.invoice_number
                    .toLowerCase()
                    .includes(number.toLowerCase())

            const matchesQuery =
                !query ||
                `${invoice.invoice_number} ${invoice.customer_name}`
                    .toLowerCase()
                    .includes(query.toLowerCase())

            return (
                matchesStatus &&
                matchesDate &&
                matchesNumber &&
                matchesQuery
            )
        })
    }, [
        invoices,
        query,
        number,
        status,
        filterDate,
    ])

    const pages = Math.max(
        1,
        Math.ceil(filtered.length / PAGE_SIZE)
    )

    const safePage = Math.min(page, pages)

    const paginatedInvoices = filtered.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    )

    function clearFilters() {
        setQuery("")
        setNumber("")
        setStatus("ALL")
        setFilterDate("")
        setPage(1)
    }

    function openDeleteModal(invoice: Invoice) {
        setDeleteInvoice(invoice)
    }

    async function handleDeleteInvoice() {
        if (!deleteInvoice) return

        setDeleting(true)

        try {
            await invoiceService.deleteInvoice(
                deleteInvoice.id
            )

            setInvoices((current) =>
                current.filter(
                    (invoice) =>
                        invoice.id !== deleteInvoice.id
                )
            )

            toast.success(
                "Invoice deleted successfully."
            )

            setDeleteInvoice(null)

            // Keep the user on a valid page
            const remainingCount =
                filtered.length - 1

            const remainingPages = Math.max(
                1,
                Math.ceil(
                    remainingCount / PAGE_SIZE
                )
            )

            setPage((currentPage) =>
                Math.min(
                    currentPage,
                    remainingPages
                )
            )
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to delete invoice."
            )
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="mx-auto w-full max-w-[1510px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <PageHeading
                eyebrow={
                    dashboard
                        ? "WORKSPACE / OVERVIEW"
                        : "WORKSPACE / INVOICES"
                }
                title={
                    dashboard
                        ? "Invoice Dashboard"
                        : "Invoices"
                }
                description={
                    dashboard
                        ? "Monitor and manage your invoices."
                        : "View, track, and manage every invoice in one place."
                }
                action={
                    <Button
                        asChild
                        size="sm"
                        className="shrink-0 whitespace-nowrap"
                    >
                        <Link
                            href="/invoices/create"
                            className="flex items-center gap-2"
                        >
                            <Plus className="size-4 shrink-0" />
                            <span>Create Invoice</span>
                        </Link>
                    </Button>
                }
            />

            {/* Dashboard statistics */}
            {dashboard && (
                <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 [&>*:first-child]:col-span-2 md:[&>*:first-child]:col-span-1">
                    <StatCard
                        label="Total Invoices"
                        value={counts.ALL}
                        icon={
                            <FileText size={18} />
                        }
                    />

                    <StatCard
                        label="Pending"
                        value={counts.PENDING}
                        status="PENDING"
                        icon={
                            <Clock3 size={18} />
                        }
                    />

                    <StatCard
                        label="Processing"
                        value={counts.PROCESSING}
                        status="PROCESSING"
                        icon={
                            <Timer size={18} />
                        }
                    />

                    <StatCard
                        label="Submitted"
                        value={counts.SUBMITTED}
                        status="SUBMITTED"
                        icon={
                            <Send size={18} />
                        }
                    />

                    <StatCard
                        label="Failed"
                        value={counts.FAILED}
                        status="FAILED"
                        icon={
                            <AlertCircle
                                size={18}
                            />
                        }
                    />
                </div>
            )}

            <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <div className="min-w-0">
                        <h2 className="font-display text-[15px] font-bold text-foreground">
                            {dashboard
                                ? "Recent invoices"
                                : "All invoices"}
                        </h2>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {dashboard
                                ? "The latest activity across your invoices"
                                : "Search and filter your invoice records"}
                        </p>
                    </div>

                    {dashboard && (
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="shrink-0 whitespace-nowrap"
                        >
                            <Link href="/invoices">
                                View all invoices
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="grid gap-2 border-b border-border bg-muted/40 px-4 py-3 sm:grid-cols-2 lg:grid-cols-[minmax(210px,1fr)_160px_150px_160px_auto]">
                    {/* Search */}
                    <div className="relative sm:col-span-2 lg:col-span-1">
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            className={`${fieldClass} pl-9`}
                            aria-label="Search invoice number or customer"
                            placeholder="Search invoice or customer..."
                            value={query}
                            onChange={(event) => {
                                setQuery(
                                    event.target.value
                                )
                                setPage(1)
                            }}
                        />
                    </div>

                    {/* Invoice number */}
                    <Input
                        className={fieldClass}
                        aria-label="Filter by invoice number"
                        placeholder="Invoice number"
                        value={number}
                        onChange={(event) => {
                            setNumber(
                                event.target.value
                            )
                            setPage(1)
                        }}
                    />

                    {/* Status */}
                    <select
                        aria-label="Filter by status"
                        className="h-9 w-full rounded-md border border-input bg-card px-3 text-[13px] text-foreground outline-none transition-shadow focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                        value={status}
                        onChange={(event) => {
                            setStatus(
                                event.target
                                    .value as
                                | "ALL"
                                | InvoiceStatus
                            )
                            setPage(1)
                        }}
                    >
                        <option value="ALL">
                            All statuses
                        </option>

                        {(
                            [
                                "PENDING",
                                "PROCESSING",
                                "SUBMITTED",
                                "FAILED",
                            ] as InvoiceStatus[]
                        ).map(
                            (invoiceStatus) => (
                                <option
                                    key={
                                        invoiceStatus
                                    }
                                    value={
                                        invoiceStatus
                                    }
                                >
                                    {invoiceStatus
                                        .charAt(
                                            0
                                        )
                                        .toUpperCase() +
                                        invoiceStatus
                                            .slice(
                                                1
                                            )
                                            .toLowerCase()}
                                </option>
                            )
                        )}
                    </select>

                    {/* Date */}
                    <Input
                        aria-label="Filter by invoice date"
                        className={fieldClass}
                        type="date"
                        value={filterDate}
                        onChange={(event) => {
                            setFilterDate(
                                event.target.value
                            )
                            setPage(1)
                        }}
                    />

                    {/* Clear */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-self-start whitespace-nowrap sm:col-span-2 lg:col-span-1"
                        onClick={clearFilters}
                        disabled={
                            !query &&
                            !number &&
                            status === "ALL" &&
                            !filterDate
                        }
                    >
                        <X size={15} />
                        <span>Clear</span>
                    </Button>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState
                        message={error}
                        retry={() => void load()}
                    />
                ) : paginatedInvoices.length > 0 ? (
                    <>
                        <InvoiceTable
                            invoices={
                                paginatedInvoices
                            }
                            showCreated={!dashboard}
                            onDelete={
                                openDeleteModal
                            }
                        />

                        <Pagination
                            page={safePage}
                            pages={pages}
                            count={filtered.length}
                            pageSize={PAGE_SIZE}
                            onPage={setPage}
                        />
                    </>
                ) : (
                    <EmptyState />
                )}
            </section>

            {/* Delete confirmation modal */}
            <AlertDialog
                open={!!deleteInvoice}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setDeleteInvoice(null)
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete invoice?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to
                            delete{" "}
                            <span className="font-medium text-foreground">
                                {
                                    deleteInvoice?.invoice_number
                                }
                            </span>
                            ? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={deleting}
                        >
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={deleting}
                            onClick={(event) => {
                                event.preventDefault()
                                void handleDeleteInvoice()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Invoice"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}