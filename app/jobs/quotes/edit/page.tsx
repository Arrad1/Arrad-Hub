"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import AppShell from "@/components/AppShell";
import { findQuote, loadQuotes, updateQuote, type Quote, type QuoteItem, type QuoteStatus } from "@/lib/quotes";

export default function EditQuotePage() { return <Suspense fallback={<p className="p-10">Loading quote…</p>}><Editor /></Suspense>; }

function Editor() {
  const params = useSearchParams(); const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>();
  useEffect(() => { const task = setTimeout(() => setQuote(findQuote(loadQuotes(), params.get("id")) ?? null), 0); return () => clearTimeout(task); }, [params]);
  if (quote === undefined) return <p className="p-10 text-sm text-slate-500">Loading quote…</p>;
  if (quote === null) return <AppShell title="Quote not found" description="The quote link is incomplete or the quote has been removed."><Link href="/jobs/quotes" className="secondary-button">Return to quotes</Link></AppShell>;

  const items = quote.items?.length ? quote.items : [{ id: `legacy-line-${quote.id}`, description: quote.description, quantity: 1, unitPrice: Number(quote.quoteAmount) || 0 }];
  return <QuoteForm key={quote.id} initial={{ ...quote, items }} save={(updated) => { updateQuote(updated); router.push(`/jobs/quotes/view?id=${updated.id}&updated=1`); }} />;
}

function QuoteForm({ initial, save }: { initial: Quote; save: (quote: Quote) => void }) {
  const [form, setForm] = useState(initial); const [error, setError] = useState("");
  const total = (form.items || []).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  function itemChange(id: string, patch: Partial<QuoteItem>) { setForm({ ...form, items: form.items?.map((item) => item.id === id ? { ...item, ...patch } : item) }); }
  function submit(event: FormEvent) { event.preventDefault(); if (!form.customerName.trim() || !form.quoteReference.trim() || !(form.items || []).some((item) => item.description.trim())) { setError("Customer, reference and at least one line description are required."); return; } save({ ...form, description: (form.items || []).map((item) => item.description).filter(Boolean).join("\n"), quoteAmount: total.toFixed(2) }); }
  return <AppShell title={`Edit ${form.quoteReference || "quote"}`} description="Update customer details, scope, pricing and quote status." actions={<Link href={`/jobs/quotes/view?id=${form.id}`} className="secondary-button">Cancel</Link>}>
    <form onSubmit={submit} className="space-y-6">
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <EditField label="Customer name" value={form.customerName} set={(v) => setForm({ ...form, customerName: v })} />
        <EditField label="Park / site" value={form.holidayPark} set={(v) => setForm({ ...form, holidayPark: v })} />
        <EditField label="Email" type="email" value={form.customerEmail} set={(v) => setForm({ ...form, customerEmail: v })} />
        <EditField label="Phone" value={form.customerPhone} set={(v) => setForm({ ...form, customerPhone: v })} />
        <label className="sm:col-span-2"><span className="field-label">Address</span><textarea className="form-input" rows={3} value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} /></label>
        <EditField label="Quote reference" value={form.quoteReference} set={(v) => setForm({ ...form, quoteReference: v })} />
        <label><span className="field-label">Status</span><select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as QuoteStatus })}><option>Draft</option><option>Sent</option><option>Accepted</option><option>Declined</option></select></label>
        <EditField label="Quote date" type="date" value={form.quoteDate} set={(v) => setForm({ ...form, quoteDate: v })} />
        <EditField label="Valid until" type="date" value={form.validUntil} set={(v) => setForm({ ...form, validUntil: v })} />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-950">Quote line items</h2><p className="mt-1 text-sm text-slate-500">Add each supply, manufacturing or installation element separately.</p></div><button type="button" className="secondary-button" onClick={() => setForm({ ...form, items: [...(form.items || []), { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 }] })}>+ Add line</button></div>
        <div className="mt-5 space-y-3">{form.items?.map((item) => <div key={item.id} className="grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_100px_140px_auto]"><input aria-label="Line description" className="form-input" placeholder="Description" value={item.description} onChange={(e) => itemChange(item.id, { description: e.target.value })} /><input aria-label="Quantity" className="form-input" type="number" min="0" step="1" value={item.quantity} onChange={(e) => itemChange(item.id, { quantity: Number(e.target.value) })} /><input aria-label="Unit price" className="form-input" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => itemChange(item.id, { unitPrice: Number(e.target.value) })} /><button type="button" className="px-2 text-sm font-bold text-rose-600" onClick={() => setForm({ ...form, items: form.items?.filter((line) => line.id !== item.id) })}>Remove</button></div>)}</div>
        <div className="mt-5 border-t border-slate-200 pt-4 text-right"><span className="text-sm text-slate-500">Quote total</span><strong className="ml-4 text-2xl text-slate-950">£{total.toFixed(2)}</strong></div>
      </section>
      <label className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="field-label">Notes / exclusions</span><textarea className="form-input" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
      <div className="text-right"><button className="primary-button">Save quote changes</button></div>
    </form>
  </AppShell>;
}

function EditField({ label, value, set, type = "text" }: { label: string; value: string; set: (value: string) => void; type?: string }) { return <label><span className="field-label">{label}</span><input className="form-input" type={type} value={value} onChange={(e) => set(e.target.value)} /></label>; }
