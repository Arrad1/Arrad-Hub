"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import { hubData, type Enquiry, type Job } from "@/lib/hub-data";
import { loadQuotes, type Quote } from "@/lib/quotes";

export default function CustomersPage() {
  const [data, setData] = useState<{ enquiries: Enquiry[]; quotes: Quote[]; jobs: Job[] }>({ enquiries: [], quotes: [], jobs: [] }); const [query, setQuery] = useState("");
  useEffect(() => { const task = setTimeout(() => setData({ enquiries: hubData.enquiries(), quotes: loadQuotes(), jobs: hubData.jobs() }), 0); return () => clearTimeout(task); }, []);
  const customers = useMemo(() => { const map = new Map<string, { name: string; email: string; phone: string; sites: Set<string>; enquiries: number; quotes: number; jobs: number }>();
    const get = (name: string) => { const key = name.trim().toLowerCase(); if (!map.has(key)) map.set(key, { name: name || "Unnamed customer", email: "", phone: "", sites: new Set(), enquiries: 0, quotes: 0, jobs: 0 }); return map.get(key)!; };
    data.enquiries.forEach((item) => { const customer = get(item.customerName); customer.email ||= item.email; customer.phone ||= item.phone; if (item.site) customer.sites.add(item.site); customer.enquiries++; });
    data.quotes.forEach((item) => { const customer = get(item.customerName); customer.email ||= item.customerEmail; customer.phone ||= item.customerPhone; if (item.holidayPark) customer.sites.add(item.holidayPark); customer.quotes++; });
    data.jobs.forEach((item) => { const customer = get(item.customerName); if (item.site) customer.sites.add(item.site); customer.jobs++; });
    return [...map.values()].filter((customer) => [customer.name, customer.email, customer.phone, ...customer.sites].join(" ").toLowerCase().includes(query.toLowerCase()));
  }, [data, query]);
  return <AppShell title="Customers" description="A single customer view built automatically from enquiries, quotes and live jobs." actions={<input aria-label="Search customers" className="form-input sm:w-72" placeholder="Search customers" value={query} onChange={(e) => setQuery(e.target.value)} />}>
    {!customers.length ? <EmptyState title="No customers yet" description="Customer records will appear automatically as enquiries and quotes are added." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{customers.map((customer) => <article key={customer.name.toLowerCase()} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-slate-950">{customer.name}</h2><p className="mt-2 text-sm text-slate-600">{[...customer.sites].join(", ") || "No site recorded"}</p><div className="mt-3 text-sm text-slate-500">{customer.email && <p>{customer.email}</p>}{customer.phone && <p>{customer.phone}</p>}</div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center"><Count label="Enquiries" value={customer.enquiries} /><Count label="Quotes" value={customer.quotes} /><Count label="Jobs" value={customer.jobs} /></div></article>)}</div>}
  </AppShell>;
}
function Count({ label, value }: { label: string; value: number }) { return <div><strong className="block text-lg text-slate-950">{value}</strong><small className="text-slate-400">{label}</small></div>; }
