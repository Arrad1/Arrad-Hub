"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { formatMoney } from "@/lib/quotes";
import { hubData, shortDate, updateRecord, type Job, type JobStatus } from "@/lib/hub-data";

export default function JobStageList({ mode = "all" }: { mode?: "all" | "production" | "installation" }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => { const task = setTimeout(() => setJobs(hubData.jobs()), 0); return () => clearTimeout(task); }, []);
  const visible = jobs.filter((job) => mode === "all" || (mode === "production" ? ["Survey", "Manufacturing", "Ready"].includes(job.status) : ["Ready", "Installation", "Complete"].includes(job.status)));
  function patch(id: string, value: Partial<Job>) { const next = updateRecord(jobs, id, value); hubData.saveJobs(next); setJobs(next); }
  function raiseInvoice(job: Job) {
    const invoices = hubData.invoices();
    if (!invoices.some((invoice) => invoice.jobId === job.id)) hubData.saveInvoices([{ id: crypto.randomUUID(), jobId: job.id, reference: job.reference.replace("JOB-", "INV-"), customerName: job.customerName, amount: job.value, dueDate: "", status: "Draft" }, ...invoices]);
    patch(job.id, { invoiceStatus: "Draft" });
  }
  if (!visible.length) return <EmptyState title={`No ${mode === "all" ? "live jobs" : mode + " jobs"} yet`} description={mode === "all" ? "Accept a customer quote to create the first live job." : "Jobs will appear here automatically when they reach this stage."} />;
  return <div className="space-y-4">{visible.map((job) => <article key={job.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-2xl"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-slate-950">{job.reference}</h2><StatusBadge>{job.status}</StatusBadge></div><p className="mt-2 font-semibold text-slate-800">{job.customerName} · {job.site || "Site not set"}</p><p className="mt-2 text-sm leading-6 text-slate-600">{job.description}</p><p className="mt-3 text-sm font-bold text-slate-950">{formatMoney(job.value)}</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
        <label><span className="field-label">Job stage</span><select className="small-select w-full" value={job.status} onChange={(e) => patch(job.id, { status: e.target.value as JobStatus })}><option>Planned</option><option>Survey</option><option>Manufacturing</option><option>Ready</option><option>Installation</option><option>Complete</option></select></label>
        <label><span className="field-label">Drawing</span><select className="small-select w-full" value={job.drawingStatus} onChange={(e) => patch(job.id, { drawingStatus: e.target.value as Job["drawingStatus"] })}><option>Not started</option><option>In progress</option><option>Approved</option></select></label>
        <label><span className="field-label">Target / install date</span><input className="small-select w-full" type="date" value={job.targetDate} onChange={(e) => patch(job.id, { targetDate: e.target.value })} /></label>
        <div><span className="field-label">Invoice</span>{job.invoiceStatus === "Not raised" ? <button onClick={() => raiseInvoice(job)} className="secondary-button w-full">Raise draft invoice</button> : <div className="flex h-[38px] items-center"><StatusBadge>{job.invoiceStatus}</StatusBadge></div>}</div>
      </div>
    </div>{job.targetDate && <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">Target date: {shortDate(job.targetDate)}</p>}
  </article>)}</div>;
}
