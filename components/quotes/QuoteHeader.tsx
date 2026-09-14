import Link from "next/link";
import type { ReactNode } from "react";

export default function QuoteHeader({ eyebrow, title, description, actions }: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
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
    </header>
  );
}
