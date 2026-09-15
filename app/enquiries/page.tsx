"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { hubData, updateRecord, type Enquiry, type EnquiryStatus } from "@/lib/hub-data";
import { saveQuote, type Quote } from "@/lib/quotes";

export default function EnquiriesPage() {
  const router = useRouter();
  const [records, setRecords] = useState<Enquiry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName: "", email: "", phone: "", site: "", summary: "" });

  useEffect(() => { const task = window.setTimeout(() => setRecords(hubData.enquiries()), 0); return () => clearTimeout(task); }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Enquiry = { id: crypto.randomUUID(), ...form, status: "New", createdAt: new Date().toISOString().slice(0, 10) };
    const updated = [next, ...records]; hubData.saveEnquiries(updated); setRecords(updated);
    setForm({ customerName: "", email: "", phone: "", site: "", summary: "" }); setShowForm(false);
  }

  function changeStatus(id: string, status: EnquiryStatus) {
    const updated = updateRecord(records, id, { status }); hubData.saveEnquiries(updated); setRecords(updated);
  }

  function createQuote(enquiry: Enquiry) {
    const id = crypto.randomUUID();
    const quote: Quote = { id, customerName: enquiry.customerName, holidayPark: enquiry.site, quoteReference: `ARR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`, description: enquiry.summary, quoteAmount: "", customerAddress: "", customerEmail: enquiry.email, customerPhone: enquiry.phone, quoteDate: new Date().toISOString().slice(0, 10), validUntil: "", status: "Draft", notes: "" };
    saveQuote(quote); changeStatus(enquiry.id, "Quoted"); router.push(`/jobs/quotes/edit?id=${id}`);
  }

  return (
    <AppShell title="Enquiries" description="Capture new opportunities and turn qualified enquiries into quotations." actions={<button onClick={() => setShowForm((value) => !value)} className="primary-button">{showForm ? "Close form" : "+ New enquiry"}</button>}>
      {showForm && <form onSubmit={submit} className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <Input label="Customer name" required value={form.customerName} set={(value) => setForm({ ...form, customerName: value })} />
        <Input label="Park / site" value={form.site} set={(value) => setForm({ ...form, site: value })} />
        <Input label="Email" type="email" value={form.email} set={(value) => setForm({ ...form, email: value })} />
        <Input label="Phone" type="tel" value={form.phone} set={(value) => setForm({ ...form, phone: value })} />
        <label className="sm:col-span-2"><span className="field-label">What does the customer need?</span><textarea required rows={4} className="form-input" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></label>
        <div className="sm:col-span-2 sm:text-right"><button className="primary-button">Save enquiry</button></div>
      </form>}
      {records.length === 0 ? <EmptyState title="No enquiries yet" description="Add the first enquiry when a customer or holiday park contacts Arrad." /> : <div className="space-y-3">
        {records.map((record) => <article key={record.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-slate-950">{record.customerName}</h2><StatusBadge>{record.status}</StatusBadge></div><p className="mt-1 text-sm text-slate-600">{record.summary}</p><p className="mt-2 text-xs text-slate-400">{record.site || "No site specified"} · {record.email || record.phone || "No contact details"}</p></div>
            <div className="flex flex-wrap gap-2"><select aria-label={`Status for ${record.customerName}`} value={record.status} onChange={(e) => changeStatus(record.id, e.target.value as EnquiryStatus)} className="small-select"><option>New</option><option>Contacted</option><option>Quoted</option><option>Closed</option></select><button onClick={() => createQuote(record)} className="secondary-button" disabled={record.status === "Quoted"}>Create quote</button></div>
          </div>
        </article>)}
      </div>}
    </AppShell>
  );
}

function Input({ label, value, set, type = "text", required }: { label: string; value: string; set: (value: string) => void; type?: string; required?: boolean }) {
  return <label><span className="field-label">{label}</span><input required={required} type={type} className="form-input" value={value} onChange={(e) => set(e.target.value)} /></label>;
}
