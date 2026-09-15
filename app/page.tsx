"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { hubData, type Enquiry, type Invoice, type Job, type StockItem } from "@/lib/hub-data";
import { formatMoney, loadQuotes, type Quote } from "@/lib/quotes";

type Snapshot = { enquiries: Enquiry[]; quotes: Quote[]; jobs: Job[]; invoices: Invoice[]; stock: StockItem[] };
const empty: Snapshot = { enquiries: [], quotes: [], jobs: [], invoices: [], stock: [] };

export default function Home() {
  const [data, setData] = useState(empty);
  useEffect(() => {
    const load = () => setData({ enquiries: hubData.enquiries(), quotes: loadQuotes(), jobs: hubData.jobs(), invoices: hubData.invoices(), stock: hubData.stock() });
    const task = setTimeout(load, 0); window.addEventListener("arrad-data-change", load); return () => { clearTimeout(task); window.removeEventListener("arrad-data-change", load); };
  }, []);
  const outstanding = data.invoices.filter((record) => record.status !== "Paid").reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const attention = [
    ...data.enquiries.filter((record) => record.status === "New").map((record) => ({ label: "New enquiry", name: record.customerName, href: "/enquiries", status: record.status })),
    ...data.stock.filter((record) => record.quantity <= record.reorderLevel).map((record) => ({ label: "Stock reorder", name: record.name, href: "/stock", status: "Low stock" })),
    ...data.invoices.filter((record) => record.status === "Overdue").map((record) => ({ label: "Invoice overdue", name: record.reference, href: "/invoices", status: record.status })),
  ];
  return <AppShell title="Business dashboard" description="A live view of enquiries, quotes, jobs, installations, invoices and materials.">
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="New enquiries" value={String(data.enquiries.filter((r) => r.status === "New").length)} href="/enquiries" /><Metric label="Quotes awaiting" value={String(data.quotes.filter((r) => r.status === "Sent").length)} href="/jobs/quotes" /><Metric label="Active jobs" value={String(data.jobs.filter((r) => r.status !== "Complete").length)} href="/jobs" /><Metric label="Outstanding invoices" value={formatMoney(String(outstanding))} href="/invoices" /></section>
    <section className="mt-8"><h2 className="mb-4 text-xl font-bold text-slate-950">Arrad workflow</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
      ["1", "Enquiries", "Capture and qualify new work", "/enquiries"], ["2", "Quotes", "Price, send and accept", "/jobs/quotes"], ["3", "Jobs & production", "Draw, manufacture and schedule", "/jobs"], ["4", "Install & invoice", "Complete work and collect payment", "/operations/installations"],
    ].map(([step, title, text, href]) => <Link key={title} href={href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-slate-950">{step}</span><h3 className="mt-4 font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p></Link>)}</div></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-950">Needs attention</h2>{attention.length ? <div className="mt-4 divide-y divide-slate-100">{attention.slice(0, 6).map((item, index) => <Link href={item.href} key={`${item.label}-${index}`} className="flex items-center justify-between py-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}</p><p className="mt-1 font-semibold text-slate-800">{item.name}</p></div><StatusBadge>{item.status}</StatusBadge></Link>)}</div> : <p className="mt-4 text-sm text-slate-500">Nothing needs urgent attention.</p>}</div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-950">Operations</h2><div className="mt-4 grid grid-cols-2 gap-3"><Quick label="In manufacturing" value={data.jobs.filter((r) => r.status === "Manufacturing").length} /><Quick label="Ready to install" value={data.jobs.filter((r) => r.status === "Ready").length} /><Quick label="Completed jobs" value={data.jobs.filter((r) => r.status === "Complete").length} /><Quick label="Low stock items" value={data.stock.filter((r) => r.quantity <= r.reorderLevel).length} /></div></div></section>
  </AppShell>;
}

function Metric({ label, value, href }: { label: string; value: string; href: string }) { return <Link href={href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-400"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p></Link>; }
function Quick({ label, value }: { label: string; value: number }) { return <div className="rounded-lg bg-slate-50 p-4"><p className="text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p></div>; }
