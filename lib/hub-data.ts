export type EnquiryStatus = "New" | "Contacted" | "Quoted" | "Closed";
export type JobStatus = "Planned" | "Survey" | "Manufacturing" | "Ready" | "Installation" | "Complete";
export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue";

export type Enquiry = {
  id: string; customerName: string; email: string; phone: string; site: string;
  summary: string; status: EnquiryStatus; createdAt: string;
};
export type Job = {
  id: string; quoteId: string; reference: string; customerName: string; site: string;
  description: string; value: string; status: JobStatus; targetDate: string;
  drawingStatus: "Not started" | "In progress" | "Approved";
  invoiceStatus: "Not raised" | "Draft" | "Sent" | "Paid";
};
export type Invoice = {
  id: string; jobId: string; reference: string; customerName: string; amount: string;
  dueDate: string; status: InvoiceStatus;
};
export type StockItem = {
  id: string; name: string; sku: string; quantity: number; reorderLevel: number; supplier: string;
};
export type Supplier = {
  id: string; name: string; category: string; contact: string; email: string; phone: string;
};

const keys = {
  enquiries: "arrad-enquiries", jobs: "arrad-jobs", invoices: "arrad-invoices",
  stock: "arrad-stock", suppliers: "arrad-suppliers",
} as const;

function read<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function write<T>(key: string, records: T[]) {
  localStorage.setItem(key, JSON.stringify(records));
  window.dispatchEvent(new Event("arrad-data-change"));
}

export const hubData = {
  enquiries: () => read<Enquiry>(keys.enquiries),
  jobs: () => read<Job>(keys.jobs),
  invoices: () => read<Invoice>(keys.invoices),
  stock: () => read<StockItem>(keys.stock),
  suppliers: () => read<Supplier>(keys.suppliers),
  saveEnquiries: (records: Enquiry[]) => write(keys.enquiries, records),
  saveJobs: (records: Job[]) => write(keys.jobs, records),
  saveInvoices: (records: Invoice[]) => write(keys.invoices, records),
  saveStock: (records: StockItem[]) => write(keys.stock, records),
  saveSuppliers: (records: Supplier[]) => write(keys.suppliers, records),
};

export function updateRecord<T extends { id: string }>(records: T[], id: string, patch: Partial<T>) {
  return records.map((record) => record.id === id ? { ...record, ...patch } : record);
}

export function shortDate(value: string) {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB").format(date);
}
