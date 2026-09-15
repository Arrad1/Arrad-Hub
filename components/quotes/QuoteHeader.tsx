import Link from "next/link";
import type { ReactNode } from "react";

export default function QuoteHeader({ eyebrow, title, description, actions }: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <><div className="bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between"><Link href="/" className="font-black tracking-[0.12em]">ARRAD HUB</Link><Link href="/jobs/quotes" className="rounded-md bg-white px-3 py-1.5 text-sm font-bold text-slate-950">Quotes</Link></div><nav className="mt-3 flex gap-4 overflow-x-auto text-sm font-semibold text-slate-300"><Link href="/enquiries">Enquiries</Link><Link href="/customers">Customers</Link><Link href="/jobs">Jobs</Link><Link href="/operations/production">Production</Link><Link href="/operations/installations">Installations</Link><Link href="/invoices">Invoices</Link><Link href="/stock">Stock</Link><Link href="/suppliers">Suppliers</Link></nav></div></div><header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/jobs" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
          ← Back to Jobs
        </Link>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">{eyebrow}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
          </div>
          {actions}
        </div>
      </div>
    </header></>
  );
}
