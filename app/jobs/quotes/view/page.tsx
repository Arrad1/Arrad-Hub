"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { findQuote, formatDate, formatMoney, loadQuotes, updateQuote, type Quote } from "@/lib/quotes";
import { hubData, type Job } from "@/lib/hub-data";

export default function ViewQuotePage() {
  return <Suspense fallback={<QuoteLoading />}><QuoteView /></Suspense>;
}

function QuoteView() {
  const searchParams = useSearchParams();
  const [quote, setQuote] = useState<Quote | null | undefined>(undefined);
  const [jobCreated, setJobCreated] = useState(false);

  useEffect(() => {
    const task = window.setTimeout(() => {
      setQuote(findQuote(loadQuotes(), searchParams.get("id")) ?? null);
    }, 0);
    return () => window.clearTimeout(task);
  }, [searchParams]);

  if (quote === undefined) return <QuoteLoading />;
  if (quote === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-xl">?</div>
          <h1 className="mt-4 text-xl font-bold text-slate-950">Quote not found</h1>
          <p className="mt-2 text-sm text-slate-500">This quote may have been removed, or the link may be incomplete.</p>
          <Link href="/jobs/quotes" className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Return to quotes</Link>
        </div>
      </main>
    );
  }

  function acceptAndCreateJob(currentQuote: Quote) {
    const jobs = hubData.jobs();
    if (!jobs.some((job) => job.quoteId === currentQuote.id)) {
      const job: Job = { id: crypto.randomUUID(), quoteId: currentQuote.id, reference: currentQuote.quoteReference.replace("ARR-", "JOB-") || `JOB-${Date.now()}`, customerName: currentQuote.customerName, site: currentQuote.holidayPark, description: currentQuote.description, value: currentQuote.quoteAmount, status: "Planned", targetDate: "", drawingStatus: "Not started", invoiceStatus: "Not raised" };
      hubData.saveJobs([job, ...jobs]);
    }
    const accepted = { ...currentQuote, status: "Accepted" as const }; updateQuote(accepted); setQuote(accepted); setJobCreated(true);
  }

  return (
    <main className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-5 flex max-w-5xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/jobs/quotes" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">← Back to quote register</Link>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:flex-none">Print / save PDF</button>
          <Link href="/jobs/quotes/new" className="flex-1 rounded-lg bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:flex-none">New quote</Link>
          <Link href={`/jobs/quotes/edit?id=${quote.id}`} className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-800 shadow-sm sm:flex-none">Edit</Link>
          {quote.status !== "Accepted" && <button onClick={() => acceptAndCreateJob(quote)} className="flex-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm sm:flex-none">Accept & create job</button>}
        </div>
      </div>

      {searchParams.get("created") === "1" && <div className="no-print mx-auto mb-5 max-w-5xl px-4"><div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Quote saved successfully.</div></div>}
      {(searchParams.get("updated") === "1" || jobCreated) && <div className="no-print mx-auto mb-5 max-w-5xl px-4"><div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{jobCreated ? "Quote accepted and live job created." : "Quote updated successfully."}</div></div>}

      <article className="quote-document mx-auto max-w-5xl bg-white shadow-xl print:max-w-none print:shadow-none">
        <header className="bg-slate-950 px-7 py-8 text-white sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500 text-xl font-black text-slate-950">A</div>
              <h1 className="mt-4 text-2xl font-black tracking-[0.14em]">ARRAD</h1>
              <p className="mt-1 text-sm font-semibold text-slate-300">FOOT BALCONIES LTD</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">Customer quotation</p>
              <p className="mt-2 text-3xl font-bold">{quote.quoteReference || "Quote"}</p>
              <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-inset ring-white/20">{quote.status}</span>
            </div>
          </div>
        </header>

        <div className="px-7 py-8 sm:px-10 sm:py-10">
          <section className="grid gap-8 border-b border-slate-200 pb-8 sm:grid-cols-2">
            <div>
              <p className="quote-label">Prepared for</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">{quote.customerName || "Customer"}</h2>
              {quote.customerAddress && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{quote.customerAddress}</p>}
              <div className="mt-3 space-y-1 text-sm text-slate-600">{quote.customerEmail && <p>{quote.customerEmail}</p>}{quote.customerPhone && <p>{quote.customerPhone}</p>}</div>
            </div>
            <dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm sm:text-right">
              <QuoteDetail label="Quote date" value={formatDate(quote.quoteDate)} />
              <QuoteDetail label="Valid until" value={formatDate(quote.validUntil)} />
              <QuoteDetail label="Park / site" value={quote.holidayPark || "Not specified"} wide />
            </dl>
          </section>

          <section className="py-8">
            <p className="quote-label">Proposed works</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Quotation details</h2>
            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-[1fr_auto] gap-4 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500"><span>Description</span><span>Amount</span></div>
              {quote.items?.length ? quote.items.map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto] gap-5 border-t border-slate-100 px-5 py-4 first:border-t-0"><div><p className="text-sm text-slate-700">{item.description}</p><p className="mt-1 text-xs text-slate-400">{item.quantity} × {formatMoney(String(item.unitPrice))}</p></div><p className="font-bold text-slate-950">{formatMoney(String(item.quantity * item.unitPrice))}</p></div>) : <div className="grid grid-cols-[1fr_auto] gap-5 px-5 py-6"><p className="whitespace-pre-line text-sm leading-6 text-slate-700">{quote.description || "No description supplied."}</p><p className="font-bold text-slate-950">{formatMoney(quote.quoteAmount)}</p></div>}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4"><p className="text-sm font-bold text-slate-700">Quote total</p><p className="text-2xl font-black text-slate-950">{formatMoney(quote.quoteAmount)}</p></div>
            </div>
          </section>

          {quote.notes && <section className="border-t border-slate-200 py-7"><p className="quote-label">Notes and exclusions</p><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{quote.notes}</p></section>}

          <section className="rounded-xl bg-slate-950 px-6 py-6 text-white sm:flex sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Next step</p><h2 className="mt-2 text-lg font-bold">Ready to proceed?</h2><p className="mt-1 text-sm text-slate-300">Please contact Arrad and quote reference {quote.quoteReference || "shown above"}.</p></div>
            <div className="mt-4 text-sm font-semibold text-slate-200 sm:mt-0 sm:text-right"><p>Arrad Foot Balconies Ltd</p><p className="mt-1 text-slate-400">Built around your project</p></div>
          </section>
          <footer className="mt-8 border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-400">This quotation is based on the information shown above and remains subject to final site confirmation where required.</footer>
        </div>
      </article>
    </main>
  );
}

function QuoteDetail({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "col-span-2" : ""}><dt className="quote-label">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div>;
}

function QuoteLoading() {
  return <main className="min-h-screen bg-slate-50 p-10 text-center text-sm text-slate-500">Loading quote…</main>;
}
