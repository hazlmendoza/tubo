import type { Invoice, InvoiceStatus, ProcessingAttempt } from '@/types/invoice';

const d = (day: number, time = '10:02:00'): string =>
    `2026-09-${String(day).padStart(2, '0')}T${time}+08:00`;

const attempt = (
    number: number,
    day: number,
    status: 'SUBMITTED' | 'FAILED',
    time: string,
): ProcessingAttempt => ({
    id: `attempt-${day}-${number}`,
    attemptNumber: number,
    startedAt: d(day, time),
    endedAt: d(day, time),
    status,
    httpResponse: status === 'FAILED' ? 503 : 200,
    errorMessage: status === 'FAILED' ? 'Service unavailable' : null,
});

const row = (
    id: number,
    customerName: string,
    amount: number,
    status: InvoiceStatus,
    day: number,
    description: string,
    extra = false,
): Invoice => {
    const items = extra
        ? [
            {
                id: `${id}-1`,
                description,
                quantity: 1,
                unitPrice: (amount * 0.6) / 1.12,
                tax: ((amount * 0.6) / 1.12) * 0.12,
                lineTotal: amount * 0.6,
            },
            {
                id: `${id}-2`,
                description: 'Implementation and support',
                quantity: 1,
                unitPrice: (amount * 0.4) / 1.12,
                tax: ((amount * 0.4) / 1.12) * 0.12,
                lineTotal: amount * 0.4,
            },
        ]
        : [
            {
                id: `${id}-1`,
                description,
                quantity: 1,
                unitPrice: amount / 1.12,
                tax: amount - amount / 1.12,
                lineTotal: amount,
            },
        ];

    const subtotal = items.reduce((n, i) => n + i.quantity * i.unitPrice, 0);
    const taxAmount = items.reduce((n, i) => n + i.tax, 0);

    const processingAttempts: ProcessingAttempt[] =
        status === 'FAILED' && id === 3
            ? [attempt(1, day, 'FAILED', '10:03:00'), attempt(2, day, 'FAILED', '10:08:00'), attempt(3, day, 'FAILED', '10:15:00')]
            : status === 'FAILED'
                ? [attempt(1, day, 'FAILED', '10:15:00')]
                : status === 'SUBMITTED'
                    ? [attempt(1, day, 'SUBMITTED', '10:03:00')]
                    : [];

    return {
        id: String(id),
        invoiceNumber: `INV-${10000 + id}`,
        invoiceDate: d(day),
        seller: 'Tubo Technologies Inc.',
        customerName,
        customerTaxId: `00${id}-123-456-000`,
        customerEmail: `billing@${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}.ph`,
        currency: 'PHP',
        subtotal,
        taxAmount,
        totalAmount: subtotal + taxAmount,
        status,
        createdAt: d(day),
        updatedAt: status === 'FAILED' ? d(day, '10:15:00') : d(day, '10:03:00'),
        items,
        processingAttempts,
    };
};

export const seedInvoices: Invoice[] = [
    row(1, 'ABC Corporation', 125000, 'SUBMITTED', 30, 'Enterprise software license', true),
    row(2, 'XYZ Trading', 48500, 'PROCESSING', 30, 'Inventory system integration'),
    row(3, 'Sample Retail Corp', 75200, 'FAILED', 29, 'Point of sale implementation', true),
    row(4, "Juan's Hardware", 32000, 'PENDING', 28, 'Monthly IT maintenance'),
    row(5, 'Mabuhay Foods Inc.', 96800, 'SUBMITTED', 27, 'Cloud hosting services', true),
    row(6, 'Pacific Star Logistics', 18450, 'FAILED', 26, 'Logistics platform subscription'),
    row(7, 'Santos & Co. Accounting', 64200, 'SUBMITTED', 25, 'Data migration and training', true),
    row(8, 'Greenfield Properties', 113600, 'PENDING', 24, 'Property management software', true),
    row(9, 'Bayani Medical Supplies', 27750, 'SUBMITTED', 23, 'Software maintenance'),
    row(10, 'Luzon Digital Works', 58900, 'PROCESSING', 22, 'API integration and support', true),
];