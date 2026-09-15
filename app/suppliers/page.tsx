"use client";

import { useEffect, useState, type FormEvent } from "react";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import { hubData, type Supplier } from "@/lib/hub-data";

export default function SuppliersPage() {
  const [records, setRecords] = useState<Supplier[]>([]); const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", contact: "", email: "", phone: "" });
  useEffect(() => { const task = setTimeout(() => setRecords(hubData.suppliers()), 0); return () => clearTimeout(task); }, []);
  function submit(event: FormEvent) { event.preventDefault(); const updated = [{ id: crypto.randomUUID(), ...form }, ...records]; hubData.saveSuppliers(updated); setRecords(updated); setShow(false); setForm({ name: "", category: "", contact: "", email: "", phone: "" }); }
  return <AppShell title="Suppliers" description="Keep purchasing contacts and material categories in one accessible register." actions={<button className="primary-button" onClick={() => setShow(!show)}>{show ? "Close form" : "+ Add supplier"}</button>}>
    {show && <form onSubmit={submit} className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2"><SupplierField label="Supplier name" value={form.name} set={(v) => setForm({ ...form, name: v })} required /><SupplierField label="Category" value={form.category} set={(v) => setForm({ ...form, category: v })} /><SupplierField label="Contact person" value={form.contact} set={(v) => setForm({ ...form, contact: v })} /><SupplierField label="Email" value={form.email} set={(v) => setForm({ ...form, email: v })} type="email" /><SupplierField label="Phone" value={form.phone} set={(v) => setForm({ ...form, phone: v })} /><div className="sm:col-span-2 sm:text-right"><button className="primary-button">Save supplier</button></div></form>}
    {!records.length ? <EmptyState title="No suppliers yet" description="Add supplier contacts for decking, balustrades, glass, fixings and other materials." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{records.map((supplier) => <article key={supplier.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-[#5e9e00]">{supplier.category || "General supplier"}</p><h2 className="mt-2 text-lg font-bold text-slate-950">{supplier.name}</h2><p className="mt-3 text-sm text-slate-600">{supplier.contact || "No contact named"}</p>{supplier.email && <a className="mt-2 block text-sm font-medium text-blue-700" href={`mailto:${supplier.email}`}>{supplier.email}</a>}{supplier.phone && <a className="mt-1 block text-sm font-medium text-blue-700" href={`tel:${supplier.phone}`}>{supplier.phone}</a>}</article>)}</div>}
  </AppShell>;
}
function SupplierField({ label, value, set, type = "text", required }: { label: string; value: string; set: (value: string) => void; type?: string; required?: boolean }) { return <label><span className="field-label">{label}</span><input required={required} type={type} className="form-input" value={value} onChange={(e) => set(e.target.value)} /></label>; }
