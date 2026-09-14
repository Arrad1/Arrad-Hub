"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import QuoteHeader from "@/components/quotes/QuoteHeader";
import { saveQuote, type Quote, type QuoteStatus } from "@/lib/quotes";

const today = () => new Date().toISOString().slice(0, 10);

function defaultValidUntil() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

export default function NewQuotePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerName: "", holidayPark: "", quoteReference: "", description: "", quoteAmount: "",
    customerAddress: "", customerEmail: "", customerPhone: "", quoteDate: today(),
    validUntil: defaultValidUntil(), status: "Draft" as QuoteStatus, notes: "",
  });

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!form.customerName.trim() || !form.quoteReference.trim() || !form.description.trim()) {
      setError("Please complete the customer name, quote reference and description.");
      return;
    }
    if (!form.quoteAmount || Number(form.quoteAmount) < 0) {
      setError("Please enter a valid quote amount.");
      return;
    }

    const quote: Quote = {
      id: crypto.randomUUID(), ...form,
      customerName: form.customerName.trim(), holidayPark: form.holidayPark.trim(),
      quoteReference: form.quoteReference.trim(), description: form.description.trim(),
      quoteAmount: form.quoteAmount.trim(), customerAddress: form.customerAddress.trim(),
      customerEmail: form.customerEmail.trim(), customerPhone: form.customerPhone.trim(), notes: form.notes.trim(),
    };
    saveQuote(quote);
    router.push(`/jobs/quotes/view?id=${encodeURIComponent(quote.id)}&created=1`);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <QuoteHeader eyebrow="Jobs / Quotes" title="New customer quote" description="Capture the customer, site, scope and value. You can review the finished quote before sending it." />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/jobs/quotes" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">← Back to quote register</Link>
        <form onSubmit={handleSave} className="mt-5 space-y-6">
          {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{error}</div>}

          <FormSection title="Customer and site" description="Who the quotation is for and where the work will take place.">
            <Field label="Customer name" required><input required value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} className="form-input" /></Field>
            <Field label="Holiday park / site"><input value={form.holidayPark} onChange={(e) => updateField("holidayPark", e.target.value)} className="form-input" /></Field>
            <Field label="Customer email"><input type="email" value={form.customerEmail} onChange={(e) => updateField("customerEmail", e.target.value)} className="form-input" /></Field>
            <Field label="Customer phone"><input type="tel" value={form.customerPhone} onChange={(e) => updateField("customerPhone", e.target.value)} className="form-input" /></Field>
            <Field label="Customer address" wide><textarea rows={3} value={form.customerAddress} onChange={(e) => updateField("customerAddress", e.target.value)} className="form-input resize-y" /></Field>
          </FormSection>

          <FormSection title="Quote details" description="The reference, dates and current stage of the quotation.">
            <Field label="Quote reference" required><input required value={form.quoteReference} onChange={(e) => updateField("quoteReference", e.target.value)} className="form-input" placeholder="e.g. ARR-2026-001" /></Field>
            <Field label="Status"><select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="form-input"><option>Draft</option><option>Sent</option><option>Accepted</option><option>Declined</option></select></Field>
            <Field label="Quote date"><input type="date" value={form.quoteDate} onChange={(e) => updateField("quoteDate", e.target.value)} className="form-input" /></Field>
            <Field label="Valid until"><input type="date" value={form.validUntil} onChange={(e) => updateField("validUntil", e.target.value)} className="form-input" /></Field>
          </FormSection>

          <FormSection title="Scope and price" description="Describe exactly what Arrad will supply and install.">
            <Field label="Description of works" required wide><textarea required rows={6} value={form.description} onChange={(e) => updateField("description", e.target.value)} className="form-input resize-y" placeholder="Include dimensions, materials, finish and installation details…" /></Field>
            <Field label="Quote amount (£)" required><input required type="number" min="0" step="0.01" value={form.quoteAmount} onChange={(e) => updateField("quoteAmount", e.target.value)} className="form-input" placeholder="0.00" /></Field>
            <Field label="Notes / exclusions" wide><textarea rows={4} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className="form-input resize-y" placeholder="Optional assumptions, exclusions or payment notes…" /></Field>
          </FormSection>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/jobs/quotes" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50">Cancel</Link>
            <button type="submit" className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Save and view quote</button>
          </div>
        </form>
      </div>
    </main>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p><div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div></section>;
}

function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: ReactNode }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}{required && <span className="ml-1 text-amber-600">*</span>}</span>{children}</label>;
}
