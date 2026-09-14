"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import QuoteHeader from "@/components/quotes/QuoteHeader";
import { formatMoney, loadQuotes, type Quote } from "@/lib/quotes";

const statusStyles: Record<Quote["status"], string> = {
  Draft: "bg-slate-100 text-slate-700",
  Sent: "bg-blue-50 text-blue-700",
  Accepted: "bg-emerald-50 text-emerald-700",
  Declined: "bg-rose-50 text-rose-700",
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const task = window.setTimeout(() => {
      setQuotes(loadQuotes());
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(task);
  }, []);

  const filteredQuotes = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return quotes;
    return quotes.filter((quote) =>
      [quote.customerName, quote.holidayPark, quote.quoteReference, quote.description]
        .join(" ").toLowerCase().includes(search),
    );
  }, [query, quotes]);

  return (
    <main className="min-h-screen bg-slate-50">
      <QuoteHeader
        eyebrow="Jobs / Quotes"
        title="Customer quotes"
        description="Create, review and track quotations before they become live jobs."
        actions={
          <Link href="/jobs/quotes/new" className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
            + New quote
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="All quotes" value={quotes.length} />
          <SummaryCard label="Awaiting decision" value={quotes.filter((quote) => quote.status === "Sent").length} />
          <SummaryCard label="Accepted" value={quotes.filter((quote) => quote.status === "Accepted").length} />
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Quote register</h2>
              <p className="mt-1 text-sm text-slate-500">{quotes.length} {quotes.length === 1 ? "quote" : "quotes"} saved</p>
            </div>
            <label className="sr-only" htmlFor="quote-search">Search quotes</label>
            <input id="quote-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, site or reference" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 sm:max-w-sm" />
          </div>

          {!loaded ? (
            <p className="p-8 text-center text-sm text-slate-500">Loading quotes…</p>
          ) : filteredQuotes.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-xl">£</div>
              <h2 className="mt-4 font-bold text-slate-900">{quotes.length === 0 ? "No quotes yet" : "No matching quotes"}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {quotes.length === 0 ? "Create the first customer quote to start building your quote register." : "Try a different customer name, site or quote reference."}
              </p>
              {quotes.length === 0 && <Link href="/jobs/quotes/new" className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">Create first quote</Link>}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredQuotes.map((quote) => (
                <article key={quote.id} className="grid gap-4 p-5 transition hover:bg-slate-50 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold text-slate-950">{quote.customerName || "Unnamed customer"}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[quote.status]}`}>{quote.status}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-600">{quote.description || "No description supplied"}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">{quote.quoteReference || "No reference"}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-500">Park / site</p>
                    <p className="mt-1 font-medium text-slate-900">{quote.holidayPark || "Not specified"}</p>
                  </div>
                  <div className="flex items-center justify-between gap-5 md:justify-end">
                    <p className="text-lg font-bold text-slate-950">{formatMoney(quote.quoteAmount)}</p>
                    <Link href={`/jobs/quotes/view?id=${encodeURIComponent(quote.id)}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white">View quote</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p></div>;
}
