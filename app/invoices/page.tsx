"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { formatMoney } from "@/lib/quotes";
import { hubData, shortDate, updateRecord, type Invoice, type InvoiceStatus } from "@/lib/hub-data";

export default function InvoicesPage() {
  const [records, setRecords] = useState<Invoice[]>([]);
  useEffect(() => { const task = setTimeout(() => setRecords(hubData.invoices()), 0); return () => clearTimeout(task); }, []);
  function patch(id: string, value: Partial<Invoice>) {
    const updated = updateRecord(records, id, value); hubData.saveInvoices(updated); setRecords(updated);
    const invoice = updated.find((record) => record.id === id);
    if (invoice) { const jobs = hubData.jobs(); const job = jobs.find((record) => record.id === invoice.jobId); if (job) hubData.saveJobs(updateRecord(jobs, job.id, { invoiceStatus: invoice.status === "Overdue" ? "Sent" : invoice.status })); }
  }
  const outstanding = records.filter((record) => record.status !== "Paid").reduce((sum, record) => sum + Number(record.amount || 0), 0);
  return <AppShell title="Invoices" description="Raise invoices from jobs and track what has been sent, paid or needs attention.">
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Metric label="Invoices" value={String(records.length)} /><Metric label="Outstanding" value={formatMoney(String(outstanding))} /><Metric label="Paid" value={String(records.filter((record) => record.status === "Paid").length)} /></div>
    {!records.length ? <EmptyState title="No invoices yet" description="Use Raise draft invoice on a live job when it is ready for billing." /> : <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-200">{records.map((invoice) => <article key={invoice.id} className="grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_160px_150px] md:items-center"><div><div className="flex gap-2"><h2 className="font-bold text-slate-950">{invoice.reference}</h2><StatusBadge>{invoice.status}</StatusBadge></div><p className="mt-1 text-sm text-slate-500">{invoice.customerName}</p></div><strong>{formatMoney(invoice.amount)}</strong><label><span className="sr-only">Due date</span><input aria-label={`Due date for ${invoice.reference}`} type="date" className="small-select w-full" value={invoice.dueDate} onChange={(e) => patch(invoice.id, { dueDate: e.target.value })} />{invoice.dueDate && <small className="mt-1 block text-slate-400">Due {shortDate(invoice.dueDate)}</small>}</label><select aria-label={`Status for ${invoice.reference}`} className="small-select" value={invoice.status} onChange={(e) => patch(invoice.id, { status: e.target.value as InvoiceStatus })}><option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option></select></article>)}</div></div>}
  </AppShell>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div>; }
