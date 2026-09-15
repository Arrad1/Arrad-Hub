"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import PwaInstall from "@/components/PwaInstall";
import BrandLogo from "@/components/BrandLogo";

const nav = [
  ["Dashboard", "/"], ["Enquiries", "/enquiries"], ["Customers", "/customers"], ["Quotes", "/jobs/quotes"],
  ["Jobs", "/jobs"], ["Production", "/operations/production"],
  ["Installations", "/operations/installations"], ["Invoices", "/invoices"],
  ["Stock", "/stock"], ["Suppliers", "/suppliers"],
];

export default function AppShell({ title, description, actions, children }: {
  title: string; description: string; actions?: ReactNode; children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#f5f7f3]">
      <header className="border-b-4 border-[#7ac400] bg-[#4d4f4c] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo className="h-14 w-[210px] rounded-md sm:w-[270px]" />
              <span className="hidden border-l border-white/25 pl-4 lg:block"><strong className="block tracking-[0.12em]">HUB</strong><small className="text-slate-200">Business control centre</small></span>
            </Link>
            <div className="flex items-center gap-2"><PwaInstall /><span className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300">Testing v1</span></div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1" aria-label="Main navigation">
            {nav.map(([label, href]) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return <Link key={href} href={href} className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition ${active ? "bg-[#7ac400] text-[#242624]" : "text-slate-100 hover:bg-white/10 hover:text-white"}`}>{label}</Link>;
            })}
          </nav>
        </div>
      </header>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div><h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-600">{description}</p></div>{actions}
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
