import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogo from "@/components/BrandLogo";

export default function QuoteHeader({ eyebrow, title, description, actions }: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <><div className="border-b-4 border-[#7ac400] bg-[#4d4f4c] text-white"><div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between"><Link href="/"><BrandLogo className="h-12 w-[190px] rounded-md sm:w-[240px]" /></Link><Link href="/jobs/quotes" className="rounded-md bg-[#7ac400] px-3 py-1.5 text-sm font-bold text-[#242624]">Quotes</Link></div><nav className="mt-3 flex gap-4 overflow-x-auto text-sm font-semibold text-slate-100"><Link href="/enquiries">Enquiries</Link><Link href="/customers">Customers</Link><Link href="/jobs">Jobs</Link><Link href="/operations/production">Production</Link><Link href="/operations/installations">Installations</Link><Link href="/invoices">Invoices</Link><Link href="/stock">Stock</Link><Link href="/suppliers">Suppliers</Link></nav></div></div><header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/jobs" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
          ← Back to Jobs
        </Link>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5e9e00]">{eyebrow}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
          </div>
          {actions}
        </div>
      </div>
    </header></>
  );
}
