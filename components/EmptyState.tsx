import type { ReactNode } from "react";
export default function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 font-black text-amber-700">A</div><h2 className="mt-4 font-bold text-slate-950">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
